import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" })); // This tells ki agar kisi req me JSON hai , to use parse kro and it should be accessible in req.body

app.use(cookieParser());  // similarly , hmlog req.cookies use krskte hain and can extract the jwt from there

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // this is for handling CORS

app.use("/api/auth", authRoutes); // authentication layer ...
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
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
