from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class SkillsGapAnalysis(Base):
    __tablename__ = "skillsgapanalysis"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    resume_id = Column(Integer, ForeignKey("resume.id"))
    job_description_id = Column(Integer, ForeignKey("jobdescription.id"))
    missing_skills = Column(JSON, nullable=True)
    enhancement_opportunities = Column(JSON, nullable=True)
    implicit_skills = Column(JSON, nullable=True)
    user_added_skills = Column(JSON, nullable=True)
    
    user = relationship("User", back_populates="skills_gap_analyses")
    resume = relationship("Resume", back_populates="skills_gap_analyses")
    job_description = relationship("JobDescription", back_populates="skills_gap_analyses")
