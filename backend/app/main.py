from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from backend.app.api.auth import router as auth_router
# from backend.app.api.coursesInfo import router as courses_info_router
# from backend.app.api.schedule import router as student_schedule_router
# from backend.app.core.logger import logger
# from backend.app.core.cache import load_courses_to_mem

from app.api.auth import router as auth_router
from app.api.coursesInfo import router as courses_info_router
from app.api.schedule import router as student_schedule_router
from app.core.logger import logger
from app.core.cache import load_courses_to_mem


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup code here ---
    load_courses_to_mem()
    logger.info("Startup tasks completed.")
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
app.include_router(student_schedule_router, prefix="/schedule", tags=["StudentSchedule"])
