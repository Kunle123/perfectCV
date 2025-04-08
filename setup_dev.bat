@echo off
echo Setting up PerfectCV development environment...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install -e .

REM Set environment variables
set ENV_FILE=tests/.env.test
set PYTHONPATH=%CD%

REM Return to root directory
cd ..

echo Development environment setup complete!
echo To start the server, run: start_server.bat 