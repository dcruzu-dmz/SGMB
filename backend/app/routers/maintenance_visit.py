import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.maintenance_visit import (
    MaintenanceVisit,
    MaintenanceVisitItem,
    MaintenanceVisitChecklistEntry,
    MaintenanceVisitPhoto,
)
from app.schemas.maintenance_visit import (
    MaintenanceVisitCreate,
    MaintenanceVisitUpdate,
    MaintenanceVisitResponse,
    MaintenanceVisitItemCreate,
    MaintenanceVisitItemUpdate,
    MaintenanceVisitItemResponse,
    MaintenanceVisitChecklistEntryUpdate,
    MaintenanceVisitChecklistEntryResponse,
    MaintenanceVisitPhotoResponse,
)
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/maintenance-visits", tags=["MaintenanceVisits"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "visit-photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

VISIT_LOAD_OPTIONS = [
    joinedload(MaintenanceVisit.items).joinedload(MaintenanceVisitItem.photos),
    joinedload(MaintenanceVisit.checklist_entries),
]


def _get_visit_or_404(visit_id: int, db: Session) -> MaintenanceVisit:
    visit = (
        db.query(MaintenanceVisit)
        .options(*VISIT_LOAD_OPTIONS)
        .filter(MaintenanceVisit.id == visit_id)
        .first()
    )
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    return visit


# Crear visita (con equipos y checklist anidados)
@router.post("/", response_model=MaintenanceVisitResponse)
def create_visit(
    data: MaintenanceVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = data.dict(exclude={"items", "checklist_entries"})
    visit = MaintenanceVisit(**payload)
    db.add(visit)
    db.flush()

    for item_data in data.items:
        db.add(MaintenanceVisitItem(visit_id=visit.id, **item_data.dict()))

    for entry_data in data.checklist_entries:
        db.add(MaintenanceVisitChecklistEntry(visit_id=visit.id, **entry_data.dict()))

    db.commit()
    return _get_visit_or_404(visit.id, db)


# Listar visitas
@router.get("/", response_model=list[MaintenanceVisitResponse])
def get_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(MaintenanceVisit)
        .options(*VISIT_LOAD_OPTIONS)
        .order_by(MaintenanceVisit.visit_date.desc(), MaintenanceVisit.id.desc())
        .all()
    )


# Obtener visita por ID
@router.get("/{visit_id}", response_model=MaintenanceVisitResponse)
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_visit_or_404(visit_id, db)


# Actualizar cabecera de la visita
@router.put("/{visit_id}", response_model=MaintenanceVisitResponse)
def update_visit(
    visit_id: int,
    data: MaintenanceVisitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(visit, key, value)

    db.commit()
    return _get_visit_or_404(visit_id, db)


# Eliminar visita
@router.delete("/{visit_id}")
def delete_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")

    for item in visit.items:
        for photo in item.photos:
            file_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.file_path))
            if os.path.exists(file_path):
                os.remove(file_path)

    db.delete(visit)
    db.commit()
    return {"detail": "Visita eliminada"}


# Agregar un equipo a una visita existente
@router.post("/{visit_id}/items", response_model=MaintenanceVisitItemResponse)
def add_visit_item(
    visit_id: int,
    data: MaintenanceVisitItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")

    item = MaintenanceVisitItem(visit_id=visit_id, **data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# Actualizar un equipo de la visita
@router.put("/items/{item_id}", response_model=MaintenanceVisitItemResponse)
def update_visit_item(
    item_id: int,
    data: MaintenanceVisitItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(MaintenanceVisitItem).filter(MaintenanceVisitItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


# Eliminar un equipo de la visita
@router.delete("/items/{item_id}")
def delete_visit_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(MaintenanceVisitItem).filter(MaintenanceVisitItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for photo in item.photos:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.file_path))
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(item)
    db.commit()
    return {"detail": "Equipo eliminado"}


# Subir fotos de un equipo (multiples)
@router.post("/items/{item_id}/photos", response_model=list[MaintenanceVisitPhotoResponse])
def upload_item_photos(
    item_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(MaintenanceVisitItem).filter(MaintenanceVisitItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    saved_photos = []
    for file in files:
        extension = os.path.splitext(file.filename or "")[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{extension}"
        destination = os.path.join(UPLOAD_DIR, filename)

        with open(destination, "wb") as out:
            out.write(file.file.read())

        photo = MaintenanceVisitPhoto(item_id=item_id, file_path=f"/uploads/visit-photos/{filename}")
        db.add(photo)
        saved_photos.append(photo)

    db.commit()
    for photo in saved_photos:
        db.refresh(photo)
    return saved_photos


# Eliminar una foto
@router.delete("/photos/{photo_id}")
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = db.query(MaintenanceVisitPhoto).filter(MaintenanceVisitPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Foto no encontrada")

    file_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.file_path))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(photo)
    db.commit()
    return {"detail": "Foto eliminada"}


# Actualizar una entrada del checklist (marcar/comentar)
@router.put("/checklist/{entry_id}", response_model=MaintenanceVisitChecklistEntryResponse)
def update_checklist_entry(
    entry_id: int,
    data: MaintenanceVisitChecklistEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(MaintenanceVisitChecklistEntry).filter(MaintenanceVisitChecklistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Elemento de checklist no encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry
