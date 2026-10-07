"""
Pruebas UNITARIAS (Tipo = U) — segunda tanda, exactamente 10 pruebas.

Reglas seguidas:
- Cada prueba ejercita UNA funcion Python aislada.
- Ninguna prueba abre una base de datos real, hace una peticion HTTP,
  ni usa un navegador. Donde la funcion real requiere una sesion de base
  de datos (run_preventive_check), se usa un mock (unittest.mock) en vez
  de una base de datos real.
- Distribucion: Auth (3), Control de Acceso (2), Visitas (3),
  Solicitudes Correctivas (2) = 10 en total.
"""
import sys
import os
from unittest.mock import MagicMock
from datetime import date, timedelta

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.security import hash_password, verify_password, verify_token
from app.utils.dependencies import require_roles
from app.models.user import User
from app.models.branch import Branch
from app.models.asset import Asset
from app.models.maintenance_visit import (
    MaintenanceVisit, MaintenanceVisitItem, MaintenanceVisitChecklistEntry, MaintenanceVisitPhoto,
)
from app.models.corrective_request import CorrectiveRequest
from app.schemas.corrective_request import CorrectiveRequestCreate
from app.routers.maintenance_visit import _check_visit_write
from app.routers.corrective_request import _check_request_read
from app.services.preventive_scheduler import run_preventive_check


# ---------------------------------------------------------------------
# Modulo: Auth (backend/app/utils/security.py)
# ---------------------------------------------------------------------

def test_AUTH_U01_hash_and_verify_password_roundtrip():
    """hash_password nunca devuelve el texto plano, y verify_password
    reconoce la contrasena correcta contra ese hash."""
    plain = "MiClaveSegura123"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True


def test_AUTH_U02_verify_password_rejects_wrong_password():
    """verify_password debe rechazar una contrasena incorrecta."""
    hashed = hash_password("ClaveCorrecta1")
    assert verify_password("ClaveIncorrecta9", hashed) is False


def test_AUTH_U03_verify_token_returns_none_for_invalid_token():
    """verify_token debe devolver None (no lanzar excepcion) ante un
    token invalido o manipulado."""
    assert verify_token("esto-no-es-un-jwt-valido") is None


# ---------------------------------------------------------------------
# Modulo: Control de Acceso (backend/app/utils/dependencies.py)
# ---------------------------------------------------------------------

def _fake_user(role: str) -> User:
    return User(name="Prueba", email="prueba@sgmb.com", password_hash="x", role=role, is_active=True)


def test_RBAC_U01_require_roles_allows_matching_role():
    """require_roles('admin') debe permitir el acceso a un usuario admin."""
    dependency = require_roles("admin")
    user = _fake_user("admin")
    assert dependency(current_user=user) is user


def test_RBAC_U02_require_roles_denies_non_matching_role():
    """require_roles('admin') debe lanzar HTTPException 403 para un
    usuario con rol tecnico."""
    dependency = require_roles("admin")
    user = _fake_user("tecnico")
    with pytest.raises(HTTPException) as exc_info:
        dependency(current_user=user)
    assert exc_info.value.status_code == 403


# ---------------------------------------------------------------------
# Modulo: Visitas de Mantenimiento
# ---------------------------------------------------------------------

def test_VIS_U01_check_visit_write_permite_al_tecnico_asignado():
    """_check_visit_write no debe lanzar excepcion cuando el tecnico
    autenticado es el mismo asignado a la visita."""
    tecnico = _fake_user("tecnico")
    tecnico.id = 5
    visit = MaintenanceVisit(branch_id=1, technician_id=5, visit_date=date.today())
    _check_visit_write(visit, tecnico)  # no debe lanzar


def test_VIS_U02_check_visit_write_deniega_a_tecnico_no_asignado():
    """_check_visit_write debe lanzar HTTPException 403 cuando el
    tecnico autenticado no es el asignado a la visita."""
    tecnico = _fake_user("tecnico")
    tecnico.id = 5
    visit = MaintenanceVisit(branch_id=1, technician_id=99, visit_date=date.today())
    with pytest.raises(HTTPException) as exc_info:
        _check_visit_write(visit, tecnico)
    assert exc_info.value.status_code == 403


def test_VIS_U03_preventive_check_no_genera_visita_si_no_esta_vencida():
    """run_preventive_check no debe crear ninguna visita cuando la
    ultima visita completada de la sucursal aun no vence. Se usa un
    mock de la sesion de base de datos (sin base de datos real)."""
    branch = Branch(id=1, name="Sucursal Mock", maintenance_frequency_days=30, is_active=True)
    last_visit = MaintenanceVisit(branch_id=1, visit_date=date.today() - timedelta(days=5), status="completado")

    branches_chain = MagicMock()
    branches_chain.filter.return_value = branches_chain
    branches_chain.all.return_value = [branch]

    visits_chain = MagicMock()
    visits_chain.filter.return_value = visits_chain
    visits_chain.order_by.return_value = visits_chain
    visits_chain.first.return_value = last_visit

    db = MagicMock()
    db.query.side_effect = lambda model: branches_chain if model is Branch else visits_chain

    created = run_preventive_check(db)

    assert created == 0
    db.commit.assert_not_called()


# ---------------------------------------------------------------------
# Modulo: Solicitudes Correctivas
# ---------------------------------------------------------------------

def test_SOL_U01_correctiverequestcreate_requires_description():
    """CorrectiveRequestCreate debe rechazar la creacion si falta el
    campo 'description' (validacion pura de Pydantic, sin base de datos)."""
    with pytest.raises(ValidationError):
        CorrectiveRequestCreate(asset_id=1, requester_id=1, priority="alta")


def test_SOL_U02_check_request_read_deniega_a_tecnico_no_asignado():
    """_check_request_read debe lanzar HTTPException 403 cuando el
    tecnico autenticado no es el asignado a la solicitud."""
    tecnico = _fake_user("tecnico")
    tecnico.id = 7
    request = CorrectiveRequest(asset_id=1, requester_id=1, assigned_id=99, description="x", priority="alta")
    with pytest.raises(HTTPException) as exc_info:
        _check_request_read(request, tecnico)
    assert exc_info.value.status_code == 403
