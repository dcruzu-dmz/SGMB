from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssetBase(BaseModel):
    name: str
    type: str
    brand: str | None = None
    model: str | None = None
    serial_number: str | None = None
    location: str | None = None
    status: str = "disponible"
    description: str | None = None
    

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True