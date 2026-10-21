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

const clientUrl = process.env.CLIENT_URL?.replace(/\/+$/, "");

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const clean = origin.replace(/\/+$/, "");
  if (
    clean === "http://localhost:5173" ||
    clean === "https://chat-app-tuak.vercel.app" ||
    (clientUrl && clean === clientUrl)
  ) {
    return true;
  }
  // Allow all Vercel preview deployments for this project
  if (/^https:\/\/chat-app-tuak(-[a-z0-9-]+)?\.vercel\.app$/i.test(clean)) {
    return true;
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

// CORS middleware MUST run at the top of the middleware stack
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Root & Health routes for pinging / monitoring
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/", (req, res) => res.status(200).json({ message: "Chatty API is running" }));

// Main API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

// Global error handler preserving CORS headers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

server.listen(PORT, async () => {
  console.log("Server is running on port:", PORT);

  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
});
