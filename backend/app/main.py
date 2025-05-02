from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.app.db import SessionLocal
from backend.app.cache import global_courses_cache
from backend.app.models import DepartmentCourses
from backend.app.auth import router as auth_router
from backend.app.coursesInfo import router as courses_info_router
import json

app = FastAPI()


@app.on_event("startup")
def load_courses_into_cache():
    db: Session = SessionLocal()
    try:
        departments = db.query(DepartmentCourses).all()
        for dept in departments:
            if isinstance(dept.data, str):
                course_data = json.loads(dept.data)
            else:
                course_data = dept.data  # in case it's already a dict/list

            global_courses_cache[dept.department_name] = course_data

        print(f"Cached {len(global_courses_cache)} departments at startup.")
    finally:
        db.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the auth router
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(courses_info_router, prefix="/courses", tags=["courseInfo"])
