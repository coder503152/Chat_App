import { useState } from "react";
import { useAIStore } from "../store/useAIStore";
import { useChatStore } from "../store/useChatStore";
import {
  Sparkles,
  X,
  Copy,
  Check,
  RotateCw,
  CheckCircle2,
  ListTodo,
  HelpCircle,
  FileText,
  AlertCircle,
  Target,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const AISummaryModal = () => {
  const {
    summary,
    isSummarizing,
    summaryError,
    isSummaryModalOpen,
    closeSummaryModal,
    summarizeConversation,
  } = useAIStore();
  const { selectedUser } = useChatStore();
  const [copied, setCopied] = useState(false);

  if (!isSummaryModalOpen) return null;

  const handleCopySummary = () => {
    if (!summary) return;

    let textToCopy = `📋 Chat Summary with ${selectedUser?.fullName || "Contact"}\n\n`;

    if (summary.intent) {
      textToCopy += `🎯 What they are trying to say:\n${summary.intent}\n\n`;
    }

    if (summary.overview) {
      textToCopy += `📌 Overview:\n${summary.overview}\n\n`;
    }

    if (summary.mainPoints?.length > 0) {
      textToCopy += `💡 Main Discussion Points:\n${summary.mainPoints.map((p) => `• ${p}`).join("\n")}\n\n`;
    }

    if (summary.decisions?.length > 0) {
      textToCopy += `✅ Decisions Made:\n${summary.decisions.map((d) => `• ${d}`).join("\n")}\n\n`;
    }

    if (summary.actionItems?.length > 0) {
      textToCopy += `📝 Action Items / Tasks:\n${summary.actionItems.map((a) => `• ${a}`).join("\n")}\n\n`;
    }

    if (summary.unresolvedQuestions?.length > 0) {
      textToCopy += `❓ Unresolved Questions:\n${summary.unresolvedQuestions.map((q) => `• ${q}`).join("\n")}\n\n`;
    }

    navigator.clipboard.writeText(textToCopy.trim());
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (selectedUser?._id) {
      summarizeConversation(selectedUser._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                AI Chat & Intent Summary
                <span className="badge badge-primary badge-sm">Pro</span>
              </h3>
              <p className="text-xs text-base-content/70">
                Messages from {selectedUser?.fullName || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={closeSummaryModal}
            className="btn btn-sm btn-ghost btn-circle text-base-content/70 hover:text-base-content"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {isSummarizing && (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <div className="space-y-1">
                <p className="font-medium text-base">Analyzing messages & core intent...</p>
                <p className="text-xs text-base-content/60 max-w-xs">
                  AI is deciphering what {selectedUser?.fullName?.split(" ")[0]} is trying to say and extracting main takeaways.
                </p>
              </div>
            </div>
          )}

          {!isSummarizing && summaryError && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="p-3 rounded-full bg-error/10 text-error">
                <AlertCircle className="size-8" />
              </div>
              <h4 className="font-semibold text-base">Unable to generate summary</h4>
              <p className="text-sm text-base-content/70 max-w-md">{summaryError}</p>
              <button
                onClick={handleRegenerate}
                className="btn btn-sm btn-outline btn-primary mt-2 gap-2"
              >
                <RotateCw className="size-4" /> Try Again
              </button>
            </div>
          )}

          {!isSummarizing && !summaryError && summary && (
            <div className="space-y-4">
              {/* CORE INTENT (What they are trying to say) */}
              {summary.intent && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-primary/30 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide">
                      <Target className="size-4 text-primary" /> What {selectedUser?.fullName?.split(" ")[0] || "They"} Are Trying To Say
                    </span>
                    <span className="badge badge-primary badge-xs">Core Goal</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-base-content">{summary.intent}</p>
                </div>
              )}

              {/* Overview */}
              {summary.overview && (
                <div className="p-4 rounded-xl bg-base-200/60 border border-base-300">
                  <div className="flex items-center gap-2 mb-1.5 font-medium text-sm text-primary">
                    <FileText className="size-4" />
                    <span>Overview</span>
                  </div>
                  <p className="text-sm leading-relaxed text-base-content/90">{summary.overview}</p>
                </div>
              )}

              {/* Suggested Reply */}
              {summary.suggestedReply && (
                <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-300 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[11px] font-semibold uppercase text-secondary flex items-center gap-1">
                      <MessageSquare className="size-3" /> Recommended Reply
                    </span>
                    <p className="text-xs italic text-base-content/80 truncate">"{summary.suggestedReply}"</p>
                  </div>
                </div>
              )}


              {/* Main Discussion Points */}
              {summary.mainPoints?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" /> Key Discussion Points
                  </h4>
                  <div className="p-3.5 rounded-xl bg-base-200/40 border border-base-300 space-y-2">
                    {summary.mainPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                        <span className="text-base-content/90">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {summary.decisions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-success" /> Important Decisions
                  </h4>
                  <div className="p-3.5 rounded-xl bg-success/5 border border-success/20 space-y-2">
                    {summary.decisions.map((decision, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span className="text-base-content/90">{decision}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {summary.actionItems?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                    <ListTodo className="size-3.5 text-warning" /> Action Items & Tasks
                  </h4>
                  <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/20 space-y-2">
                    {summary.actionItems.map((action, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="badge badge-warning badge-xs shrink-0 mt-1"></span>
                        <span className="text-base-content/90">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unresolved Questions */}
              {summary.unresolvedQuestions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                    <HelpCircle className="size-3.5 text-info" /> Open & Unresolved Questions
                  </h4>
                  <div className="p-3.5 rounded-xl bg-info/5 border border-info/20 space-y-2">
                    {summary.unresolvedQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <HelpCircle className="size-4 text-info shrink-0 mt-0.5" />
                        <span className="text-base-content/90">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-base-300 flex items-center justify-between bg-base-200/50">
          <button
            onClick={handleRegenerate}
            disabled={isSummarizing}
            className="btn btn-sm btn-ghost gap-2 text-xs"
          >
            <RotateCw className={`size-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
            Regenerate
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              disabled={isSummarizing || !summary}
              className="btn btn-sm btn-outline gap-2 text-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copy Summary
                </>
              )}
            </button>
            <button onClick={closeSummaryModal} className="btn btn-sm btn-primary text-xs px-4">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;
