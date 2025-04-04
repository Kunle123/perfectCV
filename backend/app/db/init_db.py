from sqlalchemy.orm import Session
from app.db.session import engine
from app.models.base import Base
from app.models.user import User
from app.models.resume import Resume, JobDescription, Optimization

def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    Base.metadata.create_all(bind=engine) 