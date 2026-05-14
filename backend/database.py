"""
Database setup using PyMongo.
Provides a shared `mongo` instance used across routes.
"""

from flask_pymongo import PyMongo

# This single PyMongo instance is imported by all route files
mongo = PyMongo()


def init_db(app):
    """Attach PyMongo to the Flask app."""
    mongo.init_app(app)
