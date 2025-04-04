from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEPARTMENT_FILES = {
     "CS": "CS_courses.json",
    # "Math": "Math_courses.json",
    # "English": "English_courses.json",
    "מדעי המחשב": "CS_courses.json",  # Support Hebrew labels
}


@app.get("/courses")
def get_courses(department: str = "CS"):
    file_name = DEPARTMENT_FILES.get(department)
    if not file_name:
        raise HTTPException(status_code=404, detail="Department not found")

    file_path = os.path.join("data", "departmentCourseInfo", file_name)

    try:
        with open(file_path, encoding="utf-8") as f:
            courses = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Data file not found")

    return courses

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
#
# app = FastAPI()
#
# # CORS: allow frontend to talk to backend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # adjust if needed
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# @app.get("/")
# def read_root():
#     return {"message": "Hello from FastAPI!"}




