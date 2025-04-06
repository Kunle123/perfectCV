from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.core.security import verify_password
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import UserInDB
from app.core.logging import logger

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.error("No user_id found in token payload")
            raise credentials_exception
        logger.info(f"Decoded user_id from token: {user_id}")
    except (JWTError, ValidationError) as e:
        logger.error(f"Token validation error: {str(e)}")
        raise credentials_exception
    
    try:
        # Using SQLAlchemy 2.0 style query
        stmt = select(User).where(User.id == user_id)
        result = db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.error(f"User with ID {user_id} not found in the database.")
            raise credentials_exception
            
        # Convert to Pydantic model for validation
        try:
            user_data = {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_superuser": user.is_superuser,
                "credits": user.credits,
                "stripe_customer_id": user.stripe_customer_id,
                "hashed_password": user.hashed_password  # Required for UserInDB
            }
            user_in_db = UserInDB(**user_data)
            logger.info(f"User validated: {user.email}")
            return user_in_db  # Return the validated Pydantic model
        except ValidationError as e:
            logger.error(f"User data validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid user data format"
            )
    except Exception as e:
        logger.error(f"Database error while fetching user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error accessing user data"
        )

def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user),
) -> UserInDB:
    if not current_user.is_active:
        logger.warning(f"Inactive user attempted access: {current_user.email}")
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 