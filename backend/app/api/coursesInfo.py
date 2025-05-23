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







## FROM CACHE
from fastapi import APIRouter, HTTPException
from backend.app.core.cache import global_courses_cache
# Initialize the APIRouter for courses info
router = APIRouter()

# # In-memory cache dictionary to store course data (you can adjust it based on department and other params)
# courses_cache: Dict[str, str] = {}


@router.get("")
def get_courses(department: str, generalcourses: bool = True):
    # Validate department in cache
    if department not in global_courses_cache:
        raise HTTPException(status_code=404, detail="Department not found")

    # Copy department courses
    combined_courses = list(global_courses_cache[department])  # shallow copy

    # Optionally add "כללי" and "אנגלית"
    if generalcourses:
        for gen_dept in ["אנגלית", "כללי"]:
            if gen_dept in global_courses_cache:
                combined_courses.extend(global_courses_cache[gen_dept])

    return combined_courses
