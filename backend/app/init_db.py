# backend/init_db.py

from db import Base, engine
from .models import Student, StudentCourse


def init():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

if __name__ == "__main__":
    init()
