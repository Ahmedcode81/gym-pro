from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import NutritionPlan
from schemas import NutritionPlanCreate, NutritionPlanUpdate, NutritionPlanResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=NutritionPlanResponse)
async def create_nutrition_plan(
    plan: NutritionPlanCreate,
    current_user: User = Depends(require_permission("nutrition-plans", "create")),
    db: Session = Depends(get_db)
):
    db_plan = NutritionPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/", response_model=list[NutritionPlanResponse])
async def get_nutrition_plans(
    member_id: int = None,
    trainer_id: int = None,
    current_user: User = Depends(require_permission("nutrition-plans", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(NutritionPlan)
    if member_id:
        query = query.filter(NutritionPlan.member_id == member_id)
    if trainer_id:
        query = query.filter(NutritionPlan.trainer_id == trainer_id)
    return query.all()

@router.get("/{plan_id}", response_model=NutritionPlanResponse)
async def get_nutrition_plan(
    plan_id: int,
    current_user: User = Depends(require_permission("nutrition-plans", "read")),
    db: Session = Depends(get_db)
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Nutrition plan not found")
    return plan

@router.put("/{plan_id}", response_model=NutritionPlanResponse)
async def update_nutrition_plan(
    plan_id: int,
    plan_update: NutritionPlanUpdate,
    current_user: User = Depends(require_permission("nutrition-plans", "update")),
    db: Session = Depends(get_db)
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Nutrition plan not found")
    
    for field, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
async def delete_nutrition_plan(
    plan_id: int,
    current_user: User = Depends(require_permission("nutrition-plans", "delete")),
    db: Session = Depends(get_db)
):
    plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Nutrition plan not found")
    
    db.delete(plan)
    db.commit()
    return {"message": "Nutrition plan deleted successfully"}
