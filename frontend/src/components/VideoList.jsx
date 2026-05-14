// components/VideoList.jsx
// "All Videos" view: FilterBar + grid of VideoCards

import FilterBar from "./FilterBar";
import VideoCard from "./VideoCard";

export default function VideoList({
  videos,
  folders,
  filters,
  onFiltersChange,
  onEdit,
  onDeleteSuccess,
}) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Videos</h1>
        <span className="video-count">{videos.length} bookmark{videos.length !== 1 ? "s" : ""}</span>
      </div>

      <FilterBar
        filters={filters}
        folders={folders}
        onFiltersChange={onFiltersChange}
      />

      {videos.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🎬</p>
          <p>No videos found.</p>
          <p className="empty-hint">Try clearing the filters or adding a new bookmark.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onEdit={onEdit}
              onDeleteSuccess={onDeleteSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
