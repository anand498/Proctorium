from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, admin, proctoring
from app.database.connection import connect_to_mongo
from app.services.auth_service import AuthService
import os

app = FastAPI(
    title="Exam Proctoring API",
    description="API for online exam proctoring with face detection",
    version="1.0.0",
)

# CORS middleware to allow requests from the frontend
origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include the API routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(proctoring.router, prefix="/api/proctoring", tags=["proctoring"])


@app.on_event("startup")
async def startup_event():
    """Initialize database and create default users"""
    connect_to_mongo()

    # Create default users
    auth_service = AuthService()
    auth_service.create_default_users()


@app.get("/")
async def root():
    return {"message": "Welcome to the Exam Proctoring API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "exam-proctoring-api"}
