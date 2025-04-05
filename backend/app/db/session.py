from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from app.core.config import settings

# Create database directory if it doesn't exist (for SQLite)
if settings.DATABASE_URL.startswith('sqlite'):
    db_path = settings.DATABASE_URL.replace('sqlite:///', '')
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith('sqlite') else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
