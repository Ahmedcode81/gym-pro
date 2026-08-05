from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import decode_token
from typing import Optional

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return user

def require_role(*allowed_roles: str):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles and current_user.role.value != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

def require_permission(resource: str, action: str):
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        # Super admin has all permissions
        if current_user.role.value == "super_admin":
            return current_user
        
        # Define basic permissions based on role
        role_permissions = {
            "owner": ["*"],
            "branch_manager": [
                "members.*", "trainers.*", "classes.*", "check-in.*",
                "memberships.*", "workout-programs.*", "nutrition-plans.*"
            ],
            "receptionist": ["members.read", "check-in.*", "payments.read", "memberships.read"],
            "cashier": ["payments.*", "pos.*", "inventory.read"],
            "trainer": ["workout-programs.*", "nutrition-plans.*", "body-measurements.*"],
            "accountant": ["payments.*", "reports.*", "inventory.*"],
        }
        
        permissions = role_permissions.get(current_user.role.value, [])
        
        has_permission = any(
            perm == "*" or 
            perm == f"{resource}.*" or 
            perm == f"{resource}.{action}"
            for perm in permissions
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {resource}.{action}"
            )
        
        return current_user
    return permission_checker
