// src/pages/Chat.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  usePresence(currentUser);

  return (
    <div className="h-screen flex bg-gray-800">
      <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}