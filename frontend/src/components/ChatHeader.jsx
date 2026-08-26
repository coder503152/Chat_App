import { X, Sparkles, Bot } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { summarizeConversation, openAskModal, isSummarizing } = useAIStore();

  const handleSummarize = () => {
    if (selectedUser?._id) {
      summarizeConversation(selectedUser._id);
    }
  };

  const handleOpenAskAI = () => {
    if (selectedUser?._id) {
      openAskModal();
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="btn btn-xs sm:btn-sm btn-ghost hover:btn-primary gap-1 text-xs font-medium"
            title="Summarize this conversation"
          >
            <Sparkles className={`size-3.5 sm:size-4 text-primary ${isSummarizing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Summarize</span>
          </button>

          <button
            onClick={handleOpenAskAI}
            className="btn btn-xs sm:btn-sm btn-ghost hover:btn-secondary gap-1 text-xs font-medium"
            title="Ask AI questions about this chat"
          >
            <Bot className="size-3.5 sm:size-4 text-secondary" />
            <span className="hidden md:inline">Ask AI</span>
          </button>

          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-xs sm:btn-sm btn-ghost btn-circle"
            title="Close conversation"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
