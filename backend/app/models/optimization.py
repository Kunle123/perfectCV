from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Optimization(Base):
    __tablename__ = "optimization"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resume.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_description.id"), nullable=False)
    optimized_content = Column(JSON)  # Optimized resume content
    score = Column(Integer)  # Match score
    feedback = Column(Text)  # Optimization feedback
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="optimizations")
    resume = relationship("Resume", back_populates="optimizations")
    job_description = relationship("JobDescription", back_populates="optimizations")
