#!/bin/bash

# Kill any existing processes on port 8001
lsof -ti:8001 | xargs kill -9 2>/dev/null

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if all required packages are installed
if ! pip freeze | grep -q "fastapi==0.68.2"; then
    echo "Installing/updating dependencies..."
    pip install -r requirements.txt
fi

# Run database migrations
alembic upgrade head

# Start the server
python3 -m uvicorn app.main:app --reload --port 8001 --host 0.0.0.0 