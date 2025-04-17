from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Import our new auth router
from .auth import router as auth_router
from .coursesInfo import router as courses_info_router

app = FastAPI()

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
