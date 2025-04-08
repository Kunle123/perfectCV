import requests
import json
import time
import sys
from typing import Dict, Any
from datetime import datetime, timedelta

def print_separator():
    print("\n" + "="*50 + "\n")

def print_response(response: requests.Response, test_name: str) -> None:
    """Print the response in a formatted way"""
    print(f"\n{test_name} Results:")
    print("-" * (len(test_name) + 9))
    print(f"Status Code: {response.status_code}")
    try:
        formatted_json = json.dumps(response.json(), indent=2)
        print(f"Response Data:\n{formatted_json}")
    except json.JSONDecodeError:
        print(f"Response Text: {response.text}")
    print_separator()

def test_register(email: str = "newuser@example.com", password: str = "testpass123", full_name: str = "New Test User") -> Dict[str, Any]:
    """Test the registration endpoint"""
    print("\nExecuting Registration Test...")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Testing with email: {email}")
    
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    data = {
        "email": email,
        "password": password,
        "full_name": full_name
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print_response(response, "Registration Test")
        if not response.ok:
            print(f"❌ Registration failed with status code: {response.status_code}")
            sys.exit(1)
        return response.json() if response.ok else None
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server. Make sure it's running on http://127.0.0.1:8000")
        print_separator()
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out. The server is taking too long to respond.")
        print_separator()
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print_separator()
        sys.exit(1)

def test_login(email: str = "newuser@example.com", password: str = "testpass123") -> Dict[str, Any]:
    """Test the login endpoint"""
    print("\nExecuting Login Test...")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Testing with email: {email}")
    
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    data = {
        "username": email,  # FastAPI OAuth2 uses 'username' for email
        "password": password
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        print_response(response, "Login Test")
        if not response.ok:
            print(f"❌ Login failed with status code: {response.status_code}")
            sys.exit(1)
        return response.json() if response.ok else None
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server. Make sure it's running on http://127.0.0.1:8000")
        print_separator()
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out. The server is taking too long to respond.")
        print_separator()
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print_separator()
        sys.exit(1)

def run_all_tests():
    print_separator()
    print("Starting API Tests")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_separator()

    # Set a timeout for the entire test suite
    start_time = datetime.now()
    timeout_minutes = 5
    timeout_datetime = start_time + timedelta(minutes=timeout_minutes)
    
    print(f"Test timeout set for: {timeout_datetime.strftime('%Y-%m-%d %H:%M:%S')} ({timeout_minutes} minutes)")
    print_separator()

    def check_timeout():
        if datetime.now() > timeout_datetime:
            print(f"❌ Tests timed out after {timeout_minutes} minutes!")
            print_separator()
            sys.exit(1)

    # Test registration
    check_timeout()
    registration_result = test_register()
    
    # Wait a moment before testing login
    time.sleep(1)
    
    # Test login with the same credentials
    check_timeout()
    login_result = test_login()
    
    print("✅ All tests passed successfully!")
    print("\nTest Summary:")
    print("-" * 12)
    print(f"User ID: {login_result.get('id')}")
    print(f"Email: {login_result.get('email')}")
    print(f"Access Token Available: {'access_token' in login_result}")
    
    print_separator()
    print("All tests completed!")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total execution time: {datetime.now() - start_time}")
    print_separator()

if __name__ == "__main__":
    run_all_tests() 