@echo off
echo Fixing Python path for PerfectCV...

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set environment variables
set ENV_FILE=tests/.env.test
set PYTHONPATH=%CD%\backend

REM Create a .pth file in the site-packages directory to add the backend directory to the Python path
echo Creating .pth file in site-packages...
python -c "import site; print(site.getsitepackages()[0])" > site_packages_path.txt
set /p SITE_PACKAGES_PATH=<site_packages_path.txt
del site_packages_path.txt

echo %CD%\backend > "%SITE_PACKAGES_PATH%\perfectcv.pth"

echo Python path fixed successfully!
echo You can now run start_server.bat to start the server. 