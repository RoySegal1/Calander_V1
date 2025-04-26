# backend/init_db.py

from app.db import Base, engine
from app.models import Student, StudentCourse


def init():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

if __name__ == "__main__":
    init()
