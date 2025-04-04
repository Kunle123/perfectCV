from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class CoverLetter(Base):
    __tablename__ = "coverletter"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    resume_id = Column(Integer, ForeignKey("resume.id"))
    job_description_id = Column(Integer, ForeignKey("jobdescription.id"))
    company_name = Column(String, nullable=True)
    hiring_manager = Column(String, nullable=True)
    additional_notes = Column(Text, nullable=True)
    content = Column(JSON)
    
    user = relationship("User", back_populates="cover_letters")
    resume = relationship("Resume", back_populates="cover_letters")
    job_description = relationship("JobDescription", back_populates="cover_letters")
