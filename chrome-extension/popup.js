// popup.js
// Runs inside the extension popup when you click the toolbar icon.

const BACKEND_URL = "http://localhost:5000/api/videos/";

// This function is injected INTO the YouTube tab to read video info.
// It cannot reference any variables from popup.js — it runs in a different context.
function getVideoInfo() {
  const video = document.querySelector("video");
  const currentTime = video ? Math.floor(video.currentTime) : 0;
  const url = window.location.href;
  // Remove " - YouTube" from the page title
  const title = document.title.replace(/\s*[-–]\s*YouTube\s*$/, "").trim();
  return { url, currentTime, title };
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  const saveBtn  = document.getElementById("save-btn");
  const status   = document.getElementById("status-select").value;
  const folder   = document.getElementById("folder-input").value.trim();

  statusEl.className = "";
  statusEl.textContent = "Detecting video...";
  saveBtn.disabled = true;

  // Get the currently active browser tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Make sure we're on a YouTube watch page
  if (!tab.url || !tab.url.includes("youtube.com/watch")) {
    statusEl.textContent = "⚠ Open a YouTube video first.";
    statusEl.className = "error";
    saveBtn.disabled = false;
    return;
  }

  // Inject the function into the YouTube tab and get video info
  let videoInfo;
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getVideoInfo,
    });
    videoInfo = results[0].result;
  } catch (err) {
    statusEl.textContent = "❌ Could not read video info.";
    statusEl.className = "error";
    saveBtn.disabled = false;
    return;
  }

  statusEl.textContent = `Saving at ${videoInfo.currentTime}s...`;

  // Send bookmark data to the Flask backend
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: videoInfo.url,
        title: videoInfo.title,
        timestamp_seconds: videoInfo.currentTime,
        status: status,
        folder: folder,
      }),
    });

    if (response.ok) {
      statusEl.textContent = "✅ Bookmark saved!";
      statusEl.className = "success";
    } else {
      const err = await response.json();
      statusEl.textContent = `Error: ${err.error || "Unknown error"}`;
      statusEl.className = "error";
    }
  } catch (err) {
    statusEl.textContent = "❌ Can't reach backend. Is Flask running?";
    statusEl.className = "error";
  }

  saveBtn.disabled = false;
});
