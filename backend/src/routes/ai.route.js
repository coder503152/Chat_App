import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  summarizeChat,
  askAboutChat,
  suggestReplies,
} from "../controllers/ai.controller.js";

const router = express.Router();

// All AI endpoints are protected by JWT authentication
router.post("/summarize", protectRoute, summarizeChat);
router.post("/ask", protectRoute, askAboutChat);
router.post("/reply-suggestions", protectRoute, suggestReplies);

export default router;
