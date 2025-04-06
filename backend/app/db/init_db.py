from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import engine
from app.models.base import Base
from app.models.user import User
from app.models.resume import Resume, JobDescription, Optimization
import logging

logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except SQLAlchemyError as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise 