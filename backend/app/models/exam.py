from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Any, Annotated
from datetime import datetime
from bson import ObjectId


def validate_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str):
        return ObjectId(value)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]


class FlagModel(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True, json_encoders={ObjectId: str}
    )

    flag_name: str
    screenshot_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ExamModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    exam_id: str = Field(..., description="Unique exam identifier")
    user_id: Optional[str] = None
    flags: List[FlagModel] = []
    screenshots: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    status: str = "in_progress"  # in_progress, completed


# Pydantic models for API requests/responses
class ExamCreate(BaseModel):
    exam_id: str
    flags: List[FlagModel] = []
    screenshots: List[str] = []


class ExamResponse(BaseModel):
    exam_id: str
    flags: List[FlagModel]
    screenshots: List[str]
    created_at: datetime
    completed_at: Optional[datetime] = None
    status: str
