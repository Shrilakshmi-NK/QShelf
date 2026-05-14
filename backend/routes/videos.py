"""
Video Routes - /api/videos
Handles all CRUD operations for video bookmarks.
"""

from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from database import mongo
from utils.helpers import (
    extract_video_id,
    seconds_to_hms,
    hms_to_seconds,
    fetch_video_title,
)

videos_bp = Blueprint("videos", __name__)


def serialize_video(video):
    """Convert a MongoDB document to a JSON-serializable dict."""
    video["_id"] = str(video["_id"])
    return video


# ─── GET ALL VIDEOS ──────────────────────────────────────────────────────────

@videos_bp.route("/", methods=["GET"])
def get_videos():
    """
    Fetch all videos with optional filtering and sorting.
    Query params:
      - status: filter by status (Not Started / Watching / Completed)
      - folder: filter by folder name
      - search: search by title (case-insensitive)
      - sort: recently_added | last_updated | alphabetical
    """
    query = {}

    # Filter by status
    status = request.args.get("status")
    if status:
        query["status"] = status

    # Filter by folder
    folder = request.args.get("folder")
    if folder:
        query["folder"] = folder

    # Search by title
    search = request.args.get("search")
    if search:
        query["title"] = {"$regex": search, "$options": "i"}  # case-insensitive

    # Sorting
    sort = request.args.get("sort", "recently_added")
    sort_map = {
        "recently_added": [("created_at", -1)],
        "last_updated": [("updated_at", -1)],
        "alphabetical": [("title", 1)],
    }
    sort_order = sort_map.get(sort, sort_map["recently_added"])

    videos = list(mongo.db.videos.find(query).sort(sort_order))
    return jsonify([serialize_video(v) for v in videos]), 200


# ─── GET SINGLE VIDEO ─────────────────────────────────────────────────────────

@videos_bp.route("/<video_id>", methods=["GET"])
def get_video(video_id):
    """Fetch a single video by its MongoDB _id."""
    try:
        video = mongo.db.videos.find_one({"_id": ObjectId(video_id)})
        if not video:
            return jsonify({"error": "Video not found"}), 404
        return jsonify(serialize_video(video)), 200
    except Exception:
        return jsonify({"error": "Invalid video ID"}), 400


# ─── ADD VIDEO ────────────────────────────────────────────────────────────────

@videos_bp.route("/", methods=["POST"])
def add_video():
    """
    Add a new video bookmark.
    Expected JSON body:
      - url (required): YouTube URL
      - timestamp_seconds (optional): integer seconds
      - status (optional): defaults to "Not Started"
      - folder (optional): folder/category name
    """
    data = request.get_json()

    if not data or not data.get("url"):
        return jsonify({"error": "YouTube URL is required"}), 400

    url = data["url"]
    video_id = extract_video_id(url)

    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    # Auto-fetch title from YouTube oEmbed API
    title = data.get("title") or fetch_video_title(url) or "Untitled Video"

    # Handle timestamp
    timestamp_seconds = int(data.get("timestamp_seconds", 0))
    timestamp_readable = seconds_to_hms(timestamp_seconds)

    now = datetime.utcnow().isoformat()

    new_video = {
        "title": title,
        "url": url,
        "video_id": video_id,
        "timestamp_seconds": timestamp_seconds,
        "timestamp_readable": timestamp_readable,
        "status": data.get("status", "Not Started"),
        "folder": data.get("folder", ""),
        "created_at": now,
        "updated_at": now,
    }

    result = mongo.db.videos.insert_one(new_video)
    new_video["_id"] = str(result.inserted_id)

    return jsonify(new_video), 201


# ─── UPDATE VIDEO ─────────────────────────────────────────────────────────────

@videos_bp.route("/<video_id>", methods=["PUT"])
def update_video(video_id):
    """
    Update a video bookmark.
    Accepts any subset of: title, timestamp_seconds, status, folder
    """
    try:
        data = request.get_json()
        update_fields = {}

        if "title" in data:
            update_fields["title"] = data["title"]
        if "status" in data:
            update_fields["status"] = data["status"]
        if "folder" in data:
            update_fields["folder"] = data["folder"]
        if "timestamp_seconds" in data:
            ts = int(data["timestamp_seconds"])
            update_fields["timestamp_seconds"] = ts
            update_fields["timestamp_readable"] = seconds_to_hms(ts)

        update_fields["updated_at"] = datetime.utcnow().isoformat()

        result = mongo.db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Video not found"}), 404

        updated = mongo.db.videos.find_one({"_id": ObjectId(video_id)})
        return jsonify(serialize_video(updated)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ─── DELETE VIDEO ─────────────────────────────────────────────────────────────

@videos_bp.route("/<video_id>", methods=["DELETE"])
def delete_video(video_id):
    """Delete a video bookmark by ID."""
    try:
        result = mongo.db.videos.delete_one({"_id": ObjectId(video_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Video not found"}), 404
        return jsonify({"message": "Video deleted successfully"}), 200
    except Exception:
        return jsonify({"error": "Invalid video ID"}), 400


# ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

@videos_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard():
    """Return counts and grouped data for the dashboard."""
    total = mongo.db.videos.count_documents({})
    watching = mongo.db.videos.count_documents({"status": "Watching"})
    completed = mongo.db.videos.count_documents({"status": "Completed"})
    not_started = mongo.db.videos.count_documents({"status": "Not Started"})

    # Recently added (last 5)
    recent = list(mongo.db.videos.find().sort("created_at", -1).limit(5))
    recent = [serialize_video(v) for v in recent]

    # Currently watching
    currently_watching = list(mongo.db.videos.find({"status": "Watching"}).limit(5))
    currently_watching = [serialize_video(v) for v in currently_watching]

    return jsonify({
        "stats": {
            "total": total,
            "watching": watching,
            "completed": completed,
            "not_started": not_started,
        },
        "recently_added": recent,
        "continue_watching": currently_watching,
    }), 200
