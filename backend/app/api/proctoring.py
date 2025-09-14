from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List
from app.services.exam_service import ExamService
from app.utils.helpers import verify_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
exam_service = ExamService()


class Flag(BaseModel):
    flag_name: str
    screenshot_url: str


class ProctoringData(BaseModel):
    exam_id: str
    flags: List[Flag]


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get current user from token"""
    print(f"🔍 Verifying token: {token[:20]}..." if token else "🔍 No token provided")

    if not token:
        print("❌ Token is None or empty")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(token)
    print(f"🔍 Token verification result: {payload}")

    if payload is None:
        print("❌ Token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = payload.get("sub")
    print(f"✅ Token verified for user: {username}")
    return username


@router.post("/data")
async def receive_proctoring_data(
    data: ProctoringData, user: str = Depends(get_current_user)
):
    """Store proctoring data for an exam"""
    try:
        exam_service.store_proctoring_data(data.exam_id, data.flags)
        return {"message": "Proctoring data received successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/data/{exam_id}")
async def get_proctoring_data(exam_id: str, user: str = Depends(get_current_user)):
    """Get proctoring data for an exam"""
    try:
        data = exam_service.get_proctoring_data(exam_id)
        if not data:
            raise HTTPException(status_code=404, detail="Data not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/screenshot")
async def upload_screenshot(
    file: UploadFile = File(...),
    exam_id: str = Form(...),
    flag_type: str = Form(...),
    timestamp: str = Form(...),
    # user: str = Depends(get_current_user),
):
    """Upload a screenshot for proctoring"""
    try:
        print(f"📸 Received screenshot upload for exam {exam_id}, flag: {flag_type}")

        # Read file content
        image_data = await file.read()
        print(f"📷 Screenshot size: {len(image_data)} bytes")

        # Save screenshot using exam service (saves to both storage and database)
        screenshot_url = exam_service.save_screenshot(exam_id, flag_type, image_data)
        print(f"✅ Screenshot saved to storage and database: {screenshot_url}")

        return {
            "message": "Screenshot uploaded successfully",
            "screenshot_url": screenshot_url,
            "exam_id": exam_id,
            "flag_type": flag_type,
            "timestamp": timestamp,
        }
    except Exception as e:
        print(f"❌ Error uploading screenshot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
