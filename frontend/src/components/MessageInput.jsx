import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAIStore } from "../store/useAIStore";
import { Image, Send, X, Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const {
    replySuggestions,
    isGeneratingSuggestions,
    getReplySuggestions,
    clearSuggestions,
  } = useAIStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form & suggestions
      setText("");
      setImagePreview(null);
      clearSuggestions();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
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
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Reply Suggestions Box */}
      {isGeneratingSuggestions && (
        <div className="mb-2 flex items-center gap-2 text-xs text-base-content/70 px-2 py-1.5 bg-base-200/60 rounded-lg border border-base-300 animate-pulse">
          <span className="loading loading-spinner loading-xs text-primary"></span>
          <span className="font-medium">Generating AI reply suggestions...</span>
        </div>
      )}

      {!isGeneratingSuggestions && replySuggestions.length > 0 && (
        <div className="mb-3 bg-base-200/80 backdrop-blur-sm border border-base-300 rounded-xl p-2.5 shadow-sm space-y-1.5 animate-fadeIn">
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
                className="btn btn-xs sm:btn-sm btn-ghost hover:btn-primary justify-start text-left font-normal text-xs normal-case border border-base-300/80 bg-base-100 hover:bg-primary/10 rounded-lg p-2 h-auto line-clamp-2 transition-all"
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
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            ref={textInputRef}
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Suggest Reply Button */}
          <button
            type="button"
            disabled={isGeneratingSuggestions}
            className={`btn btn-circle btn-sm sm:btn-md ${
              isGeneratingSuggestions ? "text-primary animate-spin" : "text-zinc-400 hover:text-primary"
            }`}
            onClick={handleSuggestReply}
            title="Suggest AI Reply"
          >
            <Wand2 size={18} />
          </button>

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
