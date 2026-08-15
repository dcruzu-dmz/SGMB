from sqlalchemy import Column, Date, DateTime, Integer, String, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class PreventiveMaintenance(Base):
    __tablename__ = "preventive_maintenance"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    maintenance_type = Column(String(50), nullable=False)
    frequency = Column(String(50), nullable=False)
    scheduled_date = Column(Date, nullable=False)
    status = Column(String(20), default="pendiente")
    observations = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset", foreign_keys=[asset_id])
    responsible = relationship("User", foreign_keys=[responsible_id])
