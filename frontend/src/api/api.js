// api/api.js - All backend API calls in one place
// Base URL for the Flask backend
const BASE_URL = "http://localhost:5000/api";

// ─── Helper ───────────────────────────────────────────────────────────────────
// Generic fetch wrapper that returns parsed JSON or empty array on error
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (err) {
    console.error("API Error:", err.message);
    return null;
  }
}

// ─── Videos ───────────────────────────────────────────────────────────────────

/**
 * Get all videos with optional filters/sorting.
 * @param {Object} filters - { status, folder, search, sort }
 */
export async function getVideos(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.folder) params.set("folder", filters.folder);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort)   params.set("sort", filters.sort);
  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await apiFetch(`/videos/${query}`);
  return data || [];
}

/**
 * Add a new video bookmark.
 * @param {Object} videoData - { url, timestamp_seconds, status, folder }
 */
export async function addVideo(videoData) {
  return apiFetch("/videos/", {
    method: "POST",
    body: JSON.stringify(videoData),
  });
}

/**
 * Update an existing video.
 * @param {string} id - MongoDB _id
 * @param {Object} updates - fields to update
 */
export async function updateVideo(id, updates) {
  return apiFetch(`/videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a video by ID.
 * @param {string} id - MongoDB _id
 */
export async function deleteVideo(id) {
  return apiFetch(`/videos/${id}`, { method: "DELETE" });
}

/**
 * Fetch dashboard stats and grouped videos.
 */
export async function getDashboardStats() {
  return apiFetch("/videos/dashboard/stats");
}

// ─── Folders ──────────────────────────────────────────────────────────────────

export async function getFolders() {
  const data = await apiFetch("/folders/");
  return data || [];
}

export async function createFolder(name) {
  return apiFetch("/folders/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteFolder(id) {
  return apiFetch(`/folders/${id}`, { method: "DELETE" });
}

export async function renameFolder(id, name) {
  return apiFetch(`/folders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
}
