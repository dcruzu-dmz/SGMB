from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, asset, branch
from app.models.user import User
from app.models.asset import Asset
from app.models.branch import Branch


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

  
@app.get("/")
def read_root():
    return {"message": "Welcome to the SGMB API!"}
