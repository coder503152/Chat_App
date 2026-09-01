import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Sparkles, Wand2, Reply } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  const { sendMessage, selectedUser, replyingTo, setReplyingTo } = useChatStore();
  const {
    replySuggestions,
    isGeneratingSuggestions,
    getReplySuggestions,
    clearSuggestions,
  } = useAIStore();

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Reset typing status on selectedUser change or component unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      const socket = useAuthStore.getState().socket;
      if (socket && isTypingRef.current && selectedUser?._id) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }
      isTypingRef.current = false;
    };
  }, [selectedUser?._id]);

  const adjustHeight = () => {
    const textarea = textInputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    adjustHeight();

    const socket = useAuthStore.getState().socket;
    if (!socket || !selectedUser?._id) return;

    if (newText.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(`Image size exceeds limit (${sizeMB} MB). Maximum allowed image size is 10 MB.`, {
          duration: 5000,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setVideoPreview(null);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(`Video size exceeds limit (${sizeMB} MB). Maximum allowed video size is 50 MB.`, {
          duration: 5000,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select an image or video file");
    }
  };

  const removeMedia = () => {
    setImagePreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (isSending || (!text.trim() && !imagePreview && !videoPreview)) return;

    setIsSending(true);

    const socket = useAuthStore.getState().socket;
    if (socket && isTypingRef.current && selectedUser?._id) {
      isTypingRef.current = false;
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const messageData = {
      text: replyingTo
        ? `↩️ Replying to ${replyingTo.senderName}:\n"${replyingTo.text?.slice(0, 80)}${(replyingTo.text?.length || 0) > 80 ? "..." : ""}"\n\n${text.trim()}`
        : text.trim(),
      image: imagePreview,
      video: videoPreview,
    };

    // Reset composer inputs immediately
    setText("");
    setImagePreview(null);
    setVideoPreview(null);
    setReplyingTo(null);
    clearSuggestions();
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textInputRef.current) textInputRef.current.style.height = "auto";


    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestReply = () => {
    if (selectedUser?._id) {
      getReplySuggestions(selectedUser._id);
    }
  };

  const handleSelectSuggestion = (suggestionText) => {
    setText(suggestionText);
    clearSuggestions();
    if (textInputRef.current) {
      textInputRef.current.focus();
      // Trigger size adjustment
      setTimeout(adjustHeight, 10);
    }
  };

  const canSend = (text.trim() || imagePreview || videoPreview) && !isSending;

  return (
    <div className="p-3 sm:p-4 w-full bg-base-100/40 border-t border-base-300/60 backdrop-blur-sm">
      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="mb-2.5 p-2.5 bg-primary/10 border-l-4 border-primary rounded-r-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-primary flex items-center gap-1.5">
              <Reply className="size-3.5" /> Replying to {replyingTo.senderName}
            </p>
            <p className="text-xs text-base-content/80 truncate font-medium mt-0.5">
              {replyingTo.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="btn btn-xs btn-ghost btn-circle text-base-content/50 hover:text-base-content"
            title="Cancel reply"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Reply Suggestions Box */}
      {isGeneratingSuggestions && (
        <div className="mb-2.5 flex items-center gap-2 text-xs text-base-content/70 px-3 py-2 bg-base-200/70 rounded-xl border border-base-300 animate-pulse">
          <span className="loading loading-spinner loading-xs text-primary"></span>
          <span className="font-medium">AI is crafting smart reply options...</span>
        </div>
      )}

      {!isGeneratingSuggestions && replySuggestions.length > 0 && (
        <div className="mb-3 bg-base-200/90 backdrop-blur-md border border-base-300 rounded-2xl p-3 shadow-md space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> AI Reply Suggestions
            </span>
            <button
              type="button"
              onClick={clearSuggestions}
              className="btn btn-xs btn-ghost btn-circle text-base-content/50 hover:text-base-content"
              title="Dismiss suggestions"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {replySuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="btn btn-xs sm:btn-sm btn-ghost hover:btn-primary justify-start text-left font-normal text-xs normal-case border border-base-300 bg-base-100 hover:bg-primary/10 rounded-xl p-2.5 h-auto line-clamp-2 transition-all shadow-2xs"
                title="Click to insert into message"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border border-base-300 shadow-sm"
            />
            <button
              onClick={removeMedia}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 border border-base-content/20 flex items-center justify-center text-base-content/80 hover:text-error hover:bg-base-200 transition-colors shadow-sm"
              type="button"
              disabled={isSending}
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <video
              src={videoPreview}
              className="w-28 h-20 object-cover rounded-xl border border-base-300 shadow-sm"
              controls
            />
            <button
              onClick={removeMedia}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 border border-base-content/20 flex items-center justify-center text-base-content/80 hover:text-error hover:bg-base-200 transition-colors shadow-sm"
              type="button"
              disabled={isSending}
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 flex items-end gap-1.5 bg-base-200/60 border border-base-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl px-3 py-1.5 transition-all">
          <textarea
            ref={textInputRef}
            rows={1}
            className="w-full bg-transparent border-none outline-none text-sm py-1.5 text-base-content placeholder:text-base-content/40 focus:ring-0 resize-none max-h-[120px] overflow-y-auto align-bottom leading-relaxed"
            placeholder={isSending ? "Uploading attachment..." : "Type a message..."}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />

          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isSending}
          />

          {/* Suggest Reply Button */}
          <button
            type="button"
            disabled={isGeneratingSuggestions || isSending}
            className={`btn btn-ghost btn-circle btn-xs sm:btn-sm shrink-0 transition-colors ${
              isGeneratingSuggestions
                ? "text-primary animate-spin"
                : "text-base-content/50 hover:text-primary hover:bg-primary/10"
            }`}
            onClick={handleSuggestReply}
            title="Suggest AI Reply"
          >
            <Wand2 size={16} />
          </button>

          {/* Single Media attach button (Images & Videos) */}
          <button
            type="button"
            disabled={isSending}
            className={`btn btn-ghost btn-circle btn-xs sm:btn-sm shrink-0 transition-colors ${
              imagePreview || videoPreview
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-base-content/50 hover:text-base-content"
            }`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach photo or video"
          >
            <Image size={17} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className={`btn btn-circle btn-sm sm:btn-md shrink-0 transition-all ${
            canSend
              ? "btn-primary shadow-md scale-105"
              : "btn-ghost text-base-content/30 btn-disabled"
          }`}
          disabled={!canSend}
          title="Send message"
        >
          {isSending ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
