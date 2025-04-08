@echo off
echo Setting up PerfectCV development environment...

REM Create and activate virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

REM Set environment variables
set ENV_FILE=tests/.env.test
set PYTHONPATH=%CD%

REM Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 