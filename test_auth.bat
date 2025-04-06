@echo off
echo Testing Authentication Flow...

REM Set the API URL
set API_URL=https://perfectcv-production.up.railway.app/api/v1

REM Test Registration
echo.
echo Testing Registration...
curl -X POST "%API_URL%/auth/register" ^
-H "Content-Type: application/json" ^
-d "{\"email\":\"test@example.com\",\"password\":\"testpassword123\",\"full_name\":\"Test User\"}" ^
-v

REM Test Login and capture token
echo.
echo Testing Login...
for /f "tokens=*" %%a in ('curl -s -X POST "%API_URL%/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test@example.com&password=testpassword123" ^| findstr "access_token"') do (
    set TOKEN=%%a
    echo Token received: %%a
)

REM Extract token value
for /f "tokens=2 delims=:," %%a in ("%TOKEN%") do (
    set TOKEN=%%a
    set TOKEN=!TOKEN:"=!
    set TOKEN=!TOKEN: =!
)

REM Test Protected Endpoint with actual token
echo.
echo Testing Protected Endpoint with token: %TOKEN%
curl -X GET "%API_URL%/auth/me" ^
-H "Authorization: Bearer %TOKEN%" ^
-v

echo.
echo Test completed.
pause 