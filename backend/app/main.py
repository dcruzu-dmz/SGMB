import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, users, asset, branch, corrective_request, maintenance_visit, assigned_task
from app.services.preventive_scheduler import preventive_check_loop
# Registra todos los modelos: las relaciones entre ellos se resuelven por nombre.
# El esquema de la base lo crean y actualizan las migraciones (alembic upgrade head).
from app.models.user import User
from app.models.asset import Asset
from app.models.branch import Branch
from app.models.corrective_request import CorrectiveRequest
from app.models.maintenance_visit import (
    MaintenanceVisit,
    MaintenanceVisitItem,
    MaintenanceVisitChecklistEntry,
    MaintenanceVisitPhoto,
)
from app.models.assigned_task import AssignedTask


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = asyncio.create_task(preventive_check_loop())
    yield
    scheduler.cancel()


app = FastAPI(title="SGMB API", version="1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(asset.router)
app.include_router(branch.router)
app.include_router(corrective_request.router)
app.include_router(maintenance_visit.router)
app.include_router(assigned_task.router)

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
def read_root():
    return {"message": "Welcome to the SGMB API!"}
