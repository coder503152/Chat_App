import { useState, useRef, useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import { useChatStore } from "../store/useChatStore";
import {
  Bot,
  User,
  Send,
  X,
  Copy,
  Check,
  Trash2,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "What did we decide about the project?",
  "What tasks were assigned to me?",
  "Summarize what happened today.",
  "What are the important points from this conversation?",
];

const AIAskModal = () => {
  const {
    askHistory,
    isAsking,
    isAskModalOpen,
    closeAskModal,
    clearAskHistory,
    askAboutConversation,
  } = useAIStore();
  const { selectedUser } = useChatStore();

  const [question, setQuestion] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [askHistory, isAsking]);

  if (!isAskModalOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!question.trim() || isAsking || !selectedUser?._id) return;

    askAboutConversation(selectedUser._id, question.trim());
    setQuestion("");
  };

  const handleQuickPromptClick = (promptText) => {
    if (isAsking || !selectedUser?._id) return;
    askAboutConversation(selectedUser._id, promptText);
  };

  const handleCopyAnswer = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("AI response copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
              <Bot className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Ask AI About This Chat
              </h3>
              <p className="text-xs text-base-content/70">
                Answers based strictly on your conversation with {selectedUser?.fullName || "Contact"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {askHistory.length > 0 && (
              <button
                onClick={clearAskHistory}
                className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-error"
                title="Clear Q&A History"
              >
                <Trash2 className="size-4" />
              </button>
            )}
            <button
              onClick={closeAskModal}
              className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-base-200/30 border-b border-base-300 overflow-x-auto flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-base-content/60 flex items-center gap-1 shrink-0 px-1">
            <Sparkles className="size-3 text-secondary" /> Suggestions:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isAsking}
              onClick={() => handleQuickPromptClick(prompt)}
              className="btn btn-xs btn-outline hover:btn-secondary text-xs rounded-full whitespace-nowrap shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Q&A Chat Log */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {askHistory.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3 px-4">
              <div className="p-4 rounded-full bg-secondary/10 text-secondary">
                <HelpCircle className="size-10" />
              </div>
              <h4 className="font-semibold text-base">Ask anything about this conversation</h4>
              <p className="text-sm text-base-content/60 max-w-sm">
                Get quick answers about decisions made, action items, dates, or summaries from this specific chat.
              </p>
            </div>
          )}

          {askHistory.map((item) => (
            <div key={item.id} className="space-y-3">
              {/* User Question */}
              <div className="flex items-start gap-2.5 justify-end">
                <div className="max-w-[85%] bg-primary text-primary-content rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm">
                  <p>{item.question}</p>
                </div>
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <User className="size-4" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-2.5">
                <div className="size-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0 mt-1">
                  <Bot className="size-4" />
                </div>
                <div className="max-w-[85%] bg-base-200 border border-base-300 rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3" /> AI Assistant
                    </span>
                    {item.answer && !item.isLoading && (
                      <button
                        onClick={() => handleCopyAnswer(item.answer, item.id)}
                        className="btn btn-ghost btn-xs gap-1 text-base-content/70 hover:text-base-content"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="size-3 text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {item.isLoading ? (
                    <div className="flex items-center gap-2 text-base-content/70 py-1">
                      <span className="loading loading-dots loading-sm text-secondary"></span>
                      <span className="text-xs">Searching chat history...</span>
                    </div>
                  ) : item.isError ? (
                    <div className="flex items-center gap-2 text-error text-xs">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{item.answer}</span>
                    </div>
                  ) : (
                    <p className="text-base-content/90 whitespace-pre-wrap leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Query Input Footer */}
        <div className="p-3 sm:p-4 border-t border-base-300 bg-base-200/50">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question about this conversation..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isAsking}
              className="input input-bordered input-sm sm:input-md flex-1 rounded-xl focus:outline-none focus:border-secondary"
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="btn btn-secondary btn-sm sm:btn-md rounded-xl gap-2"
            >
              {isAsking ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Send className="size-4" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAskModal;
