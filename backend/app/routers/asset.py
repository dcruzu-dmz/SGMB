from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse, AssetUpdate
from app.utils.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/assets", tags=["Assets"])

# Crear equipos
@router.post("/", response_model=AssetResponse)
def create_asset(
    data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = Asset(
        name=data.name,
        type=data.type,
        brand=data.brand,
        model=data.model,
        serial_number=data.serial_number,
        location=data.location,
        status=data.status,
        description=data.description,
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

    for key, value in data.dict(exclude_unset=True).items():
        setattr(asset, key, value)

    db.commit()
    db.refresh(asset)

# Eliminar equipo
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
    
    asset.status = status
    db.commit()
    db.refresh(asset)
    return asset