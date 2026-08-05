from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Sale, Product
from schemas import SaleCreate, SaleResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=SaleResponse)
async def create_sale(
    sale: SaleCreate,
    current_user: User = Depends(require_permission("pos", "create")),
    db: Session = Depends(get_db)
):
    # Check product availability and update inventory
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        
        if product.quantity < item['quantity']:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for product {product.name}"
            )
        
        product.quantity -= item['quantity']
    
    db_sale = Sale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/", response_model=list[SaleResponse])
async def get_sales(
    branch_id: int = None,
    cashier_id: int = None,
    current_user: User = Depends(require_permission("pos", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Sale)
    if branch_id:
        query = query.filter(Sale.branch_id == branch_id)
    if cashier_id:
        query = query.filter(Sale.cashier_id == cashier_id)
    return query.order_by(Sale.created_at.desc()).all()

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(
    sale_id: int,
    current_user: User = Depends(require_permission("pos", "read")),
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/{sale_id}/return")
async def return_sale(
    sale_id: int,
    current_user: User = Depends(require_permission("pos", "update")),
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    if sale.status == "refunded":
        raise HTTPException(status_code=400, detail="Sale already refunded")
    
    # Restore inventory
    for item in sale.items:
        product = db.query(Product).filter(Product.id == item['product_id']).first()
        if product:
            product.quantity += item['quantity']
    
    sale.status = "refunded"
    db.commit()
    return {"message": "Sale returned successfully"}
