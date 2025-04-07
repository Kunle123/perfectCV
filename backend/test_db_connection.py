import os
import sys
import time
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    """Test database connection with various configurations."""
    # Load environment variables
    load_dotenv()
    
    # Get database URLs
    internal_url = os.getenv("DATABASE_URL")
    public_url = os.getenv("DATABASE_PUBLIC_URL")
    proxy_domain = os.getenv("RAILWAY_TCP_PROXY_DOMAIN")
    proxy_port = os.getenv("RAILWAY_TCP_PROXY_PORT")
    
    logger.info("Testing database connections...")
    logger.info(f"Internal URL: {internal_url}")
    logger.info(f"Public URL: {public_url}")
    logger.info(f"Proxy Domain: {proxy_domain}")
    logger.info(f"Proxy Port: {proxy_port}")
    
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
    
    # Test URLs to try
    test_urls = [
        internal_url,
        public_url,
        f"postgresql://postgres:{os.getenv('POSTGRES_PASSWORD')}@{proxy_domain}:{proxy_port}/railway?sslmode=require" if proxy_domain and proxy_port else None
    ]
    
    # Remove None values
    test_urls = [url for url in test_urls if url]
    
    for i, url in enumerate(test_urls, 1):
        logger.info(f"\nTrying connection #{i} with URL: {url}")
        
        try:
            # Create engine with configuration
            engine = create_engine(
                url,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10
            )
            
            # Test the connection
            with engine.connect() as connection:
                # Test basic query
                result = connection.execute(text("SELECT version();")).scalar()
                logger.info(f"PostgreSQL version: {result}")
                
                # Get database information
                inspector = inspect(engine)
                tables = inspector.get_table_names()
                logger.info(f"Connected successfully! Found tables: {tables}")
                
                # Test a more complex query
                result = connection.execute(text("SELECT current_database(), current_user, inet_server_port();")).fetchone()
                logger.info(f"Database: {result[0]}, User: {result[1]}, Port: {result[2]}")
                
                logger.info("Connection test successful!")
                return True
                
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            if hasattr(e, 'orig'):
                logger.error(f"Original error: {str(e.orig)}")
            continue
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            continue
    
    logger.error("All connection attempts failed.")
    return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1) 