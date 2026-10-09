"""
Concurrencia del chequeo preventivo (auditoria, punto 18).

Necesita PostgreSQL real (el candado es pg_advisory_xact_lock), asi que solo corre
si TEST_POSTGRES_URL apunta a una base de prueba DESECHABLE: el test crea y borra
todas las tablas. Nunca usar la base de desarrollo. En CI se define en el workflow.
"""
import asyncio
import os
import sys
import threading
import time
from datetime import date, timedelta

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models import asset, assigned_task, branch, corrective_request, maintenance_visit, user  # noqa: F401
from app.models.branch import Branch
from app.models.maintenance_visit import MaintenanceVisit
from app.database import get_db
from app.models.user import User
from app.routers import maintenance_visit as visit_router
from app.services import preventive_scheduler
from app.utils.dependencies import get_current_user

TEST_POSTGRES_URL = os.environ.get("TEST_POSTGRES_URL")
needs_postgres = pytest.mark.skipif(not TEST_POSTGRES_URL, reason="TEST_POSTGRES_URL no definida")


class SlowAddSession(Session):
    """Demora la creacion de la visita para que dos corridas coincidan siempre
    entre "hay visita pendiente?" y "crearla": hace la carrera determinista."""

    def add(self, instance, *args, **kwargs):
        if isinstance(instance, MaintenanceVisit):
            time.sleep(0.5)
        return super().add(instance, *args, **kwargs)


@pytest.fixture()
def factory():
    engine = create_engine(TEST_POSTGRES_URL)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    make = sessionmaker(bind=engine, class_=SlowAddSession)
    with make() as db:
        # Sucursal vencida: frecuencia de 30 dias y nunca visitada
        db.add(Branch(name="Sucursal vencida", is_active=True, maintenance_frequency_days=30))
        db.commit()
    yield make
    Base.metadata.drop_all(engine)
    engine.dispose()


def _run_concurrently(make, check_fn):
    barrier = threading.Barrier(2)
    results = []

    def worker():
        with make() as db:
            barrier.wait()
            results.append(check_fn(db))

    threads = [threading.Thread(target=worker) for _ in range(2)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return results


def _pending_visits(make):
    with make() as db:
        return db.query(MaintenanceVisit).filter(MaintenanceVisit.status == "programada").count()


@needs_postgres
def test_SCH01_dos_corridas_simultaneas_crean_una_sola_visita(factory):
    results = _run_concurrently(factory, preventive_scheduler.run_preventive_check_locked)

    assert _pending_visits(factory) == 1
    # Una corrida crea la visita y la otra se salta porque el candado esta tomado
    assert sorted(results, key=lambda r: (r is not None, r)) == [None, 1]


@needs_postgres
def test_SCH02_sin_candado_la_carrera_duplica(factory):
    """Demuestra que el escenario de SCH01 reproduce el problema real: sin el
    candado, las dos corridas crean visita para la misma sucursal."""
    _run_concurrently(factory, preventive_scheduler.run_preventive_check)

    assert _pending_visits(factory) == 2


def _check_preventive_client(make):
    app = FastAPI()
    app.include_router(visit_router.router)

    def db_override():
        with make() as db:
            yield db

    app.dependency_overrides[get_db] = db_override
    app.dependency_overrides[get_current_user] = lambda: User(id=1, name="Admin", email="a@t.com", password_hash="x", role="admin", is_active=True)
    return TestClient(app)


@needs_postgres
def test_SCH03_boton_manual_se_salta_si_otra_corrida_tiene_el_candado(factory):
    client = _check_preventive_client(factory)
    with factory() as holder:
        # Otra corrida en curso: transaccion abierta que tiene el candado
        holder.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": preventive_scheduler.PREVENTIVE_CHECK_LOCK_KEY})
        response = client.post("/maintenance-visits/check-preventive")
        holder.rollback()

    assert response.status_code == 200
    assert response.json() == {"created": 0, "skipped": True}
    assert _pending_visits(factory) == 0


@needs_postgres
def test_SCH04_boton_manual_crea_la_visita_con_el_candado_libre(factory):
    response = _check_preventive_client(factory).post("/maintenance-visits/check-preventive")

    assert response.json() == {"created": 1, "skipped": False}
    assert _pending_visits(factory) == 1


def test_SCH05_el_loop_usa_la_version_con_candado(monkeypatch):
    calls = []
    monkeypatch.setattr(preventive_scheduler, "SessionLocal", lambda: type("FakeDb", (), {"close": lambda self: None})())
    monkeypatch.setattr(preventive_scheduler, "run_preventive_check_locked", lambda db: calls.append("locked") or 0)
    monkeypatch.setattr(preventive_scheduler, "run_preventive_check", lambda db: calls.append("unlocked") or 0)

    async def stop_after_first_run(_seconds):
        raise asyncio.CancelledError

    monkeypatch.setattr(preventive_scheduler.asyncio, "sleep", stop_after_first_run)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(preventive_scheduler.preventive_check_loop())

    assert calls == ["locked"]
