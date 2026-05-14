// components/FilterBar.jsx
// Search, filter by status/folder, and sort controls

export default function FilterBar({ filters, folders, onFiltersChange }) {
  // Helper to update a single filter key
  const update = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ status: "", folder: "", search: "", sort: "recently_added" });
  };

  const hasActiveFilters = filters.status || filters.folder || filters.search;

  return (
    <div className="filter-bar">
      {/* Search input */}
      <input
        type="text"
        placeholder="🔍 Search videos..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="filter-search"
      />

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="filter-select"
      >
        <option value="">All Statuses</option>
        <option value="Not Started">Not Started</option>
        <option value="Watching">Watching</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Folder filter */}
      <select
        value={filters.folder}
        onChange={(e) => update("folder", e.target.value)}
        className="filter-select"
      >
        <option value="">All Folders</option>
        {folders.map((f) => (
          <option key={f._id} value={f.name}>{f.name}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort}
        onChange={(e) => update("sort", e.target.value)}
        className="filter-select"
      >
        <option value="recently_added">Recently Added</option>
        <option value="last_updated">Last Updated</option>
        <option value="alphabetical">A → Z</option>
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}
