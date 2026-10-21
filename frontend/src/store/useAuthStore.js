import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";

// Determine Socket.IO server URL:
// 1. In development mode: default to local backend "http://localhost:5001" (unless overridden)
// 2. In production: prefer VITE_SOCKET_URL, or derive from VITE_API_URL, or fallback to Render backend
const getSocketURL = () => {
  const rawSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (rawSocketUrl) {
    return rawSocketUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  }
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl) {
    return rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  }
  return import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://chat-app-xq7u.onrender.com";
};

const BASE_URL = getSocketURL();

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        get().connectSocket();
      } else {
        set({ authUser: null });
        get().disconnectSocket();
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.data && res.data._id) {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log out");
    } finally {
      set({ authUser: null });
      get().disconnectSocket();
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();
    // Guard against undefined or unauthenticated user ID:
    if (!authUser || !authUser._id) return;
    if (existingSocket?.connected) return;

    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    useChatStore.getState().subscribeToMessages();
  },

  disconnectSocket: () => {
    useChatStore.getState().unsubscribeFromMessages();
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
