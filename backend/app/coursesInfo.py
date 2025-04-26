#FROM JSON
# from fastapi import APIRouter, HTTPException
# import json
# import os
# from backend.data.consts import DEPARTMENT_FILES
#
# router = APIRouter()
#
#
# @router.get("")
# def get_courses(department: str, generalcourses: bool = True):
#     department_file_name = DEPARTMENT_FILES.get(department)
#     english_file_name = DEPARTMENT_FILES.get("אנגלית")
#     klali_file_name = DEPARTMENT_FILES.get("כללי")
#     if not department_file_name:
#         raise HTTPException(status_code=404, detail="Department not found")
#
#     file_path_department_courses = os.path.join("data", "departmentCourseInfo", department_file_name)
#     file_path_english_courses = os.path.join("data", "departmentCourseInfo", english_file_name)
#     file_path_klali_courses = os.path.join("data", "departmentCourseInfo", klali_file_name)
#
#     try:
#         with open(file_path_department_courses, encoding="utf-8") as f:
#             department_courses = json.load(f)
#         with open(file_path_english_courses, encoding="utf-8") as f:
#             english_courses = json.load(f)
#         with open(file_path_klali_courses, encoding="utf-8") as f:
#             klali_courses = json.load(f)
#     except FileNotFoundError:
#         raise HTTPException(status_code=500, detail="Data file not found")
#
#     # Combine all courses into one list (appending items from the others)
#     all_courses = department_courses
#     if generalcourses:
#         all_courses.extend(english_courses)
#         all_courses.extend(klali_courses)
#     return all_courses







## FROM DB
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .db import SessionLocal
from .models import DepartmentCourses
import json
from typing import Dict

# Initialize the APIRouter for courses info
router = APIRouter()

# In-memory cache dictionary to store course data (you can adjust it based on department and other params)
courses_cache: Dict[str, str] = {}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_courses(department: str, generalcourses: bool = True, db: Session = Depends(get_db)):
    # Check if the data is cached
    cache_key = f"courses_{department}_{generalcourses}"

    # If data exists in cache, return it
    if cache_key in courses_cache:
        cached_data = courses_cache[cache_key]
        return json.loads(cached_data)  # Return the cached data

    # Get the main department
    dept_entry = db.query(DepartmentCourses).filter_by(department_name=department).first()
    if not dept_entry:
        raise HTTPException(status_code=404, detail="Department not found")

    all_courses = list(dept_entry.data)  # Make a copy

    if generalcourses:
        # Add general departments: אנגלית and כללי
        for general_dept in ["אנגלית", "כללי"]:
            general_entry = db.query(DepartmentCourses).filter_by(department_name=general_dept).first()
            if general_entry:
                all_courses.extend(general_entry.data)

    # Cache the response data for the given department and generalcourses flag
    courses_cache[cache_key] = json.dumps(all_courses)

    return all_courses

