import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import auth, festivals, participants, photos

Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="MatsuRipple API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(festivals.router, prefix="/festivals", tags=["festivals"])
app.include_router(participants.router, prefix="/participants", tags=["participants"])
app.include_router(photos.router, prefix="/photos", tags=["photos"])
