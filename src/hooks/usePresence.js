// src/hooks/usePresence.js
import { useEffect } from "react";
import { setUserStatus } from "../lib/firestore";

/**
 * Marks the current user as online while the tab is open.
 * Updates lastSeen every 30 seconds.
 * Sets offline when the tab closes.
 */
export function usePresence(currentUser) {
  useEffect(() => {
    if (!currentUser) return;

    // Set online immediately
    setUserStatus(currentUser.uid, "online");

    // Heartbeat: update lastSeen every 30 seconds
    const interval = setInterval(() => {
      setUserStatus(currentUser.uid, "online");
    }, 30000);

    // Set offline when the tab closes
    function handleUnload() {
      setUserStatus(currentUser.uid, "offline");
    }
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      setUserStatus(currentUser.uid, "offline");
    };
  }, [currentUser]);
}