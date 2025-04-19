from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import json
import os
from typing import Optional

router = APIRouter()


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
def login(data: LoginRequest):
    user = load_user(data.username)

    if user is None or user.get("UserName") != data.username:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Remove password before returning user data
    user_data = {k: v for k, v in user.items() if k != "password"}

    return {
        "status": "success",
        "user": user_data,
        "message": f"Welcome back, {data.username}!"
    }




def save_user(user: dict):
    """Save a single user's data to a JSON file"""
    filename = f"{user['username']}.json"
    user_path = os.path.join(USER_INFO_DIR, filename)

    os.makedirs(USER_INFO_DIR, exist_ok=True)

    with open(user_path, "w", encoding="utf-8") as f:
        json.dump(user, f, ensure_ascii=False, indent=2)





@router.post("/signup")
def signup(user: User):
    existing_user = load_user(user.username)

    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create new user object
    new_user = {
        "username": user.username,
        "password": user.password,  # Hashing recommended
        "department": user.department,
        "saved_courses": [],
        "progress": {}
    }

    save_user(new_user)

    # Return user data without password
    user_data = {k: v for k, v in new_user.items() if k != "password"}

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


