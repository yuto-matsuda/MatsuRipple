from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.ParticipantResponse, status_code=201)
def register_participant(participant: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    if not db.query(models.Festival).filter(models.Festival.id == participant.festival_id).first():
        raise HTTPException(status_code=404, detail="Festival not found")
    db_participant = models.Participant(**participant.model_dump())
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant)
    return db_participant


@router.get("/festival/{festival_id}", response_model=List[schemas.ParticipantResponse])
def list_participants(festival_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Participant)
        .filter(models.Participant.festival_id == festival_id)
        .order_by(models.Participant.created_at.desc())
        .all()
    )
