import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

config();

const cleanDatabase = async () => {
  try {
    await connectDB();

    const deletedUsers = await User.deleteMany({});
    const deletedMessages = await Message.deleteMany({});

    console.log(`Successfully deleted ${deletedUsers.deletedCount} users and ${deletedMessages.deletedCount} messages.`);
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning database:", error);
    process.exit(1);
  }
};

cleanDatabase();

