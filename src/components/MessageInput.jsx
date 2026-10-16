// src/components/MessageInput.jsx
import { useState, useRef } from "react";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    if (onTyping) onTyping();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setShowEmoji(false);
  }

  function handleEmojiSelect(emoji) {
    const input = inputRef.current;
    if (!input) {
      setText((t) => t + emoji);
      return;
    }

    // Insert emoji at cursor position
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);

    // Restore cursor after the inserted emoji
    requestAnimationFrame(() => {
      input.focus();
      const pos = start + emoji.length;
      input.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="relative">
      {showEmoji && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmoji(false)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 border-t border-gray-800 bg-gray-900"
      >
        {/* Emoji toggle button */}
        <button
          type="button"
          onClick={() => setShowEmoji((s) => !s)}
          disabled={disabled}
          title="Insert emoji"
          className={`p-2 rounded-full transition disabled:opacity-50 ${
            showEmoji
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          placeholder={
            disabled ? "Select a user to start chatting" : "Type a message..."
          }
          disabled={disabled}
          className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-full font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}