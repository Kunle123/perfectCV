@echo off
echo Installing requests package...
python -m pip install requests
echo.
echo Running Authentication Test...
python test_auth.py
pause 