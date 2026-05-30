from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()


@router.get("/", response_model=List[schemas.ReviewResponse])
def list_reviews(festival_id: int):
    sb = get_supabase()
    result = (
        sb.table("reviews")
        .select("*")
        .eq("festival_id", festival_id)
        .order("created_at", desc=True)
        .execute()
    )
    reviews = []
    for r in result.data:
        user = sb.table("users").select("username").eq("id", r["user_id"]).execute()
        username = user.data[0]["username"] if user.data else "Unknown"
        reviews.append({**r, "username": username})
    return [schemas.ReviewResponse.model_validate(r) for r in reviews]


@router.post("/", response_model=schemas.ReviewResponse, status_code=201)
def post_review(
    body: schemas.ReviewCreate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()

    # 参加者チェック
    user = sb.table("users").select("email").eq("id", current_user.id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    email = user.data[0]["email"]

    participated = sb.table("participants").select("id").eq("festival_id", body.festival_id).eq("email", email).execute()
    if not participated.data:
        raise HTTPException(status_code=403, detail="参加者のみ口コミを投稿できます")

    # 重複チェック
    existing = sb.table("reviews").select("id").eq("festival_id", body.festival_id).eq("user_id", current_user.id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="すでに口コミを投稿済みです")

    result = sb.table("reviews").insert({
        "festival_id": body.festival_id,
        "user_id": current_user.id,
        "body": body.body,
        "rating": body.rating,
    }).execute()

    return schemas.ReviewResponse.model_validate({**result.data[0], "username": current_user.username})
