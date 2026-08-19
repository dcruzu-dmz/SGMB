from sqlalchemy import Column, Date, Time, DateTime, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class MaintenanceVisit(Base):
    __tablename__ = "maintenance_visits"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    visit_date = Column(Date, nullable=False)
    entry_time = Column(Time, nullable=True)
    exit_time = Column(Time, nullable=True)

    visit_reasons = Column(Text, nullable=True)  # JSON-encoded list of checkbox reasons

    equipment_count = Column(Integer, nullable=True)
    thermal_printers_count = Column(Integer, nullable=True)
    matrix_printers_count = Column(Integer, nullable=True)

    branch_contact_name = Column(String(150), nullable=True)
    branch_contact_employee_code = Column(String(50), nullable=True)

    camera_review_by = Column(String(150), nullable=True)
    camera_review_time = Column(Time, nullable=True)

    equipment_change_previous_serial = Column(String(100), nullable=True)
    equipment_change_previous_brand = Column(String(100), nullable=True)
    equipment_change_new_serial = Column(String(100), nullable=True)
    equipment_change_new_brand = Column(String(100), nullable=True)

    delivered_equipment = Column(String(150), nullable=True)
    delivered_brand = Column(String(100), nullable=True)
    delivered_serial = Column(String(100), nullable=True)
    delivered_model = Column(String(100), nullable=True)

    general_observations = Column(Text, nullable=True)
    supervisor_observations = Column(Text, nullable=True)

    signed_report_path = Column(String(300), nullable=True)

    status = Column(String(20), default="borrador")  # borrador | completado
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("Branch", foreign_keys=[branch_id])
    technician = relationship("User", foreign_keys=[technician_id])
    items = relationship("MaintenanceVisitItem", back_populates="visit", cascade="all, delete-orphan")
    checklist_entries = relationship("MaintenanceVisitChecklistEntry", back_populates="visit", cascade="all, delete-orphan")


class MaintenanceVisitItem(Base):
    __tablename__ = "maintenance_visit_items"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("maintenance_visits.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)

    equipment_type = Column(String(100), nullable=False)
    identification_location = Column(String(150), nullable=True)
    serial = Column(String(100), nullable=True)

    installed = Column(Boolean, nullable=True)
    working = Column(Boolean, nullable=True)
    cleaning_done = Column(Boolean, nullable=True)
    notes = Column(Text, nullable=True)

    visit = relationship("MaintenanceVisit", back_populates="items")
    asset = relationship("Asset", foreign_keys=[asset_id])
    photos = relationship("MaintenanceVisitPhoto", back_populates="item", cascade="all, delete-orphan")
    checklist_entries = relationship("MaintenanceVisitChecklistEntry", back_populates="item", cascade="all, delete-orphan")


class MaintenanceVisitChecklistEntry(Base):
    __tablename__ = "maintenance_visit_checklist_entries"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(Integer, ForeignKey("maintenance_visits.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("maintenance_visit_items.id"), nullable=True)

    category = Column(String(30), nullable=False)  # software (por equipo) | revision | compartido
    label = Column(String(200), nullable=False)
    checked = Column(Boolean, default=False)
    comment = Column(String(200), nullable=True)

    visit = relationship("MaintenanceVisit", back_populates="checklist_entries")
    item = relationship("MaintenanceVisitItem", back_populates="checklist_entries")


class MaintenanceVisitPhoto(Base):
    __tablename__ = "maintenance_visit_photos"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("maintenance_visit_items.id"), nullable=False)

    file_path = Column(String(300), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("MaintenanceVisitItem", back_populates="photos")
