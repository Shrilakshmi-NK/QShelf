// components/Dashboard.jsx
// Home/Dashboard view showing stats, continue watching, and recently added

import VideoCard from "./VideoCard";

export default function Dashboard({ data, onEdit, onDeleteSuccess, onViewAll }) {
  if (!data) {
    return <div className="page-container"><p>Loading dashboard...</p></div>;
  }

  const { stats, recently_added, continue_watching } = data;

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>

      {/* ─── Stats row ─────────────────────────────────────────────────── */}
      <div className="stats-row">
        <StatCard label="Total Bookmarks" value={stats.total} color="blue" />
        <StatCard label="Watching" value={stats.watching} color="yellow" />
        <StatCard label="Completed" value={stats.completed} color="green" />
        <StatCard label="Not Started" value={stats.not_started} color="gray" />
      </div>

      {/* ─── Continue Watching ──────────────────────────────────────────── */}
      <Section
        title="Continue Watching"
        videos={continue_watching}
        onEdit={onEdit}
        onDeleteSuccess={onDeleteSuccess}
        emptyMessage="No videos in progress. Start watching something!"
      />

      {/* ─── Recently Added ─────────────────────────────────────────────── */}
      <Section
        title="Recently Added"
        videos={recently_added}
        onEdit={onEdit}
        onDeleteSuccess={onDeleteSuccess}
        emptyMessage="No videos added yet."
      />

      {/* View all link */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="btn btn-secondary" onClick={onViewAll}>
          View All Bookmarks →
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function Section({ title, videos, onEdit, onDeleteSuccess, emptyMessage }) {
  return (
    <section className="dashboard-section">
      <h2 className="section-title">{title}</h2>
      {videos && videos.length > 0 ? (
        <div className="video-grid video-grid-small">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onEdit={onEdit}
              onDeleteSuccess={onDeleteSuccess}
            />
          ))}
        </div>
      ) : (
        <p className="empty-hint">{emptyMessage}</p>
      )}
    </section>
  );
}
