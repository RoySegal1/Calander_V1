from passlib.hash import bcrypt
from .logger import logger
from ..db.db import SessionLocal
from ..db.models import Student, StudentCourse
from backend.scripts.WebScraperStudent import scrape_student_grades
from sqlalchemy.exc import IntegrityError

from ...data.consts import COURSES_FROM_DIFFERENT_YEARS


def save_user(user: dict):
    """
    Save a single user's data by running WebScraperStudent script and saving to DB
    Returns success/failure status
    """
    # Check if user already exists
    if check_user_exists(user['username']):
        logger.error("User already exists")
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
        logger.info("Trying to run scraper")
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
            password=bcrypt.hash(user_data["password"]),  # Note: Should be hashed in production
            name=user_data.get("name", user_data["username"].split(".")[0]),  # name till dot
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
                        lecture_type=1,  # Default lecture type. TODO: fix or cut group_code &  lecture_type
                        grade=grade,
                        credits=float(details[1])

                    )
                    db.add(new_course)

        # Commit the transaction
        db.commit()
        logger.info("User saved in DB")
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


def match_course(course_code, all_data):  # Search for course_code
    for course in all_data:
        if course.get("realCourseCode") == course_code:
            course_without_groups = course.copy()
            course_without_groups.pop("groups", None)  # Remove 'groups' if it exists
            return course_without_groups
    if course_code in COURSES_FROM_DIFFERENT_YEARS:
        return COURSES_FROM_DIFFERENT_YEARS[course_code]
    return None