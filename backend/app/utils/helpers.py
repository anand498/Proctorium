from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def save_screenshot(image_data: bytes, exam_id: str, flag_name: str) -> str:
    # Logic to save the screenshot to MinIO or local storage
    # Return the URL of the saved image
    import uuid

    filename = f"{exam_id}_{flag_name}_{uuid.uuid4()}.jpg"
    # This would typically save to MinIO and return the URL
    return f"http://localhost:9000/exam-screenshots/{filename}"


def generate_exam_id() -> str:
    import uuid

    return f"EXAM-{str(uuid.uuid4())[:8].upper()}"


def validate_exam_id(exam_id: str) -> bool:
    # Logic to validate the exam ID format
    return isinstance(exam_id, str) and len(exam_id) >= 8


def format_flags_data(flags: list) -> dict:
    # Format the flags data for storage or response
    formatted = {}
    for flag in flags:
        if isinstance(flag, dict):
            flag_name = flag.get("flag_name", flag.get("name"))
            timestamp = flag.get("timestamp", datetime.utcnow().isoformat())
            formatted[flag_name] = {
                "timestamp": timestamp,
                "screenshot_url": flag.get("screenshot_url"),
            }
    return formatted
