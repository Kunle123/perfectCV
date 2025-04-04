from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.user import User
from app.services.resume_optimizer import optimize_resume

router = APIRouter()

@router.post("/optimize-resume", response_model=Dict[str, Any])
async def optimize_resume_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    resume_text: str = Body(...),
    job_description: str = Body(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Optimize a resume given its text and job description.
    """
    # Check if user has enough credits
    if current_user.credits < 1:
        raise HTTPException(
            status_code=402,
            detail="Insufficient credits. Please purchase more credits to continue."
        )
    
    # Optimize resume
    optimization_result = await optimize_resume(resume_text, job_description)
    
    # Create optimization record
    optimization = crud.optimization.create(
        db=db,
        obj_in=schemas.OptimizationCreate(
            resume_id=None,
            job_description_id=None,
            result=optimization_result,
            status="completed"
        )
    )
    
    # Deduct credits
    current_user.credits -= 1
    db.commit()
    
    return optimization_result

@router.get("/", response_model=List[schemas.Optimization])
def read_optimizations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
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
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get optimization by ID.
    """
    optimization = crud.optimization.get(db=db, id=optimization_id)
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    if optimization.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return optimization

@router.delete("/{optimization_id}", response_model=schemas.Optimization)
def delete_optimization(
    *,
    db: Session = Depends(deps.get_db),
    optimization_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete optimization.
    """
    optimization = crud.optimization.get(db=db, id=optimization_id)
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    if optimization.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    optimization = crud.optimization.remove(db=db, id=optimization_id)
    return optimization

@router.post("/export/{optimization_id}")
async def export_optimization(
    *,
    db: Session = Depends(deps.get_db),
    optimization_id: int,
    format: str = Body("pdf"),
    current_user: User = Depends(deps.get_current_active_user),
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