from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class PreventiveMaintenanceBase(BaseModel):
    asset_id: int
    responsible_id: int
    maintenance_type: str
    frequency: str
    scheduled_date: date
    status: str = "pendiente"
    observations: Optional[str] = None

class PreventiveMaintenanceCreate(PreventiveMaintenanceBase):
    pass

class PreventiveMaintenanceUpdate(BaseModel):
    asset_id: Optional[int] = None
    responsible_id: Optional[int] = None
    maintenance_type: Optional[str] = None
    frequency: Optional[str] = None
    scheduled_date: Optional[date] = None
    status: Optional[str] = None
    observations: Optional[str] = None

class PreventiveMaintenanceResponse(PreventiveMaintenanceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
