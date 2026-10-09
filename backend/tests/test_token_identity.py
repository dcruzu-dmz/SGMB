"""
Identidad del token (revision de usuarios, hallazgo 4): el token identifica al
usuario por su id, que nunca cambia ni se reutiliza, y no por su correo.
"""
import os
import sys

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models import asset, assigned_task, branch, corrective_request, maintenance_visit  # noqa: F401
from app.models.user import User
from app.routers.auth import login
from app.schemas.auth import LoginRequest
from app.utils.dependencies import get_current_user
from app.utils.security import create_access_token, hash_password


class FakeRequest:
    client = None


@pytest.fixture()
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def _user_for(token: str, db) -> User:
    return get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=token), db)


def test_TOK01_token_de_login_sigue_identificando_al_usuario_si_su_correo_se_reasigna(db):
    ana = User(name="Ana", email="ana@sgmb.com", password_hash=hash_password("Clave-Ana-1"), role="tecnico", is_active=True)
    db.add(ana); db.commit()
    token = login(LoginRequest(email="ana@sgmb.com", password="Clave-Ana-1"), FakeRequest(), db)["access_token"]

    # El admin le cambia el correo a Ana y despues crea otro usuario con el correo viejo
    ana.email = "ana.lopez@sgmb.com"; db.commit()
    otro = User(name="Otro", email="ana@sgmb.com", password_hash="x", role="admin", is_active=True)
    db.add(otro); db.commit()

    # El token de Ana sigue siendo de Ana: no autentica al usuario nuevo
    assert _user_for(token, db).id == ana.id


def test_TOK02_token_antiguo_con_correo_en_sub_se_rechaza(db):
    db.add(User(name="Ana", email="ana@sgmb.com", password_hash="x", role="tecnico", is_active=True)); db.commit()
    old_token = create_access_token({"sub": "ana@sgmb.com", "role": "tecnico"})

    with pytest.raises(HTTPException) as exc:
        _user_for(old_token, db)
    assert exc.value.status_code == 401
