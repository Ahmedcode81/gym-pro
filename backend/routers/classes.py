from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import GroupClass, ClassBooking
from schemas import GroupClassCreate, GroupClassUpdate, GroupClassResponse, ClassBookingCreate, ClassBookingUpdate, ClassBookingResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=GroupClassResponse)
async def create_group_class(
    group_class: GroupClassCreate,
    current_user: User = Depends(require_permission("classes", "create")),
    db: Session = Depends(get_db)
):
    db_class = GroupClass(**group_class.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@router.get("/", response_model=list[GroupClassResponse])
async def get_group_classes(
    branch_id: int = None,
    trainer_id: int = None,
    current_user: User = Depends(require_permission("classes", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(GroupClass)
    if branch_id:
        query = query.filter(GroupClass.branch_id == branch_id)
    if trainer_id:
        query = query.filter(GroupClass.trainer_id == trainer_id)
    return query.all()

@router.get("/{class_id}", response_model=GroupClassResponse)
async def get_group_class(
    class_id: int,
    current_user: User = Depends(require_permission("classes", "read")),
    db: Session = Depends(get_db)
):
    group_class = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not group_class:
        raise HTTPException(status_code=404, detail="Group class not found")
    return group_class

@router.put("/{class_id}", response_model=GroupClassResponse)
async def update_group_class(
    class_id: int,
    class_update: GroupClassUpdate,
    current_user: User = Depends(require_permission("classes", "update")),
    db: Session = Depends(get_db)
):
    group_class = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not group_class:
        raise HTTPException(status_code=404, detail="Group class not found")
    
    for field, value in class_update.dict(exclude_unset=True).items():
        setattr(group_class, field, value)
    
    db.commit()
    db.refresh(group_class)
    return group_class

@router.delete("/{class_id}")
async def delete_group_class(
    class_id: int,
    current_user: User = Depends(require_permission("classes", "delete")),
    db: Session = Depends(get_db)
):
    group_class = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not group_class:
        raise HTTPException(status_code=404, detail="Group class not found")
    
    db.delete(group_class)
    db.commit()
    return {"message": "Group class deleted successfully"}

@router.post("/{class_id}/bookings", response_model=ClassBookingResponse)
async def create_class_booking(
    class_id: int,
    booking: ClassBookingCreate,
    current_user: User = Depends(require_permission("classes", "create")),
    db: Session = Depends(get_db)
):
    group_class = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not group_class:
        raise HTTPException(status_code=404, detail="Group class not found")
    
    # Check capacity
    existing_bookings = db.query(ClassBooking).filter(
        ClassBooking.class_id == class_id,
        ClassBooking.date == booking.date,
        ClassBooking.status.in_(["booked", "attended"])
    ).count()
    
    if existing_bookings >= group_class.capacity:
        raise HTTPException(status_code=400, detail="Class is fully booked")
    
    booking_dict = booking.dict()
    booking_dict['class_id'] = class_id
    db_booking = ClassBooking(**booking_dict)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/{class_id}/bookings", response_model=list[ClassBookingResponse])
async def get_class_bookings(
    class_id: int,
    current_user: User = Depends(require_permission("classes", "read")),
    db: Session = Depends(get_db)
):
    return db.query(ClassBooking).filter(ClassBooking.class_id == class_id).all()

@router.put("/bookings/{booking_id}", response_model=ClassBookingResponse)
async def update_class_booking(
    booking_id: int,
    booking_update: ClassBookingUpdate,
    current_user: User = Depends(require_permission("classes", "update")),
    db: Session = Depends(get_db)
):
    booking = db.query(ClassBooking).filter(ClassBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for field, value in booking_update.dict(exclude_unset=True).items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    return booking
