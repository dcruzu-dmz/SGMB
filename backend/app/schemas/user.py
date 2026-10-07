from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Literal

UserRole = Literal["admin", "tecnico", "solicitante"]


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str 
    is_active: bool = True


class UserCreate(UserBase):
    role: UserRole
    password: str = Field(min_length=8)

class PasswordReset(BaseModel):
    new_password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    

class UserResponse(UserBase):
    # None cuando quien consulta no es admin (ver routers/users.py)
    email: EmailStr | None
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)