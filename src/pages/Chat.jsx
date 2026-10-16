// src/pages/Chat.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  usePresence(currentUser);

  // When a user is selected on mobile, close the sidebar
  function handleSelectUser(user) {
    setSelectedUser(user);
    // On mobile, close sidebar. On desktop, this has no visual effect.
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  return (
    <div className="h-screen flex bg-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-20 transform transition-transform duration-300
          md:relative md:translate-x-0 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={handleSelectUser}
        />
      </div>

      {/* Overlay on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
        />
      )}

      {/* Chat window */}
      <ChatWindow
        selectedUser={selectedUser}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}