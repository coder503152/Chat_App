import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

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
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
        <AISummaryModal />
        <AIAskModal />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMyMessage = message.senderId === authUser._id;
          const isEditing = editingMessageId === message._id;

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"} group relative`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-1.5">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
                {message.isEdited && (
                  <span className="text-[10px] opacity-40 italic font-light">(edited)</span>
                )}
              </div>

              <div className="chat-bubble flex flex-col relative">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {isEditing ? (
                  <div className="flex flex-col gap-2 min-w-[200px] pt-1">
                    <input
                      type="text"
                      className="input input-bordered input-xs sm:input-sm w-full bg-base-100 text-base-content rounded focus:outline-none"
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
                        className="btn btn-ghost btn-xs text-xs gap-1"
                        title="Cancel (Esc)"
                      >
                        <X className="size-3" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(message._id)}
                        disabled={!editText.trim() || isUpdating}
                        className="btn btn-primary btn-xs text-xs gap-1"
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
                  message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>
                )}

                {/* Hover action toolbar for user's own sent messages */}
                {isMyMessage && !isEditing && (
                  <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-1 bg-base-300/90 backdrop-blur-sm border border-base-content/10 px-1.5 py-0.5 rounded-lg shadow-md z-10 animate-fadeIn">
                    {message.text && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(message)}
                        className="btn btn-ghost btn-xs btn-circle p-1 hover:text-primary"
                        title="Edit message"
                      >
                        <Pencil className="size-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(message._id)}
                      className="btn btn-ghost btn-xs btn-circle p-1 hover:text-error"
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
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deletingMessageId}
                className="btn btn-sm btn-error px-4"
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
    </div>
  );
};
export default ChatContainer;
