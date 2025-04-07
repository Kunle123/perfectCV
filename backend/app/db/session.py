import os
from sqlalchemy import create_engine, URL, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging import logger
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

def create_database_url() -> str:
    """Create and validate the database URL."""
    try:
        # Use the public URL if available, otherwise fall back to the internal URL
        database_url = settings.DATABASE_PUBLIC_URL
        logger.info(f"Using database URL: {database_url}")
        
        if database_url.startswith("sqlite"):
            # Create database directory for SQLite
            db_path = database_url.replace("sqlite:///", "")
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            return database_url
        return database_url
    except Exception as e:
        logger.error(f"Error creating database URL: {str(e)}")
        raise

@retry(
    stop=stop_after_attempt(5),
    wait=wait_fixed(2),
    retry=retry_if_exception_type(SQLAlchemyError),
    reraise=True
)
def setup_engine():
    """Set up the SQLAlchemy engine with proper configuration."""
    try:
        database_url = create_database_url()
        logger.info(f"Setting up engine for database: {database_url}")
        
        # Base configuration for all database types
        engine_config = {
            "poolclass": QueuePool,
            "pool_pre_ping": True,
            "pool_size": settings.SQLALCHEMY_POOL_SIZE,
            "max_overflow": settings.SQLALCHEMY_MAX_OVERFLOW,
            "echo": settings.SQLALCHEMY_ECHO,
            "pool_timeout": settings.SQLALCHEMY_POOL_TIMEOUT,
            "pool_recycle": settings.SQLALCHEMY_POOL_RECYCLE,
        }

        # Add database-specific configuration
        if database_url.startswith("postgresql"):
            logger.info("Configuring PostgreSQL connection parameters")
            engine_config["connect_args"] = {
                "connect_timeout": 30,
                "application_name": "perfectcv",
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5,
                "sslmode": "require"
            }
        elif database_url.startswith("sqlite"):
            logger.info("Configuring SQLite connection parameters")
            engine_config["connect_args"] = {"check_same_thread": False}

        # Create SQLAlchemy engine with configuration
        engine = create_engine(database_url, **engine_config)

        # Add engine event listeners for better debugging
        @event.listens_for(engine, "connect")
        def connect(dbapi_connection, connection_record):
            logger.info("New database connection established")

        @event.listens_for(engine, "checkout")
        def checkout(dbapi_connection, connection_record, connection_proxy):
            logger.debug("Database connection checked out from pool")

        @event.listens_for(engine, "checkin")
        def checkin(dbapi_connection, connection_record):
            logger.debug("Database connection returned to pool")

        return engine
    except Exception as e:
        logger.error(f"Error setting up database engine: {str(e)}")
        raise

try:
    # Set up the engine
    engine = setup_engine()
    
    # Create session factory
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        expire_on_commit=False
    )
    
    logger.info("Database session configuration initialized successfully")
except SQLAlchemyError as e:
    logger.error(f"SQLAlchemy error during session configuration: {str(e)}")
    raise
except Exception as e:
    logger.error(f"Unexpected error during session configuration: {str(e)}")
    raise

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
