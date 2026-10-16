// src/components/MessageBubble.jsx
import { formatTime } from "../utils/formatDate";

export default function MessageBubble({ message, isOwn, isRead }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-xs md:max-w-md px-3 py-2 rounded-2xl break-words ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-700 text-white rounded-bl-sm"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOwn ? "text-blue-100" : "text-gray-400"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className={isRead ? "text-blue-200" : "text-blue-100"}>
              {isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}