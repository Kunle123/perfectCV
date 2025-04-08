"""
Simple test for the Flask authentication server
"""
import requests
import json

def test_register():
    print("\n===== Testing Registration =====")
    url = "http://127.0.0.1:5000/api/v1/auth/register"
    data = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    
    try:
        print(f"POST {url}")
        print(f"Data: {json.dumps(data)}")
        
        response = requests.post(url, json=data, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Registration successful")
            return response.json()
        else:
            print("❌ Registration failed")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
        
def test_login(email="test@example.com", password="password123"):
    print("\n===== Testing Login =====")
    url = "http://127.0.0.1:5000/api/v1/auth/login"
    data = {
        "username": email,  # Flask server follows FastAPI convention
        "password": password
    }
    
    try:
        print(f"POST {url}")
        print(f"Data: {json.dumps(data)}")
        
        response = requests.post(url, json=data, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Login successful")
            return response.json()
        else:
            print("❌ Login failed")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("Simple Authentication Test")
    
    user = test_register()
    if user:
        test_login()
    
    print("\nTest completed.") 