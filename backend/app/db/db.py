# backend/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Dynamically determine the absolute path to the .env file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Directory of db.py
ENV_PATH = os.path.join(BASE_DIR, "db_keys.env")  # Path to db_keys.env
if not os.path.exists(ENV_PATH):
    raise FileNotFoundError(f"Environment file not found: {ENV_PATH}")

# Load environment variables
load_dotenv(ENV_PATH)
# print("Environment variables loaded.")

# Fetch environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # Not needed here but good to keep
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

# # Debug prints to verify variables
# print(f"SUPABASE_URL: {SUPABASE_URL}")
# print(f"SUPABASE_ANON_KEY: {SUPABASE_ANON_KEY}")
# print(f"DATABASE_URL: {SUPABASE_DB_URL}")

# Raise an error if DATABASE_URL is not set
if not SUPABASE_DB_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables")
# Alternatively: hard-code it if Supabase gave you full DB URL
# DATABASE_URL = "postgresql://username:password@db.xxxxx.supabase.co:5432/postgres"

# Create SQLAlchemy engine and session
engine = create_engine(SUPABASE_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

