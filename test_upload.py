import requests
import os
import json
import time

# Configuration
API_URL = "https://perfectcv-production.up.railway.app/api/v1"
TOKEN = "YOUR_TOKEN_HERE"  # Replace with your actual token
TEST_FILE_PATH = "test_resume.pdf"  # Replace with path to a test resume file

def test_endpoint(url, method='GET', headers=None, data=None, files=None):
    """Test an API endpoint and print detailed information about the request and response."""
    print(f"\nTesting {method} {url}")
    print("Headers:", json.dumps(headers, indent=2))
    
    if data and not files:
        print("Data:", json.dumps(data, indent=2))
    elif files:
        print("Files:", {k: v for k, v in files.items()})
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, data=data, files=files)
        elif method == 'POST':
            response = requests.post(url, headers=headers, data=data, files=files)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, data=data, files=files)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, data=data, files=files)
        elif method == 'OPTIONS':
            response = requests.options(url, headers=headers, data=data, files=files)
        else:
            print(f"Unsupported method: {method}")
            return
        
        print(f"Status Code: {response.status_code}")
        print("Response Headers:", json.dumps(dict(response.headers), indent=2))
        
        try:
            print("Response Body:", json.dumps(response.json(), indent=2))
        except:
            print("Response Body (text):", response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

# Test the resume upload endpoint
def test_resume_upload():
    # First test OPTIONS request
    headers = {
        'Origin': 'https://perfect-cv-snowy.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
    test_endpoint(f"{API_URL}/resumes/upload", 'OPTIONS', headers)
    
    # Then test POST request with file
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Origin': 'https://perfect-cv-snowy.vercel.app'
    }
    
    # Check if test file exists
    if not os.path.exists(TEST_FILE_PATH):
        print(f"Test file not found: {TEST_FILE_PATH}")
        return
    
    files = {
        'file': ('test_resume.pdf', open(TEST_FILE_PATH, 'rb'), 'application/pdf')
    }
    data = {
        'title': 'Test Resume'
    }
    
    test_endpoint(f"{API_URL}/resumes/upload", 'POST', headers, data, files)

# Test the optimization endpoint
def test_optimization(resume_id):
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json',
        'Origin': 'https://perfect-cv-snowy.vercel.app'
    }
    
    data = {
        'resume_id': resume_id,
        'job_description_id': 0
    }
    
    test_endpoint(f"{API_URL}/optimizations/optimize-resume", 'POST', headers, data)

if __name__ == "__main__":
    print("Testing Resume Upload API")
    print("=========================")
    
    # Test resume upload
    test_resume_upload()
    
    # If you have a resume ID, you can test optimization
    # test_optimization(123)  # Replace with actual resume ID 