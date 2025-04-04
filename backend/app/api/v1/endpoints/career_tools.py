"""
API endpoints for cover letter generation and skills gap analysis.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import tempfile
import os
import json

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.cover_letter import CoverLetter
from app.models.skills_gap_analysis import SkillsGapAnalysis
from app.services.openai.cover_letter_generator import generate_cover_letter_with_openai, CoverLetterGenerationError
from app.services.openai.skills_gap_analyzer import analyze_skills_gap_with_openai, incorporate_user_skills_with_openai, SkillsGapAnalysisError
from app.services.resume_parser import parse_resume
from app.services.document_generator import generate_document_pdf, generate_document_docx

router = APIRouter()

@router.post("/generate-cover-letter")
async def generate_cover_letter(
    resume_id: int,
    job_description_id: int,
    company_name: Optional[str] = None,
    hiring_manager: Optional[str] = None,
    additional_notes: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Generate a cover letter based on an existing resume and job description.
    """
    # Check if user has access to the resume and job description
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    job_description = db.query(JobDescription).filter(
        JobDescription.id == job_description_id, 
        JobDescription.user_id == current_user.id
    ).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    try:
        # Generate cover letter
        cover_letter_data = await generate_cover_letter_with_openai(
            resume_data=resume.parsed_data,
            job_description=job_description.text,
            company_name=company_name,
            hiring_manager=hiring_manager,
            additional_notes=additional_notes
        )
        
        # Save cover letter to database
        cover_letter = CoverLetter(
            user_id=current_user.id,
            resume_id=resume_id,
            job_description_id=job_description_id,
            company_name=company_name,
            hiring_manager=hiring_manager,
            cover_letter_data=cover_letter_data
        )
        db.add(cover_letter)
        db.commit()
        db.refresh(cover_letter)
        
        return {
            "id": cover_letter.id,
            "cover_letter_data": cover_letter_data
        }
    except CoverLetterGenerationError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-cover-letter-upload")
async def generate_cover_letter_upload(
    background_tasks: BackgroundTasks,
    resume_file: UploadFile = File(...),
    job_description_text: str = Form(...),
    company_name: Optional[str] = Form(None),
    hiring_manager: Optional[str] = Form(None),
    additional_notes: Optional[str] = Form(None),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Generate a cover letter based on an uploaded resume and job description text.
    """
    try:
        # Parse resume
        resume_content = await resume_file.read()
        file_extension = os.path.splitext(resume_file.filename)[1].lower()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(resume_content)
            temp_path = temp_file.name
        
        try:
            resume_data = parse_resume(temp_path)
        finally:
            os.unlink(temp_path)
        
        # Save resume to database
        resume = Resume(
            user_id=current_user.id,
            filename=resume_file.filename,
            parsed_data=resume_data
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        # Save job description to database
        job_description = JobDescription(
            user_id=current_user.id,
            text=job_description_text
        )
        db.add(job_description)
        db.commit()
        db.refresh(job_description)
        
        # Generate cover letter
        cover_letter_data = await generate_cover_letter_with_openai(
            resume_data=resume_data,
            job_description=job_description_text,
            company_name=company_name,
            hiring_manager=hiring_manager,
            additional_notes=additional_notes
        )
        
        # Save cover letter to database
        cover_letter = CoverLetter(
            user_id=current_user.id,
            resume_id=resume.id,
            job_description_id=job_description.id,
            company_name=company_name,
            hiring_manager=hiring_manager,
            cover_letter_data=cover_letter_data
        )
        db.add(cover_letter)
        db.commit()
        db.refresh(cover_letter)
        
        return {
            "id": cover_letter.id,
            "cover_letter_data": cover_letter_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export-cover-letter/{cover_letter_id}")
async def export_cover_letter(
    cover_letter_id: int,
    format: str = "pdf",
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Export a cover letter as PDF or DOCX.
    """
    # Get cover letter
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id, 
        CoverLetter.user_id == current_user.id
    ).first()
    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    try:
        # Generate temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as temp_file:
            temp_path = temp_file.name
        
        # Generate document
        if format.lower() == "pdf":
            generate_document_pdf(cover_letter.cover_letter_data["full_text"], temp_path)
        elif format.lower() == "docx":
            generate_document_docx(cover_letter.cover_letter_data["full_text"], temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'pdf' or 'docx'.")
        
        # Return file
        return FileResponse(
            path=temp_path,
            filename=f"cover_letter_{cover_letter_id}.{format}",
            media_type=f"application/{format}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-skills-gap")
async def analyze_skills_gap(
    resume_id: int,
    job_description_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Analyze skills gap between a resume and job description.
    """
    # Get resume and job description
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    job_description = db.query(JobDescription).filter(
        JobDescription.id == job_description_id, 
        JobDescription.user_id == current_user.id
    ).first()
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    try:
        # Analyze skills gap
        analysis_data = await analyze_skills_gap_with_openai(
            resume_data=resume.parsed_data,
            job_description=job_description.text
        )
        
        # Save analysis to database
        skills_gap_analysis = SkillsGapAnalysis(
            user_id=current_user.id,
            resume_id=resume_id,
            job_description_id=job_description_id,
            analysis_data=analysis_data
        )
        db.add(skills_gap_analysis)
        db.commit()
        db.refresh(skills_gap_analysis)
        
        return {
            "id": skills_gap_analysis.id,
            "analysis_data": analysis_data
        }
    except SkillsGapAnalysisError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add-user-skills/{analysis_id}")
async def add_user_skills(
    analysis_id: int,
    user_skills: Dict[str, str],
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Add user-provided skills to a resume based on skills gap analysis.
    """
    # Get skills gap analysis
    analysis = db.query(SkillsGapAnalysis).filter(
        SkillsGapAnalysis.id == analysis_id, 
        SkillsGapAnalysis.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Skills gap analysis not found")
    
    # Get resume
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    try:
        # Incorporate user skills
        updated_resume_data = await incorporate_user_skills_with_openai(
            resume_data=resume.parsed_data,
            user_skills=user_skills
        )
        
        # Create a new optimized resume
        optimized_resume = Resume(
            user_id=current_user.id,
            filename=f"optimized_{resume.filename}",
            parsed_data=updated_resume_data,
            parent_id=resume.id
        )
        db.add(optimized_resume)
        db.commit()
        db.refresh(optimized_resume)
        
        return {
            "id": optimized_resume.id,
            "optimized_data": updated_resume_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
