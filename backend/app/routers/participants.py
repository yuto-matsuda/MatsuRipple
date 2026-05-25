from fastapi import APIRouter, HTTPException
from typing import List
from .. import schemas
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


@router.get("/festival/{festival_id}", response_model=List[schemas.ParticipantResponse])
def list_participants(festival_id: int):
    sb = get_supabase()
    result = (
        sb.table("participants")
        .select("*")
        .eq("festival_id", festival_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [schemas.ParticipantResponse.model_validate(p) for p in result.data]
