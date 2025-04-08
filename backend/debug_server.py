"""
Debug and repair script for FastAPI server issues
"""
import os
import sys
import sqlite3
import time
from pathlib import Path

def check_environment():
    """Check if the environment variables are set correctly"""
    print("Checking environment variables...")
    env_file = os.environ.get('ENV_FILE')
    print(f"ENV_FILE: {env_file}")
    
    # Check if .env.development exists
    env_path = Path('.env.development')
    if env_path.exists():
        print(f"✅ {env_path} exists")
        # Check content
        with open(env_path, 'r') as f:
            content = f.read()
            print(f"Content of {env_path}:")
            print(content)
    else:
        print(f"❌ {env_path} does not exist")
        print("Creating development environment file...")
        with open(env_path, 'w') as f:
            f.write("""# Database
DATABASE_URL=sqlite:///./dev.db
ENV_FILE=.env.development

# CORS
CORS_ORIGINS=http://localhost:5174,http://localhost:5173,http://localhost:3000

# JWT
JWT_SECRET_KEY=development_secret_key_do_not_use_in_production

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Server
PORT=8000
HOST=127.0.0.1
""")
        print(f"✅ Created {env_path}")

def check_database():
    """Check if the SQLite database exists and is working"""
    print("\nChecking database...")
    db_path = Path('dev.db')
    if db_path.exists():
        print(f"✅ Database file exists: {db_path.absolute()}")
        print(f"  Size: {db_path.stat().st_size} bytes")
        print(f"  Modified: {time.ctime(db_path.stat().st_mtime)}")
        
        # Check if the database is valid
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"  Tables in database: {[table[0] for table in tables]}")
            conn.close()
            print("✅ Database is valid and can be accessed")
        except sqlite3.Error as e:
            print(f"❌ Database error: {e}")
            print("Removing corrupt database file...")
            os.remove(db_path)
            print("✅ Corrupt database file removed. A new one will be created when the server starts.")
    else:
        print(f"ℹ️ Database file does not exist: {db_path.absolute()}")
        print("  A new database will be created when the server starts.")

def check_port():
    """Check if port 8000 is already in use"""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", 8000))
        print("\n✅ Port 8000 is available")
        s.close()
    except socket.error:
        print("\n❌ Port 8000 is already in use")
        print("Checking processes using port 8000...")
        os.system("netstat -ano | findstr :8000")
        
def kill_server_processes():
    """Kill all Python server processes"""
    print("\nKilling all Python server processes...")
    try:
        os.system("taskkill /f /im python.exe")
        print("✅ Python processes terminated")
    except Exception as e:
        print(f"❌ Error terminating processes: {e}")

def main():
    print("=" * 50)
    print("FastAPI Server Diagnostic and Repair Tool")
    print("=" * 50)
    
    # Check environment
    check_environment()
    
    # Check database
    check_database()
    
    # Check port 
    check_port()
    
    # Kill existing server processes
    kill_server_processes()
    
    print("\n" + "=" * 50)
    print("Diagnostic complete. Run the server with:")
    print("$env:ENV_FILE='.env.development'; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
    print("=" * 50)
    
    restart = input("\nWould you like to restart the server now? (y/n): ")
    if restart.lower() == 'y':
        print("\nStarting server...")
        os.system("$env:ENV_FILE='.env.development'; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")

if __name__ == "__main__":
    main() 