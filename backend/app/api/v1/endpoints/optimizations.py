from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.resume_optimizer import optimize_resume

router = APIRouter()

@router.post("/", response_model=schemas.Optimization)
async def create_optimization(
    *,
    db: Session = Depends(deps.get_db),
    optimization_in: schemas.OptimizationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new resume optimization.
    """
    # Check if user has enough credits
    if current_user.credits < 1:
        raise HTTPException(
            status_code=402,
            detail="Insufficient credits. Please purchase more credits to continue."
        )
    
    # Get resume and job description
    resume = crud.resume.get(db=db, id=optimization_in.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    jd = crud.job_description.get(db=db, id=optimization_in.job_description_id)
    if not jd or jd.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Optimize resume
    optimization_result = await optimize_resume(resume.content, jd.content)
    
    # Create optimization record
    optimization = crud.optimization.create(
        db=db,
        obj_in=schemas.OptimizationCreate(
            resume_id=optimization_in.resume_id,
            job_description_id=optimization_in.job_description_id,
            result=optimization_result,
            status="completed"
        )
    )
    
    # Deduct credits
    current_user.credits -= 1
    db.commit()
    
    return optimization

@router.get("/", response_model=List[schemas.Optimization])
def read_optimizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve optimizations.
    """
    optimizations = crud.optimization.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return optimizations

@router.get("/{optimization_id}", response_model=schemas.Optimization)
def read_optimization(
    *,
    db: Session = Depends(deps.get_db),
    optimization_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get optimization by ID.
    """
    optimization = crud.optimization.get(db=db, id=optimization_id)
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    if optimization.resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return optimization

@router.post("/export/{optimization_id}")
async def export_optimization(
    *,
    db: Session = Depends(deps.get_db),
    optimization_id: int,
    format: str = Body("pdf"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export optimized resume in specified format.
    """
    optimization = crud.optimization.get(db=db, id=optimization_id)
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    if optimization.resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # TODO: Implement export functionality
    # This should generate a PDF or DOCX file from the optimization result
    return {"message": f"Export in {format} format not yet implemented"} 