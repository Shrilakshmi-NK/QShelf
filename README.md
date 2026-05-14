# 🎬 VideoMark — YouTube Video Bookmarker

A full-stack web app for students and researchers to save YouTube videos
with timestamps, track watch progress, and organize bookmarks into folders.

**Tech Stack:** React · Flask · MongoDB

---

## 📁 Project Structure

```
youtube-bookmarker/
├── backend/
│   ├── app.py              ← Flask entry point
│   ├── config.py           ← App configuration
│   ├── database.py         ← MongoDB connection
│   ├── requirements.txt    ← Python dependencies
│   ├── routes/
│   │   ├── videos.py       ← CRUD for video bookmarks
│   │   └── folders.py      ← CRUD for folders
│   └── utils/
│       └── helpers.py      ← Timestamp utils, video ID parser
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx          ← Root component
│       ├── App.css          ← Global styles
│       ├── main.jsx         ← React entry point
│       ├── api/
│       │   └── api.js       ← All backend API calls
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Dashboard.jsx
│       │   ├── VideoList.jsx
│       │   ├── VideoCard.jsx
│       │   ├── VideoForm.jsx
│       │   └── FilterBar.jsx
│       └── utils/
│           └── timestamp.js ← Frontend timestamp helpers
│
└── chrome-extension/
    └── extension.js         ← Extension code with instructions
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

### 1. Start MongoDB

If running MongoDB locally:
```bash
# macOS/Linux
mongod --dbpath /data/db

# Windows
mongod
```

Or use MongoDB Atlas (free tier) and copy your connection string.

---

### 2. Backend Setup (Flask)

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set MongoDB URI if using Atlas
export MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/youtube_bookmarker"

# Run the Flask server
python app.py
```

Backend will be running at: **http://localhost:5000**

---

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description                  |
|--------|------------------------------|------------------------------|
| GET    | /api/videos/                 | Get all videos (with filters)|
| POST   | /api/videos/                 | Add new bookmark             |
| PUT    | /api/videos/:id              | Update video                 |
| DELETE | /api/videos/:id              | Delete video                 |
| GET    | /api/videos/dashboard/stats  | Dashboard data               |
| GET    | /api/folders/                | Get all folders              |
| POST   | /api/folders/                | Create folder                |
| DELETE | /api/folders/:id             | Delete folder                |

### Filter/Sort Query Params (GET /api/videos/)

| Param  | Values                             |
|--------|------------------------------------|
| status | Not Started / Watching / Completed |
| folder | folder name string                 |
| search | partial title match                |
| sort   | recently_added / last_updated / alphabetical |

---

## 📦 MongoDB Document Structure

### Video Document
```json
{
  "_id": "ObjectId",
  "title": "Learn React in 30 Minutes",
  "url": "https://www.youtube.com/watch?v=abc123",
  "video_id": "abc123",
  "timestamp_seconds": 720,
  "timestamp_readable": "12:00",
  "status": "Watching",
  "folder": "React",
  "created_at": "2025-05-14T10:00:00",
  "updated_at": "2025-05-14T10:00:00"
}
```

### Folder Document
```json
{
  "_id": "ObjectId",
  "name": "DBMS",
  "created_at": "2025-05-14T10:00:00"
}
```

---

## 🔧 Chrome Extension Setup

1. Navigate to `chrome://extensions/` in Chrome
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** → select the `chrome-extension/` folder
4. The extension icon will appear in your toolbar
5. Open a YouTube video, click the extension → **Save Current Timestamp**

> **Note:** The extension reads `document.querySelector('video').currentTime`
> to get the exact timestamp of the video you're watching.

---

## 💡 How It Works

1. Paste a YouTube URL → title is auto-fetched via YouTube's oEmbed API
2. Videos are stored in MongoDB with timestamp, status, and folder
3. Click "Open" on any card → YouTube opens at the saved timestamp
4. Edit a card to update timestamp + status after watching

---

## 🚀 Future Improvements

- [ ] User authentication (JWT)
- [ ] Notes / annotations per video
- [ ] Playlist import
- [ ] Progress bar visualization
- [ ] Export bookmarks to CSV
- [ ] Dark/light theme toggle
- [ ] Deploy to Vercel (frontend) + Render (backend)
- [ ] MongoDB Atlas for cloud database
