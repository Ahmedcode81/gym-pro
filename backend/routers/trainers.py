from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Trainer
from schemas import TrainerCreate, TrainerUpdate, TrainerResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=TrainerResponse)
async def create_trainer(
    trainer: TrainerCreate,
    current_user: User = Depends(require_permission("trainers", "create")),
    db: Session = Depends(get_db)
):
    db_trainer = Trainer(**trainer.dict())
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer

@router.get("/", response_model=list[TrainerResponse])
async def get_trainers(
    current_user: User = Depends(require_permission("trainers", "read")),
    db: Session = Depends(get_db)
):
    return db.query(Trainer).all()

@router.get("/{trainer_id}", response_model=TrainerResponse)
async def get_trainer(
    trainer_id: int,
    current_user: User = Depends(require_permission("trainers", "read")),
    db: Session = Depends(get_db)
):
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer

@router.put("/{trainer_id}", response_model=TrainerResponse)
async def update_trainer(
    trainer_id: int,
    trainer_update: TrainerUpdate,
    current_user: User = Depends(require_permission("trainers", "update")),
    db: Session = Depends(get_db)
):
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    for field, value in trainer_update.dict(exclude_unset=True).items():
        setattr(trainer, field, value)
    
    db.commit()
    db.refresh(trainer)
    return trainer

@router.delete("/{trainer_id}")
async def delete_trainer(
    trainer_id: int,
    current_user: User = Depends(require_permission("trainers", "delete")),
    db: Session = Depends(get_db)
):
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    db.delete(trainer)
    db.commit()
    return {"message": "Trainer deleted successfully"}
