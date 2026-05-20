from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, festivals, participants, photos, festival_gallery

app = FastAPI(title="MatsuRipple API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(festivals.router, prefix="/festivals", tags=["festivals"])
app.include_router(participants.router, prefix="/participants", tags=["participants"])
app.include_router(photos.router, prefix="/photos", tags=["photos"])
app.include_router(festival_gallery.router, prefix="/festival-gallery", tags=["festival-gallery"])
