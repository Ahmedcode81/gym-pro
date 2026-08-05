from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog
from schemas import AuditLogResponse
from dependencies import get_current_user, require_permission
from models import User
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

@router.get("/", response_model=list[AuditLogResponse])
async def get_audit_logs(
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    current_user: User = Depends(require_permission("audit", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if resource:
        query = query.filter(AuditLog.resource == resource)
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()

@router.get("/recent")
async def get_recent_activities(
    limit: int = Query(10, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "user": db.query(User).filter(User.id == log.user_id).first().full_name if log.user_id else "System",
            "action": log.action,
            "description": log.details or f"{log.action} on {log.resource}",
            "timestamp": log.created_at
        }
        for log in logs
    ]
