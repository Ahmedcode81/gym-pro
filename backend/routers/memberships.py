from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Membership, MembershipPlan
from schemas import MembershipCreate, MembershipUpdate, MembershipResponse, MembershipPlanCreate, MembershipPlanUpdate, MembershipPlanResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/plans", response_model=MembershipPlanResponse)
async def create_membership_plan(
    plan: MembershipPlanCreate,
    current_user: User = Depends(require_permission("memberships", "create")),
    db: Session = Depends(get_db)
):
    db_plan = MembershipPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plans", response_model=list[MembershipPlanResponse])
async def get_membership_plans(
    current_user: User = Depends(require_permission("memberships", "read")),
    db: Session = Depends(get_db)
):
    return db.query(MembershipPlan).all()

@router.get("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def get_membership_plan(
    plan_id: int,
    current_user: User = Depends(require_permission("memberships", "read")),
    db: Session = Depends(get_db)
):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    return plan

@router.put("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def update_membership_plan(
    plan_id: int,
    plan_update: MembershipPlanUpdate,
    current_user: User = Depends(require_permission("memberships", "update")),
    db: Session = Depends(get_db)
):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    for field, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/plans/{plan_id}")
async def delete_membership_plan(
    plan_id: int,
    current_user: User = Depends(require_permission("memberships", "delete")),
    db: Session = Depends(get_db)
):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Membership plan deleted successfully"}

@router.post("/", response_model=MembershipResponse)
async def create_membership(
    membership: MembershipCreate,
    current_user: User = Depends(require_permission("memberships", "create")),
    db: Session = Depends(get_db)
):
    db_membership = Membership(**membership.dict())
    db.add(db_membership)
    db.commit()
    db.refresh(db_membership)
    return db_membership

@router.get("/", response_model=list[MembershipResponse])
async def get_memberships(
    member_id: Optional[int] = None,
    current_user: User = Depends(require_permission("memberships", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Membership)
    if member_id:
        query = query.filter(Membership.member_id == member_id)
    return query.all()

@router.get("/{membership_id}", response_model=MembershipResponse)
async def get_membership(
    membership_id: int,
    current_user: User = Depends(require_permission("memberships", "read")),
    db: Session = Depends(get_db)
):
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    return membership

@router.put("/{membership_id}", response_model=MembershipResponse)
async def update_membership(
    membership_id: int,
    membership_update: MembershipUpdate,
    current_user: User = Depends(require_permission("memberships", "update")),
    db: Session = Depends(get_db)
):
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    for field, value in membership_update.dict(exclude_unset=True).items():
        setattr(membership, field, value)
    
    db.commit()
    db.refresh(membership)
    return membership
