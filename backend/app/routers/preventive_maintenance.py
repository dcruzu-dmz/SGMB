from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.preventive_maintenance import PreventiveMaintenance
from app.schemas.preventive_maintenance import PreventiveMaintenanceCreate, PreventiveMaintenanceResponse, PreventiveMaintenanceUpdate
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/preventive", tags=["PreventiveMaintenance"])

#Crear mantenimiento preventivo
@router.post("/", response_model=PreventiveMaintenanceResponse)
def create_preventive_maintenance(
    data: PreventiveMaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preventive = PreventiveMaintenance(
        asset_id=data.asset_id,
        responsible_id=data.responsible_id,
        maintenance_type=data.maintenance_type,
        frequency=data.frequency,
        scheduled_date=data.scheduled_date,
        status=data.status,
        observations=data.observations,
    )

    db.add(preventive)
    db.commit()
    db.refresh(preventive)
    return preventive

#Obtener mantenimientos preventivos
@router.get("/", response_model=list[PreventiveMaintenanceResponse])
def get_preventive_maintenances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preventives = db.query(PreventiveMaintenance).all()
    return preventives

#Obtener mantenimiento preventivo por ID
@router.get("/{preventive_id}", response_model=PreventiveMaintenanceResponse)
def get_preventive_maintenance(
    preventive_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preventive = db.query(PreventiveMaintenance).filter(PreventiveMaintenance.id == preventive_id).first()
    if not preventive:
        raise HTTPException(status_code=404, detail="Mantenimiento preventivo no encontrado")
    return preventive

#Actualizar mantenimiento preventivo
@router.put("/{preventive_id}", response_model=PreventiveMaintenanceResponse)
def update_preventive_maintenance(
    preventive_id: int,
    data: PreventiveMaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preventive = db.query(PreventiveMaintenance).filter(PreventiveMaintenance.id == preventive_id).first()
    if not preventive:
        raise HTTPException(status_code=404, detail="Mantenimiento preventivo no encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(preventive, key, value)

    db.commit()
    db.refresh(preventive)
    return preventive

#Cambiar estado del mantenimiento preventivo
@router.patch("/{preventive_id}", response_model=PreventiveMaintenanceResponse)
def change_preventive_maintenance_status(
    preventive_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preventive = db.query(PreventiveMaintenance).filter(PreventiveMaintenance.id == preventive_id).first()
    if not preventive:
        raise HTTPException(status_code=404, detail="Mantenimiento preventivo no encontrado")

    preventive.status = status
    db.commit()
    db.refresh(preventive)
    return preventive
