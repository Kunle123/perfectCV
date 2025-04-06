const https = require('https');
const http = require('http');
const dns = require('dns');
const { promisify } = require('util');
const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);

const API_URL = 'https://perfectcv-production.up.railway.app/api/v1';
const API_HOST = 'perfectcv-production.up.railway.app';

console.log('API Connection Diagnostic Tool');
console.log('==============================');
console.log(`Testing connection to: ${API_URL}`);
console.log('');

// Function to make an HTTPS request
function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Function to make an HTTP request
function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main diagnostic function
async function diagnoseApiConnection() {
  try {
    // Step 1: DNS Resolution
    console.log('Step 1: DNS Resolution');
    console.log('----------------------');
    try {
      const dnsResult = await dnsLookup(API_HOST);
      console.log(`DNS Lookup Result: ${JSON.stringify(dnsResult, null, 2)}`);
      
      const dnsResolveResult = await dnsResolve(API_HOST);
      console.log(`DNS Resolve Result: ${JSON.stringify(dnsResolveResult, null, 2)}`);
      console.log('DNS Resolution: SUCCESS');
    } catch (error) {
      console.log(`DNS Resolution: FAILED - ${error.message}`);
      console.log('This indicates a problem with DNS resolution. The domain might not exist or there might be network issues.');
    }
    
    console.log('');
    
    // Step 2: HTTPS Connection
    console.log('Step 2: HTTPS Connection');
    console.log('------------------------');
    try {
      const httpsResult = await makeHttpsRequest(API_URL, {
        headers: {
          'User-Agent': 'Node.js API Diagnostic Tool'
        }
      });
      console.log(`Status Code: ${httpsResult.statusCode}`);
      console.log(`Headers: ${JSON.stringify(httpsResult.headers, null, 2)}`);
      console.log(`Response Data: ${httpsResult.data.substring(0, 500)}${httpsResult.data.length > 500 ? '...' : ''}`);
      console.log('HTTPS Connection: SUCCESS');
    } catch (error) {
      console.log(`HTTPS Connection: FAILED - ${error.message}`);
      console.log('This could be due to:');
      console.log('1. The server is down or not responding');
      console.log('2. There is a network connectivity issue');
      console.log('3. There might be a firewall blocking the connection');
      console.log('4. There might be an SSL/TLS issue');
      
      // Try HTTP as fallback
      console.log('');
      console.log('Trying HTTP as fallback...');
      try {
        const httpUrl = API_URL.replace('https://', 'http://');
        const httpResult = await makeHttpRequest(httpUrl, {
          headers: {
            'User-Agent': 'Node.js API Diagnostic Tool'
          }
        });
        console.log(`HTTP Status Code: ${httpResult.statusCode}`);
        console.log(`HTTP Headers: ${JSON.stringify(httpResult.headers, null, 2)}`);
        console.log(`HTTP Response Data: ${httpResult.data.substring(0, 500)}${httpResult.data.length > 500 ? '...' : ''}`);
        console.log('HTTP Connection: SUCCESS (but the API might require HTTPS)');
      } catch (httpError) {
        console.log(`HTTP Connection: FAILED - ${httpError.message}`);
      }
    }
    
    console.log('');
    
    // Step 3: CORS Headers Check
    console.log('Step 3: CORS Headers Check');
    console.log('-------------------------');
    try {
      const corsResult = await makeHttpsRequest(API_URL, {
        method: 'OPTIONS',
        headers: {
          'User-Agent': 'Node.js API Diagnostic Tool',
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      console.log('CORS Headers:');
      corsHeaders.forEach(header => {
        if (corsResult.headers[header]) {
          console.log(`  ${header}: ${corsResult.headers[header]}`);
        } else {
          console.log(`  ${header}: Not present`);
        }
      });
      
      if (corsHeaders.some(header => corsResult.headers[header])) {
        console.log('CORS Headers: PRESENT');
      } else {
        console.log('CORS Headers: NOT PRESENT (This might cause issues with browser requests)');
      }
    } catch (error) {
      console.log(`CORS Headers Check: FAILED - ${error.message}`);
      console.log('This might indicate that the server does not support OPTIONS requests or CORS.');
    }
    
    console.log('');
    console.log('Diagnostic Summary:');
    console.log('------------------');
    console.log('1. If DNS Resolution failed: Check your internet connection and DNS settings.');
    console.log('2. If HTTPS Connection failed: The API server might be down or unreachable.');
    console.log('3. If CORS Headers are not present: The API might not allow requests from browsers.');
    console.log('4. If HTTP works but HTTPS doesn\'t: There might be an SSL/TLS issue.');
    
  } catch (error) {
    console.log(`Diagnostic Error: ${error.message}`);
  }
}

// Run the diagnostic
diagnoseApiConnection(); 