from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserInDB
from app.core.logging import logger

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: UserInDB = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    try:
        logger.debug(f"Retrieved current user: {current_user.email}")
        
        # Create User model from UserInDB
        user_dict = {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "is_active": current_user.is_active,
            "is_superuser": current_user.is_superuser,
            "credits": current_user.credits,
            "stripe_customer_id": current_user.stripe_customer_id
        }
        logger.debug(f"User data: {user_dict}")
        
        # Return the User model directly since the response_model will handle the conversion
        return schemas.User(**user_dict)
            
    except Exception as e:
        logger.error(f"Error retrieving user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user data"
        )

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    password: str = Body(None),
    full_name: str = Body(None),
    email: EmailStr = Body(None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    try:
        current_user_data = jsonable_encoder(current_user)
        user_in = schemas.UserUpdate(**current_user_data)
        
        if password is not None:
            user_in.password = password
        if full_name is not None:
            user_in.full_name = full_name
        if email is not None:
            user_in.email = email
            
        user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
        return user
    except ValidationError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Data validation error", "errors": ve.errors()},
        )
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user data"
        )

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get(db, id=user_id)
    if user == current_user:
        return user
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return user

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users.
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users

@router.get("/credits", response_model=float)
def get_user_credits(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's credits.
    """
    return current_user.credits

@router.post("/credits/purchase", response_model=schemas.User)
async def purchase_credits(
    *,
    db: Session = Depends(deps.get_db),
    amount: float = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Purchase credits for the current user.
    """
    # TODO: Implement Stripe payment integration
    current_user.credits += amount
    db.commit()
    db.refresh(current_user)
    return current_user 