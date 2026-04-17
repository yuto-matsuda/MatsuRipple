from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.FestivalResponse])
def list_festivals(db: Session = Depends(get_db)):
    return db.query(models.Festival).order_by(models.Festival.created_at.desc()).all()


@router.get("/{festival_id}", response_model=schemas.FestivalResponse)
def get_festival(festival_id: int, db: Session = Depends(get_db)):
    festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if not festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    return festival


@router.post("/", response_model=schemas.FestivalResponse, status_code=201)
def create_festival(
    festival: schemas.FestivalCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_festival = models.Festival(**festival.model_dump())
    db.add(db_festival)
    db.commit()
    db.refresh(db_festival)
    return db_festival


@router.put("/{festival_id}", response_model=schemas.FestivalResponse)
def update_festival(
    festival_id: int,
    festival: schemas.FestivalCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if not db_festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    for key, value in festival.model_dump().items():
        setattr(db_festival, key, value)
    db.commit()
    db.refresh(db_festival)
    return db_festival


@router.delete("/{festival_id}", status_code=204)
def delete_festival(
    festival_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    db_festival = db.query(models.Festival).filter(models.Festival.id == festival_id).first()
    if not db_festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    db.delete(db_festival)
    db.commit()
