from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.user import User
from app.services.jd_analyzer import analyze_job_description

router = APIRouter()

@router.post("/", response_model=schemas.JobDescription)
def create_job_description(
    *,
    db: Session = Depends(deps.get_db),
    jd_in: schemas.JobDescriptionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new job description.
    """
    jd = crud.job_description.create(db=db, obj_in=jd_in)
    return jd

@router.get("/", response_model=List[schemas.JobDescription])
def read_job_descriptions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve job descriptions.
    """
    jds = crud.job_description.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return jds

@router.get("/{jd_id}", response_model=schemas.JobDescription)
def read_job_description(
    *,
    db: Session = Depends(deps.get_db),
    jd_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get job description by ID.
    """
    jd = crud.job_description.get(db=db, id=jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    if jd.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return jd

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_jd(
    *,
    db: Session = Depends(deps.get_db),
    jd_text: str = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Analyze job description text and extract key information.
    """
    # Check if user has enough credits
    if current_user.credits < 1:
        raise HTTPException(
            status_code=402,
            detail="Insufficient credits. Please purchase more credits to continue."
        )
    
    # Analyze the job description
    analysis_result = await analyze_job_description(jd_text)
    
    # Deduct credits
    current_user.credits -= 1
    db.commit()
    
    return analysis_result

@router.delete("/{jd_id}", response_model=schemas.JobDescription)
def delete_job_description(
    *,
    db: Session = Depends(deps.get_db),
    jd_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete job description.
    """
    jd = crud.job_description.get(db=db, id=jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    if jd.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    jd = crud.job_description.remove(db=db, id=jd_id)
    return jd 