"""
Retomar borradores de visita: PUT /maintenance-visits/{id} con `items` y
`checklist_entries` sincroniza en una sola transaccion (actualiza los que traen
id, crea los nuevos y borra los que ya no vienen), sin duplicar.
"""
import os
import sys
from datetime import date

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db
from app.models import asset, assigned_task, branch, corrective_request  # noqa: F401
from app.models.branch import Branch
from app.models.maintenance_visit import MaintenanceVisit, MaintenanceVisitItem, MaintenanceVisitPhoto
from app.models.user import User
from app.routers import maintenance_visit as visit_router
from app.utils.dependencies import get_current_user


@pytest.fixture()
def env(tmp_path, monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    tecnico = User(name="Tec", email="tec@t.com", password_hash="x", role="tecnico", is_active=True)
    sucursal = Branch(name="Central", is_active=True)
    db.add_all([tecnico, sucursal]); db.commit()

    monkeypatch.setattr(visit_router, "UPLOAD_DIR", str(tmp_path))
    app = FastAPI(); app.include_router(visit_router.router)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: tecnico
    client = TestClient(app)

    # Borrador ya guardado: 2 equipos con checklist, 1 foto en el segundo, checklist general
    visit = MaintenanceVisit(branch_id=sucursal.id, technician_id=tecnico.id, visit_date=date.today(), status="borrador")
    db.add(visit); db.commit()
    saved = client.put(f"/maintenance-visits/{visit.id}", json={
        "items": [
            {"equipment_type": "Monitor", "working": True, "checklist_entries": [{"category": "limpieza", "label": "Pantalla", "checked": False}]},
            {"equipment_type": "Teclado", "working": True, "checklist_entries": []},
        ],
        "checklist_entries": [{"category": "revision", "label": "DVR", "checked": False}],
    })
    assert saved.status_code == 200, saved.text
    photo_file = tmp_path / "foto.jpg"; photo_file.write_bytes(b"x")
    db.add(MaintenanceVisitPhoto(item_id=saved.json()["items"][1]["id"], file_path="/uploads/visit-photos/foto.jpg")); db.commit()

    yield {"client": client, "db": db, "visit": visit, "saved": saved.json(), "photo_file": photo_file, "sucursal": sucursal}
    db.close()


def test_SYNC01_guardar_de_nuevo_actualiza_crea_y_borra_sin_duplicar(env):
    client, saved = env["client"], env["saved"]
    monitor, teclado = saved["items"]
    general = saved["checklist_entries"]
    general_only = [e for e in general if e["item_id"] is None]

    res = client.put(f"/maintenance-visits/{env['visit'].id}", json={
        "items": [
            # Monitor: se actualiza (deja de funcionar y se marca su checklist)
            {"id": monitor["id"], "equipment_type": "Monitor", "working": False,
             "checklist_entries": [{"id": monitor["checklist_entries"][0]["id"], "category": "limpieza", "label": "Pantalla", "checked": True}]},
            # Equipo nuevo
            {"equipment_type": "Mouse", "working": True, "checklist_entries": []},
            # Teclado no viene: se borra con su foto
        ],
        "checklist_entries": [{"id": general_only[0]["id"], "category": "revision", "label": "DVR", "checked": True}],
    })

    assert res.status_code == 200, res.text
    body = res.json()
    assert [i["equipment_type"] for i in body["items"]] == ["Monitor", "Mouse"]
    assert body["items"][0]["id"] == monitor["id"]
    assert body["items"][0]["working"] is False
    assert body["items"][0]["checklist_entries"][0]["checked"] is True
    assert len(body["items"][0]["checklist_entries"]) == 1
    general_after = [e for e in body["checklist_entries"] if e["item_id"] is None]
    assert len(general_after) == 1 and general_after[0]["checked"] is True
    # El teclado y su foto ya no existen (ni en la base ni en disco)
    assert env["db"].get(MaintenanceVisitItem, teclado["id"]) is None
    assert env["db"].query(MaintenanceVisitPhoto).count() == 0
    assert not env["photo_file"].exists()


def test_SYNC02_no_acepta_equipos_de_otra_visita(env):
    db = env["db"]
    otra = MaintenanceVisit(branch_id=env["sucursal"].id, technician_id=None, visit_date=date.today(), status="borrador")
    db.add(otra); db.commit()
    ajeno = MaintenanceVisitItem(visit_id=otra.id, equipment_type="UPS"); db.add(ajeno); db.commit()

    res = env["client"].put(f"/maintenance-visits/{env['visit'].id}", json={
        "items": [{"id": ajeno.id, "equipment_type": "UPS", "checklist_entries": []}],
    })

    assert res.status_code == 400
    assert db.get(MaintenanceVisitItem, ajeno.id).visit_id == otra.id


def test_SYNC03_sin_items_el_put_no_toca_los_equipos(env):
    res = env["client"].put(f"/maintenance-visits/{env['visit'].id}", json={"general_observations": "solo cabecera"})

    assert res.status_code == 200
    assert len(res.json()["items"]) == 2
