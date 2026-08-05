from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import BodyMeasurement
from schemas import BodyMeasurementCreate, BodyMeasurementUpdate, BodyMeasurementResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=BodyMeasurementResponse)
async def create_body_measurement(
    measurement: BodyMeasurementCreate,
    current_user: User = Depends(require_permission("body-measurements", "create")),
    db: Session = Depends(get_db)
):
    # Calculate BMI
    measurement_dict = measurement.dict()
    height_m = measurement_dict['height'] / 100  # Convert cm to m
    measurement_dict['bmi'] = round(measurement_dict['weight'] / (height_m ** 2), 2)
    
    db_measurement = BodyMeasurement(**measurement_dict)
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)
    return db_measurement

@router.get("/", response_model=list[BodyMeasurementResponse])
async def get_body_measurements(
    member_id: int = None,
    current_user: User = Depends(require_permission("body-measurements", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(BodyMeasurement)
    if member_id:
        query = query.filter(BodyMeasurement.member_id == member_id)
    return query.order_by(BodyMeasurement.date.desc()).all()

@router.get("/{measurement_id}", response_model=BodyMeasurementResponse)
async def get_body_measurement(
    measurement_id: int,
    current_user: User = Depends(require_permission("body-measurements", "read")),
    db: Session = Depends(get_db)
):
    measurement = db.query(BodyMeasurement).filter(BodyMeasurement.id == measurement_id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Body measurement not found")
    return measurement

@router.put("/{measurement_id}", response_model=BodyMeasurementResponse)
async def update_body_measurement(
    measurement_id: int,
    measurement_update: BodyMeasurementUpdate,
    current_user: User = Depends(require_permission("body-measurements", "update")),
    db: Session = Depends(get_db)
):
    measurement = db.query(BodyMeasurement).filter(BodyMeasurement.id == measurement_id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Body measurement not found")
    
    for field, value in measurement_update.dict(exclude_unset=True).items():
        setattr(measurement, field, value)
    
    # Recalculate BMI if weight or height changed
    if measurement_update.weight or measurement_update.height:
        height_m = measurement.height / 100
        measurement.bmi = round(measurement.weight / (height_m ** 2), 2)
    
    db.commit()
    db.refresh(measurement)
    return measurement

@router.delete("/{measurement_id}")
async def delete_body_measurement(
    measurement_id: int,
    current_user: User = Depends(require_permission("body-measurements", "delete")),
    db: Session = Depends(get_db)
):
    measurement = db.query(BodyMeasurement).filter(BodyMeasurement.id == measurement_id).first()
    if not measurement:
        raise HTTPException(status_code=404, detail="Body measurement not found")
    
    db.delete(measurement)
    db.commit()
    return {"message": "Body measurement deleted successfully"}
