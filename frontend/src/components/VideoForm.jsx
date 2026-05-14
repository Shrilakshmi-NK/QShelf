// components/VideoForm.jsx
// Add a new video bookmark or edit an existing one.
// Shown inside a modal overlay.

import { useState, useEffect } from "react";
import { addVideo, updateVideo } from "../api/api";
import { secondsToHMS, hmsToSeconds } from "../utils/timestamp";

const STATUS_OPTIONS = ["Not Started", "Watching", "Completed"];

export default function VideoForm({ existingVideo, folders, onSaved, onCancel }) {
  // If existingVideo is provided, we're in "edit" mode
  const isEditing = Boolean(existingVideo);

  // ─── Form state ──────────────────────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [timestampHMS, setTimestampHMS] = useState("0:00");
  const [status, setStatus] = useState("Not Started");
  const [folder, setFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (existingVideo) {
      setUrl(existingVideo.url || "");
      setTitle(existingVideo.title || "");
      setTimestampHMS(existingVideo.timestamp_readable || "0:00");
      setStatus(existingVideo.status || "Not Started");
      setFolder(existingVideo.folder || "");
    } else {
      setUrl("");
      setTitle("");
      setTimestampHMS("0:00");
      setStatus("Not Started");
      setFolder("");
    }
  }, [existingVideo]);

  // ─── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const timestamp_seconds = hmsToSeconds(timestampHMS);

    if (isEditing && !title.trim()) {
      setError("Title is required when editing a saved video.");
      return;
    }

    const payload = { timestamp_seconds, status, folder };
    if (title.trim()) {
      payload.title = title.trim();
    }

    if (!isEditing) {
      payload.url = url;
    }

    setLoading(true);
    let result;

    if (isEditing) {
      // Update existing video - don't resend URL (it won't change)
      result = await updateVideo(existingVideo._id, payload);
    } else {
      result = await addVideo(payload);
    }

    setLoading(false);

    if (result) {
      onSaved(result);
    } else {
      setError("Something went wrong. Check the URL and try again.");
    }
  };

  return (
    <form className="video-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {isEditing ? "Edit Bookmark" : "Add New Bookmark"}
      </h2>

      {/* YouTube URL (only editable in add mode) */}
      {!isEditing && (
        <div className="form-group">
          <label htmlFor="url">YouTube URL *</label>
          <input
            id="url"
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="form-input"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">
          Title {isEditing ? "*" : "(optional)"}
        </label>
        <input
          id="title"
          type="text"
          placeholder={isEditing ? "Enter the video title" : "Enter a title or leave blank to fetch automatically"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          required={isEditing}
        />
        <small className="form-hint">
          {isEditing
            ? "Rename the saved title for this bookmark."
            : "The app will try to fetch the video title automatically, but you can provide one here if needed."}
        </small>
      </div>

      {/* Timestamp */}
      <div className="form-group">
        <label htmlFor="timestamp">Timestamp (mm:ss or hh:mm:ss)</label>
        <input
          id="timestamp"
          type="text"
          placeholder="0:00"
          value={timestampHMS}
          onChange={(e) => setTimestampHMS(e.target.value)}
          className="form-input"
        />
        <small className="form-hint">
          Where you left off. Example: 12:34 or 1:23:45
        </small>
      </div>

      {/* Status */}
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-input"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Folder */}
      <div className="form-group">
        <label htmlFor="folder">Folder (optional)</label>
        <select
          id="folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="form-input"
        >
          <option value="">None</option>
          {folders.map((f) => (
            <option key={f._id} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error && <p className="form-error">{error}</p>}

      {/* Buttons */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Bookmark"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
