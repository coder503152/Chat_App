
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

const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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


// yaha pe server.listen islie krte hain because is same HTTP server pr hamare dono express and socket.io connected hain :-

//  HTTP Server
//                   server.listen()
//                        │
//               ┌────────┴────────┐
//               │                 │
//            Express           Socket.IO
//               │                 │
//         REST API calls      Persistent
//         request/response     connection
//               │                 │
//               ▼                 ▼
//        Login / messages    Instant events
//                               ↕
//                          Client ↔ Server
