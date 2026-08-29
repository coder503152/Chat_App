import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app); // is app ke around ek server banao jo ki bidirect. messages allow krega and we will use Socket.Io around this

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {  // jab bhi koi client is socket.io conn se connect krega , then exec this fun :-
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId; // when the FE connects with the server , so the socket object contains various , there we have the user id in socket.handshake.query .....  
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // typing indicator listener
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  // read receipts listener
  socket.on("markAsRead", async ({ senderId }) => {
    try {
      if (!userId) return;
      await Message.updateMany(
        { senderId, receiverId: userId, isRead: { $ne: true } },
        { isRead: true }
      );
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readBy: userId });
      }
    } catch (error) {
      console.error("Error in markAsRead socket listener:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

});

export { io, app, server };

