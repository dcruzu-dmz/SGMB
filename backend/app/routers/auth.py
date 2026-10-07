import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserResponse
from app.utils.dependencies import get_current_user
from app.utils.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

MAX_FAILED_LOGINS = 5
FAILED_LOGIN_WINDOW_SECONDS = 15 * 60

# ponytail: contador en memoria, se reinicia con el servidor y no se comparte entre
# workers; si se corre con varios workers o detras de un proxy, moverlo a Redis/BD
# y tomar la IP real de X-Forwarded-For.
_failed_logins: dict[tuple[str, str], list[float]] = defaultdict(list)


def _recent_failures(key: tuple[str, str]) -> list[float]:
    cutoff = time.monotonic() - FAILED_LOGIN_WINDOW_SECONDS
    _failed_logins[key] = [t for t in _failed_logins[key] if t > cutoff]
    return _failed_logins[key]


@router.post("/login", response_model=Token)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    key = (request.client.host if request.client else "", data.email.lower())
    if len(_recent_failures(key)) >= MAX_FAILED_LOGINS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo."
        )

    user = db.query(User).filter(User.email == data.email).first()

    # La contraseña se valida antes de revisar is_active: asi un intento sin la
    # contraseña correcta no revela si la cuenta existe o esta inactiva.
    if not user or not verify_password(data.password, user.password_hash):
        _failed_logins[key].append(time.monotonic())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    _failed_logins.pop(key, None)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    token = create_access_token({
        "sub": user.email,
        "role": user.role
        })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }