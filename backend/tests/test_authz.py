"""
Pruebas de autorizacion por rol y validacion de archivos subidos (SPEC.md).
Usa una app de prueba con solo los routers involucrados y SQLite en memoria:
no importa app.main, asi que nunca toca la base de datos real.
"""
import sys
import os
from datetime import date

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.models.branch import Branch
from app.models.asset import Asset
from app.models.corrective_request import CorrectiveRequest
from app.models.assigned_task import AssignedTask  # noqa: F401  (registra la tabla)
from app.models.maintenance_visit import MaintenanceVisit, MaintenanceVisitItem
from app.routers import corrective_request as request_router
from app.routers import maintenance_visit as visit_router

PDF_BYTES = b"%PDF-1.4\n%fake\n"
PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32


@pytest.fixture()
def env(tmp_path, monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    db = sessionmaker(bind=engine)()

    users = {
        role: User(name=role, email=f"{role}@t.com", password_hash="x", role=role, is_active=True)
        for role in ("admin", "tecnico", "solicitante")
    }
    users["otro_tecnico"] = User(name="otro", email="otro@t.com", password_hash="x", role="tecnico", is_active=True)
    users["otro_solicitante"] = User(name="otro_s", email="os@t.com", password_hash="x", role="solicitante", is_active=True)
    db.add_all(users.values())
    branch = Branch(name="Central", is_active=True)
    other_branch = Branch(name="Norte", is_active=True)
    db.add_all([branch, other_branch])
    db.flush()
    asset = Asset(name="PC", type="computadora", branch_id=branch.id)
    db.add(asset)
    db.flush()

    visit = MaintenanceVisit(branch_id=branch.id, technician_id=users["tecnico"].id, visit_date=date.today(), status="borrador")
    db.add(visit)
    db.flush()
    item = MaintenanceVisitItem(visit_id=visit.id, equipment_type="computadora")
    own_request = CorrectiveRequest(asset_id=asset.id, requester_id=users["solicitante"].id,
                                    assigned_id=users["tecnico"].id, description="falla", priority="media", status="abierta")
    foreign_request = CorrectiveRequest(asset_id=asset.id, requester_id=users["otro_solicitante"].id,
                                        assigned_id=users["otro_tecnico"].id, description="ajena", priority="baja", status="abierta")
    db.add_all([item, own_request, foreign_request])
    db.commit()

    monkeypatch.setattr(visit_router, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(visit_router, "REPORTS_UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(request_router, "REPORTS_UPLOAD_DIR", str(tmp_path))

    app = FastAPI()
    app.include_router(visit_router.router)
    app.include_router(request_router.router)
    app.dependency_overrides[get_db] = lambda: db
    current = {"user": users["admin"]}
    app.dependency_overrides[get_current_user] = lambda: current["user"]
    client = TestClient(app)

    def as_role(name):
        current["user"] = users[name]
        return client

    yield {
        "as": as_role, "db": db, "users": users, "visit": visit, "item": item,
        "own": own_request, "foreign": foreign_request, "branch2": other_branch, "dir": tmp_path,
    }
    db.close()


# --- Visitas ---------------------------------------------------------------

def test_solicitante_no_puede_modificar_visitas(env):
    c = env["as"]("solicitante")
    vid, iid = env["visit"].id, env["item"].id
    assert c.get(f"/maintenance-visits/{vid}").status_code == 200  # lectura permitida
    assert c.put(f"/maintenance-visits/{vid}", json={"general_observations": "x"}).status_code == 403
    assert c.post(f"/maintenance-visits/items/{iid}/photos",
                  files=[("files", ("a.png", PNG_BYTES, "image/png"))]).status_code == 403
    assert c.delete(f"/maintenance-visits/{vid}/signed-report").status_code == 403


def test_tecnico_solo_edita_sus_visitas_y_no_se_reasigna(env):
    vid = env["visit"].id
    assert env["as"]("otro_tecnico").put(f"/maintenance-visits/{vid}", json={"general_observations": "x"}).status_code == 403

    c = env["as"]("tecnico")
    tecnico_id = env["users"]["tecnico"].id
    # reenviar el mismo technician_id (como hace el formulario) no cuenta como cambio
    ok = c.put(f"/maintenance-visits/{vid}", json={"general_observations": "ok", "technician_id": tecnico_id})
    assert ok.status_code == 200
    assert c.put(f"/maintenance-visits/{vid}", json={"technician_id": env["users"]["otro_tecnico"].id}).status_code == 403
    assert c.put(f"/maintenance-visits/{vid}", json={"branch_id": env["branch2"].id}).status_code == 403


# --- Solicitudes correctivas -------------------------------------------------

def test_solicitante_no_puede_falsificar_requester_id(env):
    c = env["as"]("solicitante")
    res = c.post("/correctiverequest/", json={
        "asset_id": env["own"].asset_id, "requester_id": env["users"]["otro_solicitante"].id,
        "description": "nueva", "priority": "alta",
    })
    assert res.status_code == 200
    assert res.json()["requester_id"] == env["users"]["solicitante"].id


def test_solicitante_solo_ve_y_edita_sus_solicitudes(env):
    c = env["as"]("solicitante")
    ids = {r["id"] for r in c.get("/correctiverequest/").json()}
    assert ids == {env["own"].id}
    assert c.get(f"/correctiverequest/{env['foreign'].id}").status_code == 403
    assert c.put(f"/correctiverequest/{env['foreign'].id}", json={"description": "x"}).status_code == 403
    assert c.put(f"/correctiverequest/{env['own'].id}", json={"description": "mejor descrita"}).status_code == 200
    assert c.put(f"/correctiverequest/{env['own'].id}", json={"status": "cerrada"}).status_code == 403
    assert c.patch(f"/correctiverequest/{env['own'].id}", params={"status": "cerrada"}).status_code == 403
    assert c.post(f"/correctiverequest/{env['own'].id}/signed-report",
                  files={"file": ("h.pdf", PDF_BYTES, "application/pdf")}).status_code == 403


def test_tecnico_no_puede_reasignar_solicitud(env):
    c = env["as"]("tecnico")
    rid = env["own"].id
    assert c.put(f"/correctiverequest/{rid}", json={"assigned_id": env["users"]["otro_tecnico"].id}).status_code == 403
    assert c.put(f"/correctiverequest/{rid}", json={"status": "en_proceso", "solution": "revisado"}).status_code == 200
    assert c.patch(f"/correctiverequest/{env['foreign'].id}", params={"status": "cerrada"}).status_code == 403


# --- Archivos ----------------------------------------------------------------

@pytest.mark.parametrize("name,content,mime,expected", [
    ("x.html", b"<script>alert(1)</script>", "text/html", 400),
    ("x.png", b"<script>alert(1)</script>", "image/png", 400),  # extension valida, contenido falso
    ("x.svg", b"<svg onload=alert(1)>", "image/svg+xml", 400),
    ("x.pdf", PDF_BYTES + b"0" * (10 * 1024 * 1024), "application/pdf", 413),
    ("hoja.PDF", PDF_BYTES, "application/pdf", 200),
])
def test_subida_hoja_firmada_valida_tipo_y_tamano(env, name, content, mime, expected):
    c = env["as"]("tecnico")
    res = c.post(f"/correctiverequest/{env['own'].id}/signed-report", files={"file": (name, content, mime)})
    assert res.status_code == expected
    stored = list(env["dir"].iterdir())
    if expected == 200:
        assert len(stored) == 1 and stored[0].suffix == ".pdf"
    else:
        assert stored == []  # no quedan archivos parciales


def test_fotos_rechazadas_no_dejan_huerfanas(env):
    c = env["as"]("tecnico")
    res = c.post(f"/maintenance-visits/items/{env['item'].id}/photos", files=[
        ("files", ("ok.png", PNG_BYTES, "image/png")),
        ("files", ("mal.html", b"<html>", "text/html")),
    ])
    assert res.status_code == 400
    assert list(env["dir"].iterdir()) == []
