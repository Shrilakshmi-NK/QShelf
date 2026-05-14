// utils/timestamp.js - Timestamp conversion helpers

/**
 * Convert seconds (integer) to a readable hh:mm:ss or mm:ss string.
 * Example: 3723 → "1:02:03"
 */
export function secondsToHMS(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Convert a hh:mm:ss or mm:ss string to integer seconds.
 * Example: "1:02:03" → 3723
 */
export function hmsToSeconds(hms) {
  if (!hms) return 0;
  const parts = String(hms).trim().split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

/**
 * Build a YouTube URL that opens at a specific timestamp.
 * Example: buildYouTubeUrl("abc123", 120) → "https://www.youtube.com/watch?v=abc123&t=120"
 */
export function buildYouTubeUrl(videoId, timestampSeconds) {
  const t = Math.max(0, Math.floor(timestampSeconds));
  return `https://www.youtube.com/watch?v=${videoId}&t=${t}`;
}

/**
 * Format an ISO date string into a readable "May 14, 2025" format.
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
