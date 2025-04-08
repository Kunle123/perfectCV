# PowerShell script to test API endpoints using a different approach
$BASE_URL = "http://127.0.0.1:8000/api/v1"

# Test data
$TEST_USER = @{
    email = "test@example.com"
    password = ConvertTo-SecureString "testpass123" -AsPlainText -Force
    full_name = "Test User"
}

function Test-Registration {
    param (
        [Parameter(Mandatory=$false)]
        [hashtable]$UserData = $TEST_USER
    )
    
    Write-Host "`nTesting registration endpoint..."
    $uri = "$BASE_URL/auth/register"
    
    try {
        # Convert SecureString to plain text for API call
        $requestData = @{
            email = $UserData.email
            password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($UserData.password)
            )
            full_name = $UserData.full_name
        }
        
        $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body ($requestData | ConvertTo-Json)
        Write-Host "Registration successful!"
        Write-Host ($response | ConvertTo-Json)
        return $response
    }
    catch {
        Write-Host "Registration failed: $_"
        return $null
    }
}

function Test-Login {
    param (
        [Parameter(Mandatory=$false)]
        [string]$Email = $TEST_USER.email,
        [Parameter(Mandatory=$false)]
        [System.Security.SecureString]$Password = $TEST_USER.password
    )
    
    Write-Host "`nTesting login endpoint..."
    $uri = "$BASE_URL/auth/login"
    
    try {
        # Convert SecureString to plain text for API call
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
        )
        
        $body = @{
            username = $Email  # FastAPI OAuth2 uses username for email
            password = $plainPassword
        }
        
        $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
        Write-Host "Login successful!"
        Write-Host ($response | ConvertTo-Json)
        return $response
    }
    catch {
        Write-Host "Login failed: $_"
        return $null
    }
}

# Run the tests
Write-Host "Starting API tests..."
$registrationResult = Test-Registration
if ($registrationResult) {
    Start-Sleep -Seconds 1  # Wait a moment before testing login
    $loginResult = Test-Login
    if ($loginResult) {
        Write-Host "`nAll tests completed successfully!"
        Write-Host "User ID: $($loginResult.id)"
        Write-Host "Access Token: $($loginResult.access_token)"
        return $loginResult  # Return the login result for potential further use
    } else {
        Write-Host "`nLogin test failed!"
        return $null
    }
} else {
    Write-Host "`nRegistration test failed!"
    return $null
}
Write-Host "`nTests completed." 