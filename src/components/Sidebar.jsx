// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../lib/firestore";

export default function Sidebar({ selectedUser, setSelectedUser }) {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers(currentUser.uid);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [currentUser.uid]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Chats</h2>
          <button
            onClick={logout}
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Log Out
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Signed in as <strong>{currentUser?.displayName}</strong>
        </p>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="p-4 text-sm text-gray-400">Loading users...</p>
        )}

        {!loading && filteredUsers.length === 0 && (
          <p className="p-4 text-sm text-gray-400">
            No other users yet. Invite a friend to register.
          </p>
        )}

        {filteredUsers.map((user) => (
          <button
            key={user.uid}
            onClick={() => setSelectedUser(user)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition ${
              selectedUser?.uid === user.uid ? "bg-gray-800" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </button>
        ))}
      </div>
    </div>
  );
}