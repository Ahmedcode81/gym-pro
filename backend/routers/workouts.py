from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import WorkoutProgram
from schemas import WorkoutProgramCreate, WorkoutProgramUpdate, WorkoutProgramResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=WorkoutProgramResponse)
async def create_workout_program(
    program: WorkoutProgramCreate,
    current_user: User = Depends(require_permission("workout-programs", "create")),
    db: Session = Depends(get_db)
):
    db_program = WorkoutProgram(**program.dict())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

@router.get("/", response_model=list[WorkoutProgramResponse])
async def get_workout_programs(
    member_id: int = None,
    trainer_id: int = None,
    current_user: User = Depends(require_permission("workout-programs", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(WorkoutProgram)
    if member_id:
        query = query.filter(WorkoutProgram.member_id == member_id)
    if trainer_id:
        query = query.filter(WorkoutProgram.trainer_id == trainer_id)
    return query.all()

@router.get("/{program_id}", response_model=WorkoutProgramResponse)
async def get_workout_program(
    program_id: int,
    current_user: User = Depends(require_permission("workout-programs", "read")),
    db: Session = Depends(get_db)
):
    program = db.query(WorkoutProgram).filter(WorkoutProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Workout program not found")
    return program

@router.put("/{program_id}", response_model=WorkoutProgramResponse)
async def update_workout_program(
    program_id: int,
    program_update: WorkoutProgramUpdate,
    current_user: User = Depends(require_permission("workout-programs", "update")),
    db: Session = Depends(get_db)
):
    program = db.query(WorkoutProgram).filter(WorkoutProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Workout program not found")
    
    for field, value in program_update.dict(exclude_unset=True).items():
        setattr(program, field, value)
    
    db.commit()
    db.refresh(program)
    return program

@router.delete("/{program_id}")
async def delete_workout_program(
    program_id: int,
    current_user: User = Depends(require_permission("workout-programs", "delete")),
    db: Session = Depends(get_db)
):
    program = db.query(WorkoutProgram).filter(WorkoutProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Workout program not found")
    
    db.delete(program)
    db.commit()
    return {"message": "Workout program deleted successfully"}
