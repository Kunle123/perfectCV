from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user = crud.user.update(db, db_obj=current_user, obj_in=user_in)
    return user

@router.get("/credits", response_model=float)
def get_user_credits(
    current_user: models.User = Depends(deps.get_current_active_user),
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
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Purchase credits for the current user.
    """
    # TODO: Implement Stripe payment integration
    current_user.credits += amount
    db.commit()
    db.refresh(current_user)
    return current_user 