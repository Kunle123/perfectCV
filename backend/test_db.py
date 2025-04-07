import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import psycopg2
from dotenv import load_dotenv
import urllib.parse

def test_connection():
    # Load environment variables
    load_dotenv()
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    print(f"\nOriginal DATABASE_URL: {database_url}")
    
    # Try different connection string formats
    connection_strings = [
        database_url,  # Original URL
        database_url.replace("?sslmode=require", ""),  # Without SSL
        f"{database_url}&connect_timeout=10",  # With timeout
        f"{database_url}&application_name=test_connection"  # With application name
    ]
    
    for i, conn_str in enumerate(connection_strings, 1):
        print(f"\nTrying connection string #{i}:")
        print(f"URL: {conn_str}")
        
        try:
            # First try direct psycopg2 connection
            print("\nAttempting direct psycopg2 connection...")
            conn = psycopg2.connect(conn_str)
            print("Direct psycopg2 connection successful!")
            conn.close()
            
            # Then try SQLAlchemy connection
            print("\nAttempting SQLAlchemy connection...")
            engine = create_engine(conn_str)
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                print("SQLAlchemy connection successful!")
                print(f"Test query result: {result.scalar()}")
                return  # Exit on first successful connection
                
        except Exception as e:
            print(f"\nError occurred: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            if hasattr(e, 'pgcode'):
                print(f"PostgreSQL error code: {e.pgcode}")
            if hasattr(e, 'pgerror'):
                print(f"PostgreSQL error message: {e.pgerror}")
            print("Continuing to next connection string...")
    
    print("\nAll connection attempts failed.")
    sys.exit(1)

if __name__ == "__main__":
    test_connection() 