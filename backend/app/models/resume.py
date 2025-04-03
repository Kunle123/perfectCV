from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base

class Resume(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    title = Column(String)
    content = Column(JSON)  # Structured resume data
    original_file_path = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    optimizations = relationship("Optimization", back_populates="resume")

class JobDescription(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    title = Column(String)
    content = Column(Text)
    parsed_data = Column(JSON)  # Parsed skills, requirements, etc.
    
    # Relationships
    user = relationship("User", back_populates="job_descriptions")
    optimizations = relationship("Optimization", back_populates="job_description")

class Optimization(Base):
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resume.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("jobdescription.id"), nullable=False)
    result = Column(JSON)  # Optimized resume data
    status = Column(String)  # pending, completed, failed
    
    # Relationships
    resume = relationship("Resume", back_populates="optimizations")
    job_description = relationship("JobDescription", back_populates="optimizations") 