from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.branch import Branch
from app.schemas.branch import BranchCreate, BranchResponse, BranchUpdate
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/branches", tags=["Branches"])

#Crear sucursales
@router.post("/", response_model=BranchResponse)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = Branch(
        name=data.name,
        address=data.address,
        phone=data.phone,
        is_active=data.is_active,
    )

    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

#Obtener sucursales
@router.get("/", response_model=list[BranchResponse])
def get_branches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branches = db.query(Branch).all()
    return branches

# Obtener sucursal por ID
@router.get("/{branch_id}", response_model=BranchResponse)
def get_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    return branch

# Editar sucursal
@router.put("/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: int,
    data: BranchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(branch, key, value)

    db.commit()
    db.refresh(branch)
    return branch

# Dar de baja
@router.patch("/{branch_id}/status", response_model=BranchResponse)
def update_branch_status(
    branch_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    branch.is_active = is_active
    db.commit()
    db.refresh(branch)
    return branch