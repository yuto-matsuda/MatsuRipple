from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

def _check_member(sb, group_id: int, user_id: int) -> None:
    if not sb.table("group_members").select("id").eq("group_id", group_id).eq("user_id", user_id).execute().data:
        raise HTTPException(status_code=403, detail="Not a member of this group")

router = APIRouter()


@router.post("/", response_model=schemas.GroupResponse, status_code=201)
def create_group(
    body: schemas.GroupCreate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    result = sb.table("groups").insert({
        "name": body.name,
        "description": body.description,
        "creator_id": current_user.id,
    }).execute()
    group = result.data[0]
    group_id = group["id"]

    sb.table("group_members").insert({
        "group_id": group_id,
        "user_id": current_user.id,
    }).execute()

    if body.locations:
        sb.table("group_locations").insert([
            {"group_id": group_id, "name": loc.name, "order": loc.order}
            for loc in body.locations
        ]).execute()

    return schemas.GroupResponse.model_validate(group)


@router.get("/", response_model=List[schemas.GroupResponse])
def list_my_groups(current_user: schemas.UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    member_result = sb.table("group_members").select("group_id").eq("user_id", current_user.id).execute()
    group_ids = [m["group_id"] for m in member_result.data]
    if not group_ids:
        return []
    result = sb.table("groups").select("*").in_("id", group_ids).order("created_at", desc=True).execute()
    return [schemas.GroupResponse.model_validate(g) for g in result.data]


@router.get("/{group_id}", response_model=schemas.GroupDetailResponse)
def get_group(
    group_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    if not sb.table("group_members").select("id").eq("group_id", group_id).eq("user_id", current_user.id).execute().data:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    group_result = sb.table("groups").select("*").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    group = group_result.data[0]

    loc_result = sb.table("group_locations").select("*").eq("group_id", group_id).order("order").execute()

    members_result = sb.table("group_members").select("*").eq("group_id", group_id).execute()
    member_list = []
    for m in members_result.data:
        user_result = sb.table("users").select("username").eq("id", m["user_id"]).execute()
        username = user_result.data[0]["username"] if user_result.data else "Unknown"
        member_list.append({**m, "username": username})

    festival_tag_result = sb.table("group_festivals").select("*").eq("group_id", group_id).execute()
    festival_list = []
    for ft in festival_tag_result.data:
        f_result = sb.table("festivals").select("name").eq("id", ft["festival_id"]).execute()
        f_name = f_result.data[0]["name"] if f_result.data else "不明"
        festival_list.append({**ft, "festival_name": f_name})

    return schemas.GroupDetailResponse(
        id=group["id"],
        name=group["name"],
        description=group["description"],
        creator_id=group["creator_id"],
        created_at=group["created_at"],
        locations=[schemas.GroupLocationResponse.model_validate(loc) for loc in loc_result.data],
        members=[schemas.GroupMemberResponse.model_validate(m) for m in member_list],
        festivals=[schemas.GroupFestivalResponse.model_validate(f) for f in festival_list],
    )


@router.patch("/{group_id}", response_model=schemas.GroupResponse)
def update_group(
    group_id: int,
    body: schemas.GroupUpdate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    group_result = sb.table("groups").select("creator_id").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    if group_result.data[0]["creator_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can edit this group")

    data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = sb.table("groups").update(data).eq("id", group_id).execute()
    return schemas.GroupResponse.model_validate(result.data[0])


@router.delete("/{group_id}/leave", status_code=204)
def leave_group(
    group_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    if not sb.table("group_members").select("id").eq("group_id", group_id).eq("user_id", current_user.id).execute().data:
        raise HTTPException(status_code=404, detail="Not a member of this group")

    group_result = sb.table("groups").select("creator_id").eq("id", group_id).execute()
    if group_result.data and group_result.data[0]["creator_id"] == current_user.id:
        raise HTTPException(status_code=400, detail="Creator cannot leave the group")

    sb.table("group_members").delete().eq("group_id", group_id).eq("user_id", current_user.id).execute()


@router.post("/{group_id}/participate", response_model=schemas.GroupParticipateResponse, status_code=201)
def group_participate(
    group_id: int,
    body: schemas.GroupParticipateRequest,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()

    # 作成者チェック
    group_result = sb.table("groups").select("creator_id").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    if group_result.data[0]["creator_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can register the group")

    # 祭りの存在チェック
    if not sb.table("festivals").select("id").eq("id", body.festival_id).execute().data:
        raise HTTPException(status_code=404, detail="Festival not found")

    # 全メンバー取得
    members = sb.table("group_members").select("user_id").eq("group_id", group_id).execute().data
    total = len(members)

    # 各メンバーのユーザー情報を取得して一括登録
    records = []
    for m in members:
        user_result = sb.table("users").select("username, email").eq("id", m["user_id"]).execute()
        if user_result.data:
            u = user_result.data[0]
            records.append({
                "festival_id": body.festival_id,
                "name": u["username"],
                "email": u["email"],
                "message": body.message,
                "group_id": group_id,
            })

    if records:
        sb.table("participants").insert(records).execute()

    return schemas.GroupParticipateResponse(registered=len(records), total=total)


@router.get("/{group_id}/festivals", response_model=List[schemas.GroupFestivalResponse])
def list_group_festivals(
    group_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    _check_member(sb, group_id, current_user.id)
    result = sb.table("group_festivals").select("*").eq("group_id", group_id).execute()
    festival_list = []
    for ft in result.data:
        f_result = sb.table("festivals").select("name").eq("id", ft["festival_id"]).execute()
        f_name = f_result.data[0]["name"] if f_result.data else "不明"
        festival_list.append({**ft, "festival_name": f_name})
    return [schemas.GroupFestivalResponse.model_validate(f) for f in festival_list]


@router.post("/{group_id}/festivals", response_model=schemas.GroupFestivalResponse, status_code=201)
def add_group_festival(
    group_id: int,
    body: dict,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    festival_id: int = body.get("festival_id")
    if not festival_id:
        raise HTTPException(status_code=422, detail="festival_id is required")
    sb = get_supabase()
    group_result = sb.table("groups").select("creator_id").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    if group_result.data[0]["creator_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can manage festivals")
    if sb.table("group_festivals").select("id").eq("group_id", group_id).eq("festival_id", festival_id).execute().data:
        raise HTTPException(status_code=400, detail="Festival already added")
    f_result = sb.table("festivals").select("name").eq("id", festival_id).execute()
    if not f_result.data:
        raise HTTPException(status_code=404, detail="Festival not found")
    result = sb.table("group_festivals").insert({"group_id": group_id, "festival_id": festival_id}).execute()
    return schemas.GroupFestivalResponse.model_validate({**result.data[0], "festival_name": f_result.data[0]["name"]})


@router.delete("/{group_id}/festivals/{festival_id}", status_code=204)
def remove_group_festival(
    group_id: int,
    festival_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    group_result = sb.table("groups").select("creator_id").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    if group_result.data[0]["creator_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can manage festivals")
    sb.table("group_festivals").delete().eq("group_id", group_id).eq("festival_id", festival_id).execute()


@router.get("/{group_id}/photos", response_model=List[schemas.PhotoResponse])
def list_group_photos(
    group_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    _check_member(sb, group_id, current_user.id)
    result = (
        sb.table("photos")
        .select("*")
        .eq("group_id", group_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [schemas.PhotoResponse.model_validate(p) for p in result.data]


@router.post("/{group_id}/invitations", response_model=schemas.InvitationResponse, status_code=201)
def send_invitation(
    group_id: int,
    body: schemas.InvitationCreate,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    group_result = sb.table("groups").select("creator_id, name").eq("id", group_id).execute()
    if not group_result.data:
        raise HTTPException(status_code=404, detail="Group not found")
    if group_result.data[0]["creator_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can invite members")

    user_result = sb.table("users").select("id, username").eq("username", body.username).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    invitee = user_result.data[0]

    if sb.table("group_members").select("id").eq("group_id", group_id).eq("user_id", invitee["id"]).execute().data:
        raise HTTPException(status_code=400, detail="User is already a member")

    if sb.table("group_invitations").select("id").eq("group_id", group_id).eq("invitee_id", invitee["id"]).eq("status", "pending").execute().data:
        raise HTTPException(status_code=400, detail="User already has a pending invitation")

    result = sb.table("group_invitations").insert({
        "group_id": group_id,
        "inviter_id": current_user.id,
        "invitee_id": invitee["id"],
        "status": "pending",
    }).execute()
    inv = result.data[0]

    return schemas.InvitationResponse(
        **inv,
        group_name=group_result.data[0]["name"],
        inviter_username=current_user.username,
    )
