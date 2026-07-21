from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password

db = SessionLocal()

existing_admin = db.query(User).filter(User.email == "admin@sgmb.com").first()

if not existing_admin:
    user = User(
        name="Administrador General",
        email="admin@sgmb.com",
        password_hash=hash_password("Admin123"),
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    print("Admin user created")
else:
    print("Admin already exists")

db.close()