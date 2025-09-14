from fastapi import APIRouter, HTTPException
from typing import List
from app.models.exam import ExamResponse
from app.services.exam_service import ExamService

router = APIRouter()
exam_service = ExamService()


@router.get("/admin/exams/{exam_id}", response_model=ExamResponse)
async def read_exam_data(exam_id: str):
    exam_data = exam_service.get_exam_by_id(exam_id)
    if not exam_data:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam_data


@router.get("/admin/exams", response_model=List[ExamResponse])
async def get_all_exams(limit: int = 100):
    try:
        exams = exam_service.get_all_exams()[:limit]
        return exams
    except Exception as e:
        print(f"Error in get_all_exams: {str(e)}")
        # Return empty list for now to test endpoint structure
        return []


@router.delete("/admin/exams/{exam_id}")
async def delete_exam(exam_id: str):
    success = exam_service.delete_exam(exam_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted successfully"}


@router.get("/admin/flags/{exam_id}")
async def get_exam_flags(exam_id: str):
    """Get all flags and proctoring data for a specific exam"""
    flags = exam_service.get_proctoring_data(exam_id)
    if not flags:
        raise HTTPException(status_code=404, detail="No flags found for this exam")
    return flags
