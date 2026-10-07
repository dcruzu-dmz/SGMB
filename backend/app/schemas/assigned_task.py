from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AssignedTaskCreate(BaseModel):
    technician_id: int
    branch_id: int
    task_type: str
    notes: Optional[str] = None


class AssignedTaskResponse(BaseModel):
    id: int
    technician_id: int
    technician_name: Optional[str] = None
    branch_id: int
    branch_name: Optional[str] = None
    task_type: str
    status: str
    notes: Optional[str] = None
    created_by_id: int
    created_by_name: Optional[str] = None
    created_at: datetime
    closed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
