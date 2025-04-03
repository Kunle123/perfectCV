from sqlalchemy import Boolean, Column, Integer, String, Float
from app.models.base import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    credits = Column(Float, default=0.0)
    stripe_customer_id = Column(String, unique=True) 