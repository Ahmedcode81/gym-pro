from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models import Member, Payment, CheckIn, Sale, Product, Membership
from dependencies import get_current_user, require_permission
from models import User
from datetime import datetime, date, timedelta
from typing import Optional

router = APIRouter()

@router.get("/revenue")
async def get_revenue_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Payment).filter(
        Payment.status == "completed",
        Payment.created_at >= start_date,
        Payment.created_at <= end_date
    )
    
    if branch_id:
        query = query.filter(Payment.branch_id == branch_id)
    
    payments = query.all()
    
    total_revenue = sum(p.amount for p in payments)
    revenue_by_method = {}
    for payment in payments:
        method = payment.method.value
        revenue_by_method[method] = revenue_by_method.get(method, 0) + payment.amount
    
    return {
        "total_revenue": total_revenue,
        "revenue_by_method": revenue_by_method,
        "transaction_count": len(payments),
        "period": {"start": start_date, "end": end_date}
    }

@router.get("/membership")
async def get_membership_report(
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Member)
    if branch_id:
        query = query.filter(Member.branch_id == branch_id)
    
    members = query.all()
    
    status_counts = {}
    for member in members:
        status = member.membership_status.value
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_members": len(members),
        "status_breakdown": status_counts,
        "new_members_this_month": len([
            m for m in members 
            if m.join_date >= date.today().replace(day=1)
        ])
    }

@router.get("/attendance")
async def get_attendance_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(CheckIn).filter(
        CheckIn.entry_time >= start_date,
        CheckIn.entry_time <= end_date
    )
    
    if branch_id:
        query = query.filter(CheckIn.branch_id == branch_id)
    
    checkins = query.all()
    
    daily_attendance = {}
    for checkin in checkins:
        day = checkin.entry_time.date()
        daily_attendance[day] = daily_attendance.get(day, 0) + 1
    
    total_checkins = len(checkins)
    unique_members = len(set(c.member_id for c in checkins))
    
    return {
        "total_checkins": total_checkins,
        "unique_members": unique_members,
        "daily_attendance": daily_attendance,
        "period": {"start": start_date, "end": end_date}
    }

@router.get("/sales")
async def get_sales_report(
    start_date: date,
    end_date: date,
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Sale).filter(
        Sale.status == "completed",
        Sale.created_at >= start_date,
        Sale.created_at <= end_date
    )
    
    if branch_id:
        query = query.filter(Sale.branch_id == branch_id)
    
    sales = query.all()
    
    total_sales = sum(s.total for s in sales)
    sales_by_category = {}
    
    for sale in sales:
        for item in sale.items:
            product = db.query(Product).filter(Product.id == item['product_id']).first()
            if product:
                category = product.category.value
                sales_by_category[category] = sales_by_category.get(category, 0) + item['total']
    
    return {
        "total_sales": total_sales,
        "sales_by_category": sales_by_category,
        "transaction_count": len(sales),
        "period": {"start": start_date, "end": end_date}
    }

@router.get("/inventory")
async def get_inventory_report(
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if branch_id:
        query = query.filter(Product.branch_id == branch_id)
    
    products = query.all()
    
    total_value = sum(p.quantity * p.purchase_price for p in products)
    low_stock_items = [p for p in products if p.quantity <= p.low_stock_threshold]
    
    category_breakdown = {}
    for product in products:
        category = product.category.value
        category_breakdown[category] = category_breakdown.get(category, 0) + product.quantity
    
    return {
        "total_products": len(products),
        "total_value": total_value,
        "low_stock_items": len(low_stock_items),
        "low_stock_details": [
            {"id": p.id, "name": p.name, "quantity": p.quantity}
            for p in low_stock_items
        ],
        "category_breakdown": category_breakdown
    }

@router.get("/trainers")
async def get_trainers_report(
    branch_id: Optional[int] = None,
    current_user: User = Depends(require_permission("reports", "read")),
    db: Session = Depends(get_db)
):
    from models import Trainer, WorkoutProgram
    
    query = db.query(Trainer)
    if branch_id:
        query = query.filter(Trainer.branch_id == branch_id)
    
    trainers = query.all()
    
    trainer_stats = []
    for trainer in trainers:
        programs = db.query(WorkoutProgram).filter(
            WorkoutProgram.trainer_id == trainer.id
        ).count()
        
        trainer_stats.append({
            "id": trainer.id,
            "name": trainer.name,
            "specialization": trainer.specialization,
            "active_programs": programs,
            "salary": trainer.salary
        })
    
    return {
        "total_trainers": len(trainers),
        "trainer_statistics": trainer_stats
    }
