from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import aiofiles
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()
UPLOAD_DIR = "uploads"


@router.post("/", response_model=schemas.PhotoResponse, status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    festival_id: Optional[int] = Form(None),
    is_public: bool = Form(True),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image files only")
    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    content = await file.read()
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)
    db_photo = models.Photo(
        festival_id=festival_id,
        filename=filename,
        original_name=file.filename,
        is_public=is_public,
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo


@router.get("/", response_model=List[schemas.PhotoResponse])
def list_photos(festival_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Photo).filter(models.Photo.is_public == True)
    if festival_id is not None:
        query = query.filter(models.Photo.festival_id == festival_id)
    return query.order_by(models.Photo.created_at.desc()).all()
