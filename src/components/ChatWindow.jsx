// src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getOrCreateChat,
  sendMessage,
  subscribeToMessages,
} from "../lib/firestore";
import { formatDateLabel, getDayKey } from "../utils/formatDate";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import DateSeparator from "./DateSeparator";

export default function ChatWindow({ selectedUser }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) {
      setChatId(null);
      setMessages([]);
      return;
    }

    let unsubscribe = null;

    async function setupChat() {
      setLoading(true);
      try {
        const id = await getOrCreateChat(currentUser.uid, selectedUser.uid);
        setChatId(id);

        unsubscribe = subscribeToMessages(id, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to load chat:", err);
        setLoading(false);
      }
    }

    setupChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedUser, currentUser.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    if (!chatId) return;
    await sendMessage(chatId, currentUser.uid, text);
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800 text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Welcome to Chat App</h2>
          <p>Select a user from the sidebar to start chatting.</p>
        </div>
      </div>
    );
  }

  // Group messages by day for date separators
  let lastDayKey = null;

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-white">{selectedUser.username}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <p className="text-center text-gray-400 text-sm">
            Loading messages...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            No messages yet. Say hi!
          </p>
        )}

        {messages.map((msg) => {
          const dayKey = getDayKey(msg.createdAt);
          const showSeparator = dayKey !== lastDayKey;
          lastDayKey = dayKey;

          return (
            <div key={msg.id}>
              {showSeparator && (
                <DateSeparator label={formatDateLabel(msg.createdAt)} />
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.senderId === currentUser.uid}
              />
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={!chatId} />
    </div>
  );
}