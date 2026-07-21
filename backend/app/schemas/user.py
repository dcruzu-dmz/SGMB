from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str 
    is_active: bool = True


class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str 
    email: EmailStr 
    role: str 
    is_active: bool 
    

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True