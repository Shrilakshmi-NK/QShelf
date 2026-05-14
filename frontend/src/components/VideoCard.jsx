// components/VideoCard.jsx
// Displays a single video bookmark with thumbnail, status badge, and action buttons

import { deleteVideo, updateVideo } from "../api/api";
import { buildYouTubeUrl, formatDate } from "../utils/timestamp";

// Status badge colors
const STATUS_COLORS = {
  "Not Started": "badge-gray",
  "Watching": "badge-blue",
  "Completed": "badge-green",
};

export default function VideoCard({ video, onEdit, onDeleteSuccess }) {
  // Build YouTube thumbnail URL from video ID
  const thumbnail = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;

  // URL to open the video at the saved timestamp
  const watchUrl = buildYouTubeUrl(video.video_id, video.timestamp_seconds);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${video.title}"?`)) return;
    await deleteVideo(video._id);
    onDeleteSuccess();
  };

  const handleMarkComplete = async () => {
    await updateVideo(video._id, { status: "Completed" });
    onDeleteSuccess(); // reuse to trigger parent refresh
  };

  return (
    <div className="video-card">
      {/* Thumbnail */}
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="card-thumb-link">
        <img
          src={thumbnail}
          alt={video.title}
          className="card-thumbnail"
          onError={(e) => {
            // Fallback if thumbnail fails
            e.target.src = "https://via.placeholder.com/320x180?text=No+Thumbnail";
          }}
        />
        {/* Timestamp overlay */}
        {video.timestamp_seconds > 0 && (
          <span className="timestamp-badge">{video.timestamp_readable}</span>
        )}
      </a>

      {/* Card body */}
      <div className="card-body">
        <h3 className="card-title" title={video.title}>
          {video.title}
        </h3>

        <div className="card-meta">
          <span className={`status-badge ${STATUS_COLORS[video.status] || "badge-gray"}`}>
            {video.status}
          </span>
          {video.folder && (
            <span className="folder-tag">📁 {video.folder}</span>
          )}
        </div>

        <p className="card-date">Added {formatDate(video.created_at)}</p>

        {/* Action buttons */}
        <div className="card-actions">
          {/* Open video at timestamp */}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            ▶ Open
          </a>

          {/* Edit progress */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(video)}
          >
            ✏ Edit
          </button>

          {/* Quick-complete (only show if not already completed) */}
          {video.status !== "Completed" && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleMarkComplete}
              title="Mark as completed"
            >
              ✓
            </button>
          )}

          {/* Delete */}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            title="Delete bookmark"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
