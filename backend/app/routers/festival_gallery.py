import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()
BUCKET = "festival-gallery"


@router.post("/", response_model=schemas.FestivalGalleryPhotoResponse, status_code=201)
async def upload_gallery_photo(
    file: UploadFile = File(...),
    festival_id: int = Form(...),
    order_index: int = Form(0),
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image files only")

    sb = get_supabase()
    if not sb.table("festivals").select("id").eq("id", festival_id).maybe_single().execute().data:
        raise HTTPException(status_code=404, detail="Festival not found")

    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    storage_path = f"{uuid.uuid4()}{ext}"
    content = await file.read()

    sb.storage.from_(BUCKET).upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type},
    )
    public_url: str = sb.storage.from_(BUCKET).get_public_url(storage_path)

    result = sb.table("festival_gallery").insert({
        "festival_id": festival_id,
        "filename": public_url,
        "original_name": file.filename,
        "order_index": order_index,
        "user_id": current_user.id,
    }).execute()
    return schemas.FestivalGalleryPhotoResponse.model_validate(result.data[0])


@router.get("/", response_model=List[schemas.FestivalGalleryPhotoResponse])
def list_gallery_photos(festival_id: int):
    sb = get_supabase()
    result = (
        sb.table("festival_gallery")
        .select("*")
        .eq("festival_id", festival_id)
        .order("order_index")
        .execute()
    )
    return [schemas.FestivalGalleryPhotoResponse.model_validate(p) for p in result.data]
