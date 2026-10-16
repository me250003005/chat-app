// src/utils/formatDate.js
import { format, isToday, isYesterday } from "date-fns";

/**
 * Convert a Firestore Timestamp (or Date) to a JS Date safely.
 */
export function toDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate(); // Firestore Timestamp
  if (timestamp instanceof Date) return timestamp;
  return null;
}

/**
 * Format a timestamp as "2:45 PM" style.
 */
export function formatTime(timestamp) {
  const date = toDate(timestamp);
  if (!date) return "";
  return format(date, "h:mm a");
}

/**
 * Format a timestamp as "Today", "Yesterday", or "October 12".
 */
export function formatDateLabel(timestamp) {
  const date = toDate(timestamp);
  if (!date) return "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

/**
 * Get the day key (YYYY-MM-DD) for grouping messages.
 */
export function getDayKey(timestamp) {
  const date = toDate(timestamp);
  if (!date) return "unknown";
  return format(date, "yyyy-MM-dd");
}