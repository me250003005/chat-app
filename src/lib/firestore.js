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
  deleteDoc,
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

/**
 * Set the user's online/offline status.
 */
export async function setUserStatus(userId, status) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      status,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Subscribe to real-time updates of all users except the current user.
 * Returns an unsubscribe function.
 */
export function subscribeToUsers(currentUserId, callback) {
  const usersRef = collection(db, "users");
  const unsubscribe = onSnapshot(usersRef, (snapshot) => {
    const users = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.uid !== currentUserId) {
        users.push(data);
      }
    });
    callback(users);
  });
  return unsubscribe;
}
/**
 * Subscribe to real-time updates of all chats that involve the current user.
 * Returns a map of { otherUserId: { lastMessage, lastMessageAt } }.
 */
export function subscribeToChats(currentUserId, callback) {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", currentUserId));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatMap = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const otherId = data.participants.find((id) => id !== currentUserId);
      if (otherId) {
        chatMap[otherId] = {
          lastMessage: data.lastMessage || "",
          lastMessageAt: data.lastMessageAt || null,
        };
      }
    });
    callback(chatMap);
  });

  return unsubscribe;
}
/**
 * Update the typing state for a user in a chat.
 * Passing null clears their typing state.
 */
export async function setTyping(chatId, userId, isTyping) {
  const chatRef = doc(db, "chats", chatId);
  await setDoc(
    chatRef,
    {
      typing: {
        [userId]: isTyping ? Date.now() : null,
      },
    },
    { merge: true }
  );
}

/**
 * Subscribe to a chat document to get real-time typing state.
 */
export function subscribeToChat(chatId, callback) {
  const chatRef = doc(db, "chats", chatId);
  const unsubscribe = onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
  return unsubscribe;
}
/**
 * Mark a chat as read by the given user.
 */
export async function markChatAsRead(chatId, userId) {
  const chatRef = doc(db, "chats", chatId);
  await setDoc(
    chatRef,
    {
      lastReadAt: {
        [userId]: Date.now(),
      },
    },
    { merge: true }
  );
}
/**
 * Delete a message. Only allowed if the current user is the sender.
 */
export async function deleteMessage(chatId, messageId) {
  const messageRef = doc(db, "chats", chatId, "messages", messageId);
  await deleteDoc(messageRef);
}