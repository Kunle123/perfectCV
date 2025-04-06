# PowerShell script to test API endpoints using a different approach
$API_BASE_URL = "https://perfectcv-production.up.railway.app/api/v1"
$TOKEN = "" # Add your token here

Write-Host "Testing API server accessibility..."
Write-Host "====================================="

# Test 1: Simple HTTP request
try {
    Write-Host "Test 1: Simple HTTP request"
    $response = Invoke-WebRequest -Uri $API_BASE_URL -Method GET -UseBasicParsing
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Status Description: $($response.StatusDescription)"
    Write-Host "Headers: $($response.Headers | ConvertTo-Json)"
    Write-Host "Content: $($response.Content)"
    Write-Host "Test 1: SUCCESS"
}
catch {
    Write-Host "Test 1: FAILED"
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
}

Write-Host "`nTest 2: Test with System.Net.WebClient"
Write-Host "====================================="

# Test 2: Using System.Net.WebClient
try {
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("User-Agent", "PowerShell API Tester")
    $content = $webClient.DownloadString($API_BASE_URL)
    Write-Host "Content: $content"
    Write-Host "Test 2: SUCCESS"
}
catch {
    Write-Host "Test 2: FAILED"
    Write-Host "Error: $_"
}

Write-Host "`nTest 3: Test with System.Net.HttpClient"
Write-Host "====================================="

# Test 3: Using System.Net.HttpClient
try {
    $httpClient = New-Object System.Net.Http.HttpClient
    $httpClient.DefaultRequestHeaders.Add("User-Agent", "PowerShell API Tester")
    $response = $httpClient.GetAsync($API_BASE_URL).Result
    $content = $response.Content.ReadAsStringAsync().Result
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content: $content"
    Write-Host "Test 3: SUCCESS"
}
catch {
    Write-Host "Test 3: FAILED"
    Write-Host "Error: $_"
}

Write-Host "`nTest 4: Test with curl.exe"
Write-Host "====================================="

# Test 4: Using curl.exe
try {
    $curlOutput = & curl.exe -s -v $API_BASE_URL 2>&1
    Write-Host "Curl Output: $curlOutput"
    Write-Host "Test 4: SUCCESS"
}
catch {
    Write-Host "Test 4: FAILED"
    Write-Host "Error: $_"
}

Write-Host "`nAll tests completed." 