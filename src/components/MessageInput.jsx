// src/components/MessageInput.jsx
import { useState } from "react";

export default function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState("");

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
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-gray-800 bg-gray-900"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={disabled ? "Select a user to start chatting" : "Type a message..."}
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
  );
}