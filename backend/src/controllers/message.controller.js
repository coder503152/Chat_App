import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Two types of things happen here :- 

// And there are two communication mechanisms working together:

// MongoDB/Mongoose → persistent storage
// Socket.IO        → real-time delivery


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Current Logged in User
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); // we find all the users except for the current logged in user , except for their passwords cuz we dont need that....
    // it filters the users except the currently logged in user ......


    res.status(200).json(filteredUsers);  // returns the filtered users in the response .....
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // We grab from the request the id of the person for which we wanna bring the chats .... 
    const myId = req.user._id; 

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }); // Find the messages where the sender is me and reciver is the other person i am fetching fro or vice versa.

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body; // The content of the message I'm bout to send....
    const { id: receiverId } = req.params; // The Id of the person i am sending the message to ...
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId); // We need the receiverSocketId of the other person to send messages to him in the realtime if he is connected , if he is not then the message anyways gets stored in the MongoDB and when the user will log in again , then he will see the messages anyway saved in the MongoDB.....
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text cannot be empty" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow the original sender to edit the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to edit this message" });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    // Notify receiver in real time
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in updateMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow the original sender to delete the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    // Notify receiver in real time
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully", messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { reaction } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.reaction = message.reaction === reaction ? null : reaction;
    await message.save();

    const otherUserId =
      message.senderId.toString() === req.user._id.toString()
        ? message.receiverId
        : message.senderId;

    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReacted", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


