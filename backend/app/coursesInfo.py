from fastapi import APIRouter, HTTPException
import json
import os
from backend.data.consts import DEPARTMENT_FILES

router = APIRouter()


@router.get("")
def get_courses(department: str, generalcourses: bool = True):
    department_file_name = DEPARTMENT_FILES.get(department)
    english_file_name = DEPARTMENT_FILES.get("אנגלית")
    klali_file_name = DEPARTMENT_FILES.get("כללי")
    if not department_file_name:
        raise HTTPException(status_code=404, detail="Department not found")

    file_path_department_courses = os.path.join("data", "departmentCourseInfo", department_file_name)
    file_path_english_courses = os.path.join("data", "departmentCourseInfo", english_file_name)
    file_path_klali_courses = os.path.join("data", "departmentCourseInfo", klali_file_name)

    try:
        with open(file_path_department_courses, encoding="utf-8") as f:
            department_courses = json.load(f)
        with open(file_path_english_courses, encoding="utf-8") as f:
            english_courses = json.load(f)
        with open(file_path_klali_courses, encoding="utf-8") as f:
            klali_courses = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Data file not found")

    # Combine all courses into one list (appending items from the others)
    all_courses = department_courses
    if generalcourses:
        all_courses.extend(english_courses)
        all_courses.extend(klali_courses)
    return all_courses