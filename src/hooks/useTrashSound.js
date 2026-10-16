// src/hooks/useTrashSound.js
import { useRef, useCallback } from "react";

/**
 * Plays a short "trash/crumple" sound.
 * Sounds like paper crumpling — perfect for delete actions.
 * Generated via Web Audio API — no external file needed.
 */
export function useTrashSound() {
  const audioCtxRef = useRef(null);

  const play = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const duration = 0.28;

      // Master output
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      master.connect(ctx.destination);

      // Create a short white-noise buffer for the crumple texture
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Band-pass filter that sweeps down — gives the "crunch" character
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);
      filter.Q.setValueAtTime(1.2, now);

      // Second filter for warmth
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(3500, now);

      // Short amplitude bursts — like multiple crumples
      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.3, now + 0.08);
      envelope.gain.exponentialRampToValueAtTime(0.7, now + 0.13);
      envelope.gain.exponentialRampToValueAtTime(0.2, now + 0.2);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(lowpass);
      lowpass.connect(envelope);
      envelope.connect(master);

      noise.start(now);
      noise.stop(now + duration);
    } catch (err) {
      console.warn("Could not play trash sound:", err);
    }
  }, []);

  return { play };
}