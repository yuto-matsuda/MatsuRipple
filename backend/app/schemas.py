from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('パスワードは8文字以上で入力してください')
        return v


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


class UserDB(BaseModel):
    id: int
    username: str
    email: str
    hashed_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class FestivalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    venue: Optional[str] = None
    thumbnail_url: Optional[str] = None


class FestivalResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    start_datetime: Optional[str] = None
    end_datetime: Optional[str] = None
    venue: Optional[str] = None
    thumbnail_url: Optional[str] = None
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class FestivalGalleryPhotoResponse(BaseModel):
    id: int
    festival_id: int
    filename: str
    original_name: Optional[str] = None
    order_index: int
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ParticipantCreate(BaseModel):
    festival_id: int
    name: str
    email: str
    message: Optional[str] = None


class ParticipantResponse(BaseModel):
    id: int
    festival_id: int
    name: str
    message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PhotoResponse(BaseModel):
    id: int
    festival_id: Optional[int] = None
    group_id: Optional[int] = None
    filename: str
    original_name: Optional[str] = None
    is_public: bool
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Photo update ───────────────────────────────────────
class PhotoUpdate(BaseModel):
    is_public: Optional[bool] = None


# ── Group ──────────────────────────────────────────────
class GroupLocationCreate(BaseModel):
    name: str
    order: int = 0


class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    locations: list[GroupLocationCreate] = []


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class GroupLocationResponse(BaseModel):
    id: int
    group_id: int
    name: str
    order: int

    model_config = {"from_attributes": True}


class GroupMemberResponse(BaseModel):
    id: int
    group_id: int
    user_id: int
    username: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    creator_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupFestivalResponse(BaseModel):
    id: int
    group_id: int
    festival_id: int
    festival_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupDetailResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    creator_id: int
    created_at: datetime
    locations: list[GroupLocationResponse] = []
    members: list[GroupMemberResponse] = []
    festivals: list[GroupFestivalResponse] = []

    model_config = {"from_attributes": True}


# ── Group participation ────────────────────────────────
class GroupParticipateRequest(BaseModel):
    festival_id: int
    message: Optional[str] = None


class GroupParticipateResponse(BaseModel):
    registered: int
    total: int


# ── Invitation ─────────────────────────────────────────
class InvitationCreate(BaseModel):
    username: str


class InvitationResponse(BaseModel):
    id: int
    group_id: int
    inviter_id: int
    invitee_id: int
    status: str
    created_at: datetime
    group_name: Optional[str] = None
    inviter_username: Optional[str] = None

    model_config = {"from_attributes": True}
