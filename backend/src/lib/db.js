import mongoose from "mongoose";
import Message from "../models/message.model.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Mark historical messages created before isRead schema as read
    await Message.updateMany({ isRead: { $exists: false } }, { isRead: true });
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

