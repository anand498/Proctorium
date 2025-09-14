from pymongo import MongoClient
from minio import Minio
from minio.error import S3Error
import os
import io
import base64
from datetime import datetime
from typing import Optional, Dict, Any
import logging


class StorageService:
    def __init__(self):
        # Setup logging
        self.logger = logging.getLogger(__name__)

        # MongoDB setup
        self.mongo_client = MongoClient(os.getenv("MONGO_URI"))
        self.db = self.mongo_client["exam_proctoring"]

        # MinIO setup
        self.minio_client = Minio(
            os.getenv("MINIO_ENDPOINT"),
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=False,
        )
        self.bucket_name = os.getenv("MINIO_BUCKET_NAME", "exam-screenshots")
        self._create_bucket_if_not_exists()
        self._set_bucket_policy()

    def _create_bucket_if_not_exists(self) -> None:
        """Create MinIO bucket if it doesn't exist"""
        try:
            if not self.minio_client.bucket_exists(self.bucket_name):
                self.minio_client.make_bucket(self.bucket_name)
                self.logger.info(f"Bucket '{self.bucket_name}' created successfully")
        except S3Error as e:
            self.logger.error(f"Error creating bucket: {e}")
            raise

    def _set_bucket_policy(self) -> None:
        """Set public read policy for the bucket"""
        try:
            print(f"🔧 Setting bucket policy for {self.bucket_name}")
            # Set public read policy for the bucket
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"],
                    }
                ],
            }

            import json

            self.minio_client.set_bucket_policy(self.bucket_name, json.dumps(policy))
            print(f"✅ Public read policy set for bucket '{self.bucket_name}'")
            self.logger.info(f"Public read policy set for bucket '{self.bucket_name}'")
        except S3Error as e:
            print(f"❌ S3Error setting bucket policy: {e}")
            self.logger.error(f"Error setting bucket policy: {e}")
            # Don't raise here, just log the error
        except Exception as e:
            print(f"❌ Unexpected error setting bucket policy: {e}")
            self.logger.error(f"Unexpected error setting bucket policy: {e}")
            # Don't raise here, just log the error

    def upload_image(self, image_data: bytes, image_name: str) -> Optional[str]:
        """Upload image to MinIO and return the URL"""
        try:
            # Convert image_data to bytes if it's a string (base64)
            if isinstance(image_data, str):
                # Handle base64 encoded images
                if "," in image_data:
                    image_data = base64.b64decode(image_data.split(",")[1])
                else:
                    image_data = base64.b64decode(image_data)

            self.minio_client.put_object(
                self.bucket_name,
                image_name,
                io.BytesIO(image_data),
                len(image_data),
                content_type="image/jpeg",
            )

            # Use external endpoint for URL generation (accessible from browser)
            external_endpoint = os.getenv(
                "MINIO_EXTERNAL_ENDPOINT", os.getenv("MINIO_ENDPOINT")
            )
            url = f"{external_endpoint}/{self.bucket_name}/{image_name}"
            self.logger.info(f"Image uploaded successfully: {image_name}")
            return url
        except S3Error as e:
            self.logger.error(f"Error uploading image {image_name}: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Unexpected error uploading image {image_name}: {e}")
            return None

    def save_screenshot(self, exam_id: str, flag_name: str, image_data: bytes) -> str:
        """Save screenshot for exam and return URL"""
        import uuid

        filename = f"{exam_id}_{flag_name}_{uuid.uuid4()}.jpg"
        url = self.upload_image(image_data, filename)
        if not url:
            raise Exception("Failed to upload screenshot")
        return url

    def store_exam_data(self, exam_id: str, flags: list, screenshots: list) -> bool:
        """Store exam data in MongoDB"""
        try:
            exam_data = {
                "exam_id": exam_id,
                "flags": flags,
                "screenshots": screenshots,
                "created_at": datetime.utcnow(),
            }
            result = self.db.exams.insert_one(exam_data)
            self.logger.info(f"Exam data stored successfully for exam_id: {exam_id}")
            return bool(result.inserted_id)
        except Exception as e:
            self.logger.error(f"Error storing exam data for {exam_id}: {e}")
            return False

    def fetch_exam_data(self, exam_id: str) -> Optional[Dict[str, Any]]:
        """Fetch exam data from MongoDB"""
        try:
            exam_data = self.db.exams.find_one({"exam_id": exam_id})
            if exam_data:
                # Convert ObjectId to string for JSON serialization
                exam_data["_id"] = str(exam_data["_id"])
                self.logger.info(
                    f"Exam data fetched successfully for exam_id: {exam_id}"
                )
            else:
                self.logger.warning(f"No exam data found for exam_id: {exam_id}")
            return exam_data
        except Exception as e:
            self.logger.error(f"Error fetching exam data for {exam_id}: {e}")
            return None

    def fetch_all_exams(self, limit: int = 100) -> list:
        """Fetch all exam data for admin dashboard"""
        try:
            exams = list(self.db.exams.find().limit(limit).sort("created_at", -1))
            for exam in exams:
                exam["_id"] = str(exam["_id"])
            self.logger.info(f"Fetched {len(exams)} exams")
            return exams
        except Exception as e:
            self.logger.error(f"Error fetching all exams: {e}")
            return []

    def delete_exam_data(self, exam_id: str) -> bool:
        """Delete exam data and associated screenshots"""
        try:
            # First fetch the exam data to get screenshot names
            exam_data = self.fetch_exam_data(exam_id)
            if not exam_data:
                return False

            # Delete screenshots from MinIO
            for screenshot in exam_data.get("screenshots", []):
                if isinstance(screenshot, dict) and "url" in screenshot:
                    # Extract filename from URL
                    filename = screenshot["url"].split("/")[-1]
                    try:
                        self.minio_client.remove_object(self.bucket_name, filename)
                    except S3Error as e:
                        self.logger.warning(
                            f"Could not delete screenshot {filename}: {e}"
                        )

            # Delete exam data from MongoDB
            result = self.db.exams.delete_one({"exam_id": exam_id})
            success = result.deleted_count > 0
            if success:
                self.logger.info(
                    f"Exam data deleted successfully for exam_id: {exam_id}"
                )
            return success
        except Exception as e:
            self.logger.error(f"Error deleting exam data for {exam_id}: {e}")
            return False

    def close_connections(self):
        """Close database connections"""
        try:
            self.mongo_client.close()
            self.logger.info("Database connections closed")
        except Exception as e:
            self.logger.error(f"Error closing connections: {e}")
