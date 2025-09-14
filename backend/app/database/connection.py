from pymongo import MongoClient
import os
from typing import Optional

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/exam_proctoring")


class MongoDB:
    client: Optional[MongoClient] = None
    database = None


def connect_to_mongo():
    """Create database connection"""
    MongoDB.client = MongoClient(MONGO_URI)
    MongoDB.database = MongoDB.client.get_database()


def close_mongo_connection():
    """Close database connection"""
    if MongoDB.client:
        MongoDB.client.close()


def get_database():
    """Get database instance"""
    if MongoDB.database is None:
        connect_to_mongo()
    return MongoDB.database
