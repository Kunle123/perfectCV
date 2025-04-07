import os
import logging
import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import time
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_fixed(5),
    retry=retry_if_exception_type(SQLAlchemyError)
)
def test_railway_connection():
    """Test connection to Railway PostgreSQL database"""
    # Get database URL from environment or use default
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@europe-west4-drams3a.railway.app:7878/railway?sslmode=require"
    )
    
    logger.info(f"Testing connection to Railway database: {database_url}")
    
    try:
        # Create engine with extended timeout and connection parameters
        engine = create_engine(
            database_url,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
            connect_args={
                "connect_timeout": 30,
                "application_name": "perfectcv_test",
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5
            }
        )
        
        # Test the connection
        with engine.connect() as connection:
            # Get PostgreSQL version
            version = connection.execute(text("SELECT version()")).scalar()
            logger.info(f"Successfully connected to PostgreSQL. Version: {version}")
            
            # Get current database name
            db_name = connection.execute(text("SELECT current_database()")).scalar()
            logger.info(f"Connected to database: {db_name}")
            
            # List all tables in the public schema
            tables = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)).fetchall()
            
            logger.info("Tables in public schema:")
            for table in tables:
                logger.info(f"- {table[0]}")
            
            return True
            
    except SQLAlchemyError as e:
        logger.error(f"Failed to connect to Railway database: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error args: {e.args}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        test_railway_connection()
        exit(0)
    except Exception as e:
        logger.error("Connection test failed")
        exit(1) 