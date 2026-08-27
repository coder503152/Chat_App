import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import {
  summarizeChatService,
  askAboutChatService,
  suggestRepliesService,
} from "../services/ai.service.js";

/**
 * Helper to validate user & retrieve conversation messages safely
 */
const getConversationContext = async ({ currentUserId, otherUserId, limit = 100 }) => {
  if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    const error = new Error("Invalid or missing user ID for conversation");
    error.statusCode = 400;
    throw error;
  }

  const otherUser = await User.findById(otherUserId).select("-password");
  if (!otherUser) {
    const error = new Error("Conversation participant not found");
    error.statusCode = 404;
    throw error;
  }

  // Fetch messages between the two users, sorted chronologically
  const messages = await Message.find({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  if (!messages || messages.length === 0) {
    const error = new Error("No messages found in this conversation to analyze");
    error.statusCode = 400;
    throw error;
  }

  // Reverse to chronological order (oldest to newest)
  const chronologicalMessages = messages.reverse();

  return {
    messages: chronologicalMessages,
    otherUser,
  };
};

/**
 * Handle AI errors cleanly
 */
const handleAIError = (res, error, contextMessage) => {
  console.error(`AI Controller Error (${contextMessage}):`, error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  const rawMessage = error.message || "";

  if (rawMessage.includes("AI API Key is missing")) {
    return res.status(503).json({
      message: "AI service is not configured. Please set GEMINI_API_KEY in the backend environment.",
    });
  }

  // Parse if rawMessage is a JSON string from the SDK
  let friendlyMessage = "Failed to process AI request. Please try again in a few seconds.";

  if (rawMessage.includes("503") || rawMessage.includes("high demand") || rawMessage.includes("UNAVAILABLE")) {
    friendlyMessage = "AI service is experiencing high demand. Please try again in a few seconds.";
    return res.status(503).json({ message: friendlyMessage });
  }

  if (error.status === 429 || rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    friendlyMessage = "AI rate limit reached. Please wait a moment before trying again.";
    return res.status(429).json({ message: friendlyMessage });
  }

  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed.error?.message) {
      friendlyMessage = parsed.error.message;
    }
  } catch {
    if (rawMessage && !rawMessage.startsWith("{")) {
      friendlyMessage = rawMessage;
    }
  }

  return res.status(500).json({
    message: friendlyMessage,
  });
};

/**
 * POST /api/ai/summarize
 * Body: { userId: string }
 */
export const summarizeChat = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserName = req.user.fullName;
    const { userId: otherUserId } = req.body;

    const { messages, otherUser } = await getConversationContext({
      currentUserId,
      otherUserId,
      limit: 100,
    });

    const summary = await summarizeChatService({
      messages,
      currentUserId,
      currentUserName,
      otherUserName: otherUser.fullName,
    });

    return res.status(200).json({
      success: true,
      summary,
      messageCount: messages.length,
      participant: otherUser.fullName,
    });
  } catch (error) {
    return handleAIError(res, error, "summarizeChat");
  }
};



/**
 * POST /api/ai/ask
 * Body: { userId: string, question: string }
 */
export const askAboutChat = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserName = req.user.fullName;
    const { userId: otherUserId, question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ message: "Please provide a question to ask about this chat" });
    }

    const { messages, otherUser } = await getConversationContext({
      currentUserId,
      otherUserId,
      limit: 100,
    });

    const answer = await askAboutChatService({
      messages,
      question: question.trim(),
      currentUserId,
      currentUserName,
      otherUserName: otherUser.fullName,
    });

    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer,
      participant: otherUser.fullName,
    });
  } catch (error) {
    return handleAIError(res, error, "askAboutChat");
  }
};

/**
 * POST /api/ai/reply-suggestions
 * Body: { userId: string }
 */
export const suggestReplies = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserName = req.user.fullName;
    const { userId: otherUserId } = req.body;

    const { messages, otherUser } = await getConversationContext({
      currentUserId,
      otherUserId,
      limit: 15,
    });

    const suggestions = await suggestRepliesService({
      messages,
      currentUserId,
      currentUserName,
      otherUserName: otherUser.fullName,
    });

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    return handleAIError(res, error, "suggestReplies");
  }
};
