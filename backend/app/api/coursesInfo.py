from fastapi import APIRouter, HTTPException
from backend.app.core.cache import global_courses_cache
from backend.app.core.logger import logger
# Initialize the APIRouter for courses info
router = APIRouter()

# # In-memory cache dictionary to store course data (you can adjust it based on department and other params)
# courses_cache: Dict[str, str] = {}


@router.get("")
def get_courses(department: str, generalcourses: bool = True):
    # Validate department in cache
    if department not in global_courses_cache:
        logger.error(f"department not in global_courses_cache {department}")
        raise HTTPException(status_code=404, detail="Department not found")

    # Copy department courses
    combined_courses = list(global_courses_cache[department])  # shallow copy

    # Optionally add "כללי" and "אנגלית"
    if generalcourses:
        for gen_dept in ["אנגלית", "כללי"]:
            if gen_dept in global_courses_cache:
                combined_courses.extend(global_courses_cache[gen_dept])

    return combined_courses
