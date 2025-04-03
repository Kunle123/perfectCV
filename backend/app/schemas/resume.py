from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.schemas.base import BaseSchema, TimestampedSchema

class ResumeBase(BaseSchema):
    title: str
    content: Dict[str, Any]
    original_file_path: Optional[str] = None

class ResumeCreate(ResumeBase):
    user_id: int

class ResumeUpdate(ResumeBase):
    pass

class Resume(ResumeBase, TimestampedSchema):
    id: int
    user_id: int

class JobDescriptionBase(BaseSchema):
    title: str
    content: str
    parsed_data: Optional[Dict[str, Any]] = None

class JobDescriptionCreate(JobDescriptionBase):
    user_id: int

class JobDescriptionUpdate(JobDescriptionBase):
    pass

class JobDescription(JobDescriptionBase, TimestampedSchema):
    id: int
    user_id: int

class OptimizationBase(BaseSchema):
    resume_id: int
    job_description_id: int
    result: Optional[Dict[str, Any]] = None
    status: str

class OptimizationCreate(OptimizationBase):
    pass

class OptimizationUpdate(OptimizationBase):
    pass

class Optimization(OptimizationBase, TimestampedSchema):
    id: int 