<?php
// Function to test an endpoint and print response details
function testEndpoint($url, $method = 'GET', $headers = [], $body = '') {
    echo "\nTesting $method $url\n";
    echo "Headers: " . json_encode($headers, JSON_PRETTY_PRINT) . "\n";
    
    // Initialize cURL session
    $ch = curl_init();
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    // Add headers
    $headerArray = [];
    foreach ($headers as $key => $value) {
        $headerArray[] = "$key: $value";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headerArray);
    
    // Add body for POST requests
    if ($method === 'POST' && !empty($body)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Execute the request
    $response = curl_exec($ch);
    
    // Get response info
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    // Split response into headers and body
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    
    // Print response details
    echo "Status Code: $httpCode\n";
    echo "Response Headers:\n$responseHeaders\n";
    echo "Response Body: $responseBody\n";
    
    // Check for errors
    if (curl_errno($ch)) {
        echo "Error: " . curl_error($ch) . "\n";
    }
    
    // Close cURL session
    curl_close($ch);
}

// Test the simple endpoint
$headers = [
    'Origin' => 'https://perfect-cv-snowy.vercel.app'
];
testEndpoint('https://perfectcv-production.up.railway.app/test-cors', 'GET', $headers);

// Test the OPTIONS request for resume upload
$headers = [
    'Origin' => 'https://perfect-cv-snowy.vercel.app',
    'Access-Control-Request-Method' => 'POST',
    'Access-Control-Request-Headers' => 'Content-Type, Authorization'
];
testEndpoint('https://perfectcv-production.up.railway.app/api/v1/resumes/upload', 'OPTIONS', $headers);

// Test the POST request for resume upload (this will fail auth, but we just want to test CORS)
$headers = [
    'Origin' => 'https://perfect-cv-snowy.vercel.app',
    'Authorization' => 'Bearer test-token'
];
testEndpoint('https://perfectcv-production.up.railway.app/api/v1/resumes/upload', 'POST', $headers, 'test'); 