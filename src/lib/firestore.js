// src/lib/firestore.js
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetch all users from Firestore except the current user.
 */
export async function getAllUsers(currentUserId) {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  const users = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.uid !== currentUserId) {
      users.push(data);
    }
  });
  return users;
}

/**
 * Get an existing chat between two users, or create a new one.
 */
export async function getOrCreateChat(userId1, userId2) {
  const chatId = [userId1, userId2].sort().join("_");

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
    });
  }

  return chatId;
}

/**
 * Send a message in a chat.
 */
export async function sendMessage(chatId, senderId, text) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  const chatRef = doc(db, "chats", chatId);
  await setDoc(
    chatRef,
    {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to real-time messages in a chat.
 */
export function subscribeToMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(messages);
  });

  return unsubscribe;
}