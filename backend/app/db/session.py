import os
from sqlalchemy import create_engine, URL, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging import logger

def create_database_url() -> str:
    """Create and validate the database URL."""
    try:
        if settings.DATABASE_URL.startswith("sqlite"):
            # Create database directory for SQLite
            db_path = settings.DATABASE_URL.replace("sqlite:///", "")
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            return settings.DATABASE_URL
        return settings.DATABASE_URL
    except Exception as e:
        logger.error(f"Error creating database URL: {str(e)}")
        raise

def setup_engine():
    """Set up the SQLAlchemy engine with proper configuration."""
    try:
        # Base configuration for all database types
        engine_config = {
            "poolclass": QueuePool,
            "pool_pre_ping": True,
            "pool_size": settings.SQLALCHEMY_POOL_SIZE,
            "max_overflow": settings.SQLALCHEMY_MAX_OVERFLOW,
            "echo": settings.SQLALCHEMY_ECHO,
            "future": True,  # Enable SQLAlchemy 2.0 features
            "pool_timeout": settings.SQLALCHEMY_POOL_TIMEOUT,
            "pool_recycle": settings.SQLALCHEMY_POOL_RECYCLE,
        }

        # Add database-specific configuration
        if settings.DATABASE_URL.startswith("postgresql"):
            engine_config["connect_args"] = {"connect_timeout": 30}
        elif settings.DATABASE_URL.startswith("sqlite"):
            engine_config["connect_args"] = {"check_same_thread": False}

        # Create SQLAlchemy engine with configuration
        engine = create_engine(create_database_url(), **engine_config)

        # Add engine event listeners for better debugging
        @event.listens_for(engine, "connect")
        def connect(dbapi_connection, connection_record):
            logger.debug("New database connection established")

        @event.listens_for(engine, "checkout")
        def checkout(dbapi_connection, connection_record, connection_proxy):
            logger.debug("Database connection checked out from pool")

        @event.listens_for(engine, "checkin")
        def checkin(dbapi_connection, connection_record):
            logger.debug("Database connection returned to pool")

        return engine
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error during engine setup: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during engine setup: {str(e)}")
        raise

try:
    # Set up the engine
    engine = setup_engine()
    
    # Create session factory with SQLAlchemy 2.0 features
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        future=True,
        expire_on_commit=False  # Prevent expired objects after commit
    )
    
    logger.info("Database session configuration initialized successfully")
except SQLAlchemyError as e:
    logger.error(f"SQLAlchemy error during session configuration: {str(e)}")
    raise
except Exception as e:
    logger.error(f"Unexpected error during session configuration: {str(e)}")
    raise
