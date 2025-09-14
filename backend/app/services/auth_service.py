from fastapi import HTTPException
from passlib.context import CryptContext
from app.database.connection import get_database
from app.models.user import UserModel, UserCreate, UserLogin
from app.utils.helpers import create_access_token
from typing import Optional
import os


class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.db = get_database()
        self.users_collection = self.db.users

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def authenticate_user(self, username: str, password: str) -> Optional[UserModel]:
        user_data = self.users_collection.find_one({"username": username})
        if not user_data:
            return None

        user = UserModel(**user_data)
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def register_user(self, user_data: UserCreate) -> UserModel:
        # Check if user already exists
        existing_user = self.users_collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_password = self.get_password_hash(user_data.password)
        new_user = UserModel(
            username=user_data.username,
            hashed_password=hashed_password,
            email=user_data.email,
            role=user_data.role,
        )

        result = self.users_collection.insert_one(
            new_user.dict(by_alias=True, exclude_unset=True)
        )
        new_user.id = result.inserted_id
        return new_user

    def get_user_by_username(self, username: str) -> Optional[UserModel]:
        user_data = self.users_collection.find_one({"username": username})
        if user_data:
            return UserModel(**user_data)
        return None

    def create_default_users(self):
        """Create default admin and user accounts if they don't exist"""
        # Create admin user
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

        if not self.get_user_by_username(admin_username):
            admin_user = UserCreate(
                username=admin_username, password=admin_password, role="admin"
            )
            self.register_user(admin_user)

        # Create regular user
        user_username = os.getenv("USER_USERNAME", "user")
        user_password = os.getenv("USER_PASSWORD", "user123")

        if not self.get_user_by_username(user_username):
            regular_user = UserCreate(
                username=user_username, password=user_password, role="user"
            )
            self.register_user(regular_user)
