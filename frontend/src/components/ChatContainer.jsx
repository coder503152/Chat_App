import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, Check, X, Sparkles, Play, Download } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AISummaryModal from "./AISummaryModal";
import AIAskModal from "./AIAskModal";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatMessageDateSeparator } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    updateMessage,
    deleteMessage,
    newIncomingCount,
    resetNewIncomingCount,
  } = useChatStore();
  const { summarizeConversation, isSummarizing } = useAIStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);


  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
    setIsBannerDismissed(false);

    subscribeToMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  const handleStartEdit = (message) => {
    setEditingMessageId(message._id);
    setEditText(message.text || "");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editText.trim() || isUpdating) return;
    setIsUpdating(true);
    const success = await updateMessage(messageId, editText.trim());
    setIsUpdating(false);
    if (success) {
      setEditingMessageId(null);
      setEditText("");
    }
  };

  const handleConfirmDelete = (messageId) => {
    setDeleteConfirmId(messageId);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmId || deletingMessageId) return;
    setDeletingMessageId(deleteConfirmId);
    await deleteMessage(deleteConfirmId);
    setDeletingMessageId(null);
    setDeleteConfirmId(null);
  };

  const handleSummarizeNewBatch = () => {
    if (selectedUser?._id) {
      summarizeConversation(selectedUser._id);
    }
    resetNewIncomingCount();
    setIsBannerDismissed(true);
  };


  const handleKeyDown = (e, messageId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100/30">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
        <AISummaryModal />
        <AIAskModal />
      </div>
    );
  }

  const showNewMessageBanner = newIncomingCount >= 1 && !isBannerDismissed;
  const countBadgeText = newIncomingCount >= 5 ? `${newIncomingCount}+` : `${newIncomingCount}`;


  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100/40 relative">
      <ChatHeader />

      {/* Real-time Dynamic New Messages Summary Alert Banner */}
      {showNewMessageBanner && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/10 border border-primary/30 shadow-lg flex items-center justify-between gap-3 animate-fadeIn z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-primary text-primary-content shrink-0 shadow-sm">
              <Sparkles className="size-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-base-content flex items-center gap-1.5">
                <span>{countBadgeText} new messages received</span>
                <span className="badge badge-xs badge-primary animate-pulse">Live</span>
              </p>
              <p className="text-[11px] text-base-content/70 truncate">
                Click to let AI summarize the chat & explain what {selectedUser?.fullName?.split(" ")[0]} is trying to say.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSummarizeNewBatch}
              disabled={isSummarizing}
              className="btn btn-xs sm:btn-sm btn-primary rounded-xl font-semibold text-xs gap-1 shadow-sm"
            >
              <Sparkles className="size-3.5" />
              Summarize Chat
            </button>
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="btn btn-xs btn-ghost btn-circle text-base-content/50 hover:text-base-content"
              title="Dismiss banner"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}


      <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">

        {(messages || []).map((message, index) => {
          const isMyMessage = (message.senderId?._id ? String(message.senderId._id) : String(message.senderId)) === String(authUser?._id);
          const isEditing = editingMessageId === message._id;
          const isMediaOnly = (message.image || message.video) && !message.text;

          // Consecutive checks (within 2 minutes)
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const isPrevFromSameUser = prevMsg && (prevMsg.senderId?._id ? String(prevMsg.senderId._id) : String(prevMsg.senderId)) === (message.senderId?._id ? String(message.senderId._id) : String(message.senderId));
          const isConsecutive = isPrevFromSameUser && (new Date(message.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 120000;

          // Date Separator (day transition)
          const showDateSeparator = !prevMsg || new Date(message.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

          return (
            <div key={message._id} className="flex flex-col">
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4 select-none animate-fadeIn">
                  <span className="bg-base-200/80 text-base-content/60 text-[11px] font-semibold px-3 py-1 rounded-full border border-base-300 shadow-3xs">
                    {formatMessageDateSeparator(message.createdAt)}
                  </span>
                </div>
              )}

              <div
                className={`chat ${isMyMessage ? "chat-end" : "chat-start"} group relative ${
                  isConsecutive ? "mt-0.5 sm:mt-1" : "mt-3 sm:mt-4"
                } animate-fadeIn`}
              >
                {/* Avatar */}
                {isConsecutive ? (
                  <div className="chat-image size-10 shrink-0 invisible lg:block" />
                ) : (
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full border border-base-300 shadow-xs overflow-hidden">
                      <img
                        src={
                          isMyMessage
                            ? authUser?.profilePic || "/avatar.png"
                            : selectedUser?.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Sender Header */}
                {!isConsecutive && (
                  <div className="chat-header mb-1 flex items-center gap-1.5 opacity-60">
                    <span className="font-semibold text-[11px] text-base-content/80">
                      {isMyMessage ? "You" : selectedUser?.fullName?.split(" ")[0]}
                    </span>
                  </div>
                )}

                {/* Chat Bubble */}
                <div
                  className={`chat-bubble flex flex-col relative shadow-sm max-w-[85%] sm:max-w-[70%] ${
                    isMediaOnly ? "p-1" : "p-3 pb-1.5 pr-4"
                  } ${
                    isMyMessage
                      ? "bg-primary text-primary-content rounded-2xl rounded-tr-none"
                      : "bg-base-200 text-base-content border border-base-300 rounded-2xl rounded-tl-none"
                  }`}
                >
                  {/* Image message */}
                  {message.image && (
                    <div
                      onClick={() => !message.isSending && setPreviewMedia({ type: "image", url: message.image })}
                      className={`relative group overflow-hidden rounded-xl ${message.text ? "mb-2" : "mb-0"} border border-base-content/10 shadow-xs max-w-full ${
                        message.isSending ? "cursor-wait" : "cursor-pointer"
                      }`}
                      title={message.isSending ? "Uploading image..." : "Click to view full image"}
                    >
                      <img
                        src={message.image}
                        alt="Attachment"
                        className={`max-w-full sm:max-w-[280px] max-h-[220px] object-cover transition-all rounded-lg ${
                          message.isSending ? "opacity-40 blur-[1px]" : "group-hover:scale-[1.02] duration-300"
                        }`}
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                          e.target.title = "Failed to load image";
                        }}
                      />
                      {message.isSending && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2">
                          <span className="loading loading-spinner loading-sm text-emerald-400"></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video message */}
                  {message.video && (
                    <div
                      onClick={() => !message.isSending && setPreviewMedia({ type: "video", url: message.video })}
                      className={`relative group overflow-hidden rounded-xl ${message.text ? "mb-2" : "mb-0"} border border-base-content/10 shadow-xs max-w-full w-[240px] sm:w-[280px] h-[150px] sm:h-[180px] bg-black/60 flex items-center justify-center ${
                        message.isSending ? "cursor-wait" : "cursor-pointer"
                      }`}
                      title={message.isSending ? "Uploading video..." : "Click to play video"}
                    >
                      <video
                        src={message.video}
                        className={`w-full h-full object-cover transition-opacity rounded-lg ${
                          message.isSending ? "opacity-40 blur-[1px]" : "opacity-85 group-hover:opacity-100"
                        }`}
                        preload="metadata"
                      />

                      {message.isSending ? (
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-2">
                          <span className="loading loading-spinner loading-md text-emerald-400"></span>
                        </div>
                      ) : (
                        <div className="absolute size-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg ring-4 ring-emerald-500/25">
                          <Play className="size-4 fill-white translate-x-0.5" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text or Edit UI */}
                  {isEditing ? (
                    <div className="flex flex-col gap-2 min-w-[220px] pt-1">
                      <input
                        type="text"
                        className="input input-bordered input-xs sm:input-sm w-full bg-base-100 text-base-content rounded-xl focus:outline-none"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, message._id)}
                        autoFocus
                        disabled={isUpdating}
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="btn btn-ghost btn-xs text-xs gap-1 rounded-lg"
                          title="Cancel (Esc)"
                        >
                          <X className="size-3" /> Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(message._id)}
                          disabled={!editText.trim() || isUpdating}
                          className="btn btn-primary btn-xs text-xs gap-1 rounded-lg"
                          title="Save (Enter)"
                        >
                          {isUpdating ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Check className="size-3" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                          {message.text}
                        </p>
                      )}

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono select-none align-middle ${
                        isMyMessage ? "text-primary-content/70" : "text-base-content/50"
                      }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {message.isEdited && <span className="opacity-80 font-sans">(edited)</span>}
                        {isMyMessage && !message.isSending && (
                          <span className="ml-0.5">
                            {message.isRead ? (
                              <span className="font-bold text-[10px] text-accent tracking-tighter" title="Seen">✓✓</span>
                            ) : (
                              <span className="text-[10px]" title="Delivered">✓</span>
                            )}
                          </span>
                        )}
                        {message.isSending && (
                          <span className="loading loading-spinner loading-[8px]"></span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Hover action toolbar for user's own sent messages */}
                  {isMyMessage && !isEditing && (
                    <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-0.5 bg-base-300/90 backdrop-blur-md border border-base-content/10 px-1 py-0.5 rounded-lg shadow-md z-10 animate-fadeIn">
                      {message.text && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(message)}
                          className="btn btn-ghost btn-xs btn-circle p-1 hover:text-primary transition-colors"
                          title="Edit message"
                        >
                          <Pencil className="size-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(message._id)}
                        className="btn btn-ghost btn-xs btn-circle p-1 hover:text-error transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>


      <MessageInput />
      <AISummaryModal />
      <AIAskModal />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="font-semibold text-lg text-base-content">Delete Message?</h3>
            <p className="text-sm text-base-content/70">
              Are you sure you want to permanently delete this message? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deletingMessageId}
                className="btn btn-sm btn-error rounded-xl px-4"
              >
                {deletingMessageId ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Media Viewer Modal */}
      {previewMedia &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl w-screen h-screen flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden animate-fadeIn"
            onClick={() => setPreviewMedia(null)}
          >
            {/* Top Header Bar */}
            <div className="w-full flex items-center justify-between z-50 px-2 sm:px-4 py-2 shrink-0">
              <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                {previewMedia.type === "image" ? (
                  <span className="badge badge-neutral gap-1.5 px-3 py-2 border border-white/20 text-white">📷 Photo Viewer</span>
                ) : (
                  <span className="badge gap-1.5 px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🎥 Video Player</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-circle btn-sm sm:btn-md bg-white/15 hover:bg-white/30 border-0 text-white transition-all shadow-lg"
                  title="Download / Open original"
                >
                  <Download className="size-4 sm:size-5" />
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="btn btn-circle btn-sm sm:btn-md bg-white/15 hover:bg-white/30 border-0 text-white transition-all shadow-lg"
                  title="Close"
                >
                  <X className="size-5 sm:size-6" />
                </button>
              </div>
            </div>

            {/* Media Content Area */}
            <div
              className="flex-1 w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-4 my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {previewMedia.type === "image" ? (
                <img
                  src={previewMedia.url}
                  alt="Full View"
                  className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
export default ChatContainer;
