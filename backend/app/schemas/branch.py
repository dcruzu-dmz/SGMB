from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BranchBase(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None
    chain: str | None = None
    is_active: bool = True
    maintenance_frequency_days: int | None = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BranchBase):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    chain: Optional[str] = None
    is_active: Optional[bool] = None
    maintenance_frequency_days: Optional[int] = None

class BranchResponse(BranchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True