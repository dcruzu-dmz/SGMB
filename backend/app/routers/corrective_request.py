from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.corrective_request import CorrectiveRequest
from app.schemas.corrective_request import CorrectiveRequestCreate, CorrectiveRequestResponse, CorrectiveRequestUpdate
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/correctiverequest", tags=["CorrectiveRequest"])

#Crear Solicitud
@router.post("/", response_model=CorrectiveRequestResponse)
def create_correctiverequest(
    data: CorrectiveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request  = CorrectiveRequest(
        asset_id=data.asset_id,
        requester_id=data.requester_id,
        assigned_id=data.assigned_id,
        description=data.description,
        priority=data.priority,
        status=data.status, 
    )

    db.add(corrective_request)
    db.commit()
    db.refresh(corrective_request)
    return corrective_request

#Obtener Solicitudes
@router.get("/", response_model=list[CorrectiveRequestResponse])
def get_corrective_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = db.query(CorrectiveRequest).all()
    return corrective_request

#Obtener Solicitud por ID
@router.get("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def get_corrective_request_by_id(
    corrective_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return corrective_request

#Actualizar solicitud
@router.put("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def update_corrective_request(
    corrective_request_id: int,
    data: CorrectiveRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(corrective_request,key, value)

    db.commit()
    db.refresh(corrective_request)
    return corrective_request

# Cambiar estado de la solicitud
@router.patch("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def change_corrective_request_status(
    corrective_request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    corrective_request.status = status
    db.commit()
    db.refresh(corrective_request)
    return corrective_request
