from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from datetime import datetime, timezone
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class Festival(Base):
    __tablename__ = "festivals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    region = Column(String)
    location_lat = Column(Float)
    location_lng = Column(Float)
    date = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Participant(Base):
    __tablename__ = "participants"
    id = Column(Integer, primary_key=True, index=True)
    festival_id = Column(Integer, ForeignKey("festivals.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True, index=True)
    festival_id = Column(Integer, ForeignKey("festivals.id"), nullable=True)
    filename = Column(String, nullable=False)
    original_name = Column(String)
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
