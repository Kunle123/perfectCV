const https = require('https');

const API_BASE_URL = 'https://perfectcv-production.up.railway.app/api/v1';
const TOKEN = ''; // Add your token here if needed

// Common API endpoints to test
const endpoints = [
  '', // Root endpoint
  '/resumes',
  '/resumes/upload',
  '/resumes/upload/',
  '/optimizations',
  '/optimizations/optimize-resume',
  '/optimizations/optimize-resume/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/users',
  '/users/profile',
  '/health',
  '/status'
];

// Function to make an HTTPS request
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Testing endpoint: ${url}`);
    
    const options = {
      headers: {
        'User-Agent': 'Node.js API Endpoint Tester'
      }
    };
    
    // Add authorization header if token is provided
    if (TOKEN) {
      options.headers['Authorization'] = `Bearer ${TOKEN}`;
    }
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          endpoint,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        endpoint,
        error: error.message
      });
    });
    
    req.end();
  });
}

// Main function to test all endpoints
async function testEndpoints() {
  console.log('Testing API endpoints...');
  console.log('========================');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint);
      results.push(result);
      
      console.log(`\nEndpoint: ${endpoint}`);
      console.log(`Status Code: ${result.statusCode}`);
      
      if (result.statusCode === 200) {
        console.log('✅ SUCCESS: This endpoint exists and is accessible!');
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.log('🔒 AUTHENTICATION REQUIRED: This endpoint exists but requires authentication.');
      } else if (result.statusCode === 404) {
        console.log('❌ NOT FOUND: This endpoint does not exist.');
      } else {
        console.log(`⚠️ OTHER STATUS: ${result.statusCode}`);
      }
      
      // Only show headers and data for successful responses or interesting errors
      if (result.statusCode === 200 || result.statusCode === 401 || result.statusCode === 403) {
        console.log('Headers:', JSON.stringify(result.headers, null, 2));
        console.log('Response:', result.data);
      }
    } catch (error) {
      results.push(error);
      console.log(`\nEndpoint: ${endpoint}`);
      console.log(`❌ ERROR: ${error.error}`);
    }
  }
  
  console.log('\nSummary:');
  console.log('========');
  
  const successfulEndpoints = results.filter(r => r.statusCode === 200).map(r => r.endpoint);
  const authRequiredEndpoints = results.filter(r => r.statusCode === 401 || r.statusCode === 403).map(r => r.endpoint);
  const notFoundEndpoints = results.filter(r => r.statusCode === 404).map(r => r.endpoint);
  const errorEndpoints = results.filter(r => r.error).map(r => r.endpoint);
  
  console.log(`✅ Successful endpoints (200): ${successfulEndpoints.length > 0 ? successfulEndpoints.join(', ') : 'None'}`);
  console.log(`🔒 Authentication required endpoints (401/403): ${authRequiredEndpoints.length > 0 ? authRequiredEndpoints.join(', ') : 'None'}`);
  console.log(`❌ Not found endpoints (404): ${notFoundEndpoints.length > 0 ? notFoundEndpoints.join(', ') : 'None'}`);
  console.log(`⚠️ Error endpoints: ${errorEndpoints.length > 0 ? errorEndpoints.join(', ') : 'None'}`);
  
  console.log('\nRecommendations:');
  console.log('================');
  
  if (successfulEndpoints.length > 0) {
    console.log('1. Use one of the successful endpoints for your API requests.');
  } else if (authRequiredEndpoints.length > 0) {
    console.log('1. The API requires authentication. Make sure to include a valid token in your requests.');
    console.log('2. Try one of these endpoints with authentication: ' + authRequiredEndpoints.join(', '));
  } else {
    console.log('1. None of the tested endpoints were successful. The API might have a different structure.');
    console.log('2. Check the API documentation for the correct endpoints.');
    console.log('3. The API might be down or not responding correctly.');
  }
}

// Run the tests
testEndpoints(); 