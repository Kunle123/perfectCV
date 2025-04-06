import requests
import json

def test_endpoint(url, method='GET', headers=None, data=None):
    """Test an endpoint and print the response headers and status code."""
    print(f"\nTesting {method} {url}")
    print(f"Headers: {headers}")
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, data=data)
        elif method == 'OPTIONS':
            response = requests.options(url, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return
        
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        try:
            print(f"Response Body: {response.text}")
        except:
            print("Response Body: [Could not decode]")
            
    except Exception as e:
        print(f"Error: {str(e)}")

# Test the simple endpoint
test_endpoint(
    'https://perfectcv-production.up.railway.app/test-cors',
    headers={'Origin': 'https://perfect-cv-snowy.vercel.app'}
)

# Test the OPTIONS request for resume upload
test_endpoint(
    'https://perfectcv-production.up.railway.app/api/v1/resumes/upload',
    method='OPTIONS',
    headers={
        'Origin': 'https://perfect-cv-snowy.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
)

# Test the POST request for resume upload (this will fail auth, but we just want to test CORS)
test_endpoint(
    'https://perfectcv-production.up.railway.app/api/v1/resumes/upload',
    method='POST',
    headers={
        'Origin': 'https://perfect-cv-snowy.vercel.app',
        'Authorization': 'Bearer test-token'
    },
    data={'file': 'test.pdf'}
) 