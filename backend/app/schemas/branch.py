from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BranchBase(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None
    is_active: bool = True

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BranchBase):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class BranchResponse(BranchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True