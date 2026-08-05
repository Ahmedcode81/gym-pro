from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Payment
from schemas import PaymentCreate, PaymentUpdate, PaymentResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(require_permission("payments", "create")),
    db: Session = Depends(get_db)
):
    db_payment = Payment(**payment.dict())
    db_payment.status = "completed"
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/", response_model=list[PaymentResponse])
async def get_payments(
    member_id: int = None,
    branch_id: int = None,
    current_user: User = Depends(require_permission("payments", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Payment)
    if member_id:
        query = query.filter(Payment.member_id == member_id)
    if branch_id:
        query = query.filter(Payment.branch_id == branch_id)
    return query.order_by(Payment.created_at.desc()).all()

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(require_permission("payments", "read")),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    current_user: User = Depends(require_permission("payments", "update")),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    for field, value in payment_update.dict(exclude_unset=True).items():
        setattr(payment, field, value)
    
    db.commit()
    db.refresh(payment)
    return payment

@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: int,
    current_user: User = Depends(require_permission("payments", "update")),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.status == "refunded":
        raise HTTPException(status_code=400, detail="Payment already refunded")
    
    payment.status = "refunded"
    db.commit()
    db.refresh(payment)
    return {"message": "Payment refunded successfully"}
