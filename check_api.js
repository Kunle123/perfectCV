const https = require('https');

const API_URL = 'https://perfectcv-production.up.railway.app/api/v1';

console.log(`Checking if API server is accessible: ${API_URL}`);

// Function to make a simple GET request to check if the API is accessible
function checkApiAccess() {
  return new Promise((resolve, reject) => {
    const req = https.get(API_URL, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Status Message: ${res.statusMessage}`);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:', data);
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

// Run the check
checkApiAccess()
  .then(result => {
    console.log('API check completed successfully');
    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log('✅ API server is accessible');
    } else {
      console.log('⚠️ API server returned a non-200 status code');
    }
  })
  .catch(error => {
    console.error('❌ API server is not accessible:', error.message);
  }); 