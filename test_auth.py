import requests
import json
import logging
import time
import sys
import jwt
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

# Configure logging
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
BASE_URL = "http://localhost:8080/api/v1"

def handle_response(response: requests.Response, operation: str) -> Dict[str, Any]:
    """Handle API response and extract relevant information."""
    try:
        if response.headers.get("content-type", "").startswith("application/json"):
            return response.json()
        return {"text": response.text}
    except json.JSONDecodeError:
        logger.error(f"Failed to decode JSON response for {operation}")
        return {"text": response.text}
    except Exception as e:
        logger.error(f"Error handling response for {operation}: {str(e)}")
        return {"error": str(e)}

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
                "full_name": "Test User"
            }
        )
        logger.info(f"Registration Response Status: {response.status_code}")
        
        response_data = handle_response(response, "registration")
        logger.info(f"Registration Response: {json.dumps(response_data)}")
        
        if response.status_code == 200:
            logger.info("Registration successful!")
            return response_data
        else:
            logger.error(f"Registration failed with status {response.status_code}")
            return None
    except requests.RequestException as e:
        logger.error(f"Network error during registration: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return None

def test_login(email: Optional[str], password: Optional[str]) -> Optional[Dict[str, Any]]:
    """Test login endpoint."""
    if not email or not password:
        logger.error("Cannot test login: No valid credentials provided")
        return None
        
    logger.info("\nTesting Login Process...")
    logger.info(f"Attempting login with email: {email}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": email,
                "password": password
            }
        )
        logger.info(f"Login Response Status: {response.status_code}")
        
        response_data = handle_response(response, "login")
        logger.info(f"Login Response: {json.dumps(response_data)}")
        
        if response.status_code == 200:
            logger.info("Login successful!")
            return response_data
        else:
            logger.error(f"Login failed with status {response.status_code}")
            return None
    except requests.RequestException as e:
        logger.error(f"Network error during login: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return None

def test_me(access_token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Test /me endpoint."""
    if not access_token:
        logger.error("Cannot test /me endpoint: No access token provided")
        return None
        
    headers = {"Authorization": f"Bearer {access_token}"}
    logger.info("\nTesting /me Endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        logger.info(f"Me Endpoint Status: {response.status_code}")
        
        response_data = handle_response(response, "me endpoint")
        logger.info(f"Me Endpoint Response: {json.dumps(response_data)}")
        
        if response.status_code != 200:
            logger.error("Failed to access /me endpoint!")
            logger.error(f"Response headers: {dict(response.headers)}")
            
            # Try to decode the token to check its validity
            try:
                decoded_token = jwt.decode(access_token, options={"verify_signature": False})
                logger.info(f"Decoded token payload: {decoded_token}")
                if "exp" in decoded_token:
                    expiry = datetime.fromtimestamp(decoded_token["exp"])
                    logger.info(f"Token expiry: {expiry}")
            except jwt.InvalidTokenError as e:
                logger.error(f"Invalid token format: {str(e)}")
        else:
            logger.info("Successfully accessed /me endpoint!")
            logger.info(f"User data: {json.dumps(response_data, indent=2)}")
            return response_data
    except requests.RequestException as e:
        logger.error(f"Network error accessing /me endpoint: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error accessing /me endpoint: {str(e)}")
    return None

def main() -> None:
    """Main test function."""
    logger.info("\nStarting fresh user test...")
    
    # Test registration
    user_data = test_registration()
    if not user_data:
        logger.error("Registration failed, cannot proceed with tests")
        return
    
    # Test login
    login_data = test_login(user_data["email"], "testpassword123")
    if not login_data:
        logger.error("Login failed, cannot proceed with tests")
        return
    
    # Test /me endpoint
    me_data = test_me(login_data["access_token"])
    if not me_data:
        logger.error("Me endpoint test failed")
        return
    
    logger.info("\nAll tests completed successfully!")

if __name__ == "__main__":
    main() 