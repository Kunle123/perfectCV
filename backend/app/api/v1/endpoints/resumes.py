from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.resume_parser import parse_resume_file

router = APIRouter()

@router.post("/", response_model=schemas.Resume)
def create_resume(
    *,
    db: Session = Depends(deps.get_db),
    resume_in: schemas.ResumeCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new resume.
    """
    resume = crud.resume.create(db=db, obj_in=resume_in)
    return resume

@router.get("/", response_model=List[schemas.Resume])
def read_resumes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resumes.
    """
    resumes = crud.resume.get_multi_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return resumes

@router.get("/{resume_id}", response_model=schemas.Resume)
def read_resume(
    *,
    db: Session = Depends(deps.get_db),
    resume_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get resume by ID.
    """
    resume = crud.resume.get(db=db, id=resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return resume

@router.put("/{resume_id}", response_model=schemas.Resume)
def update_resume(
    *,
    db: Session = Depends(deps.get_db),
    resume_id: int,
    resume_in: schemas.ResumeUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update resume.
    """
    resume = crud.resume.get(db=db, id=resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    resume = crud.resume.update(db=db, db_obj=resume, obj_in=resume_in)
    return resume

@router.delete("/{resume_id}", response_model=schemas.Resume)
def delete_resume(
    *,
    db: Session = Depends(deps.get_db),
    resume_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete resume.
    """
    resume = crud.resume.get(db=db, id=resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    resume = crud.resume.remove(db=db, id=resume_id)
    return resume

@router.post("/upload", response_model=schemas.Resume)
async def upload_resume(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload and parse resume file.
    """
    # TODO: Implement file storage (e.g., S3)
    content = await file.read()
    parsed_data = await parse_resume_file(content, file.filename)
    
    resume_in = schemas.ResumeCreate(
        title=file.filename,
        content=parsed_data,
        user_id=current_user.id
    )
    resume = crud.resume.create(db=db, obj_in=resume_in)
    return resume 