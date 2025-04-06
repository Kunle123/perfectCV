from sqlalchemy import String, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from app.db.base_class import Base

class User(Base):
    __tablename__ = "user"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(default=False, nullable=False)
    credits: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    
    # Relationships with explicit back_populates and cascade
    resumes: Mapped[List["Resume"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    job_descriptions: Mapped[List["JobDescription"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    optimizations: Mapped[List["Optimization"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    cover_letters: Mapped[List["CoverLetter"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    skills_gap_analyses: Mapped[List["SkillsGapAnalysis"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    ) 