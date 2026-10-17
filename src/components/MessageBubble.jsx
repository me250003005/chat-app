// src/components/MessageBubble.jsx
import { formatTime } from "../utils/formatDate";

export default function MessageBubble({
  message,
  isOwn,
  isRead,
  onDelete,
  onReply,
  currentUserId,
}) {
  const replyTo = message.replyTo;

  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      } mb-1 group`}
    >
      {/* Reply button — shows for own messages on the left */}
      {isOwn && (
        <div className="opacity-0 group-hover:opacity-100 transition self-center mr-2 flex gap-1">
          <button
            onClick={() => onReply(message)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Reply"
            aria-label="Reply"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 rounded hover:bg-red-600 text-gray-400 hover:text-white"
            title="Delete message"
            aria-label="Delete message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`max-w-xs md:max-w-md px-3 py-2 rounded-2xl break-words ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-700 text-white rounded-bl-sm"
        }`}
      >
        {/* Quoted reply block */}
        {replyTo && (
          <div
            className={`mb-1 px-2 py-1 rounded border-l-2 text-xs ${
              isOwn
                ? "bg-blue-700 border-blue-300 text-blue-100"
                : "bg-gray-800 border-gray-400 text-gray-300"
            }`}
          >
            <p className="font-semibold text-[11px]">
              {replyTo.senderId === currentUserId ? "You" : replyTo.senderName}
            </p>
            <p className="truncate">{replyTo.text}</p>
          </div>
        )}

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

      {/* Reply button — shows for others' messages on the right */}
      {!isOwn && (
        <div className="opacity-0 group-hover:opacity-100 transition self-center ml-2">
          <button
            onClick={() => onReply(message)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Reply"
            aria-label="Reply"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}