from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .. import schemas
from ..auth import get_current_user
from ..supabase_client import get_supabase

router = APIRouter()


@router.get("/", response_model=List[schemas.InvitationResponse])
def list_my_invitations(current_user: schemas.UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    result = (
        sb.table("group_invitations")
        .select("*")
        .eq("invitee_id", current_user.id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    invitations = []
    for inv in result.data:
        group_result = sb.table("groups").select("name").eq("id", inv["group_id"]).execute()
        group_name = group_result.data[0]["name"] if group_result.data else None
        inviter_result = sb.table("users").select("username").eq("id", inv["inviter_id"]).execute()
        inviter_username = inviter_result.data[0]["username"] if inviter_result.data else None
        invitations.append(schemas.InvitationResponse(
            **inv,
            group_name=group_name,
            inviter_username=inviter_username,
        ))
    return invitations


@router.patch("/{invitation_id}/accept", response_model=schemas.InvitationResponse)
def accept_invitation(
    invitation_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    inv_result = sb.table("group_invitations").select("*").eq("id", invitation_id).eq("invitee_id", current_user.id).execute()
    if not inv_result.data:
        raise HTTPException(status_code=404, detail="Invitation not found")
    inv = inv_result.data[0]
    if inv["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invitation is no longer pending")

    updated = sb.table("group_invitations").update({"status": "accepted"}).eq("id", invitation_id).execute()
    sb.table("group_members").insert({
        "group_id": inv["group_id"],
        "user_id": current_user.id,
    }).execute()

    return schemas.InvitationResponse.model_validate(updated.data[0])


@router.patch("/{invitation_id}/reject", response_model=schemas.InvitationResponse)
def reject_invitation(
    invitation_id: int,
    current_user: schemas.UserResponse = Depends(get_current_user),
):
    sb = get_supabase()
    inv_result = sb.table("group_invitations").select("*").eq("id", invitation_id).eq("invitee_id", current_user.id).execute()
    if not inv_result.data:
        raise HTTPException(status_code=404, detail="Invitation not found")
    inv = inv_result.data[0]
    if inv["status"] != "pending":
        raise HTTPException(status_code=400, detail="Invitation is no longer pending")

    updated = sb.table("group_invitations").update({"status": "rejected"}).eq("id", invitation_id).execute()
    return schemas.InvitationResponse.model_validate(updated.data[0])
