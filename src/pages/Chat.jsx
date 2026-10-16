// src/pages/Chat.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="h-screen flex bg-gray-800">
      <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}