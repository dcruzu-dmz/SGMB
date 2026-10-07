"""
Pruebas de integracion (Tipo = INT) para la documentacion 4.4.
Total en este archivo: 4 de las 10 pruebas del entregable final.

Usan el TestClient de FastAPI contra la aplicacion real y la base de datos
PostgreSQL real del proyecto (mantenimiento_db). Cada prueba crea sus
propios datos con un sufijo unico y los elimina en el teardown.
"""
import sys
import os
import uuid

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.branch import Branch
from app.models.asset import Asset
from app.models.corrective_request import CorrectiveRequest
from app.models.maintenance_visit import (
    MaintenanceVisit, MaintenanceVisitItem, MaintenanceVisitChecklistEntry, MaintenanceVisitPhoto,
)
from app.utils.security import hash_password

client = TestClient(app)


@pytest.fixture()
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture()
def seed(db):
    suffix = uuid.uuid4().hex[:8]
    admin = User(name="QA Admin", email=f"qa-admin-{suffix}@sgmb.com",
                 password_hash=hash_password("Qatest123!"), role="admin", is_active=True)
    tecnico = User(name="QA Tecnico", email=f"qa-tec-{suffix}@sgmb.com",
                   password_hash=hash_password("Qatest123!"), role="tecnico", is_active=True)
    otro_tecnico = User(name="QA Tecnico Otro", email=f"qa-tec2-{suffix}@sgmb.com",
                        password_hash=hash_password("Qatest123!"), role="tecnico", is_active=True)
    branch = Branch(name=f"Sucursal QA {suffix}", address="Zona 1", phone="12345678",
                     is_active=True, maintenance_frequency_days=None)
    db.add_all([admin, tecnico, otro_tecnico, branch])
    db.commit()
    db.refresh(admin); db.refresh(tecnico); db.refresh(otro_tecnico); db.refresh(branch)

    asset = Asset(name=f"Equipo QA {suffix}", type="CPU Cliente", brand="Dell", model="OptiPlex",
                  serial_number=f"SN-{suffix}", location="Cliente 1", status="disponible",
                  branch_id=branch.id)
    db.add(asset)
    db.commit()
    db.refresh(asset)

    data = {"admin": admin, "tecnico": tecnico, "otro_tecnico": otro_tecnico,
            "branch": branch, "asset": asset, "suffix": suffix}
    yield data

    db.query(CorrectiveRequest).filter(CorrectiveRequest.asset_id == asset.id).delete()
    visit_ids = [v.id for v in db.query(MaintenanceVisit).filter(MaintenanceVisit.branch_id == branch.id).all()]
    if visit_ids:
        item_ids = [i.id for i in db.query(MaintenanceVisitItem).filter(MaintenanceVisitItem.visit_id.in_(visit_ids)).all()]
        if item_ids:
            db.query(MaintenanceVisitPhoto).filter(MaintenanceVisitPhoto.item_id.in_(item_ids)).delete(synchronize_session=False)
        db.query(MaintenanceVisitChecklistEntry).filter(MaintenanceVisitChecklistEntry.visit_id.in_(visit_ids)).delete(synchronize_session=False)
        db.query(MaintenanceVisitItem).filter(MaintenanceVisitItem.visit_id.in_(visit_ids)).delete(synchronize_session=False)
        db.query(MaintenanceVisit).filter(MaintenanceVisit.id.in_(visit_ids)).delete(synchronize_session=False)
    db.query(Asset).filter(Asset.id == asset.id).delete()
    db.query(Branch).filter(Branch.id == branch.id).delete()
    db.query(User).filter(User.id.in_([admin.id, tecnico.id, otro_tecnico.id])).delete(synchronize_session=False)
    db.commit()


def auth_headers(email: str, password: str = "Qatest123!") -> dict:
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_INT01_login_valido_devuelve_token(seed):
    """POST /auth/login con credenciales validas contra Postgres real
    debe devolver 200 y un token JWT."""
    res = client.post("/auth/login", json={"email": seed["admin"].email, "password": "Qatest123!"})
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body and body["token_type"] == "bearer"


def test_INT02_crear_solicitud_persiste_en_bd(seed):
    """POST /correctiverequest/ debe crear un registro real en Postgres,
    verificable luego con un GET."""
    headers = auth_headers(seed["admin"].email)
    payload = {
        "asset_id": seed["asset"].id, "requester_id": seed["admin"].id,
        "assigned_id": seed["tecnico"].id, "description": "Impresora no enciende",
        "priority": "alta", "status": "abierta",
    }
    res = client.post("/correctiverequest/", json=payload, headers=headers)
    assert res.status_code == 200
    new_id = res.json()["id"]

    check = client.get(f"/correctiverequest/{new_id}", headers=headers)
    assert check.status_code == 200
    assert check.json()["description"] == "Impresora no enciende"


def test_INT03_tecnico_no_asignado_no_puede_ver_solicitud_ajena(seed):
    """Un tecnico que no es el asignado debe recibir 403 al intentar ver
    una solicitud de otro tecnico."""
    admin_headers = auth_headers(seed["admin"].email)
    payload = {
        "asset_id": seed["asset"].id, "requester_id": seed["admin"].id,
        "assigned_id": seed["tecnico"].id, "description": "Monitor con lineas",
        "priority": "media", "status": "abierta",
    }
    created = client.post("/correctiverequest/", json=payload, headers=admin_headers).json()

    other_headers = auth_headers(seed["otro_tecnico"].email)
    res = client.get(f"/correctiverequest/{created['id']}", headers=other_headers)
    assert res.status_code == 403


def test_INT04_crear_visita_con_equipos_y_checklist(seed):
    """POST /maintenance-visits/ debe crear la visita junto con sus
    equipos y checklist anidado en una sola transaccion real."""
    headers = auth_headers(seed["admin"].email)
    payload = {
        "branch_id": seed["branch"].id, "technician_id": seed["tecnico"].id,
        "visit_date": "2026-01-15", "status": "borrador",
        "items": [{
            "asset_id": seed["asset"].id, "equipment_type": "CPU Cliente",
            "identification_location": "Cliente 1",
            "checklist_entries": [{"category": "limpieza", "label": "Case", "checked": True}],
        }],
        "checklist_entries": [],
    }
    res = client.post("/maintenance-visits/", json=payload, headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["checklist_entries"][0]["label"] == "Case"
