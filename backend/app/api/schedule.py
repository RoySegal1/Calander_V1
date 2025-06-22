from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.logger import logger
from backend.app.db.db import SessionLocal
from backend.app.core import schemas
from backend.app.db import crud

# Initialize the APIRouter for courses info
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_schedule(schedule: schemas.SavedScheduleCreate, db: Session = Depends(get_db)):
    max_schedules = 5
    current_count = crud.count_schedules_for_student(db, schedule.student_id)
    logger.info(f"Current count: {current_count} for Student ID: {schedule.student_id}")
    if current_count >= max_schedules:
        raise HTTPException(status_code=400, detail="Maximum saved schedules reached.")

    return crud.create_saved_schedule(db, schedule)


@router.get("/{schedule_id}", response_model=schemas.SavedScheduleOut)
def load_schedule(schedule_id: str, db: Session = Depends(get_db)):
    db_schedule = crud.get_schedule_by_id(db, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return db_schedule


@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: str, db: Session = Depends(get_db)):
    success = crud.delete_schedule_by_id(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"detail": "Schedule deleted successfully"}


@router.get("/student/{student_id}")
def get_student_schedules(student_id: int, db: Session = Depends(get_db)):
    schedules = crud.get_schedules_for_student(db, student_id)
    return schedules
