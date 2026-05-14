"""
Folder Routes - /api/folders
Handles folder/category management.
"""

from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from database import mongo

folders_bp = Blueprint("folders", __name__)


def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc


@folders_bp.route("/", methods=["GET"])
def get_folders():
    """Get all folders."""
    folders = list(mongo.db.folders.find().sort("name", 1))
    return jsonify([serialize(f) for f in folders]), 200


@folders_bp.route("/", methods=["POST"])
def create_folder():
    """Create a new folder. Body: { name: string }"""
    data = request.get_json()
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    # Prevent duplicate folder names
    existing = mongo.db.folders.find_one({"name": name})
    if existing:
        return jsonify({"error": "Folder already exists"}), 409

    folder = {"name": name, "created_at": datetime.utcnow().isoformat()}
    result = mongo.db.folders.insert_one(folder)
    folder["_id"] = str(result.inserted_id)
    return jsonify(folder), 201


@folders_bp.route("/<folder_id>", methods=["DELETE"])
def delete_folder(folder_id):
    """Delete a folder by ID."""
    try:
        result = mongo.db.folders.delete_one({"_id": ObjectId(folder_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Folder not found"}), 404
        return jsonify({"message": "Folder deleted"}), 200
    except Exception:
        return jsonify({"error": "Invalid folder ID"}), 400


@folders_bp.route("/<folder_id>", methods=["PUT"])
def rename_folder(folder_id):
    """Rename a folder by ID. Body: { name: string }"""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Folder name is required"}), 400

    try:
        folder = mongo.db.folders.find_one({"_id": ObjectId(folder_id)})
        if not folder:
            return jsonify({"error": "Folder not found"}), 404

        existing = mongo.db.folders.find_one({
            "name": name,
            "_id": {"$ne": ObjectId(folder_id)},
        })
        if existing:
            return jsonify({"error": "Folder already exists"}), 409

        old_name = folder["name"]
        mongo.db.folders.update_one(
            {"_id": ObjectId(folder_id)},
            {"$set": {"name": name}},
        )

        if old_name != name:
            mongo.db.videos.update_many(
                {"folder": old_name},
                {"$set": {"folder": name}},
            )

        folder["name"] = name
        return jsonify(serialize(folder)), 200
    except Exception:
        return jsonify({"error": "Invalid folder ID"}), 400
