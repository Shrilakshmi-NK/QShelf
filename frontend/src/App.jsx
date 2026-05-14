// App.jsx - Root component, sets up routing and global layout
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import VideoList from "./components/VideoList";
import VideoForm from "./components/VideoForm";
import { getVideos, getFolders, getDashboardStats } from "./api/api";
import "./App.css";

export default function App() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [view, setView] = useState("dashboard");     // current page
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [showForm, setShowForm] = useState(false);   // add/edit modal
  const [editingVideo, setEditingVideo] = useState(null); // null = add mode

  // Filter/sort state (passed to VideoList)
  const [filters, setFilters] = useState({
    status: "",
    folder: "",
    search: "",
    sort: "recently_added",
  });

  // ─── Data fetching ────────────────────────────────────────────────────────
  const loadVideos = async () => {
    const data = await getVideos(filters);
    setVideos(data);
  };

  const loadFolders = async () => {
    const data = await getFolders();
    setFolders(data);
  };

  const loadDashboard = async () => {
    const data = await getDashboardStats();
    setDashboardData(data);
  };

  // Reload videos whenever filters change
  useEffect(() => {
    loadVideos();
  }, [filters]);

  // Load folders and dashboard once on mount
  useEffect(() => {
    loadFolders();
    loadDashboard();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  // Called after a video is added or updated — refresh lists
  const handleVideoSaved = () => {
    loadVideos();
    loadDashboard();
    setShowForm(false);
    setEditingVideo(null);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleDeleteSuccess = () => {
    loadVideos();
    loadDashboard();
  };

  const handleFolderCreated = () => {
    loadFolders();
  };

  const handleFolderRenamed = (oldName, newName) => {
    setFilters((f) => (f.folder === oldName ? { ...f, folder: newName } : f));
    loadFolders();
  };

  // Navigate to "all videos" filtered by a specific folder
  const handleFolderClick = (folderName) => {
    setFilters((f) => ({ ...f, folder: folderName }));
    setView("videos");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <Navbar onAddClick={() => { setEditingVideo(null); setShowForm(true); }} />

      <div className="app-body">
        <Sidebar
          folders={folders}
          currentView={view}
          activeFolder={filters.folder}
          onNavigate={setView}
          onFolderClick={handleFolderClick}
          onFolderCreated={handleFolderCreated}
          onFolderRenamed={handleFolderRenamed}
        />

        <main className="main-content">
          {view === "dashboard" && (
            <Dashboard
              data={dashboardData}
              onEdit={handleEdit}
              onDeleteSuccess={handleDeleteSuccess}
              onViewAll={() => setView("videos")}
            />
          )}
          {view === "videos" && (
            <VideoList
              videos={videos}
              folders={folders}
              filters={filters}
              onFiltersChange={setFilters}
              onEdit={handleEdit}
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
        </main>
      </div>

      {/* Add / Edit modal overlay */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <VideoForm
              existingVideo={editingVideo}
              folders={folders}
              onSaved={handleVideoSaved}
              onCancel={() => { setShowForm(false); setEditingVideo(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
