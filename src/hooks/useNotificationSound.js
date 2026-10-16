// src/hooks/useNotificationSound.js
import { useRef, useCallback } from "react";
import notificationSound from "../assets/sound.wav";

export function useNotificationSound() {
  const audioRef = useRef(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(notificationSound);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Could not play notification sound:", err);
      });
    } catch (err) {
      console.warn("Could not play notification sound:", err);
    }
  }, []);

  return { play };
}