from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Member
from schemas import MemberCreate, MemberUpdate, MemberResponse, PaginatedResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=MemberResponse)
async def create_member(
    member: MemberCreate,
    current_user: User = Depends(require_permission("members", "create")),
    db: Session = Depends(get_db)
):
    db_member = Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=PaginatedResponse[MemberResponse])
async def get_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_permission("members", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Member)
    
    if search:
        query = query.filter(Member.full_name.ilike(f"%{search}%"))
    
    if status:
        query = query.filter(Member.membership_status == status)
    
    total = query.count()
    members = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return PaginatedResponse(
        items=members,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )

@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: int,
    current_user: User = Depends(require_permission("members", "read")),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: int,
    member_update: MemberUpdate,
    current_user: User = Depends(require_permission("members", "update")),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    for field, value in member_update.dict(exclude_unset=True).items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{member_id}")
async def delete_member(
    member_id: int,
    current_user: User = Depends(require_permission("members", "delete")),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}
