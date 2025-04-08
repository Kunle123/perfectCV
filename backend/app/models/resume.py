from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Resume(Base):
    __tablename__ = "resume"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    title = Column(String)
    content = Column(JSON)  # Structured resume data
    original_file_path = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    optimizations = relationship("Optimization", back_populates="resume")
    cover_letters = relationship("CoverLetter", back_populates="resume", cascade="all, delete-orphan")
    skills_gap_analyses = relationship("SkillsGapAnalysis", back_populates="resume", cascade="all, delete-orphan") 