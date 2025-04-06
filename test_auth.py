import requests
import json
import logging
import time
import sys
import jwt  # Add this import for JWT decoding
from datetime import datetime

# Configure logging to write to a file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("test_auth_output.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# API Configuration
API_URL = "https://perfectcv-production.up.railway.app/api/v1"

def explore_api():
    """Explore the API to get information about available endpoints"""
    logger.info("\nExploring API...")
    response = requests.get(API_URL)
    logger.info(f"API Root Response Status: {response.status_code}")
    logger.info(f"API Root Response: {response.text}")

def test_registration():
    """Test user registration with a unique email."""
    # Generate a unique email using timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "Test123!@#"
    
    register_url = f"{API_URL}/auth/register"
    register_data = {
        "email": test_email,
        "password": test_password,
        "full_name": "Test User"
    }
    
    logger.info(f"\nTesting Registration with email: {test_email}")
    try:
        response = requests.post(register_url, json=register_data)
        logger.info(f"Registration Response Status: {response.status_code}")
        logger.info(f"Registration Response: {response.text}")
        
        if response.status_code in [200, 201]:  # Accept both 200 and 201 as success
            logger.info("Registration successful!")
            return test_email, test_password
        else:
            logger.error("Registration failed!")
            return None, None
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        return None, None

def test_login(email, password):
    """Test login with the provided credentials."""
    if not email or not password:
        logger.error("Cannot test login: No valid credentials provided")
        return None
        
    login_url = f"{API_URL}/auth/login"
    login_data = {
        "username": email,
        "password": password
    }
    
    logger.info("\nTesting Login Process...")
    logger.info(f"Attempting login with email: {email}")
    
    try:
        response = requests.post(login_url, data=login_data)
        logger.info(f"Login Response Status: {response.status_code}")
        logger.info(f"Login Response: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            logger.info(f"\nToken received: {access_token[:20]}...")
            return access_token
        else:
            logger.error("Login failed!")
            return None
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return None

def test_protected_endpoint(access_token):
    """Test accessing a protected endpoint with the access token."""
    if not access_token:
        logger.error("Cannot test protected endpoint: No access token provided")
        return
        
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    me_url = f"{API_URL}/users/me"
    logger.info("\nTesting Protected Endpoint...")
    
    try:
        response = requests.get(me_url, headers=headers)
        logger.info(f"Protected Endpoint Status: {response.status_code}")
        logger.info(f"Protected Endpoint Response: {response.text}")
        
        if response.status_code == 200:
            logger.info("Successfully accessed protected endpoint!")
        else:
            logger.error("Failed to access protected endpoint!")
    except Exception as e:
        logger.error(f"Error accessing protected endpoint: {str(e)}")

def main():
    """Main test function."""
    logger.info("\nStarting fresh user test...")
    
    # Test registration with new user
    email, password = test_registration()
    
    if email and password:
        # Test login with new user
        access_token = test_login(email, password)
        
        if access_token:
            # Test protected endpoint
            test_protected_endpoint(access_token)
    
    logger.info("\nTest completed.")

if __name__ == "__main__":
    main() 