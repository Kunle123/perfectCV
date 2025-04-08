from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class Token(BaseModel):
    """Schema for access token."""
    access_token: str
    token_type: str

class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    credits: float = Field(default=0.0, ge=0.0)
    stripe_customer_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str

class UserUpdate(UserBase):
    """Schema for updating a user."""
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    credits: Optional[float] = None
    stripe_customer_id: Optional[str] = None

class User(UserBase):
    """Schema for user responses."""
    id: int

class UserInDB(User):
    """Schema for user in database."""
    hashed_password: str

class UserWithToken(UserBase):
    """Schema for user data with access token."""
    id: int
    access_token: str
    token_type: str 