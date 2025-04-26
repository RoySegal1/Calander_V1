from fastapi import APIRouter, HTTPException, Body ,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .db import SessionLocal
from .models import Student, StudentCourse
import json
import os
from typing import Optional

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
    saved_courses: Optional[list] = []
    progress: Optional[dict] = {}


# Path to users database file
USER_INFO_DIR = os.path.join("data", "userInfo")

def load_user(username: str):
    """Load a specific user file"""
    filename = f"{username}.json"
    user_path = os.path.join(USER_INFO_DIR, filename)

    try:
        with open(user_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Corrupted user data")



@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
     # Step 1: Authenticate user
    student = db.query(Student).filter(Student.username == data.username).first()

    if not student or student.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Step 2: Fetch student courses
    student_courses = db.query(StudentCourse).filter_by(student_id=student.id).all()

    # Step 3: Fetch department course data (from department_courses table)
    department_name = student.department
    department_data = db.query(DepartmentCourses).filter_by(department_name=department_name).first()
    general_data = db.query(DepartmentCourses).filter_by(is_general=True).all()

    all_data_json = []
    if department_data:
        all_data_json.extend(department_data.data)
    for gen in general_data:
        all_data_json.extend(gen.data)

    # Step 4: Find matching courses by group_code
    def match_course(group_code):#serch for realCourseCode
        for course in all_data_json:
            for group in course.get("groups", []):
                if group["groupCode"] == group_code:
                    return {
                        **course,
                        "group": group  # Add the specific group info
                    }
        return None
    
    completed_courses = []
    enrolled_courses = []

    for sc in student_courses:
            matched = match_course(sc.group_code)
            if matched:
                matched["grade"] = sc.grade
                if sc.grade is not None:
                    completed_courses.append(matched)
                else:
                    enrolled_courses.append(matched)

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
    db = SessionLocal()

    # Check if username already exists
    existing_user = db.query(Student).filter(Student.username == user.username).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create new student instance
    new_student = Student(
        username=user.username,
        password=user.password,  # You can hash this later
        name=user.username,      # You can allow input for this later
        department=user.department
    )

    try:
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred")
    finally:
        db.close()

    # Return the created user (without password)
    return {
        "status": "success",
        "user": {
            "id": new_student.id,
            "username": new_student.username,
            "name": new_student.name,
            "department": new_student.department,
        },
        "message": f"Account created successfully for {new_student.username}!"
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





#
# USERS_DB_PATH = os.path.join("data", "userInfo",) # i need to add the path  and for to correct file , "Roei.Segal"

#BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))



#
# # Helper functions
# def load_users():
#     """Load users from JSON file"""
#     try:
#         with open(USERS_DB_PATH, "r", encoding="utf-8") as f:
#             return json.load(f)
#     except (FileNotFoundError, json.JSONDecodeError):
#         # Return empty dict if file doesn't exist or is invalid # add a message "file not found sign in"
#         return {}
#
#
#
#
# @router.post("/login")
# def login(data: LoginRequest):
#     users = load_users()
#
#     if data.username not in users:
#         raise HTTPException(status_code=401, detail="Invalid username or password")
#
#     user = users[data.username]
#     if user["password"] != data.password:
#         raise HTTPException(status_code=401, detail="Invalid username or password")
#
#     # Remove password from response
#     user_data = {k: v for k, v in user.items() if k != "password"}
#
#     return {
#         "status": "success",
#         "user": user_data,
#         "message": f"Welcome back, {data.username}!"
#     }



#
# def save_users(users_data): # to DB?
#     """Save users to JSON file"""
#     # Ensure directory exists
#     os.makedirs(os.path.dirname(USERS_DB_PATH), exist_ok=True)
#
#     with open(USERS_DB_PATH, "w", encoding="utf-8") as f:
#         json.dump(users_data, f, ensure_ascii=False, indent=2)
#
#
#
# @router.post("/signup")
# def signup(user: User):
#     users = load_users()
#
#     if user.username in users:
#         raise HTTPException(status_code=400, detail="Username already exists")
#
#     # Create new user
#     users[user.username] = {
#         "username": user.username,
#         "password": user.password,  # In a real app, this should be hashed
#         "department": user.department,
#         "saved_courses": [],
#         "progress": {}
#     }
#
#     # Save updated users
#     save_users(users)
#
#     # Return user data without password
#     user_data = {k: v for k, v in users[user.username].items() if k != "password"}
#
#     return {
#         "status": "success",
#         "user": user_data,
#         "message": f"Account created successfully for {user.username}!"
#     }


