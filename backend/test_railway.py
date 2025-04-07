import psycopg2
from dotenv import load_dotenv
import os

def test_railway_connection():
    # Load environment variables
    load_dotenv()
    
    # Get database URL
    database_url = os.getenv("DATABASE_URL")
    print(f"\nTesting connection to: {database_url}")
    
    try:
        # Try direct connection
        conn = psycopg2.connect(database_url)
        print("Connection successful!")
        
        # Test a simple query
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"PostgreSQL version: {version[0]}")
        
        # Close connection
        cur.close()
        conn.close()
        print("Connection closed successfully")
        
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        if hasattr(e, 'pgcode'):
            print(f"PostgreSQL error code: {e.pgcode}")
        if hasattr(e, 'pgerror'):
            print(f"PostgreSQL error message: {e.pgerror}")

if __name__ == "__main__":
    test_railway_connection() 