from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate
from app.utils.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services.assigned_tasks import has_active_task, TASK_TYPE_INVENTORY


router = APIRouter(prefix="/assets", tags=["Assets"])


def _can_edit_asset(asset: Asset, current_user: User, db: Session) -> bool:
    if current_user.role == "admin":
        return True
    if current_user.role == "tecnico" and asset.branch_id is not None:
        return has_active_task(db, current_user.id, asset.branch_id, TASK_TYPE_INVENTORY)
    return False


def _can_create_in_branch(branch_id: int | None, current_user: User, db: Session) -> bool:
    if current_user.role == "admin":
        return True
    if current_user.role == "tecnico" and branch_id is not None:
        return has_active_task(db, current_user.id, branch_id, TASK_TYPE_INVENTORY)
    return False


# Estados que un tecnico con tarea activa puede poner el mismo. "dado_de_baja"
# queda fuera a propósito: la baja definitiva la debe confirmar un admin
# despues de ver la solicitud (ver "baja_solicitada" en update_asset_status).
TECHNICIAN_ALLOWED_STATUSES = {"disponible", "en_mantenimiento", "baja_solicitada"}


# Crear equipos
@router.post("/", response_model=AssetResponse)
def create_asset(
    data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not _can_create_in_branch(data.branch_id, current_user, db):
        raise HTTPException(status_code=403, detail="No tienes autorización para registrar equipos en esta sucursal")

    asset = Asset(
        name=data.name,
        type=data.type,
        brand=data.brand,
        model=data.model,
        serial_number=data.serial_number,
        location=data.location,
        status=data.status,
        description=data.description,
        branch_id=data.branch_id,
        ram=data.ram,
        storage=data.storage,
        processor=data.processor,
        operating_system=data.operating_system,
        channels=data.channels,
        screen_size=data.screen_size,
        video_port=data.video_port,
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

#Obtener equipos
@router.get("/", response_model=list[AssetResponse])
def get_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assets = db.query(Asset).all()
    return assets

# Obtener equipo por ID
@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return asset
    
# Editar equipo
@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    data: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if not _can_edit_asset(asset, current_user, db):
        raise HTTPException(status_code=403, detail="No tienes autorización para editar este equipo")

    update_data = data.dict(exclude_unset=True)

    if current_user.role != "admin":
        if "status" in update_data and update_data["status"] not in TECHNICIAN_ALLOWED_STATUSES:
            raise HTTPException(
                status_code=403,
                detail="Solo un administrador puede dar de baja definitivamente un equipo. Usa 'Solicitar baja' para que lo revise."
            )
        if "branch_id" in update_data and update_data["branch_id"] != asset.branch_id:
            raise HTTPException(status_code=403, detail="No puedes mover un equipo a otra sucursal")

    for key, value in update_data.items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return asset

# Cambiar estado del equipo
@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset_status(
    asset_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if current_user.role != "admin":
        if not _can_edit_asset(asset, current_user, db):
            raise HTTPException(status_code=403, detail="No tienes autorización para cambiar el estado de este equipo")
        if status not in TECHNICIAN_ALLOWED_STATUSES:
            raise HTTPException(
                status_code=403,
                detail="Solo un administrador puede dar de baja definitivamente un equipo. Usa 'Solicitar baja' para que lo revise."
            )

    asset.status = status
    db.commit()
    db.refresh(asset)
    return asset