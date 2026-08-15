import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth, users, asset, branch, corrective_request, preventive_maintenance, maintenance_visit
from app.models.user import User
from app.models.asset import Asset
from app.models.branch import Branch
from app.models.corrective_request import CorrectiveRequest
from app.models.preventive_maintenance import PreventiveMaintenance
from app.models.maintenance_visit import (
    MaintenanceVisit,
    MaintenanceVisitItem,
    MaintenanceVisitChecklistEntry,
    MaintenanceVisitPhoto,
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="SGMB API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(asset.router)
app.include_router(branch.router)
app.include_router(corrective_request.router)
app.include_router(preventive_maintenance.router)
app.include_router(maintenance_visit.router)

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/")
def read_root():
    return {"message": "Welcome to the SGMB API!"}
