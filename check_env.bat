@echo off
echo Checking PerfectCV development environment...

REM Check if virtual environment exists
if not exist "venv" (
    echo ERROR: Virtual environment not found. Run setup_dev.bat first.
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check Python version
echo Checking Python version...
python --version

REM Check if required packages are installed
echo Checking required packages...
python -c "import fastapi; print('FastAPI is installed')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: FastAPI is not installed. Run setup_dev.bat first.
    exit /b 1
)

python -c "import uvicorn; print('Uvicorn is installed')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Uvicorn is not installed. Run setup_dev.bat first.
    exit /b 1
)

python -c "import sqlalchemy; print('SQLAlchemy is installed')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: SQLAlchemy is not installed. Run setup_dev.bat first.
    exit /b 1
)

python -c "import pydantic_settings; print('Pydantic Settings is installed')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Pydantic Settings is not installed. Run setup_dev.bat first.
    exit /b 1
)

REM Check if app module can be imported
echo Checking if app module can be imported...
cd backend
python -c "import app; print('App module can be imported')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: App module cannot be imported. Check your PYTHONPATH.
    cd ..
    exit /b 1
)
cd ..

echo Environment check completed successfully!
echo You can now run start_server.bat to start the server. 