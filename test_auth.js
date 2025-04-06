const https = require('https');

const API_BASE_URL = 'https://perfectcv-production.up.railway.app/api/v1';
const TOKEN = ''; // Add your token here

// Function to make an authenticated request
function makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Function to test authentication endpoints
function testAuthEndpoints() {
  console.log('Testing authentication endpoints...');
  console.log('==================================');
  
  // Test /auth/login (POST)
  console.log('\nTesting /auth/login (POST)...');
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  makeAuthenticatedRequest('/auth/login', 'POST', loginData)
    .then(result => {
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Status Message: ${result.statusMessage}`);
      console.log('Headers:', JSON.stringify(result.headers, null, 2));
      console.log('Response:', result.data);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ Login successful!');
        try {
          const responseData = JSON.parse(result.data);
          if (responseData.token || responseData.access_token) {
            console.log('Token found in response!');
            console.log('Token:', responseData.token || responseData.access_token);
          }
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
      } else {
        console.log('❌ Login failed');
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
  
  // Test /auth/register (POST)
  console.log('\nTesting /auth/register (POST)...');
  const registerData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };
  
  makeAuthenticatedRequest('/auth/register', 'POST', registerData)
    .then(result => {
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Status Message: ${result.statusMessage}`);
      console.log('Headers:', JSON.stringify(result.headers, null, 2));
      console.log('Response:', result.data);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed');
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
}

// Function to test authenticated endpoints
function testAuthenticatedEndpoints() {
  console.log('\nTesting authenticated endpoints...');
  console.log('==================================');
  
  // Test /resumes/upload
  console.log('\nTesting /resumes/upload...');
  makeAuthenticatedRequest('/resumes/upload')
    .then(result => {
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Status Message: ${result.statusMessage}`);
      console.log('Headers:', JSON.stringify(result.headers, null, 2));
      console.log('Response:', result.data);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ /resumes/upload successful!');
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.log('❌ Authentication required for /resumes/upload');
      } else {
        console.log('❌ /resumes/upload failed');
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
  
  // Test /optimizations/optimize-resume
  console.log('\nTesting /optimizations/optimize-resume...');
  makeAuthenticatedRequest('/optimizations/optimize-resume')
    .then(result => {
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Status Message: ${result.statusMessage}`);
      console.log('Headers:', JSON.stringify(result.headers, null, 2));
      console.log('Response:', result.data);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ /optimizations/optimize-resume successful!');
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.log('❌ Authentication required for /optimizations/optimize-resume');
      } else {
        console.log('❌ /optimizations/optimize-resume failed');
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
  
  // Test /users/profile
  console.log('\nTesting /users/profile...');
  makeAuthenticatedRequest('/users/profile')
    .then(result => {
      console.log(`Status Code: ${result.statusCode}`);
      console.log(`Status Message: ${result.statusMessage}`);
      console.log('Headers:', JSON.stringify(result.headers, null, 2));
      console.log('Response:', result.data);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log('✅ /users/profile successful!');
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        console.log('❌ Authentication required for /users/profile');
      } else {
        console.log('❌ /users/profile failed');
      }
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
}

// Main function
async function main() {
  console.log('API Authentication Test');
  console.log('======================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Token: ${TOKEN ? 'Provided' : 'Not provided'}`);
  console.log('');
  
  // Test auth endpoints
  testAuthEndpoints();
  
  // If token is provided, test authenticated endpoints
  if (TOKEN) {
    testAuthenticatedEndpoints();
  } else {
    console.log('\nSkipping authenticated endpoint tests because no token is provided.');
    console.log('Edit the TOKEN variable in this script to provide a token.');
  }
}

// Run the main function
main(); 