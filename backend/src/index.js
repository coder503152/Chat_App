import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Trust reverse proxy (e.g. Render, Heroku) for secure HTTPS cookies
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const clientUrl = process.env.CLIENT_URL?.replace(/\/+$/, "");
const allowedOrigins = [
  "http://localhost:5173",
  ...(clientUrl ? [clientUrl] : []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

server.listen(PORT, async () => {
  console.log("Server is running on port:", PORT);

  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
});
