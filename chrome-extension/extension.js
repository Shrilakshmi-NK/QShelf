// ============================================================
// CHROME EXTENSION - YouTube Video Bookmarker
// Save your current YouTube video + timestamp with one click
// ============================================================

// manifest.json
/*
{
  "manifest_version": 3,
  "name": "VideoMark Bookmarker",
  "version": "1.0",
  "description": "Save YouTube video timestamps to VideoMark",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["https://www.youtube.com/*"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}
*/

// ─── content_script.js ───────────────────────────────────────────────────────
// This script runs on YouTube pages and reads the current video + timestamp

/**
 * Get the current YouTube video's URL and timestamp in seconds.
 * Inject this into the active tab via chrome.scripting.executeScript.
 */
function getYouTubeVideoInfo() {
  const video = document.querySelector("video");
  const currentTime = video ? Math.floor(video.currentTime) : 0;
  const url = window.location.href;
  const title = document.title.replace(" - YouTube", "").trim();
  return { url, currentTime, title };
}

// ─── popup.js ────────────────────────────────────────────────────────────────
// Runs in the extension popup when user clicks the extension icon

const BACKEND_URL = "http://localhost:5000/api/videos/";

async function saveBookmark() {
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Detecting video...";

  // Get the active browser tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("youtube.com/watch")) {
    statusEl.textContent = "⚠ Not a YouTube video page.";
    return;
  }

  // Inject content script to read video info from the page
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getYouTubeVideoInfo,
  });

  const { url, currentTime, title } = results[0].result;

  statusEl.textContent = `Saving "${title}" at ${currentTime}s...`;

  // Send to backend
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        title,
        timestamp_seconds: currentTime,
        status: "Watching",
      }),
    });

    if (response.ok) {
      statusEl.textContent = "✅ Bookmark saved!";
    } else {
      const err = await response.json();
      statusEl.textContent = `Error: ${err.error}`;
    }
  } catch (err) {
    statusEl.textContent = "❌ Could not reach backend.";
  }
}

// Run when popup loads
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("save-btn").addEventListener("click", saveBookmark);
});

// ─── popup.html ──────────────────────────────────────────────────────────────
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { width: 260px; padding: 16px; font-family: sans-serif; background: #1a1a1a; color: #f1f1f1; }
    h2 { font-size: 1rem; margin-bottom: 12px; color: #ff4444; }
    #save-btn { width: 100%; padding: 10px; background: #ff4444; color: white;
                border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    #save-btn:hover { background: #cc0000; }
    #status { margin-top: 10px; font-size: 0.8rem; color: #aaa; }
  </style>
</head>
<body>
  <h2>▶ VideoMark</h2>
  <button id="save-btn">Save Current Timestamp</button>
  <p id="status"></p>
  <script src="popup.js"></script>
</body>
</html>
*/
