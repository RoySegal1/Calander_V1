# backend/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, Float, PrimaryKeyConstraint,CheckConstraint
from sqlalchemy.orm import relationship
from .db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String)

    courses = relationship("StudentCourse", back_populates="student", cascade="all, delete")


class StudentCourse(Base):
    __tablename__ = "student_courses"

    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    course_code = Column(String, nullable=False)
    group_code = Column(String, primary_key=True)
    lecture_type = Column(Integer, nullable=False)
    grade = Column(Float, nullable=True)

    student = relationship("Student", back_populates="courses")

    __table_args__ = (
        PrimaryKeyConstraint("student_id", "group_code"),
        CheckConstraint("grade IS NULL OR (grade >= 0 AND grade <= 100)", name="grade_between_0_100"),
    )