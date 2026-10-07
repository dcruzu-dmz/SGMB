from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import PasswordReset, UserCreate, UserResponse, UserUpdate
from app.utils.security import hash_password
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])


def _visible_user(user: User, current_user: User) -> UserResponse:
    """Los correos solo los ve un admin; el resto de pantallas solo necesita nombre y rol."""
    data = UserResponse.model_validate(user)
    if current_user.role != "admin":
        data = data.model_copy(update={"email": None})
    return data


def _ensure_admin_access_kept(user: User, new_role: str, new_active: bool, current_user: User, db: Session) -> None:
    """Evita que un admin se bloquee a si mismo o que el sistema quede sin admins activos."""
    if user.id == current_user.id:
        if not new_active:
            raise HTTPException(status_code=409, detail="No puedes desactivar tu propia cuenta")
        if new_role != user.role:
            raise HTTPException(status_code=409, detail="No puedes cambiar tu propio rol")

    loses_admin = user.role == "admin" and user.is_active and (new_role != "admin" or not new_active)
    if loses_admin:
        other_admins = db.query(User).filter(
            User.role == "admin", User.is_active.is_(True), User.id != user.id
        ).count()
        if other_admins == 0:
            raise HTTPException(status_code=409, detail="Debe quedar al menos un administrador activo")


# Crear usuario
@router.post("/", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=data.is_active
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Obtener usuarios
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return [_visible_user(user, current_user) for user in db.query(User).all()]


# Obtener usuario por ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return _visible_user(user, current_user)


# Editar usuario
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="El correo ya está en uso")

    _ensure_admin_access_kept(user, data.role, data.is_active, current_user, db)

    user.name = data.name
    user.email = data.email
    user.role = data.role
    user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    return user


# Desactivar / activar usuario
@router.patch("/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    _ensure_admin_access_kept(user, user.role, is_active, current_user, db)

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


# Cambiar la contraseña de un usuario (el admin tambien la usa para su propia cuenta)
@router.patch("/{user_id}/password", status_code=status.HTTP_204_NO_CONTENT)
def reset_user_password(
    user_id: int,
    data: PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = hash_password(data.new_password)
    db.commit()
