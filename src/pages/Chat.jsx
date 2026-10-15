// src/pages/Chat.jsx
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Welcome to Chat!</h1>
        <p className="text-gray-600 mb-4">
          Logged in as: <strong>{currentUser?.email}</strong>
        </p>
        <p className="text-gray-600 mb-4">
          Username: <strong>{currentUser?.displayName}</strong>
        </p>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}