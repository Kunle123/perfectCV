@echo off
echo Testing Login Process...

REM Set the API URL
set API_URL=https://perfectcv-production.up.railway.app/api/v1

REM Test Login
echo.
echo Testing Login...
curl -X POST "%API_URL%/auth/login" ^
-H "Content-Type: application/x-www-form-urlencoded" ^
-d "username=test@example.com&password=testpassword123" ^
-v

REM Test Protected Endpoint
echo.
echo Testing Protected Endpoint...
curl -X GET "%API_URL%/auth/me" ^
-H "Authorization: Bearer YOUR_TOKEN_HERE" ^
-v

echo.
echo Test completed.
pause 