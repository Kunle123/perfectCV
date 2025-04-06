# Function to test an endpoint and print response details
function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = ""
    )
    
    Write-Host "`nTesting $Method $Url"
    Write-Host "Headers: $($Headers | ConvertTo-Json)"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        
        Write-Host "Status Code: $($response.StatusCode)"
        Write-Host "Response Headers:"
        $response.Headers | ForEach-Object {
            Write-Host "  $_ : $($response.Headers[$_])"
        }
        
        Write-Host "Response Body: $($response.Content)"
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
            Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
        }
    }
}

# Test the simple endpoint
$headers = @{
    "Origin" = "https://perfect-cv-snowy.vercel.app"
}
Test-Endpoint -Url "https://perfectcv-production.up.railway.app/test-cors" -Headers $headers

# Test the OPTIONS request for resume upload
$headers = @{
    "Origin" = "https://perfect-cv-snowy.vercel.app"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "Content-Type, Authorization"
}
Test-Endpoint -Url "https://perfectcv-production.up.railway.app/api/v1/resumes/upload" -Method "OPTIONS" -Headers $headers

# Test the POST request for resume upload (this will fail auth, but we just want to test CORS)
$headers = @{
    "Origin" = "https://perfect-cv-snowy.vercel.app"
    "Authorization" = "Bearer test-token"
}
Test-Endpoint -Url "https://perfectcv-production.up.railway.app/api/v1/resumes/upload" -Method "POST" -Headers $headers -Body "test" 