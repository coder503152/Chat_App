import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useAIStore = create((set, get) => ({
  // Summarization state
  summary: null,
  isSummarizing: false,
  summaryError: null,
  isSummaryModalOpen: false,

  // Ask AI state
  askHistory: [],
  isAsking: false,
  askError: null,
  isAskModalOpen: false,

  // Reply suggestions state
  replySuggestions: [],
  isGeneratingSuggestions: false,
  suggestionsError: null,

  // Summary Actions
  openSummaryModal: () => set({ isSummaryModalOpen: true }),
  closeSummaryModal: () => set({ isSummaryModalOpen: false }),

  summarizeConversation: async (userId, recentCount = null) => {
    if (!userId) {
      toast.error("Please select a conversation first");
      return;
    }

    set({ isSummarizing: true, summaryError: null, isSummaryModalOpen: true });
    try {
      const payload = { userId };
      if (recentCount) payload.recentCount = recentCount;

      const res = await axiosInstance.post("/ai/summarize", payload);
      if (res.data?.summary) {
        set({ summary: res.data.summary, summaryError: null });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to generate conversation summary";
      set({ summaryError: errMsg });
      toast.error(errMsg);
    } finally {
      set({ isSummarizing: false });
    }
  },

  summarizeRecentMessages: async (userId, count = 10) => {
    return get().summarizeConversation(userId, count);
  },


  // Ask AI Actions
  openAskModal: () => set({ isAskModalOpen: true }),
  closeAskModal: () => set({ isAskModalOpen: false }),
  clearAskHistory: () => set({ askHistory: [] }),

  askAboutConversation: async (userId, question) => {
    if (!userId) {
      toast.error("Please select a conversation first");
      return;
    }
    if (!question || !question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const trimmedQuestion = question.trim();
    const queryId = Date.now().toString();

    // Optimistically add user query to history with loading state
    const currentHistory = get().askHistory;
    set({
      isAsking: true,
      askError: null,
      isAskModalOpen: true,
      askHistory: [
        ...currentHistory,
        {
          id: queryId,
          question: trimmedQuestion,
          answer: null,
          isLoading: true,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    try {
      const res = await axiosInstance.post("/ai/ask", {
        userId,
        question: trimmedQuestion,
      });

      set((state) => ({
        askHistory: state.askHistory.map((item) =>
          item.id === queryId
            ? { ...item, answer: res.data.answer || "No response received.", isLoading: false }
            : item
        ),
      }));
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to get AI answer for this chat";
      set((state) => ({
        askError: errMsg,
        askHistory: state.askHistory.map((item) =>
          item.id === queryId
            ? {
                ...item,
                answer: `⚠️ Error: ${errMsg}`,
                isError: true,
                isLoading: false,
              }
            : item
        ),
      }));
      toast.error(errMsg);
    } finally {
      set({ isAsking: false });
    }
  },

  // Reply Suggestion Actions
  getReplySuggestions: async (userId) => {
    if (!userId) {
      toast.error("Please select a conversation first");
      return;
    }

    set({ isGeneratingSuggestions: true, suggestionsError: null });
    try {
      const res = await axiosInstance.post("/ai/reply-suggestions", { userId });
      if (res.data?.suggestions && Array.isArray(res.data.suggestions)) {
        set({ replySuggestions: res.data.suggestions, suggestionsError: null });
      } else {
        set({ replySuggestions: [] });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to generate reply suggestions";
      set({ suggestionsError: errMsg, replySuggestions: [] });
      toast.error(errMsg);
    } finally {
      set({ isGeneratingSuggestions: false });
    }
  },

  clearSuggestions: () => set({ replySuggestions: [], suggestionsError: null }),
}));
