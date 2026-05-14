// components/Sidebar.jsx
// Left navigation: page links + folder list with create/delete

import { useState } from "react";
import { createFolder, deleteFolder, renameFolder } from "../api/api";

export default function Sidebar({
  folders,
  currentView,
  activeFolder,
  onNavigate,
  onFolderClick,
  onFolderCreated,
  onFolderRenamed,
}) {
  const [newFolderName, setNewFolderName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setLoading(true);
    const result = await createFolder(name);
    setLoading(false);
    if (result) {
      setNewFolderName("");
      setShowInput(false);
      onFolderCreated();
    } else {
      alert("Could not create folder. It may already exist.");
    }
  };

  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder?")) return;
    await deleteFolder(folderId);
    if (editingFolderId === folderId) {
      setEditingFolderId(null);
      setEditingFolderName("");
    }
    onFolderCreated(); // reuse refresh callback
  };

  const startRenameFolder = (e, folder) => {
    e.stopPropagation();
    setEditingFolderId(folder._id);
    setEditingFolderName(folder.name);
  };

  const cancelRenameFolder = (e) => {
    if (e) e.stopPropagation();
    setEditingFolderId(null);
    setEditingFolderName("");
  };

  const handleRenameFolder = async (e, folder) => {
    e.stopPropagation();
    const name = editingFolderName.trim();
    if (!name) {
      alert("Folder name is required.");
      return;
    }
    if (name === folder.name) {
      cancelRenameFolder(e);
      return;
    }

    setLoading(true);
    const result = await renameFolder(folder._id, name);
    setLoading(false);

    if (result) {
      setEditingFolderId(null);
      setEditingFolderName("");
      if (onFolderRenamed) {
        onFolderRenamed(folder.name, name);
      } else {
        onFolderCreated();
      }
    } else {
      alert("Could not rename folder. It may already exist.");
    }
  };

  return (
    <aside className="sidebar">
      {/* Main navigation links */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${currentView === "dashboard" ? "active" : ""}`}
          onClick={() => onNavigate("dashboard")}
        >
          🏠 Dashboard
        </button>
        <button
          className={`sidebar-link ${currentView === "videos" && !activeFolder ? "active" : ""}`}
          onClick={() => { onNavigate("videos"); }}
        >
          🎬 All Videos
        </button>
      </nav>

      {/* Folders section */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>Folders</span>
          <button
            className="icon-btn"
            title="New folder"
            onClick={() => setShowInput(!showInput)}
          >
            +
          </button>
        </div>

        {/* New folder input */}
        {showInput && (
          <div className="folder-input-row">
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              className="folder-input"
              autoFocus
            />
            <button
              className="btn btn-sm"
              onClick={handleCreateFolder}
              disabled={loading}
            >
              {loading ? "…" : "Add"}
            </button>
          </div>
        )}

        {/* Folder list */}
        <ul className="folder-list">
          {folders.length === 0 && (
            <li className="folder-empty">No folders yet</li>
          )}
          {folders.map((folder) => (
            <li
              key={folder._id}
              className={`folder-item ${activeFolder === folder.name ? "active" : ""}`}
              onClick={() => editingFolderId !== folder._id && onFolderClick(folder.name)}
            >
              <span className="folder-icon">📁</span>

              {editingFolderId === folder._id ? (
                <>
                  <input
                    className="folder-input folder-rename-input"
                    value={editingFolderName}
                    onChange={(e) => setEditingFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameFolder(e, folder);
                      if (e.key === "Escape") cancelRenameFolder(e);
                    }}
                    autoFocus
                  />
                  <button
                    className="folder-action-btn"
                    onClick={(e) => handleRenameFolder(e, folder)}
                    disabled={loading}
                    title="Save folder name"
                  >
                    {loading ? "…" : "Save"}
                  </button>
                  <button
                    className="folder-action-btn"
                    onClick={cancelRenameFolder}
                    title="Cancel rename"
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <span className="folder-name">{folder.name}</span>
                  <button
                    className="folder-edit-btn"
                    onClick={(e) => startRenameFolder(e, folder)}
                    title="Rename folder"
                  >
                    ✎
                  </button>
                  <button
                    className="folder-delete-btn"
                    onClick={(e) => handleDeleteFolder(e, folder._id)}
                    title="Delete folder"
                  >
                    ×
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
