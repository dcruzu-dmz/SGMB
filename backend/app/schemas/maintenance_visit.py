from pydantic import BaseModel, ConfigDict
from datetime import date, time, datetime
from typing import Literal, Optional

VisitStatus = Literal["borrador", "programada", "completado"]


class MaintenanceVisitPhotoResponse(BaseModel):
    id: int
    file_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MaintenanceVisitChecklistEntryBase(BaseModel):
    category: str
    label: str
    checked: bool = False
    comment: Optional[str] = None
    item_id: Optional[int] = None


class MaintenanceVisitChecklistEntryCreate(MaintenanceVisitChecklistEntryBase):
    pass


class MaintenanceVisitChecklistEntryUpdate(BaseModel):
    checked: Optional[bool] = None
    comment: Optional[str] = None


class MaintenanceVisitChecklistEntryResponse(MaintenanceVisitChecklistEntryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MaintenanceVisitItemBase(BaseModel):
    asset_id: Optional[int] = None
    equipment_type: str
    identification_location: Optional[str] = None
    serial: Optional[str] = None
    installed: Optional[bool] = None
    working: Optional[bool] = None
    cleaning_done: Optional[bool] = None
    notes: Optional[str] = None


class MaintenanceVisitItemCreate(MaintenanceVisitItemBase):
    checklist_entries: list[MaintenanceVisitChecklistEntryCreate] = []


class MaintenanceVisitItemUpdate(BaseModel):
    asset_id: Optional[int] = None
    equipment_type: Optional[str] = None
    identification_location: Optional[str] = None
    serial: Optional[str] = None
    installed: Optional[bool] = None
    working: Optional[bool] = None
    cleaning_done: Optional[bool] = None
    notes: Optional[str] = None


class MaintenanceVisitItemResponse(MaintenanceVisitItemBase):
    id: int
    photos: list[MaintenanceVisitPhotoResponse] = []
    checklist_entries: list[MaintenanceVisitChecklistEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MaintenanceVisitBase(BaseModel):
    branch_id: int
    technician_id: Optional[int] = None
    visit_date: date
    entry_time: Optional[time] = None
    exit_time: Optional[time] = None
    visit_reasons: Optional[str] = None
    equipment_count: Optional[int] = None
    thermal_printers_count: Optional[int] = None
    matrix_printers_count: Optional[int] = None
    branch_contact_name: Optional[str] = None
    branch_contact_employee_code: Optional[str] = None
    camera_review_by: Optional[str] = None
    camera_review_time: Optional[time] = None
    equipment_change_previous_serial: Optional[str] = None
    equipment_change_previous_brand: Optional[str] = None
    equipment_change_new_serial: Optional[str] = None
    equipment_change_new_brand: Optional[str] = None
    delivered_equipment: Optional[str] = None
    delivered_brand: Optional[str] = None
    delivered_serial: Optional[str] = None
    delivered_model: Optional[str] = None
    general_observations: Optional[str] = None
    supervisor_observations: Optional[str] = None
    status: str = "borrador"


class MaintenanceVisitCreate(MaintenanceVisitBase):
    status: VisitStatus = "borrador"
    items: list[MaintenanceVisitItemCreate] = []
    checklist_entries: list[MaintenanceVisitChecklistEntryCreate] = []


class MaintenanceVisitUpdate(BaseModel):
    branch_id: Optional[int] = None
    technician_id: Optional[int] = None
    visit_date: Optional[date] = None
    entry_time: Optional[time] = None
    exit_time: Optional[time] = None
    visit_reasons: Optional[str] = None
    equipment_count: Optional[int] = None
    thermal_printers_count: Optional[int] = None
    matrix_printers_count: Optional[int] = None
    branch_contact_name: Optional[str] = None
    branch_contact_employee_code: Optional[str] = None
    camera_review_by: Optional[str] = None
    camera_review_time: Optional[time] = None
    equipment_change_previous_serial: Optional[str] = None
    equipment_change_previous_brand: Optional[str] = None
    equipment_change_new_serial: Optional[str] = None
    equipment_change_new_brand: Optional[str] = None
    delivered_equipment: Optional[str] = None
    delivered_brand: Optional[str] = None
    delivered_serial: Optional[str] = None
    delivered_model: Optional[str] = None
    general_observations: Optional[str] = None
    supervisor_observations: Optional[str] = None
    status: Optional[VisitStatus] = None


class MaintenanceVisitResponse(MaintenanceVisitBase):
    id: int
    created_at: datetime
    signed_report_path: Optional[str] = None
    items: list[MaintenanceVisitItemResponse] = []
    checklist_entries: list[MaintenanceVisitChecklistEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)
