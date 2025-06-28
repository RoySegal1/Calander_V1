from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.app.db.db import SessionLocal
from backend.app.db.models import Student, StudentCourse
from backend.data.consts import DEPARTMENT_CREDITS
from backend.app.core.validation import validate_username,validate_username_for_light
from backend.app.api.coursesInfo import get_courses
from backend.app.core.logger import logger
from backend.app.core.schemas import LoginRequest, SignupRequest
from backend.app.core.helper import save_user, match_course
from passlib.hash import bcrypt


router = APIRouter()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    username_validated = validate_username(data.username) or validate_username_for_light(data.username)
    if not username_validated:
        logger.error(f"Username not in correct format, Somehow bypassed our frontend!!  Username::{data.username}")
        raise HTTPException(status_code=401, detail="Username must be in the format Firstname.Lastname")

    student = db.query(Student).filter(Student.username == data.username).first()

    if not student or not bcrypt.verify(data.password, student.password):
        logger.error("Username not valid or Password incorrect")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Step 2: Fetch student courses
    student_courses = db.query(StudentCourse).filter_by(student_id=student.id).all()

    # Step 3: Fetch department course data (from coursesInfo.py)
    all_data_json = get_courses(student.department)

    # Step 4: Find matching courses by group_code
    completed_courses = []
    enrolled_courses = []
    credits_mandatory = 0
    credits_elective = 0
    credits_general = 0
    enrolled_credits_total = 0

    for sc in student_courses:
        matched = match_course(sc.course_code, all_data_json)
        if matched:
            course_credit = float(matched["courseCredit"]) if matched.get("courseCredit") else 0

            if sc.grade is not None:
                # Completed course
                completed_courses.append({
                    "courseId":  matched.get("realCourseCode", "") or sc.course_code,
                    "grade": sc.grade
                })

                # Add to appropriate category totals
                if 'בחירה' in matched["courseType"]:
                    credits_elective += course_credit
                if 'חובה' in matched["courseType"]:
                    credits_mandatory += course_credit
                if 'רוח' in matched["courseType"]:
                    credits_general += course_credit
            else:
                # Enrolled course
                course_id = matched.get("courseCode", "") or matched.get("realCourseCode", "") or sc.course_code


                # Store detailed info
                enrolled_courses.append({
                    "courseName": matched.get("courseName", "Unknown Course"),
                    "courseCredit": course_credit,
                    "courseType": matched.get("courseType", "Unknown"),
                    "courseCode": course_id,
                    "semester": matched.get("semester", "")
                })

                # Add to enrolled credits total
                enrolled_credits_total += course_credit
    logger.info(f"Successfully logged username {data.username}")
    return {
        "status": "success",
        "user": {
            "id": str(student.id),
            "username": student.username,
            "name": student.name,
            "department": student.department,
            "completedCourses": completed_courses,
            "enrolledCourses": enrolled_courses,
            "credits": {
                "completed": student.completedCredits,
                "required": DEPARTMENT_CREDITS[student.department],
                "enrolled": enrolled_credits_total
            },
            "gpa": student.gpa,
            "remainingRequirements": {
                "general": credits_general,
                "elective": credits_elective,
                "mandatory": credits_mandatory
            }
        },
        "message": f"Welcome back, {student.name}!"
    }


@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
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
        logger.error("Script Fails")
        raise HTTPException(
            status_code=401,
            detail="There was an issue with your Afeka credentials. Please try again or enter as guest."
        )

    # If script succeeds, proceed with login
    try:
        # Create login request object
        login_request = LoginRequest(username=data.username, password=data.password)
        login_result = login(login_request, db)  # Pass the db session here
        return login_result

    except HTTPException as e:
        # If login fails for some reason
        return {
            "status": "partial",
            "message": "Account created, but automatic login failed. Please log in manually."
        }


@router.post("/signuplight")
def signuplight(data: SignupRequest, db: Session = Depends(get_db)):
    try:
        if not validate_username_for_light(data.username):
            logger.error(f"Username not in correct format, Somehow bypassed our frontend!!  Username::{data.username}")
            raise HTTPException(status_code=401, detail="Username Not By Format")

        logger.info(f"Attempting light signup for user: {data.username}")

        existing_user = db.query(Student).filter(Student.username == data.username).first()
        if existing_user:
            logger.warning(f"Signup failed: username '{data.username}' is already taken.")
            raise HTTPException(status_code=400, detail="Username already taken")

        # Create the student with hashed password
        new_student = Student(
            username=data.username,
            password=bcrypt.hash(data.password),
            name=data.username,  # Default to username if name isn't provided
            department=data.department
        )

        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        logger.info(f"User '{data.username}' successfully registered with ID {new_student.id}")

        # Attempt login after successful signup
        login_request = LoginRequest(username=data.username, password=data.password)
        login_result = login(login_request, db)
        logger.info(f"User '{data.username}' successfully logged in after light signup.")
        return login_result

    except HTTPException as http_exc:
        # Already logged above if due to username conflict
        raise http_exc

    except SQLAlchemyError as db_exc:
        db.rollback()
        logger.error(f"Database error during light signup for '{data.username}': {db_exc}")
        raise HTTPException(status_code=500, detail="Database error occurred during signup.")

    except Exception as exc:
        logger.error(f"Unexpected error during light signup for '{data.username}': {exc}")
        raise HTTPException(status_code=500, detail="Unexpected error during signup.")