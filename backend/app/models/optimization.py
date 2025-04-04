from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Optimization(Base):
    __tablename__ = "optimization"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    resume_id = Column(Integer, ForeignKey("resume.id"))
    job_description_id = Column(Integer, ForeignKey("jobdescription.id"))
    optimized_content = Column(JSON)
    
    user = relationship("User", back_populates="optimizations")
    resume = relationship("Resume", back_populates="optimizations")
    job_description = relationship("JobDescription", back_populates="optimizations")
