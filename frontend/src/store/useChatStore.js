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
  lastMessageTimes: {},
  lastMessageTexts: {},


  resetNewIncomingCount: () => set({ newIncomingCount: 0 }),
  clearUnreadCount: (userId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
    })),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const unreadCounts = {};
      const lastMessageTimes = {};
      const lastMessageTexts = {};
      res.data.forEach((user) => {
        if (user.unreadCount) unreadCounts[user._id] = user.unreadCount;
        if (user.lastMessageTime) lastMessageTimes[user._id] = user.lastMessageTime;
        if (user.lastMessageText) lastMessageTexts[user._id] = user.lastMessageText;
      });
      set({ users: res.data, unreadCounts, lastMessageTimes, lastMessageTexts });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
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
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const textPreview = res.data.text || (res.data.image ? "📷 Attachment" : "");
      set({
        messages: [...get().messages, res.data],
        lastMessageTimes: {
          ...get().lastMessageTimes,
          [selectedUser._id]: res.data.createdAt || Date.now(),
        },
        lastMessageTexts: {
          ...get().lastMessageTexts,
          [selectedUser._id]: textPreview,
        },
      });
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to send message";
      toast.error(errMsg);
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
      const senderId = newMessage.senderId?._id
        ? String(newMessage.senderId._id)
        : String(newMessage.senderId);

      const isFromActiveUser =
        selectedUser && String(selectedUser._id) === senderId;

      const textPreview = newMessage.text || (newMessage.image ? "📷 Attachment" : "");

      if (isFromActiveUser) {
        set({
          messages: [...get().messages, newMessage],
          newIncomingCount: get().newIncomingCount + 1,
          lastMessageTimes: {
            ...get().lastMessageTimes,
            [senderId]: newMessage.createdAt || Date.now(),
          },
          lastMessageTexts: {
            ...get().lastMessageTexts,
            [senderId]: textPreview,
          },
        });
      } else {
        const currentCount = get().unreadCounts[senderId] || 0;
        set({
          unreadCounts: {
            ...get().unreadCounts,
            [senderId]: currentCount + 1,
          },
          lastMessageTimes: {
            ...get().lastMessageTimes,
            [senderId]: newMessage.createdAt || Date.now(),
          },
          lastMessageTexts: {
            ...get().lastMessageTexts,
            [senderId]: textPreview,
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


