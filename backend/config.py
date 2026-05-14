"""
Configuration settings for the Flask app.
Edit these values to match your environment.
"""

import os


class Config:
    # MongoDB connection URI - change this if using MongoDB Atlas
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/youtube_bookmarker")

    # Flask secret key (used for sessions, etc.)
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    # Debug mode - set to False in production
    DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
