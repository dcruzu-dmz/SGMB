from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    chain = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    maintenance_frequency_days = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())