import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.database import get_db
from app.models.corrective_request import CorrectiveRequest
from app.schemas.corrective_request import CorrectiveRequestCreate, CorrectiveRequestResponse, CorrectiveRequestUpdate
from app.utils.dependencies import get_current_user, require_roles
from app.models.user import User

router = APIRouter(prefix="/correctiverequest", tags=["CorrectiveRequest"])

REPORTS_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "request-reports")
os.makedirs(REPORTS_UPLOAD_DIR, exist_ok=True)


def _check_request_access(request: CorrectiveRequest, current_user: User) -> None:
    if current_user.role == "tecnico" and request.assigned_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta solicitud")


#Crear Solicitud
@router.post("/", response_model=CorrectiveRequestResponse)
def create_correctiverequest(
    data: CorrectiveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "solicitante"))
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

#Obtener Solicitudes (el técnico solo ve las que tiene asignadas)
@router.get("/", response_model=list[CorrectiveRequestResponse])
def get_corrective_request(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CorrectiveRequest)
    if current_user.role == "tecnico":
        query = query.filter(CorrectiveRequest.assigned_id == current_user.id)
    return query.all()

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
    _check_request_access(corrective_request, current_user)
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
    _check_request_access(corrective_request, current_user)

    for key, value in data.dict(exclude_unset=True).items():
        setattr(corrective_request,key, value)

    if data.status == "cerrada" and corrective_request.closed_at is None:
        corrective_request.closed_at = func.now()
    elif data.status is not None and data.status != "cerrada":
        corrective_request.closed_at = None

    db.commit()
    db.refresh(corrective_request)
    return corrective_request

# Subir la hoja de firma escaneada
@router.post("/{corrective_request_id}/signed-report", response_model=CorrectiveRequestResponse)
def upload_signed_report(
    corrective_request_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    _check_request_access(corrective_request, current_user)

    if corrective_request.signed_report_path:
        old_path = os.path.join(REPORTS_UPLOAD_DIR, os.path.basename(corrective_request.signed_report_path))
        if os.path.exists(old_path):
            os.remove(old_path)

    extension = os.path.splitext(file.filename or "")[1] or ".pdf"
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = os.path.join(REPORTS_UPLOAD_DIR, filename)

    with open(destination, "wb") as out:
        out.write(file.file.read())

    corrective_request.signed_report_path = f"/uploads/request-reports/{filename}"
    db.commit()
    db.refresh(corrective_request)
    return corrective_request


# Eliminar la hoja de firma escaneada
@router.delete("/{corrective_request_id}/signed-report", response_model=CorrectiveRequestResponse)
def delete_signed_report(
    corrective_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    _check_request_access(corrective_request, current_user)

    if corrective_request.signed_report_path:
        file_path = os.path.join(REPORTS_UPLOAD_DIR, os.path.basename(corrective_request.signed_report_path))
        if os.path.exists(file_path):
            os.remove(file_path)
        corrective_request.signed_report_path = None
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
    _check_request_access(corrective_request, current_user)

    corrective_request.status = status
    if status == "cerrada" and corrective_request.closed_at is None:
        corrective_request.closed_at = func.now()
    elif status != "cerrada":
        corrective_request.closed_at = None

    db.commit()
    db.refresh(corrective_request)
    return corrective_request
