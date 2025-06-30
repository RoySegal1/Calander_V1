# backend/insert_courses.py
import json
import os
from sqlalchemy.orm import Session
from backend.app.db.models import DepartmentCourses
from backend.app.db.db import SessionLocal


def insert_department_course(json_path: str, department_name: str, is_general: bool = False):
    with open(json_path, encoding='utf-8') as f:
        course_data = json.load(f)

    db: Session = SessionLocal()
    try:
        existing = db.query(DepartmentCourses).filter_by(department_name=department_name).first()
        if existing:
            existing.data = course_data
            existing.is_general = is_general
        else:
            db_course = DepartmentCourses(
                department_name=department_name,
                is_general=is_general,
                data=course_data
            )
            db.add(db_course)

        db.commit()
        print(f"✅ Successfully inserted/updated {department_name}")
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to insert/update {department_name}: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Go up from /backend
    JSON_PATH = os.path.join(BASE_DIR, "scripts", "combined_data", "courses_11_final.json")
    department_name = "מדעי המחשב"
    is_general = False
    insert_department_course(JSON_PATH, department_name, is_general)
