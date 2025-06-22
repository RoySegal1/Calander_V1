from sqlalchemy.orm import Session
from backend.app.db import models


def create_saved_schedule(db: Session, schedule):
    saved = models.SavedSchedule(
        student_id=schedule.student_id,
        schedule_data=[group.dict() for group in schedule.schedule_data],
        schedule_name=schedule.schedule_name
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


def get_schedule_by_id(db: Session, schedule_id: str):
    return db.query(models.SavedSchedule).filter_by(share_code=schedule_id).first()


def count_schedules_for_student(db: Session, student_id: int):
    return db.query(models.SavedSchedule).filter_by(student_id=student_id).count()


def get_schedules_for_student(db: Session, student_id: int):
    return db.query(models.SavedSchedule).filter_by(student_id=student_id).all()


def delete_schedule_by_id(db: Session, schedule_id: str):
    schedule = db.query(models.SavedSchedule).filter_by(share_code=schedule_id).first()
    if schedule:
        db.delete(schedule)
        db.commit()
        return True
    return False


