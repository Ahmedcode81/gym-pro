from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from models import Member, Payment, CheckIn, Membership, Trainer, WorkoutProgram, AuditLog
from dependencies import get_current_user
from models import User
from datetime import date, datetime, timedelta
from schemas import DashboardStats, MembershipStatistics, ChartData, TrainerStatistics, Activity

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    start_of_month = today.replace(day=1)
    start_of_year = today.replace(month=1, day=1)
    
    # Total members
    total_members = db.query(Member).count()
    
    # Active members
    active_members = db.query(Member).filter(
        Member.membership_status == "active"
    ).count()
    
    # Expired memberships
    expired_memberships = db.query(Membership).filter(
        Membership.status == "expired"
    ).count()
    
    # Today's check-ins
    today_checkins = db.query(CheckIn).filter(
        func.date(CheckIn.entry_time) == today
    ).count()
    
    # Revenue today
    revenue_today = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        func.date(Payment.created_at) == today
    ).scalar() or 0
    
    # Revenue this month
    revenue_this_month = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        func.date(Payment.created_at) >= start_of_month
    ).scalar() or 0
    
    # Revenue this year
    revenue_this_year = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        func.date(Payment.created_at) >= start_of_year
    ).scalar() or 0
    
    # Membership statistics
    membership_stats = MembershipStatistics(
        active=active_members,
        expired=expired_memberships,
        frozen=db.query(Membership).filter(Membership.status == "suspended").count(),
        pending=db.query(Membership).filter(Membership.status == "pending").count()
    )
    
    # Attendance chart (last 7 days)
    attendance_labels = []
    attendance_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        attendance_labels.append(day.strftime("%a"))
        count = db.query(CheckIn).filter(
            func.date(CheckIn.entry_time) == day
        ).count()
        attendance_data.append(count)
    
    attendance_chart = ChartData(
        labels=attendance_labels,
        datasets=[{
            "label": "Check-ins",
            "data": attendance_data,
            "color": "#8884d8"
        }]
    )
    
    # Sales chart (last 7 days)
    sales_labels = []
    sales_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        sales_labels.append(day.strftime("%a"))
        total = db.query(func.sum(Payment.amount)).filter(
            Payment.status == "completed",
            func.date(Payment.created_at) == day
        ).scalar() or 0
        sales_data.append(total)
    
    sales_chart = ChartData(
        labels=sales_labels,
        datasets=[{
            "label": "Revenue",
            "data": sales_data,
            "color": "#82ca9d"
        }]
    )
    
    # Trainer statistics
    trainer_stats = []
    trainers = db.query(Trainer).all()
    for trainer in trainers:
        total_members = db.query(WorkoutProgram).filter(
            WorkoutProgram.trainer_id == trainer.id
        ).distinct(WorkoutProgram.member_id).count()
        
        active_programs = db.query(WorkoutProgram).filter(
            WorkoutProgram.trainer_id == trainer.id
        ).count()
        
        trainer_stats.append(TrainerStatistics(
            trainer_id=trainer.id,
            trainer_name=trainer.name,
            total_members=total_members,
            active_programs=active_programs,
            revenue_generated=0  # Would be calculated from payments
        ))
    
    # Recent activities
    recent_activities = []
    logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).limit(10).all()
    
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        recent_activities.append(Activity(
            id=log.id,
            user=user.full_name if user else "System",
            action=log.action,
            description=log.details or f"{log.action} on {log.resource}",
            timestamp=log.created_at
        ))
    
    return DashboardStats(
        total_members=total_members,
        active_members=active_members,
        expired_memberships=expired_memberships,
        today_checkins=today_checkins,
        revenue_today=revenue_today,
        revenue_this_month=revenue_this_month,
        revenue_this_year=revenue_this_year,
        membership_statistics=membership_stats,
        attendance_chart=attendance_chart,
        sales_chart=sales_chart,
        trainer_statistics=trainer_stats,
        recent_activities=recent_activities,
        notifications=[]
    )
