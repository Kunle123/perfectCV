from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class JobDescription(Base):
    __tablename__ = "jobdescription"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    title = Column(String, index=True)
    company = Column(String, nullable=True)
    text = Column(Text)
    
    user = relationship("User", back_populates="job_descriptions")
    optimizations = relationship("Optimization", back_populates="job_description")
    cover_letters = relationship("CoverLetter", back_populates="job_description", cascade="all, delete-orphan")
    skills_gap_analyses = relationship("SkillsGapAnalysis", back_populates="job_description", cascade="all, delete-orphan")
