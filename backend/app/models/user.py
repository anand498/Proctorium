from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, Any, Annotated
from datetime import datetime
from bson import ObjectId


def validate_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    if isinstance(value, str):
        return ObjectId(value)
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]


class UserModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    username: str = Field(..., description="Username for login")
    hashed_password: str = Field(..., description="Hashed password")
    email: Optional[str] = None
    role: str = "user"  # user, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "user"


class UserResponse(BaseModel):
    username: str
    email: Optional[str] = None
    role: str
    created_at: datetime
    is_active: bool


class UserLogin(BaseModel):
    username: str
    password: str
