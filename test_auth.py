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
API_URL = "http://127.0.0.1:8080/api/v1"  # Updated to match Railway's port

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

def test_registration() -> Tuple[Optional[str], Optional[str]]:
    """Test user registration with a unique email."""
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
        
        response_data = handle_response(response, "registration")
        logger.info(f"Registration Response: {json.dumps(response_data)}")
        
        if response.status_code in [200, 201]:
            logger.info("Registration successful!")
            return test_email, test_password
        else:
            logger.error(f"Registration failed with status {response.status_code}")
            return None, None
    except requests.RequestException as e:
        logger.error(f"Network error during registration: {str(e)}")
        return None, None
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return None, None

def test_login(email: Optional[str], password: Optional[str]) -> Optional[str]:
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
        
        response_data = handle_response(response, "login")
        logger.info(f"Login Response: {json.dumps(response_data)}")
        
        if response.status_code == 200:
            access_token = response_data.get("access_token")
            if access_token:
                logger.info(f"\nToken received: {access_token[:20]}...")
                return access_token
            else:
                logger.error("No access token in response")
                return None
        else:
            logger.error(f"Login failed with status {response.status_code}")
            return None
    except requests.RequestException as e:
        logger.error(f"Network error during login: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return None

def test_protected_endpoint(access_token: Optional[str]) -> None:
    """Test accessing a protected endpoint with the access token."""
    if not access_token:
        logger.error("Cannot test protected endpoint: No access token provided")
        return
        
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    me_url = f"{API_URL}/users/me"
    logger.info("\nTesting Protected Endpoint...")
    
    try:
        response = requests.get(me_url, headers=headers)
        logger.info(f"Protected Endpoint Status: {response.status_code}")
        
        response_data = handle_response(response, "protected endpoint")
        logger.info(f"Protected Endpoint Response: {json.dumps(response_data)}")
        
        if response.status_code != 200:
            logger.error("Failed to access protected endpoint!")
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
            logger.info("Successfully accessed protected endpoint!")
            logger.info(f"User data: {json.dumps(response_data, indent=2)}")
    except requests.RequestException as e:
        logger.error(f"Network error accessing protected endpoint: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error accessing protected endpoint: {str(e)}")

def main() -> None:
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