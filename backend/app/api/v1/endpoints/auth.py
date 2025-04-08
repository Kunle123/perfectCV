from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.user import User
from pydantic import BaseModel
import logging

from app import crud
from app.schemas.user import UserCreate, UserWithToken, Token, User as UserSchema
from app.api import deps
from app.core import security
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user and return access token and user details.
    """
    try:
        logger.info(f"Registration attempt for email: {user_in.email}")
        
        # Check if user already exists
        user = crud.user.get_by_email(db, email=user_in.email)
        if user:
            logger.warning(f"Registration failed: Email already registered: {user_in.email}")
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        
        # Create the user
        logger.info(f"Creating new user with email: {user_in.email}")
        user = crud.user.create(db, obj_in=user_in)
        logger.info(f"User created successfully with ID: {user.id}")
        
        # Create access token for the new user
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
        logger.info(f"Access token created for user ID: {user.id}")
        
        # Return both user details and token
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "credits": user.credits,
            "access_token": access_token,
            "token_type": "bearer",
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions as they already have the correct status code
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration",
        )

@router.get("/me", response_model=UserSchema)
def read_current_user(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    try:
        # Transform SQLAlchemy model to dict
        user_dict = {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_active": current_user.is_active,
            "is_superuser": current_user.is_superuser,
            "credits": current_user.credits,
            "stripe_customer_id": current_user.stripe_customer_id
        }
        
        # Create and return Pydantic model
        return UserSchema(**user_dict)
    except Exception as e:
        logger.error(f"Error retrieving current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the current user.",
        )
