"""
YouTube Video Bookmarker - Flask Backend
Main application entry point
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db
from routes.videos import videos_bp
from routes.folders import folders_bp

def create_app():
    """Create and configure the Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow requests from React frontend (localhost:3000)
    CORS(app, origins=["http://localhost:3000"])

    # Initialize MongoDB connection
    init_db(app)

    # Register route blueprints
    app.register_blueprint(videos_bp, url_prefix="/api/videos")
    app.register_blueprint(folders_bp, url_prefix="/api/folders")

    @app.route("/")
    def health_check():
        return {"status": "ok", "message": "YouTube Bookmarker API is running"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
