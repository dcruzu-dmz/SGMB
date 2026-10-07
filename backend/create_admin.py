import os
from getpass import getpass

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password

ADMIN_EMAIL = "admin@sgmb.com"

db = SessionLocal()

existing_admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()

if not existing_admin:
    # La contraseña nunca va en el codigo: se toma de ADMIN_PASSWORD o se pide por consola
    password = os.environ.get("ADMIN_PASSWORD") or getpass(f"Contraseña para {ADMIN_EMAIL}: ")
    if len(password) < 8:
        db.close()
        raise SystemExit("La contraseña debe tener al menos 8 caracteres")

    user = User(
        name="Administrador General",
        email=ADMIN_EMAIL,
        password_hash=hash_password(password),
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    print("Admin user created")
else:
    print("Admin already exists")

db.close()
