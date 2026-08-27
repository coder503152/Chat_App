import { X, Sparkles, Bot } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { summarizeConversation, summarizeRecentMessages, openAskModal, isSummarizing } = useAIStore();

  const isOnline = onlineUsers.includes(selectedUser?._id);

  const handleSummarize = () => {
    if (selectedUser?._id) {
      summarizeConversation(selectedUser._id);
    }
  };

  const handleSummarizeRecent = () => {
    if (selectedUser?._id) {
      summarizeRecentMessages(selectedUser._id, 10);
    }
  };

  const handleOpenAskAI = () => {
    if (selectedUser?._id) {
      openAskModal();
    }
  };

  return (
    <div className="p-3.5 border-b border-base-300 bg-base-100/60 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-11 rounded-full relative border border-base-300 shadow-xs overflow-hidden">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100 animate-pulse" />
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base leading-tight">{selectedUser?.fullName}</h3>
            <p className="text-xs text-base-content/60 flex items-center gap-1 font-medium mt-0.5">
              {isOnline ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500"></span> Online
                </span>
              ) : (
                <span className="text-base-content/40">Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="btn btn-xs sm:btn-sm btn-ghost hover:bg-primary/10 hover:text-primary gap-1.5 text-xs font-semibold rounded-xl border border-primary/20 bg-primary/5 transition-all"
            title="Summarize entire conversation and explain core intent"
          >
            <Sparkles className={`size-3.5 sm:size-4 text-primary ${isSummarizing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Summarize Chat</span>
          </button>

          <button
            onClick={handleOpenAskAI}
            className="btn btn-xs sm:btn-sm btn-ghost hover:bg-secondary/10 hover:text-secondary gap-1.5 text-xs font-semibold rounded-xl border border-secondary/20 bg-secondary/5 transition-all"
            title="Ask AI questions about this chat"
          >
            <Bot className="size-3.5 sm:size-4 text-secondary" />
            <span className="hidden md:inline">Ask AI</span>
          </button>



          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-xs sm:btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
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

