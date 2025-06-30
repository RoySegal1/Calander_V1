# backend/init_db.py

from .db import Base, engine


def init():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

if __name__ == "__main__":
    init()
