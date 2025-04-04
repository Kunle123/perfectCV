from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.user import User
from app.services.resume_parser import parse_resume_file

router = APIRouter()

@router.get("/", response_model=List[schemas.Resume])
def read_resumes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resumes.
    """
    resumes = crud.resume.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return resumes

@router.post("/", response_model=schemas.Resume)
def create_resume(
    *,
    db: Session = Depends(deps.get_db),
    resume_in: schemas.ResumeCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new resume.
    """
    resume = crud.resume.create_with_user(
        db=db, obj_in=resume_in, user_id=current_user.id
    )
    return resume

@router.put("/{id}", response_model=schemas.Resume)
def update_resume(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    resume_in: schemas.ResumeUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a resume.
    """
    resume = crud.resume.get(db=db, id=id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not crud.user.is_superuser(current_user) and (resume.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    resume = crud.resume.update(db=db, db_obj=resume, obj_in=resume_in)
    return resume

@router.get("/{id}", response_model=schemas.Resume)
def read_resume(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get resume by ID.
    """
    resume = crud.resume.get(db=db, id=id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not crud.user.is_superuser(current_user) and (resume.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return resume

@router.delete("/{id}", response_model=schemas.Resume)
def delete_resume(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete resume.
    """
    resume = crud.resume.get(db=db, id=id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not crud.user.is_superuser(current_user) and (resume.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    resume = crud.resume.remove(db=db, id=id)
    return resume

@router.post("/upload", response_model=schemas.Resume)
async def upload_resume(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload and parse a resume file.
    """
    # Parse the resume file
    resume_data = await parse_resume_file(file)
    
    # Create resume object
    resume_in = schemas.ResumeCreate(
        title=file.filename,
        content=resume_data.get("content", ""),
        original_file_path=file.filename,
        user_id=current_user.id
    )
    
    # Save to database
    resume = crud.resume.create_with_user(
        db=db, obj_in=resume_in, user_id=current_user.id
    )
    
    return resume 