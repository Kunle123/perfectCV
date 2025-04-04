from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    credits: int = 10

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str

class UserUpdate(UserBase):
    """Schema for updating a user."""
    password: Optional[str] = None

class User(UserBase):
    """Schema for user responses."""
    id: int

    class Config:
        from_attributes = True 