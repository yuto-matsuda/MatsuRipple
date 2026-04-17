from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class FestivalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    date: Optional[str] = None


class FestivalResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    date: Optional[str] = None
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
    filename: str
    original_name: Optional[str] = None
    is_public: bool
    created_at: datetime

    model_config = {"from_attributes": True}
