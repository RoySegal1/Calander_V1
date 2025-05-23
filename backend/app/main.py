from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.app.db.db import SessionLocal
from backend.app.core.cache import global_courses_cache
from backend.app.db.models import DepartmentCourses
from backend.app.api.auth import router as auth_router
from backend.app.api.coursesInfo import router as courses_info_router
from backend.app.core.logger import logger
import json


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup code here ---
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

    yield  # Application runs here

    # --- Shutdown code here (if needed) ---
    # e.g., cleanup logic, closing connections, etc.

app = FastAPI(lifespan=lifespan)

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
