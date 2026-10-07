"""
Pruebas unitarias (Tipo = U) para la documentacion 4.4.
Total en este archivo: 3 de las 10 pruebas del entregable final.
"""
import sys
import os
from datetime import date, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.security import hash_password, verify_password
from app.utils.dependencies import require_roles
from app.models.user import User
from app.database import Base
from app.models.branch import Branch
from app.models.asset import Asset
from app.models.corrective_request import CorrectiveRequest
from app.models.maintenance_visit import (
    MaintenanceVisit, MaintenanceVisitItem, MaintenanceVisitChecklistEntry, MaintenanceVisitPhoto,
)
from app.services.preventive_scheduler import run_preventive_check


def test_U01_hash_and_verify_password_roundtrip():
    """El hash generado nunca es igual al texto plano, y verify_password
    reconoce la contrasena correcta contra ese hash."""
    plain = "MiClaveSegura123"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True


def test_U02_require_roles_denies_non_matching_role():
    """require_roles('admin') debe lanzar HTTPException 403 para un
    usuario con rol tecnico."""
    dependency = require_roles("admin")
    user = User(name="Prueba", email="prueba@sgmb.com", password_hash="x", role="tecnico", is_active=True)
    with pytest.raises(HTTPException) as exc_info:
        dependency(current_user=user)
    assert exc_info.value.status_code == 403


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine, tables=[Branch.__table__, MaintenanceVisit.__table__])
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


def test_U03_preventive_check_crea_visita_programada_si_vencida(db_session):
    """Debe generarse una visita en estado 'programada' cuando la ultima
    visita completada ya supero la frecuencia de mantenimiento."""
    branch = Branch(name="Galerias Test", address="Zona 10", phone="87654321",
                     is_active=True, maintenance_frequency_days=30)
    db_session.add(branch)
    db_session.flush()

    db_session.add(MaintenanceVisit(
        branch_id=branch.id, technician_id=None,
        visit_date=date.today() - timedelta(days=60), status="completado",
    ))
    db_session.commit()

    created = run_preventive_check(db_session)
    assert created == 1
