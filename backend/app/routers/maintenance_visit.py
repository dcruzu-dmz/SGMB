import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, selectinload

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
    MaintenanceVisitChecklistEntryCreate,
    MaintenanceVisitChecklistEntryUpdate,
    MaintenanceVisitChecklistEntryResponse,
    MaintenanceVisitPhotoResponse,
)
from app.utils.dependencies import get_current_user, require_roles
from app.models.user import User
from app.services.preventive_scheduler import run_preventive_check_locked
from app.utils.uploads import save_upload, remove_upload, PHOTO_EXTENSIONS, REPORT_EXTENSIONS

router = APIRouter(prefix="/maintenance-visits", tags=["MaintenanceVisits"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "visit-photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

REPORTS_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "visit-reports")
os.makedirs(REPORTS_UPLOAD_DIR, exist_ok=True)

# selectinload carga cada coleccion con una consulta aparte. Con joinedload los tres
# JOIN encadenados (fotos x checklist por equipo) multiplicaban las filas: 19 349 filas
# para 327 registros reales y 350 ms para listar 10 visitas (ver SPEC-paginacion.md).
VISIT_LOAD_OPTIONS = [
    selectinload(MaintenanceVisit.items).selectinload(MaintenanceVisitItem.photos),
    selectinload(MaintenanceVisit.items).selectinload(MaintenanceVisitItem.checklist_entries),
    selectinload(MaintenanceVisit.checklist_entries),
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


# Campos de la cabecera que un tecnico no puede cambiar en sus visitas
TECHNICIAN_FORBIDDEN_VISIT_FIELDS = {"branch_id", "technician_id"}


def _check_entries_belong_to_visit(entries, visit_id: int, db: Session) -> None:
    """Un checklist solo puede apuntar a equipos (item_id) de su propia visita."""
    item_ids = {e.item_id for e in entries if e.item_id is not None}
    if not item_ids:
        return
    own = db.query(MaintenanceVisitItem.id).filter(
        MaintenanceVisitItem.visit_id == visit_id, MaintenanceVisitItem.id.in_(item_ids)
    ).count()
    if own != len(item_ids):
        raise HTTPException(status_code=400, detail="El checklist hace referencia a un equipo de otra visita")


def _is_assigned_technician(visit: MaintenanceVisit, current_user: User) -> bool:
    return current_user.role == "tecnico" and visit.technician_id == current_user.id


def _check_visit_read(visit: MaintenanceVisit, current_user: User) -> None:
    if current_user.role in ("admin", "solicitante") or _is_assigned_technician(visit, current_user):
        return
    raise HTTPException(status_code=403, detail="No tienes acceso a esta visita")


def _check_visit_write(visit: MaintenanceVisit, current_user: User) -> None:
    if current_user.role == "admin" or _is_assigned_technician(visit, current_user):
        return
    raise HTTPException(status_code=403, detail="No tienes acceso a esta visita")


# Forzar el chequeo de mantenimiento preventivo (crea visitas 'programada' vencidas)
@router.post("/check-preventive")
def check_preventive(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    created = run_preventive_check_locked(db)
    # skipped: otra corrida (el loop u otro admin) tenia el candado; no se creo nada
    return {"created": created or 0, "skipped": created is None}


# Crear visita (con equipos y checklist anidados) — solo administradores programan/registran visitas
@router.post("/", response_model=MaintenanceVisitResponse)
def create_visit(
    data: MaintenanceVisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    payload = data.model_dump(exclude={"items", "checklist_entries"})
    visit = MaintenanceVisit(**payload)
    db.add(visit)
    db.flush()

    for item_data in data.items:
        item_dict = item_data.model_dump(exclude={"checklist_entries"})
        item = MaintenanceVisitItem(visit_id=visit.id, **item_dict)
        db.add(item)
        db.flush()

        for entry_data in item_data.checklist_entries:
            db.add(MaintenanceVisitChecklistEntry(visit_id=visit.id, item_id=item.id, **entry_data.model_dump(exclude={"item_id"})))

    _check_entries_belong_to_visit(data.checklist_entries, visit.id, db)
    for entry_data in data.checklist_entries:
        db.add(MaintenanceVisitChecklistEntry(visit_id=visit.id, **entry_data.model_dump()))

    db.commit()
    return _get_visit_or_404(visit.id, db)


# Listar visitas (el técnico solo ve las visitas que le fueron asignadas)
@router.get("/", response_model=list[MaintenanceVisitResponse])
def get_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MaintenanceVisit).options(*VISIT_LOAD_OPTIONS)
    if current_user.role == "tecnico":
        query = query.filter(MaintenanceVisit.technician_id == current_user.id)
    return query.order_by(MaintenanceVisit.visit_date.desc(), MaintenanceVisit.id.desc()).all()


# Obtener visita por ID
@router.get("/{visit_id}", response_model=MaintenanceVisitResponse)
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = _get_visit_or_404(visit_id, db)
    _check_visit_read(visit, current_user)
    return visit


def _sync_checklist(existing, entries_data, visit_id: int, item_id: int | None, db: Session) -> None:
    """Deja el checklist igual a entries_data: actualiza por id, crea los nuevos y
    borra los que no vienen."""
    by_id = {entry.id: entry for entry in existing}
    keep = set()
    for data in entries_data:
        fields = data.model_dump(exclude={"id", "item_id"})
        if data.id is None:
            db.add(MaintenanceVisitChecklistEntry(visit_id=visit_id, item_id=item_id, **fields))
            continue
        entry = by_id.get(data.id)
        if entry is None:
            raise HTTPException(status_code=400, detail="El checklist hace referencia a una entrada de otra visita")
        for key, value in fields.items():
            setattr(entry, key, value)
        keep.add(entry.id)
    for entry in existing:
        if entry.id not in keep:
            db.delete(entry)


def _sync_items(visit: MaintenanceVisit, items_data, db: Session) -> list[str]:
    """Deja los equipos de la visita iguales a items_data (por id, igual que el
    checklist). Devuelve las fotos de los equipos borrados, para eliminarlas del
    disco despues del commit."""
    by_id = {item.id: item for item in visit.items}
    keep = set()
    for data in items_data:
        fields = data.model_dump(exclude={"id", "checklist_entries"})
        if data.id is None:
            item = MaintenanceVisitItem(visit_id=visit.id, **fields)
            db.add(item)
            db.flush()
            _sync_checklist([], data.checklist_entries, visit.id, item.id, db)
            continue
        item = by_id.get(data.id)
        if item is None:
            raise HTTPException(status_code=400, detail="La visita hace referencia a un equipo de otra visita")
        for key, value in fields.items():
            setattr(item, key, value)
        _sync_checklist(list(item.checklist_entries), data.checklist_entries, visit.id, item.id, db)
        keep.add(item.id)

    removed_photos = []
    for item_id, item in by_id.items():
        if item_id not in keep:
            removed_photos += [photo.file_path for photo in item.photos]
            db.delete(item)
    return removed_photos


# Actualizar la visita (el técnico solo puede completar sus propias visitas).
# Con `items` / `checklist_entries` sincroniza tambien equipos y checklist general.
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
    _check_visit_write(visit, current_user)

    update_data = data.model_dump(exclude_unset=True, exclude={"items", "checklist_entries"})
    # el formulario reenvia todos los campos; solo cuentan los que cambian
    changed = {k for k, v in update_data.items() if getattr(visit, k) != v}
    if current_user.role != "admin" and TECHNICIAN_FORBIDDEN_VISIT_FIELDS & changed:
        raise HTTPException(
            status_code=403,
            detail="Solo un administrador puede cambiar la sucursal o el técnico de la visita",
        )

    for key, value in update_data.items():
        setattr(visit, key, value)

    removed_photos = []
    if data.items is not None:
        removed_photos = _sync_items(visit, data.items, db)
    if data.checklist_entries is not None:
        general = [entry for entry in visit.checklist_entries if entry.item_id is None]
        _sync_checklist(general, data.checklist_entries, visit.id, None, db)

    db.commit()
    for path in removed_photos:
        remove_upload(UPLOAD_DIR, path)
    return _get_visit_or_404(visit_id, db)


# Subir la hoja de firma escaneada
@router.post("/{visit_id}/signed-report", response_model=MaintenanceVisitResponse)
def upload_signed_report(
    visit_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    _check_visit_write(visit, current_user)

    filename = save_upload(file, REPORTS_UPLOAD_DIR, REPORT_EXTENSIONS)
    remove_upload(REPORTS_UPLOAD_DIR, visit.signed_report_path)

    visit.signed_report_path = f"/uploads/visit-reports/{filename}"
    db.commit()
    return _get_visit_or_404(visit_id, db)


# Eliminar la hoja de firma escaneada
@router.delete("/{visit_id}/signed-report", response_model=MaintenanceVisitResponse)
def delete_signed_report(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    _check_visit_write(visit, current_user)

    if visit.signed_report_path:
        remove_upload(REPORTS_UPLOAD_DIR, visit.signed_report_path)
        visit.signed_report_path = None
        db.commit()

    return _get_visit_or_404(visit_id, db)


# Eliminar visita
@router.delete("/{visit_id}")
def delete_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")

    for item in visit.items:
        for photo in item.photos:
            file_path = os.path.join(UPLOAD_DIR, os.path.basename(photo.file_path))
            if os.path.exists(file_path):
                os.remove(file_path)

    if visit.signed_report_path:
        report_path = os.path.join(REPORTS_UPLOAD_DIR, os.path.basename(visit.signed_report_path))
        if os.path.exists(report_path):
            os.remove(report_path)

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
    _check_visit_write(visit, current_user)

    item_dict = data.model_dump(exclude={"checklist_entries"})
    item = MaintenanceVisitItem(visit_id=visit_id, **item_dict)
    db.add(item)
    db.flush()

    for entry_data in data.checklist_entries:
        db.add(MaintenanceVisitChecklistEntry(visit_id=visit_id, item_id=item.id, **entry_data.model_dump(exclude={"item_id"})))

    db.commit()
    db.refresh(item)
    return item


# Agregar entradas de checklist a una visita (al completarla)
@router.post("/{visit_id}/checklist", response_model=list[MaintenanceVisitChecklistEntryResponse])
def add_checklist_entries(
    visit_id: int,
    data: list[MaintenanceVisitChecklistEntryCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    visit = db.query(MaintenanceVisit).filter(MaintenanceVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visita no encontrada")
    _check_visit_write(visit, current_user)

    _check_entries_belong_to_visit(data, visit_id, db)
    entries = [MaintenanceVisitChecklistEntry(visit_id=visit_id, **entry.model_dump()) for entry in data]
    db.add_all(entries)
    db.commit()
    for entry in entries:
        db.refresh(entry)
    return entries


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
    _check_visit_write(item.visit, current_user)

    for key, value in data.model_dump(exclude_unset=True).items():
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
    _check_visit_write(item.visit, current_user)

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
    _check_visit_write(item.visit, current_user)

    saved_photos = []
    saved_files = []
    try:
        for file in files:
            saved_files.append(save_upload(file, UPLOAD_DIR, PHOTO_EXTENSIONS))
    except BaseException:
        # si una foto falla no quedan huerfanas las que ya se guardaron
        for filename in saved_files:
            remove_upload(UPLOAD_DIR, filename)
        raise

    for filename in saved_files:
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
    _check_visit_write(photo.item.visit, current_user)

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
    _check_visit_write(entry.visit, current_user)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry
