"""
Test script for the simplified server
"""
import requests
import json
import sys

def test_server_alive():
    try:
        print("Testing if server is alive...")
        response = requests.get('http://127.0.0.1:8888/', timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_create_user():
    try:
        print("\nTesting user creation...")
        data = {
            "email": "test@example.com",
            "name": "Test User"
        }
        response = requests.post('http://127.0.0.1:8888/api/users', json=data, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_users():
    try:
        print("\nTesting get users...")
        response = requests.get('http://127.0.0.1:8888/api/users', timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing simplified server...")
    if not test_server_alive():
        print("Server is not responding correctly.")
        sys.exit(1)
    
    print("Server is responding correctly.")
    
    # Test user endpoints
    test_create_user()
    test_get_users() 