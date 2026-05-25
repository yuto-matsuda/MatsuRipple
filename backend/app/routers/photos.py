import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List, Optional
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()
BUCKET = "photos"


@router.get("/me", response_model=List[schemas.PhotoResponse])
def list_my_photos(current_user: schemas.UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("photos")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return [schemas.PhotoResponse.model_validate(p) for p in result.data]


@router.post("/", response_model=schemas.PhotoResponse, status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    festival_id: Optional[int] = Form(None),
    group_id: Optional[int] = Form(None),
    is_public: bool = Form(True),
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image files only")

    # group_id が指定された場合、メンバーかどうか確認
    if group_id is not None:
        sb = get_supabase()
        if not sb.table("group_members").select("id").eq("group_id", group_id).eq("user_id", current_user.id).execute().data:
            raise HTTPException(status_code=403, detail="Not a member of this group")

    ext = os.path.splitext(file.filename or "photo")[1] or ".jpg"
    storage_path = f"{uuid.uuid4()}{ext}"
    content = await file.read()

    sb = get_supabase()
    sb.storage.from_(BUCKET).upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type},
    )
    public_url: str = sb.storage.from_(BUCKET).get_public_url(storage_path)

    result = sb.table("photos").insert({
        "festival_id": festival_id,
        "group_id": group_id,
        "filename": public_url,
        "original_name": file.filename,
        "is_public": is_public,
        "user_id": current_user.id,
    }).execute()
    return schemas.PhotoResponse.model_validate(result.data[0])


@router.patch("/{photo_id}", response_model=schemas.PhotoResponse)
def update_photo(
    photo_id: int,
    body: schemas.PhotoUpdate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    photo_result = sb.table("photos").select("user_id").eq("id", photo_id).execute()
    if not photo_result.data:
        raise HTTPException(status_code=404, detail="Photo not found")
    if photo_result.data[0]["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot edit another user's photo")
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = sb.table("photos").update(data).eq("id", photo_id).execute()
    return schemas.PhotoResponse.model_validate(result.data[0])


@router.get("/", response_model=List[schemas.PhotoResponse])
def list_photos(festival_id: Optional[int] = None):
    sb = get_supabase()
    query = sb.table("photos").select("*").eq("is_public", True).order("created_at", desc=True)
    if festival_id is not None:
        query = query.eq("festival_id", festival_id)
    result = query.execute()
    return [schemas.PhotoResponse.model_validate(p) for p in result.data]
