from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
from typing import Optional
import os
from sqlalchemy.exc import IntegrityError
from backend.app.db import SessionLocal
from backend.app.models import Student, StudentCourse, DepartmentCourses
from backend.scripts.WebScraperStudent import scrape_student_grades


router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Define models for request data
class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(LoginRequest):
    department: str


@router.get("/guest")
def guest_login():
     """Guest login with limited permissions"""
     return {
         "status": "success",
         "user": {
             "is_guest": True,
             "department": "מדעי המחשב",  # Default department
         },
         "message": "Logged in as guest. Some features are limited."
     }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
     # Step 1: Authenticate user
    student = db.query(Student).filter(Student.username == data.username).first()

    if not student or student.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Step 2: Fetch student courses
    student_courses = db.query(StudentCourse).filter_by(student_id=student.id).all()

    # Step 3: Fetch department course data (from department_courses table)
    department_name = student.department
    department_data = db.query(DepartmentCourses).filter_by(department_name=department_name).first()
    general_data = db.query(DepartmentCourses).filter_by(is_general=True).all()

    all_data_json = []
    if department_data:
        all_data_json.extend(department_data.data)
    for gen in general_data:
        all_data_json.extend(gen.data)

    # Step 4: Find matching courses by group_code
    def match_course(course_code):  # Search for course_code
        for course in all_data_json:
            if course.get("realCourseCode") == course_code:
                return course
        return None
    
    completed_courses = []
    enrolled_courses = []

    for sc in student_courses:
            matched = match_course(sc.group_code)
            if matched:
                matched["grade"] = sc.grade
                if sc.grade is not None:
                    completed_courses.append(matched)
                else:
                    enrolled_courses.append(matched)

    return {
        "status": "success",
        "user": {
            "id": student.id,
            "username": student.username,
            "name": student.name,
            "department": student.department,
            "completed_courses": completed_courses,
            "enrolled_courses": enrolled_courses,
            "gpa": student.gpa,
            "completedCredits": student.completedCredits
        },
        "message": f"Welcome back, {student.name}!"
    }


@router.post("/signup")
def signup(data: SignupRequest):
    # Create new user object with just the necessary fields

    new_user = {
        "username": data.username,
        "password": data.password,
        "department": data.department,
    }

    # Save user and run the WebScraperStudent script
    save_result = save_user(new_user)

    if not save_result["success"]:
        # If script fails, tell user there was an issue
        return {
            "status": "error",
            "message": "There was an issue with your Afeka credentials. Please try again or enter as guest."
        }

    # If script succeeds, proceed with login
    try:
        # Create login request object
        login_request = LoginRequest(username=data.username, password=data.password)
        login_result = login(login_request)
        return login_result

    except HTTPException as e:
        # If login fails for some reason
        return {
            "status": "partial",
            "message": "Account created, but automatic login failed. Please log in manually."
        }


def save_user(user: dict):
    """
    Save a single user's data by running WebScraperStudent script and saving to DB
    Returns success/failure status
    """
    # Check if user already exists
    if check_user_exists(user['username']):
        return {"success": False, "error": "Username already exists"}

    # Run web scraper to get course data
    scraper_clean_result = run_web_scraper(user['username'], user['password'])

    if not scraper_clean_result["success"]:
        return scraper_clean_result

    # Save user and scraped data to database
    db_result = save_user_to_db(user, scraper_clean_result.get("data"))

    return db_result


def check_user_exists(username):
    """
    Check if a user already exists in the database
    """
    db = SessionLocal()
    try:
        user = db.query(Student).filter(Student.username == username).first()
        return user is not None
    finally:
        db.close()


def run_web_scraper(username, password):
    """
    Run the WebScraperStudent script with user credentials and return the scraped data
    """
    try:
        scraped_data = scrape_student_grades(username, password)
        scraped_data = clean_courses(scraped_data)

        # Return the Python object directly
        return {"success": True, "data": scraped_data}

    except Exception as e:
        return {"success": False, "error": str(e)}


def clean_courses(scraped_data):
    """
    Clean the course data and calculate GPA and completed credits.
    Only counts courses with grades of 60 or above for both GPA and completed credits.
    """
    cleaned_courses = {}
    total_grade_points = 0
    total_credits = 0
    completed_credits = 0

    # First pass: clean the data and store in a dictionary
    for course_entry in scraped_data.get("Courses", []):
        for course_code, details in course_entry.items():
            grade_str, credits_str = details

            # Only keep entries with valid credits
            if credits_str and credits_str.strip():
                # Always overwrite to ensure the latest attempt is kept
                cleaned_courses[course_code] = details

    # Second pass: calculate GPA and credits based on cleaned data
    for course_code, details in cleaned_courses.items():
        grade_str, credits_str = details

        try:
            credits = float(credits_str)

            # Check if grade is valid and 60 or above
            if grade_str != "N/A" and grade_str.strip():
                try:
                    grade = float(grade_str)
                    if grade >= 60:  # Only count grades 60 or above
                        total_grade_points += grade * credits
                        completed_credits += credits
                        total_credits += credits
                    else:
                        # Failed course - count in total but not in completed
                        total_credits += credits
                except ValueError:
                    # Skip if grade can't be converted to float
                    pass
            else:
                # No grade yet, still count in total credits
                total_credits += credits

        except ValueError:
            # Skip if credits can't be converted to float
            pass

    # Calculate GPA only if there are completed credits
    gpa = round(total_grade_points / completed_credits, 2) if completed_credits > 0 else 0

    # Convert back to the original format
    scraped_data["Courses"] = [{code: details} for code, details in cleaned_courses.items()]

    # Add GPA and completed credits to scraped data
    scraped_data["GPA"] = gpa
    scraped_data["CompletedCredits"] = completed_credits
    scraped_data["TotalCredits"] = total_credits

    return scraped_data


def save_user_to_db(user_data, scraped_data=None):
    """
    Save user data to the database
    """
    db = SessionLocal()
    try:
        # Create new student object
        new_student = Student(
            username=user_data["username"],
            password=user_data["password"],  # Note: Should be hashed in production
            name=user_data.get("name", user_data["username"]),  # Default to username if name not provided
            department=user_data["department"],
            gpa=scraped_data.get("GPA") if scraped_data else None,
            completedCredits=scraped_data.get("CompletedCredits") if scraped_data else None
        )

        # Add student to session
        db.add(new_student)
        db.flush()  # Flush to get the ID without committing

        # If we have scraped course data, add them
        if scraped_data and "Courses" in scraped_data:
            for course_entry in scraped_data["Courses"]:
                for course_code, details in course_entry.items():
                    # Parse grade, handling "N/A" case
                    grade = None if details[0] == "N/A" else float(details[0])

                    # Add student course
                    new_course = StudentCourse(
                        student_id=new_student.id,
                        course_code=course_code,
                        group_code=f"AUTO-{course_code}",  # Generate a default group code
                        lecture_type=1,  # Default lecture type
                        grade=grade
                    )
                    db.add(new_course)

        # Commit the transaction
        db.commit()
        return {"success": True, "user_id": new_student.id}

    except IntegrityError as e:
        db.rollback()
        if "unique constraint" in str(e).lower() and "username" in str(e).lower():
            return {"success": False, "error": "Username already exists"}
        return {"success": False, "error": f"Database integrity error: {str(e)}"}

    except Exception as e:
        db.rollback()
        return {"success": False, "error": str(e)}

    finally:
        db.close()



