// src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getOrCreateChat,
  sendMessage,
  subscribeToMessages,
  subscribeToChat,
  markChatAsRead,
} from "../lib/firestore";
import { useTyping, useOtherUserTyping } from "../hooks/useTyping";
import { useNotificationSound } from "../hooks/useNotificationSound";
import { formatDateLabel, getDayKey } from "../utils/formatDate";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import DateSeparator from "./DateSeparator";

export default function ChatWindow({ selectedUser, onOpenSidebar }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("soundEnabled") !== "false"
  );
  const messagesEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const { play: playNotification } = useNotificationSound();

  const { handleTyping } = useTyping(chatId, currentUser.uid);
  const otherUserIsTyping = useOtherUserTyping(chatData, selectedUser?.uid);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem("soundEnabled", soundEnabled);
  }, [soundEnabled]);

  // Load chat
  useEffect(() => {
    if (!selectedUser) {
      setChatId(null);
      setMessages([]);
      setChatData(null);
      lastMessageIdRef.current = null;
      return;
    }

    let unsubscribeMessages = null;
    let unsubscribeChat = null;

    async function setupChat() {
      setLoading(true);
      try {
        const id = await getOrCreateChat(currentUser.uid, selectedUser.uid);
        setChatId(id);

        unsubscribeMessages = subscribeToMessages(id, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });

        unsubscribeChat = subscribeToChat(id, (data) => {
          setChatData(data);
        });
      } catch (err) {
        console.error("Failed to load chat:", err);
        setLoading(false);
      }
    }

    setupChat();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [selectedUser, currentUser.uid]);

  // Mark as read
  useEffect(() => {
    if (!chatId) return;
    async function markRead() {
      try {
        await markChatAsRead(chatId, currentUser.uid);
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }
    markRead();
  }, [chatId, messages.length, currentUser.uid]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Play notification sound on new incoming messages
  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];

    // First load — just record the latest, do not play
    if (lastMessageIdRef.current === null) {
      lastMessageIdRef.current = latest.id;
      return;
    }

    // New message arrived
    if (latest.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = latest.id;

      if (latest.senderId !== currentUser.uid && soundEnabled) {
        playNotification();
      }
    }
  }, [messages, currentUser.uid, soundEnabled, playNotification]);

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

  const otherUserLastRead = chatData?.lastReadAt?.[selectedUser.uid];

  let lastDayKey = null;

  return (
    <div className="flex-1 flex flex-col bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-white p-1 rounded hover:bg-gray-800"
          aria-label="Open sidebar"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white truncate">
            {selectedUser.username}
          </p>
          {otherUserIsTyping ? (
            <p className="text-xs text-blue-400 italic">
              {selectedUser.username} is typing...
            </p>
          ) : selectedUser.status === "online" ? (
            <p className="text-xs text-green-500">Online</p>
          ) : (
            <p className="text-xs text-gray-400">Offline</p>
          )}
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled((s) => !s)}
          title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
          className="text-white p-2 rounded hover:bg-gray-800 transition"
        >
          {soundEnabled ? (
            // Speaker on icon
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
                d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M6 10v4a1 1 0 001 1h2l4 4V5L9 9H7a1 1 0 00-1 1z"
              />
            </svg>
          ) : (
            // Speaker muted icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l4-4m0 0l-4-4m4 4h-4"
              />
            </svg>
          )}
        </button>
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

          const isOwn = msg.senderId === currentUser.uid;

          let isRead = false;
          if (isOwn && otherUserLastRead && msg.createdAt) {
            const msgTime = msg.createdAt.toDate
              ? msg.createdAt.toDate().getTime()
              : new Date(msg.createdAt).getTime();
            isRead = msgTime <= otherUserLastRead;
          }

          return (
            <div key={msg.id}>
              {showSeparator && (
                <DateSeparator label={formatDateLabel(msg.createdAt)} />
              )}
              <MessageBubble message={msg} isOwn={isOwn} isRead={isRead} />
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!chatId}
      />
    </div>
  );
}