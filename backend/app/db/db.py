# backend/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# === Load .env file ONLY in local dev ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "db_keys.env")

if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)
    # print("Local .env file loaded.")
else:
    # print("No local .env file found. Assuming Railway environment.")
    pass

# === Load environment variables (Railway or local) ===
SUPABASE_URL = os.getenv("SUPABASE_URL")             # Railway ENV key
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")   # Railway ENV key
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")       # Railway ENV key

# === Fail early if DB URL is missing ===
if not SUPABASE_DB_URL:
    raise ValueError("DB_URL is not set in the environment variables")

# === SQLAlchemy Setup ===
engine = create_engine(SUPABASE_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
