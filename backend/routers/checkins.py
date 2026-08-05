from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import CheckIn, Member
from schemas import CheckInCreate, CheckInResponse
from dependencies import get_current_user, require_permission
from models import User
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=CheckInResponse)
async def create_checkin(
    checkin: CheckInCreate,
    current_user: User = Depends(require_permission("check-in", "create")),
    db: Session = Depends(get_db)
):
    # Verify member exists and has active membership
    member = db.query(Member).filter(Member.id == checkin.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if member.membership_status.value != "active":
        raise HTTPException(status_code=400, detail="Member does not have an active membership")
    
    db_checkin = CheckIn(**checkin.dict())
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@router.post("/{checkin_id}/checkout")
async def checkout(
    checkin_id: int,
    current_user: User = Depends(require_permission("check-in", "update")),
    db: Session = Depends(get_db)
):
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    if checkin.exit_time:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    checkin.exit_time = datetime.utcnow()
    db.commit()
    db.refresh(checkin)
    return checkin

@router.get("/", response_model=list[CheckInResponse])
async def get_checkins(
    member_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("check-in", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(CheckIn)
    if member_id:
        query = query.filter(CheckIn.member_id == member_id)
    if branch_id:
        query = query.filter(CheckIn.branch_id == branch_id)
    return query.all()
