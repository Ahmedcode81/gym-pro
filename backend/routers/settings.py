from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import GymSettings, Branch
from schemas import GymSettingsResponse, GymSettingsUpdate
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.get("/", response_model=GymSettingsResponse)
async def get_gym_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(GymSettings).first()
    if not settings:
        # Create default settings
        settings = GymSettings(
            name="Gym",
            address="Address",
            phone="Phone",
            business_hours={
                "monday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "tuesday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "wednesday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "thursday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "friday": {"open": "06:00", "close": "22:00", "is_closed": False},
                "saturday": {"open": "08:00", "close": "20:00", "is_closed": False},
                "sunday": {"open": "08:00", "close": "20:00", "is_closed": False}
            }
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=GymSettingsResponse)
async def update_gym_settings(
    settings_update: GymSettingsUpdate,
    current_user: User = Depends(require_permission("settings", "update")),
    db: Session = Depends(get_db)
):
    settings = db.query(GymSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    for field, value in settings_update.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/branches")
async def get_branches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Branch).all()

@router.post("/branches")
async def create_branch(
    branch_data: dict,
    current_user: User = Depends(require_permission("settings", "create")),
    db: Session = Depends(get_db)
):
    branch = Branch(**branch_data)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
