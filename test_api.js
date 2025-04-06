// Simple test script for API endpoints
const API_BASE_URL = 'https://perfectcv-production.up.railway.app/api/v1';
const TOKEN = ''; // Add your token here

// Function to test an API endpoint
async function testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
  const url = `${API_BASE_URL}/${endpoint}`;
  const defaultHeaders = {
    'Authorization': `Bearer ${TOKEN}`,
    'Origin': 'https://perfect-cv-snowy.vercel.app',
    'Content-Type': 'application/json'
  };

  // Merge headers
  const finalHeaders = { ...defaultHeaders, ...headers };
  
  // Remove Content-Type if it's FormData
  if (data instanceof FormData) {
    delete finalHeaders['Content-Type'];
  }

  console.log(`Testing ${method} ${url}`);
  console.log('Headers:', finalHeaders);
  
  if (data instanceof FormData) {
    console.log('FormData contents:', Array.from(data.entries()));
  } else {
    console.log('Data:', data);
  }

  try {
    const options = {
      method,
      headers: finalHeaders,
      credentials: 'include'
    };

    if (data) {
      if (data instanceof FormData) {
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);
    console.log('Status:', response.status);
    console.log('Response Headers:', Object.fromEntries([...response.headers]));
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Response Body:', jsonData);
      return jsonData;
    } else {
      const textData = await response.text();
      console.log('Response Body (text):', textData);
      return textData;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Test resume upload
async function testResumeUpload() {
  // Create a FormData object
  const formData = new FormData();
  
  // Add a file to the FormData
  // Note: In a browser environment, you would get this from a file input
  // For this test script, we'll simulate it with a text file
  const fileContent = 'This is a test resume content';
  const file = new Blob([fileContent], { type: 'application/pdf' });
  formData.append('file', file, 'test_resume.pdf');
  formData.append('title', 'Test Resume');
  
  // Test the upload endpoint
  return await testEndpoint('resumes/upload', 'POST', formData);
}

// Test optimization
async function testOptimization(resumeId) {
  return await testEndpoint('optimizations/optimize-resume', 'POST', {
    resume_id: resumeId,
    job_description_id: 0
  });
}

// Main function to run tests
async function runTests() {
  try {
    console.log('Testing Resume Upload API');
    console.log('=========================');
    
    // Test resume upload
    const uploadResult = await testResumeUpload();
    console.log('Upload Result:', uploadResult);
    
    // If upload was successful, test optimization
    if (uploadResult && uploadResult.id) {
      console.log('\nTesting Optimization API');
      console.log('=========================');
      
      const optimizationResult = await testOptimization(uploadResult.id);
      console.log('Optimization Result:', optimizationResult);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests(); 