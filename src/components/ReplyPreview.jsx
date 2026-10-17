// src/components/ReplyPreview.jsx
export default function ReplyPreview({ message, currentUserId, onCancel }) {
  if (!message) return null;

  const name =
    message.senderId === currentUserId ? "You" : message.senderName || "User";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-1 h-10 bg-blue-500 rounded" />
        <div className="min-w-0">
          <p className="text-xs text-blue-400 font-medium truncate">
            Replying to {name}
          </p>
          <p className="text-xs text-gray-400 truncate">{message.text}</p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
        title="Cancel reply"
        aria-label="Cancel reply"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}