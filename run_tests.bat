@echo off
echo Running PerfectCV tests...

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set environment variables
set ENV_FILE=tests/.env.test
set PYTHONPATH=%CD%\backend

REM Run tests
cd backend
python -m pytest tests/ -v 