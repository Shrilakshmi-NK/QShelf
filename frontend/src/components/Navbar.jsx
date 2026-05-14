// components/Navbar.jsx
// Top navigation bar with app title and "Add Video" button

export default function Navbar({ onAddClick }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        {/* YouTube-style play icon */}
        <span className="brand-icon">▶</span>
        <div>
          <span className="brand-name">QShelf</span>
          <span className="brand-subtitle">Save. Organize. Resume.</span>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onAddClick}>
        + Add Video
      </button>
    </header>
  );
}
