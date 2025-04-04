#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload