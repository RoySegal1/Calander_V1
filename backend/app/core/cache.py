# This will hold the in-memory cache
from sqlalchemy.orm import Session
from backend.app.db.db import SessionLocal
from backend.app.db.models import DepartmentCourses
from backend.app.core.logger import logger
import json

global_courses_cache = {}


def load_courses_to_mem():
    db: Session = SessionLocal()
    try:
        departments = db.query(DepartmentCourses).all()
        for dept in departments:
            if isinstance(dept.data, str):
                course_data = json.loads(dept.data)
            else:
                course_data = dept.data

            global_courses_cache[dept.department_name] = course_data

        logger.info("Cached %d departments at startup", len(global_courses_cache))
    finally:
        db.close()
