"""
Concurrencia del chequeo preventivo (auditoria, punto 18).

Necesita PostgreSQL real (el candado es pg_advisory_xact_lock), asi que solo corre
si TEST_POSTGRES_URL apunta a una base de prueba DESECHABLE: el test crea y borra
todas las tablas. Nunca usar la base de desarrollo. En CI se define en el workflow.
"""
import os
import sys
import threading
import time
from datetime import date, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models import asset, assigned_task, branch, corrective_request, maintenance_visit, user  # noqa: F401
from app.models.branch import Branch
from app.models.maintenance_visit import MaintenanceVisit
from app.services import preventive_scheduler

TEST_POSTGRES_URL = os.environ.get("TEST_POSTGRES_URL")
pytestmark = pytest.mark.skipif(not TEST_POSTGRES_URL, reason="TEST_POSTGRES_URL no definida")


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


def test_SCH01_dos_corridas_simultaneas_crean_una_sola_visita(factory):
    results = _run_concurrently(factory, preventive_scheduler.run_preventive_check_locked)

    assert _pending_visits(factory) == 1
    # Una corrida crea la visita y la otra se salta porque el candado esta tomado
    assert sorted(results, key=lambda r: (r is not None, r)) == [None, 1]


def test_SCH02_sin_candado_la_carrera_duplica(factory):
    """Demuestra que el escenario de SCH01 reproduce el problema real: sin el
    candado, las dos corridas crean visita para la misma sucursal."""
    _run_concurrently(factory, preventive_scheduler.run_preventive_check)

    assert _pending_visits(factory) == 2
