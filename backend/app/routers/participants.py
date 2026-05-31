from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()


@router.post("/", response_model=schemas.ParticipantResponse, status_code=201)
def register_participant(participant: schemas.ParticipantCreate):
    sb = get_supabase()
    if not sb.table("festivals").select("id").eq("id", participant.festival_id).execute().data:
        raise HTTPException(status_code=404, detail="Festival not found")
    data = participant.model_dump()
    result = sb.table("participants").insert(data).execute()
    return schemas.ParticipantResponse.model_validate(result.data[0])


@router.get("/me", response_model=List[schemas.FestivalResponse])
def list_my_participations(
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    """ログインユーザーが参加した祭りの一覧（email 逆引き）"""
    sb = get_supabase()

    user_result = sb.table("users").select("email").eq("id", current_user.id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    email = user_result.data[0]["email"]

    part_result = sb.table("participants").select("festival_id").eq("email", email).execute()
    festival_ids = list({p["festival_id"] for p in part_result.data})
    if not festival_ids:
        return []

    fes_result = (
        sb.table("festivals")
        .select("*")
        .in_("id", festival_ids)
        .order("start_datetime")
        .execute()
    )
    return [schemas.FestivalResponse.model_validate(f) for f in fes_result.data]


@router.get("/festival/{festival_id}", response_model=List[schemas.ParticipantResponse])
def list_participants(
    festival_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()

    festival_result = sb.table("festivals").select("user_id").eq("id", festival_id).execute()
    if not festival_result.data:
        raise HTTPException(status_code=404, detail="Festival not found")
    if festival_result.data[0]["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the festival creator can view participants")

    result = (
        sb.table("participants")
        .select("*")
        .eq("festival_id", festival_id)
        .order("created_at")
        .execute()
    )

    participants = []
    group_name_cache: dict[int, str] = {}
    for p in result.data:
        group_name = None
        gid = p.get("group_id")
        if gid:
            if gid not in group_name_cache:
                g = sb.table("groups").select("name").eq("id", gid).execute()
                group_name_cache[gid] = g.data[0]["name"] if g.data else "不明"
            group_name = group_name_cache[gid]
        participants.append({**p, "group_name": group_name})

    return [schemas.ParticipantResponse.model_validate(p) for p in participants]
