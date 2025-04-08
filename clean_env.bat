@echo off
echo Cleaning PerfectCV development environment...

REM Check if virtual environment exists
if exist "venv" (
    echo Removing virtual environment...
    rmdir /s /q venv
)

REM Check if __pycache__ directories exist
echo Removing Python cache files...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"

REM Check if egg-info directories exist
echo Removing egg-info directories...
for /d /r . %%d in (*.egg-info) do @if exist "%%d" rd /s /q "%%d"

REM Check if test.db exists
if exist "backend\test.db" (
    echo Removing test database...
    del /f /q "backend\test.db"
)

echo Environment cleaned successfully!
echo Run setup_dev.bat to set up a fresh environment. 