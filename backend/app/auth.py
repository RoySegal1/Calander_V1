from fastapi import APIRouter, HTTPException, Body ,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .db import SessionLocal
from .models import Student, StudentCourse
import json
from typing import Optional
import os
import importlib.util
from sqlalchemy.exc import IntegrityError
from backend.app.db import SessionLocal
from backend.app.models import Student, StudentCourse
from backend.scripts.WebScraperStudent import scrape_student_grades


router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define models for request data
class LoginRequest(BaseModel):
    username: str
    password: str


class User(BaseModel):
    username: str
    password: str  # In a real app, this should be hashed
    department: Optional[str] = "מדעי המחשב"  # Default department
    saved_courses: Optional[list] = []    # ?
    progress: Optional[dict] = {}         # ?


# Path to users database file
USERS_DB_PATH = os.path.join("data", "userInfo.json") # i need to add the path  and for to correct file , "Roei.Segal"


# Helper functions
def load_users():
    """Load users from JSON file"""
    try:
        with open(user_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Return empty dict if file doesn't exist or is invalid # add a message "file not found sign in"
        return {}


def save_users(users_data): # to DB?
    """Save users to JSON file"""
    # Ensure directory exists
    os.makedirs(os.path.dirname(USERS_DB_PATH), exist_ok=True)

    with open(USERS_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(users_data, f, ensure_ascii=False, indent=2)


@router.post("/login")
def login(data: LoginRequest):
    users = load_users()

    if data.username not in users:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user = users[data.username]
    if user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Remove password from response
    user_data = {k: v for k, v in user.items() if k != "password"}

    return {
        "status": "success",
        "user": {
            "id": student.id,
            "username": student.username,
            "name": student.name,
            "department": student.department,
            "completed_courses": completed_courses,
            "enrolled_courses": enrolled_courses
        },
        "message": f"Welcome back, {student.name}!"
    }

    # return {
    #     "status": "success",
    #     "user": {
    #         "id": student.id,
    #         "username": student.username,
    #         "name": student.name,
    #         "department": student.department
    #     },
    #     "message": f"Welcome back, {student.name}!"
    # }




def save_user(user: dict):
    """Save a single user's data to a JSON file"""
    filename = f"{user['username']}.json"
    user_path = os.path.join(USER_INFO_DIR, filename)

    os.makedirs(USER_INFO_DIR, exist_ok=True)

    with open(user_path, "w", encoding="utf-8") as f:
        json.dump(user, f, ensure_ascii=False, indent=2)





# @router.post("/signup")
# def signup(user: User):
#     existing_user = load_user(user.username)

#     if existing_user is not None:
#         raise HTTPException(status_code=400, detail="Username already exists")

#     # Create new user object
#     new_user = {
#         "username": user.username,
#         "password": user.password,  # Hashing recommended
#         "department": user.department,
#         "saved_courses": [],
#         "progress": {}
#     }

#     save_user(new_user)

#     # Return user data without password
#     user_data = {k: v for k, v in new_user.items() if k != "password"}

#     return {
#         "status": "success",
#         "user": user_data,
#         "message": f"Account created successfully for {user.username}!"
#     }
# auth.py (continuing from where we left off)


@router.post("/signup")
def signup(user: User):
    users = load_users()

    if user.username in users:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create new user
    users[user.username] = {
        "username": user.username,
        "password": user.password,  # In a real app, this should be hashed
        "department": user.department,
        "saved_courses": [],
        "progress": {}
    }

    # Save updated users
    save_users(users)

    # Return user data without password
    user_data = {k: v for k, v in users[user.username].items() if k != "password"}

    return {
        "status": "success",
        "user": user_data,
        "message": f"Account created successfully for {user.username}!"
    }


@router.get("/guest")
def guest_login():
    """Guest login with limited permissions"""
    return {
        "status": "success",
        "user": {
            "is_guest": True,
            "department": "מדעי המחשב",  # Default department
        },
        "message": "Logged in as guest. Some features are limited."
    }