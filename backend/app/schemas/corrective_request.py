from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CorrectiveRequestBase(BaseModel):

    asset_id: int
    requester_id: int
    assigned_id: Optional[int] = None
    description: str
    priority: str
    status: str = "abierta"

class CorrectiveRequestCreate(CorrectiveRequestBase):
    pass

class CorrectiveRequestUpdate(BaseModel):
    asset_id: Optional[int] = None
    requester_id: Optional[int] = None
    assigned_id: Optional[int] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    solution: Optional[str] = None

class CorrectiveRequestResponse(CorrectiveRequestBase):
    id: int
    signed_report_path: Optional[str] = None
    created_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True