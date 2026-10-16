// src/components/MessageBubble.jsx
export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl break-words ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-700 text-white rounded-bl-sm"
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}