# backend/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, Float, PrimaryKeyConstraint, CheckConstraint, JSON, Boolean, TIMESTAMP, func
from sqlalchemy.orm import relationship
from backend.app.db.db import Base
from uuid import uuid4


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String)
    gpa = Column(Float, nullable=True)
    completedCredits = Column(Float, nullable=True)
    courses = relationship("StudentCourse", back_populates="student", cascade="all, delete")


class StudentCourse(Base):
    __tablename__ = "student_courses"

    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    course_code = Column(String, nullable=False)
    group_code = Column(String, primary_key=True)
    lecture_type = Column(Integer, nullable=False)
    grade = Column(Float, nullable=True)
    credits = Column(Float, nullable=True)  # added course credits for courses that are no longer running
    student = relationship("Student", back_populates="courses")

    __table_args__ = (
        PrimaryKeyConstraint("student_id", "group_code"),
        CheckConstraint("grade IS NULL OR (grade >= 0 AND grade <= 100)", name="grade_between_0_100"),
    )


class DepartmentCourses(Base):
    __tablename__ = "department_courses"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String, unique=True, nullable=False)  # works fine with Hebrew
    is_general = Column(Boolean, default=False)
    data = Column(JSON, nullable=False)  # SQLAlchemy will use JSONB if PostgreSQL is detected
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class SavedSchedule(Base):
    __tablename__ = "student_schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    schedule_data = Column(JSON, nullable=False)  # Uses JSONB in PostgreSQL
    created_at = Column(TIMESTAMP, server_default=func.now())
    share_code = Column(String, unique=True, index=True, nullable=False, default=lambda: uuid4().hex[:8])
    schedule_name = Column(String, nullable=False, default="Unnamed Schedule")

    student = relationship("Student", backref="saved_schedules")
