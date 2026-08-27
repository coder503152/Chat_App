import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  newIncomingCount: 0,
  unreadCounts: {},

  resetNewIncomingCount: () => set({ newIncomingCount: 0 }),
  clearUnreadCount: (userId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    })),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set((state) => ({
      isMessagesLoading: true,
      newIncomingCount: 0,
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    }));
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text });
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      });
      toast.success("Message edited");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to update message";
      toast.error(errMsg);
      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
      toast.success("Message deleted");
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to delete message";
      toast.error(errMsg);
      return false;
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up any existing listeners first to prevent duplicate callbacks
    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const isFromActiveUser = selectedUser && newMessage.senderId === selectedUser._id;

      if (isFromActiveUser) {
        set({
          messages: [...get().messages, newMessage],
          newIncomingCount: get().newIncomingCount + 1,
        });
      } else {
        const senderId = newMessage.senderId;
        const currentCount = get().unreadCounts[senderId] || 0;
        set({
          unreadCounts: {
            ...get().unreadCounts,
            [senderId]: currentCount + 1,
          },
        });
      }
    });

    socket.on("messageUpdated", (updatedMessage) => {
      set({
        messages: get().messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ),
      });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
    });
  },


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) =>
    set((state) => ({
      selectedUser,
      newIncomingCount: 0,
      unreadCounts: selectedUser ? { ...state.unreadCounts, [selectedUser._id]: 0 } : state.unreadCounts,
    })),
}));


