import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.database import get_db
from app.models.corrective_request import CorrectiveRequest
from app.schemas.corrective_request import CorrectiveRequestCreate, CorrectiveRequestResponse, CorrectiveRequestUpdate, RequestStatus
from app.utils.dependencies import get_current_user, require_roles
from app.models.user import User
from app.utils.uploads import save_upload, remove_upload, REPORT_EXTENSIONS

router = APIRouter(prefix="/correctiverequest", tags=["CorrectiveRequest"])

REPORTS_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "request-reports")
os.makedirs(REPORTS_UPLOAD_DIR, exist_ok=True)


# Campos que cada rol (no admin) puede cambiar con PUT en las solicitudes a las que tiene acceso
EDITABLE_FIELDS_BY_ROLE = {
    "tecnico": {"status", "solution"},
    "solicitante": {"description", "priority"},
}


def _can_read_request(request: CorrectiveRequest, current_user: User) -> bool:
    if current_user.role == "admin":
        return True
    if current_user.role == "tecnico":
        return request.assigned_id == current_user.id
    if current_user.role == "solicitante":
        return request.requester_id == current_user.id
    return False


def _check_request_read(request: CorrectiveRequest, current_user: User) -> None:
    if not _can_read_request(request, current_user):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta solicitud")


def _check_request_work(request: CorrectiveRequest, current_user: User) -> None:
    """Cambiar estado y manejar la hoja firmada: admin o el tecnico asignado."""
    if current_user.role == "admin":
        return
    if current_user.role == "tecnico" and request.assigned_id == current_user.id:
        return
    raise HTTPException(status_code=403, detail="No tienes acceso a esta solicitud")


def _get_request_or_404(corrective_request_id: int, db: Session) -> CorrectiveRequest:
    corrective_request = db.query(CorrectiveRequest).filter(CorrectiveRequest.id == corrective_request_id).first()
    if not corrective_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return corrective_request


#Crear Solicitud
@router.post("/", response_model=CorrectiveRequestResponse)
def create_correctiverequest(
    data: CorrectiveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "solicitante"))
):
    corrective_request  = CorrectiveRequest(
        asset_id=data.asset_id,
        # solo un admin registra solicitudes a nombre de otra persona
        requester_id=data.requester_id if current_user.role == "admin" else current_user.id,
        assigned_id=data.assigned_id,
        description=data.description,
        priority=data.priority,
        # quien no es admin siempre abre la solicitud; cerrarla sigue el flujo normal
        status=data.status if current_user.role == "admin" else "abierta",
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
    elif current_user.role == "solicitante":
        query = query.filter(CorrectiveRequest.requester_id == current_user.id)
    elif current_user.role != "admin":
        return []
    return query.all()

#Obtener Solicitud por ID
@router.get("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def get_corrective_request_by_id(
    corrective_request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = _get_request_or_404(corrective_request_id, db)
    _check_request_read(corrective_request, current_user)
    return corrective_request

#Actualizar solicitud
@router.put("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def update_corrective_request(
    corrective_request_id: int,
    data: CorrectiveRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = _get_request_or_404(corrective_request_id, db)
    _check_request_read(corrective_request, current_user)

    update_data = data.model_dump(exclude_unset=True)
    if current_user.role != "admin":
        # el formulario reenvia todos los campos; solo cuentan los que cambian
        changed = {k for k, v in update_data.items() if getattr(corrective_request, k) != v}
        if not changed <= EDITABLE_FIELDS_BY_ROLE.get(current_user.role, set()):
            raise HTTPException(status_code=403, detail="No puedes modificar esos campos de la solicitud")
        if current_user.role == "solicitante" and changed and corrective_request.status != "abierta":
            raise HTTPException(status_code=403, detail="Solo puedes editar solicitudes abiertas")

    for key, value in update_data.items():
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
    corrective_request = _get_request_or_404(corrective_request_id, db)
    _check_request_work(corrective_request, current_user)

    filename = save_upload(file, REPORTS_UPLOAD_DIR, REPORT_EXTENSIONS)
    remove_upload(REPORTS_UPLOAD_DIR, corrective_request.signed_report_path)

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
    corrective_request = _get_request_or_404(corrective_request_id, db)
    _check_request_work(corrective_request, current_user)

    if corrective_request.signed_report_path:
        remove_upload(REPORTS_UPLOAD_DIR, corrective_request.signed_report_path)
        corrective_request.signed_report_path = None
        db.commit()
        db.refresh(corrective_request)

    return corrective_request


# Cambiar estado de la solicitud
@router.patch("/{corrective_request_id}", response_model=CorrectiveRequestResponse)
def change_corrective_request_status(
    corrective_request_id: int,
    status: RequestStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    corrective_request = _get_request_or_404(corrective_request_id, db)
    _check_request_work(corrective_request, current_user)

    corrective_request.status = status
    if status == "cerrada" and corrective_request.closed_at is None:
        corrective_request.closed_at = func.now()
    elif status != "cerrada":
        corrective_request.closed_at = None

    db.commit()
    db.refresh(corrective_request)
    return corrective_request
