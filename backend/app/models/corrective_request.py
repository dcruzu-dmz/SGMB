from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class CorrectiveRequest(Base):
    __tablename__ = "corrective_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    description = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False)
    status = Column(String(50), default="abierta")
    solution = Column(Text, nullable=True)
    signed_report_path = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)


    asset = relationship("Asset", foreign_keys=[asset_id])
    requester = relationship("User", foreign_keys=[requester_id])
    assigned = relationship("User", foreign_keys=[assigned_id])

