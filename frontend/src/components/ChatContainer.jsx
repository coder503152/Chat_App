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
import { formatMessageTime } from "../lib/utils";

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

        {(messages || []).map((message) => {

          const isMyMessage = message.senderId === authUser?._id;
          const isEditing = editingMessageId === message._id;

          const isMediaOnly = (message.image || message.video) && !message.text;

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"} group relative animate-fadeIn`}
            >
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

              <div className="chat-header mb-1 flex items-center gap-1.5 opacity-75">
                <time className="text-[11px] font-mono">
                  {formatMessageTime(message.createdAt)}
                </time>
                {message.isSending && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                    <span className="loading loading-spinner loading-xs text-emerald-400"></span> Sending...
                  </span>
                )}
                {message.isEdited && !message.isSending && (
                  <span className="text-[10px] opacity-60 italic font-light">(edited)</span>
                )}
              </div>

              <div
                className={`chat-bubble flex flex-col relative shadow-sm rounded-2xl ${
                  isMediaOnly ? "p-1" : "p-3 sm:p-3.5"
                } ${
                  isMyMessage
                    ? "bg-primary text-primary-content rounded-tr-xs"
                    : "bg-base-200 text-base-content border border-base-300 rounded-tl-xs"
                }`}
              >
                {message.image && (
                  <div
                    onClick={() => !message.isSending && setPreviewMedia({ type: "image", url: message.image })}
                    className={`relative group overflow-hidden rounded-xl ${message.text ? "mb-2" : "mb-0"} border border-base-content/20 shadow-xs ${
                      message.isSending ? "cursor-wait" : "cursor-pointer"
                    }`}
                    title={message.isSending ? "Uploading image..." : "Click to view full image"}
                  >
                    <img
                      src={message.image}
                      alt="Attachment"
                      className={`sm:max-w-[260px] max-h-[240px] w-full object-cover transition-all ${
                        message.isSending ? "opacity-40 blur-[1px]" : "group-hover:scale-105 duration-300"
                      }`}
                    />
                    {message.isSending && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2">
                        <div className="size-10 rounded-full bg-black/70 border border-emerald-500/50 flex items-center justify-center shadow-xl">
                          <span className="loading loading-spinner loading-sm text-emerald-400"></span>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Sending...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {message.video && (
                  <div
                    onClick={() => !message.isSending && setPreviewMedia({ type: "video", url: message.video })}
                    className={`relative group overflow-hidden rounded-xl ${message.text ? "mb-2" : "mb-0"} border border-base-content/20 shadow-xs w-[220px] sm:w-[260px] h-[140px] sm:h-[160px] bg-black/60 flex items-center justify-center ${
                      message.isSending ? "cursor-wait" : "cursor-pointer"
                    }`}
                    title={message.isSending ? "Uploading video..." : "Click to play video"}
                  >
                    <video
                      src={message.video}
                      className={`w-full h-full object-cover transition-opacity ${
                        message.isSending ? "opacity-40 blur-[1px]" : "opacity-85 group-hover:opacity-100"
                      }`}
                      preload="metadata"
                    />

                    {message.isSending ? (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-2">
                        <div className="size-11 sm:size-12 rounded-full bg-black/70 border border-emerald-500/50 flex items-center justify-center shadow-xl">
                          <span className="loading loading-spinner loading-md text-emerald-400"></span>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-300 bg-black/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          Uploading video...
                        </span>
                      </div>
                    ) : (
                      <div className="absolute size-11 sm:size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl ring-4 ring-emerald-500/30">
                        <Play className="size-5 sm:size-6 fill-white translate-x-0.5" />
                      </div>
                    )}
                  </div>
                )}




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
                  message.text && (
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                      {message.text}
                    </p>
                  )
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
