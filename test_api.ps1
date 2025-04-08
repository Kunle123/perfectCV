# PowerShell script to test API endpoints
$API_BASE_URL = "https://perfectcv-production.up.railway.app/api/v1"
$TOKEN = "" # Add your token here

# Function to test an API endpoint
function Test-Endpoint {
    param (
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Data = $null,
        [hashtable]$Headers = @{}
    )
    
    $url = "$API_BASE_URL/$Endpoint"
    $defaultHeaders = @{
        "Authorization" = "Bearer $TOKEN"
        "Origin" = "https://perfect-cv-snowy.vercel.app"
        "Content-Type" = "application/json"
    }
    
    # Merge headers
    $finalHeaders = @{}
    $defaultHeaders.GetEnumerator() | ForEach-Object { $finalHeaders[$_.Key] = $_.Value }
    $Headers.GetEnumerator() | ForEach-Object { $finalHeaders[$_.Key] = $_.Value }
    
    Write-Host "Testing $Method $url"
    Write-Host "Headers: $($finalHeaders | ConvertTo-Json)"
    
    if ($Data) {
        Write-Host "Data: $($Data | ConvertTo-Json)"
    }
    
    try {
        $body = $null
        if ($Data) {
            $body = $Data | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $finalHeaders -Body $body -ErrorAction Stop
        Write-Host "Response: $($response | ConvertTo-Json -Depth 10)"
        return $response
    }
    catch {
        Write-Host "Error: $_"
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        }
        catch {
            Write-Host "Could not read response body: $_"
        }
        
        throw $_
    }
}

# Test resume upload
function Test-ResumeUpload {
    param (
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "File not found: $FilePath"
        return
    }
    
    $fileName = Split-Path $FilePath -Leaf
    $fileContent = [System.IO.File]::ReadAllBytes($FilePath)
    $fileBase64 = [System.Convert]::ToBase64String($fileContent)
    
    $formData = @{
        file = $fileBase64
        title = $fileName -replace '\.[^/.]+$', ''
    }
    
    $headers = @{
        "Content-Type" = "multipart/form-data"
    }
    
    return Test-Endpoint -Endpoint "resumes/upload" -Method "POST" -Data $formData -Headers $headers
}

# Test optimization
function Test-Optimization {
    param (
        [int]$ResumeId,
        [int]$JobDescriptionId = 0
    )
    
    $data = @{
        resume_id = $ResumeId
        job_description_id = $JobDescriptionId
    }
    
    return Test-Endpoint -Endpoint "optimizations/optimize-resume" -Method "POST" -Data $data
}

# Main function to run tests
function Start-ApiTests {
    [CmdletBinding()]
    param()

    Write-Host "Starting API tests..."
    
    # Test registration
    $registrationResult = Test-Registration
    if ($registrationResult) {
        Write-Host "Registration successful!"
        
        # Wait a moment before testing login
        Start-Sleep -Seconds 1
        
        # Test login
        $loginResult = Test-Login
        if ($loginResult) {
            Write-Host "Login successful!"
        }
    }
    else {
        Write-Host "Registration failed. Please check the server logs for more details."
    }
}

# Run the tests
Start-ApiTests 