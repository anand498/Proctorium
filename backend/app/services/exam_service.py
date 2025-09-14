from fastapi import HTTPException
from typing import List, Optional
from app.models.exam import ExamModel, ExamCreate, ExamResponse, FlagModel
from app.database.connection import get_database
from app.services.storage_service import StorageService
from bson import ObjectId
from datetime import datetime


class ExamService:
    def __init__(self):
        self.db = get_database()
        self.exams_collection = self.db.exams
        self.storage_service = StorageService()

    def create_exam(self, exam_data: ExamCreate) -> ExamModel:
        """Create a new exam record"""
        exam = ExamModel(
            exam_id=exam_data.exam_id,
            flags=exam_data.flags,
            screenshots=exam_data.screenshots,
            status="completed",
            completed_at=datetime.utcnow(),
        )

        result = self.exams_collection.insert_one(
            exam.dict(by_alias=True, exclude_unset=True)
        )
        exam.id = result.inserted_id
        return exam

    def get_exam_by_id(self, exam_id: str) -> Optional[ExamResponse]:
        """Get exam by exam_id"""
        exam_data = self.exams_collection.find_one({"exam_id": exam_id})
        if not exam_data:
            return None

        exam = ExamModel(**exam_data)
        return ExamResponse(
            exam_id=exam.exam_id,
            flags=exam.flags,
            screenshots=exam.screenshots,
            created_at=exam.created_at,
            completed_at=exam.completed_at,
            status=exam.status,
        )

    def get_all_exams(self) -> List[ExamResponse]:
        """Get all exams"""
        exams = []
        for exam_data in self.exams_collection.find().sort("created_at", -1):
            exam = ExamModel(**exam_data)
            exams.append(
                ExamResponse(
                    exam_id=exam.exam_id,
                    flags=exam.flags,
                    screenshots=exam.screenshots,
                    created_at=exam.created_at,
                    completed_at=exam.completed_at,
                    status=exam.status,
                )
            )
        return exams

    def delete_exam(self, exam_id: str) -> bool:
        """Delete exam and associated data"""
        # First delete from storage service (handles MinIO cleanup)
        storage_success = self.storage_service.delete_exam_data(exam_id)

        # Then delete from MongoDB
        result = self.exams_collection.delete_one({"exam_id": exam_id})

        return result.deleted_count > 0

    def submit_exam_data(
        self, exam_id: str, flags: List[dict], screenshots: List[str]
    ) -> bool:
        """Submit exam data with flags and screenshots"""
        try:
            # Process flags
            flag_models = []
            for flag_data in flags:
                flag = FlagModel(
                    flag_name=flag_data.get("flag_name"),
                    screenshot_url=flag_data.get("screenshot_url"),
                    timestamp=datetime.utcnow(),
                )
                flag_models.append(flag)

            # Store in storage service
            success = self.storage_service.store_exam_data(exam_id, flags, screenshots)

            if success:
                # Also store in exam collection
                exam_create = ExamCreate(
                    exam_id=exam_id, flags=flag_models, screenshots=screenshots
                )
                self.create_exam(exam_create)

            return success
        except Exception as e:
            print(f"Error submitting exam data: {e}")
            return False

    def store_proctoring_data(self, exam_id: str, flags: List[dict]) -> bool:
        """Store proctoring data for an exam"""
        try:
            # Process flags
            flag_models = []
            for flag_data in flags:
                flag = FlagModel(
                    flag_name=flag_data.get("flag_name"),
                    screenshot_url=flag_data.get("screenshot_url"),
                    timestamp=datetime.utcnow(),
                )
                flag_models.append(flag)

            # Update existing exam or create new one
            exam_data = self.exams_collection.find_one({"exam_id": exam_id})
            if exam_data:
                # Add flags to existing exam
                existing_flags = exam_data.get("flags", [])
                existing_flags.extend([flag.dict() for flag in flag_models])

                self.exams_collection.update_one(
                    {"exam_id": exam_id}, {"$set": {"flags": existing_flags}}
                )
            else:
                # Create new exam record
                exam_create = ExamCreate(
                    exam_id=exam_id, flags=flag_models, screenshots=[]
                )
                self.create_exam(exam_create)

            return True
        except Exception as e:
            print(f"Error storing proctoring data: {e}")
            return False

    def get_proctoring_data(self, exam_id: str) -> Optional[dict]:
        """Get proctoring data for an exam"""
        exam_data = self.exams_collection.find_one({"exam_id": exam_id})
        if not exam_data:
            return None

        return {
            "exam_id": exam_data["exam_id"],
            "flags": exam_data.get("flags", []),
            "screenshots": exam_data.get("screenshots", []),
        }

    def save_screenshot(self, exam_id: str, flag_name: str, image_data: bytes) -> str:
        """Save screenshot to storage and create flag record in database"""
        # Save screenshot to MinIO storage
        screenshot_url = self.storage_service.save_screenshot(exam_id, flag_name, image_data)
        
        # Create flag record in database
        flag_data = {
            "flag_name": flag_name,
            "screenshot_url": screenshot_url,
            "timestamp": datetime.utcnow()
        }
        
        # Update existing exam or create new one
        exam_data = self.exams_collection.find_one({"exam_id": exam_id})
        
        if exam_data:
            # Add flag to existing exam
            existing_flags = exam_data.get("flags", [])
            existing_flags.append(flag_data)
            
            # Also add to screenshots array
            existing_screenshots = exam_data.get("screenshots", [])
            existing_screenshots.append(screenshot_url)
            
            self.exams_collection.update_one(
                {"exam_id": exam_id}, 
                {"$set": {
                    "flags": existing_flags,
                    "screenshots": existing_screenshots
                }}
            )
            print(f"📷 Added flag to existing exam {exam_id}")
        else:
            # Create new exam record with this flag
            new_exam = {
                "exam_id": exam_id,
                "flags": [flag_data],
                "screenshots": [screenshot_url],
                "status": "in_progress",
                "created_at": datetime.utcnow()
            }
            
            self.exams_collection.insert_one(new_exam)
            print(f"📝 Created new exam record for {exam_id}")
        
        return screenshot_url

    def save_flag_without_screenshot(self, exam_id: str, flag_name: str, description: str, timestamp: str) -> str:
        """Save flag without screenshot to database"""
        # Create flag record in database without screenshot
        flag_data = {
            "flag_name": flag_name,
            "screenshot_url": "",  # Empty for non-screenshot flags
            "description": description,
            "timestamp": datetime.fromisoformat(timestamp.replace('Z', '+00:00')) if timestamp else datetime.utcnow()
        }
        
        # Update existing exam or create new one
        exam_data = self.exams_collection.find_one({"exam_id": exam_id})
        
        if exam_data:
            # Add flag to existing exam
            existing_flags = exam_data.get("flags", [])
            existing_flags.append(flag_data)
            
            self.exams_collection.update_one(
                {"exam_id": exam_id}, 
                {"$set": {"flags": existing_flags}}
            )
            print(f"🚩 Added flag to existing exam {exam_id}")
        else:
            # Create new exam record with this flag
            new_exam = {
                "exam_id": exam_id,
                "flags": [flag_data],
                "screenshots": [],
                "status": "in_progress",
                "created_at": datetime.utcnow()
            }
            
            self.exams_collection.insert_one(new_exam)
            print(f"📝 Created new exam record for {exam_id}")
        
        return flag_name
