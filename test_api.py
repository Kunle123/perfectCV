import requests
import json
from datetime import datetime

def test_api():
    base_url = "http://localhost:8080/api/v1"
    
    # Test registration
    print("\nTesting registration...")
    register_data = {
        "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    try:
        response = requests.post(
            f"{base_url}/auth/register",
            json=register_data
        )
        print(f"Registration status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("Registration successful!")
            user_data = response.json()
            
            # Test login
            print("\nTesting login...")
            login_data = {
                "username": register_data["email"],
                "password": register_data["password"]
            }
            
            response = requests.post(
                f"{base_url}/auth/login",
                data=login_data
            )
            print(f"Login status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("Login successful!")
                token_data = response.json()
                
                # Test /me endpoint
                print("\nTesting /me endpoint...")
                headers = {"Authorization": f"Bearer {token_data['access_token']}"}
                response = requests.get(f"{base_url}/auth/me", headers=headers)
                print(f"Me endpoint status: {response.status_code}")
                print(f"Response: {response.text}")
                
                if response.status_code == 200:
                    print("Me endpoint test successful!")
                else:
                    print("Me endpoint test failed!")
            else:
                print("Login failed!")
        else:
            print("Registration failed!")
            
    except requests.exceptions.RequestException as e:
        print(f"Network error: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_api() 