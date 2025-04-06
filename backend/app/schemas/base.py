from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class TimestampedSchema(BaseSchema):
    created_at: datetime
    updated_at: datetime

class UserBase(BaseSchema):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    credits: float = Field(default=0.0, ge=0.0)

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str 