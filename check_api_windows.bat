@echo off
echo Testing API server connectivity...
echo =====================================

echo.
echo Test 1: Pinging the API server...
ping perfectcv-production.up.railway.app

echo.
echo Test 2: Checking if the domain resolves...
nslookup perfectcv-production.up.railway.app

echo.
echo Test 3: Testing HTTP connection with curl...
curl -v https://perfectcv-production.up.railway.app/api/v1

echo.
echo Test 4: Testing with PowerShell...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://perfectcv-production.up.railway.app/api/v1' -Method GET -UseBasicParsing; Write-Host 'Status Code: ' $response.StatusCode; Write-Host 'Content: ' $response.Content } catch { Write-Host 'Error: ' $_ }"

echo.
echo All tests completed.
pause 