// src/hooks/useTyping.js
import { useEffect, useRef, useState } from "react";
import { setTyping } from "../lib/firestore";

/**
 * Debounced typing indicator.
 * Call `handleTyping()` whenever the user types a character.
 * Automatically clears the typing state after 2 seconds of inactivity.
 */
export function useTyping(chatId, userId) {
  const timeoutRef = useRef(null);
  const isCurrentlyTypingRef = useRef(false);

  function handleTyping() {
    if (!chatId) return;

    // Set typing immediately if not already set
    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      setTyping(chatId, userId, true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout — after 2s of inactivity, mark as stopped
    timeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      setTyping(chatId, userId, false);
    }, 2000);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isCurrentlyTypingRef.current && chatId) {
        setTyping(chatId, userId, false);
      }
    };
  }, [chatId, userId]);

  return { handleTyping };
}

/**
 * Returns whether the OTHER user is currently typing.
 * Considers them typing if their timestamp is < 3 seconds old.
 */
export function useOtherUserTyping(chatData, otherUserId) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatData?.typing || !otherUserId) {
      setIsTyping(false);
      return;
    }

    const otherTypingTime = chatData.typing[otherUserId];
    if (!otherTypingTime) {
      setIsTyping(false);
      return;
    }

    // Consider them typing if timestamp is within last 3 seconds
    const age = Date.now() - otherTypingTime;
    setIsTyping(age < 3000);

    // Auto-clear after the window expires
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, Math.max(3000 - age, 0));

    return () => clearTimeout(timeout);
  }, [chatData, otherUserId]);

  return isTyping;
}