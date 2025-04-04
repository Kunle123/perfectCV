#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
python3 -m uvicorn app.main:app --reload --port ${PORT:-8001} --host 0.0.0.0 