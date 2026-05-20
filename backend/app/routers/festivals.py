from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()


@router.get("/me", response_model=List[schemas.FestivalResponse])
def list_my_festivals(current_user: schemas.UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("festivals")
        .select("*")
        .eq("user_id", current_user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return [schemas.FestivalResponse.model_validate(f) for f in result.data]


@router.get("/", response_model=List[schemas.FestivalResponse])
def list_festivals():
    sb = get_supabase()
    result = sb.table("festivals").select("*").order("created_at", desc=True).execute()
    return [schemas.FestivalResponse.model_validate(f) for f in result.data]


@router.get("/{festival_id}", response_model=schemas.FestivalResponse)
def get_festival(festival_id: int):
    sb = get_supabase()
    result = sb.table("festivals").select("*").eq("id", festival_id).maybe_single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Festival not found")
    return schemas.FestivalResponse.model_validate(result.data)


@router.post("/", response_model=schemas.FestivalResponse, status_code=201)
def create_festival(
    festival: schemas.FestivalCreate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    data = {k: v for k, v in festival.model_dump().items() if v is not None}
    data["user_id"] = current_user.id
    result = sb.table("festivals").insert(data).execute()
    return schemas.FestivalResponse.model_validate(result.data[0])


@router.put("/{festival_id}", response_model=schemas.FestivalResponse)
def update_festival(
    festival_id: int,
    festival: schemas.FestivalCreate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    existing = sb.table("festivals").select("user_id").eq("id", festival_id).maybe_single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Festival not found")
    if existing.data["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    data = {k: v for k, v in festival.model_dump().items() if v is not None}
    result = sb.table("festivals").update(data).eq("id", festival_id).execute()
    return schemas.FestivalResponse.model_validate(result.data[0])


@router.delete("/{festival_id}", status_code=204)
def delete_festival(
    festival_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    existing = sb.table("festivals").select("user_id").eq("id", festival_id).maybe_single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Festival not found")
    if existing.data["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    sb.table("festivals").delete().eq("id", festival_id).execute()
