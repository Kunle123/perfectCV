import requests
import json

def test_register():
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    data = {
        "email": "newuser@example.com",
        "password": "testpass123",
        "full_name": "New Test User"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register() 