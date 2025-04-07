import requests
import json
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set environment variable for local SQLite database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Base URL for API
BASE_URL = "http://localhost:8080/api/v1"

def handle_response(response, operation: str) -> Dict[str, Any]:
    """Handle API response and return data."""
    try:
        return response.json()
    except json.JSONDecodeError:
        logger.error(f"{operation} response is not valid JSON: {response.text}")
        return {"error": "Invalid JSON response"}

def test_registration() -> Optional[Dict[str, Any]]:
    """Test user registration endpoint."""
    email = f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
    password = "testpassword123"
    
    logger.info(f"\nTesting Registration with email: {email}")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": email,
                "password": password,
                "full_name": "Test User",
                "is_active": True,
                "is_superuser": False,
                "credits": 0
            }
        )
        logger.info(f"Registration Response Status: {response.status_code}")
        
        response_data = handle_response(response, "registration")
        logger.info(f"Registration Response: {json.dumps(response_data, indent=2)}")
        
        if response.status_code == 200:
            logger.info("Registration successful!")
            return response_data
        else:
            logger.error(f"Registration failed with status {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        return None

def test_login(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Test login endpoint."""
    logger.info(f"\nTesting Login with email: {email}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": email,
                "password": password
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        logger.info(f"Login Response Status: {response.status_code}")
        
        response_data = handle_response(response, "login")
        logger.info(f"Login Response: {json.dumps(response_data, indent=2)}")
        
        if response.status_code == 200:
            logger.info("Login successful!")
            return response_data
        else:
            logger.error(f"Login failed with status {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return None

def test_me_endpoint(token: str) -> Optional[Dict[str, Any]]:
    """Test /me endpoint with token."""
    logger.info("\nTesting /me endpoint")
    
    try:
        response = requests.get(
            f"{BASE_URL}/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        logger.info(f"Me Endpoint Response Status: {response.status_code}")
        
        response_data = handle_response(response, "me endpoint")
        logger.info(f"Me Endpoint Response: {json.dumps(response_data, indent=2)}")
        
        if response.status_code == 200:
            logger.info("Me endpoint test successful!")
            return response_data
        else:
            logger.error(f"Me endpoint test failed with status {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error during me endpoint test: {str(e)}")
        return None

def test_invalid_login() -> None:
    """Test login with invalid credentials."""
    logger.info("\nTesting Invalid Login")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        logger.info(f"Invalid Login Response Status: {response.status_code}")
        
        if response.status_code == 401:
            logger.info("Invalid login test successful - got expected 401 response")
        else:
            logger.error(f"Invalid login test failed - got unexpected status {response.status_code}")
    except Exception as e:
        logger.error(f"Error during invalid login test: {str(e)}")

def main() -> None:
    """Main test function."""
    logger.info("\nStarting Authentication Database Tests...")
    
    # Test registration
    user_data = test_registration()
    if not user_data:
        logger.error("Registration failed, cannot proceed with tests")
        return
    
    # Test login with registered user
    login_data = test_login(user_data["email"], "testpassword123")
    if not login_data:
        logger.error("Login failed, cannot proceed with tests")
        return
    
    # Test /me endpoint with token
    me_data = test_me_endpoint(login_data["access_token"])
    if not me_data:
        logger.error("Me endpoint test failed")
        return
    
    # Test invalid login
    test_invalid_login()
    
    logger.info("\nAll authentication database tests completed!")

if __name__ == "__main__":
    main() 