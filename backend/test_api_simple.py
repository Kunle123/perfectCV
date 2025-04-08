import requests
import json
from datetime import datetime

def print_divider():
    print("-" * 50)

def test_register():
    print_divider()
    print("Testing registration endpoint")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_divider()
    
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    data = {
        "email": "newuser@example.com",
        "password": "testpass123",
        "full_name": "New Test User"
    }
    
    try:
        print(f"POST {url}")
        print(f"Data: {json.dumps(data)}")
        response = requests.post(url, json=data, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Registration successful!")
            try:
                print(f"Response: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Registration failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print_divider()

if __name__ == "__main__":
    test_register() 