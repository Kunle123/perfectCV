import os
import sys
import time
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    # Get database URL from environment or use default
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@containers-us-west-207.railway.app:7878/railway?sslmode=require"
    )
    
    logger.info(f"Testing connection to database...")
    logger.info(f"Database URL: {database_url}")
    
    # Connection parameters
    connect_args = {
        "connect_timeout": 30,
        "application_name": "perfectcv_test",
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "sslmode": "require"
    }
    
    logger.info(f"Connection arguments: {connect_args}")
    
    try:
        # Create engine with configuration
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10
        )
        
        logger.info("Engine created successfully")
        
        # Test the connection with retry logic
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Connection attempt {attempt + 1} of {max_retries}")
                
                with engine.connect() as connection:
                    # Test basic query
                    result = connection.execute(text("SELECT 1")).fetchone()
                    logger.info("Basic query successful")
                    
                    # Get database information
                    inspector = inspect(engine)
                    tables = inspector.get_table_names()
                    logger.info(f"Connected successfully! Found tables: {tables}")
                    
                    return True
                    
            except SQLAlchemyError as e:
                logger.error(f"Database error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    raise
                    
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error: {str(e)}")
        if hasattr(e, 'orig'):
            logger.error(f"Original error: {str(e.orig)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection() 