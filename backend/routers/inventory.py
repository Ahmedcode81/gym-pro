from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import ProductCreate, ProductUpdate, ProductResponse
from dependencies import get_current_user, require_permission
from models import User

router = APIRouter()

@router.post("/", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    current_user: User = Depends(require_permission("inventory", "create")),
    db: Session = Depends(get_db)
):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=list[ProductResponse])
async def get_products(
    branch_id: int = None,
    category: str = None,
    low_stock: bool = False,
    current_user: User = Depends(require_permission("inventory", "read")),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if branch_id:
        query = query.filter(Product.branch_id == branch_id)
    if category:
        query = query.filter(Product.category == category)
    if low_stock:
        query = query.filter(Product.quantity <= Product.low_stock_threshold)
    return query.all()

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    current_user: User = Depends(require_permission("inventory", "read")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(require_permission("inventory", "update")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product_update.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(require_permission("inventory", "delete")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/stock")
async def update_stock(
    product_id: int,
    quantity: int,
    current_user: User = Depends(require_permission("inventory", "update")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.quantity += quantity
    db.commit()
    db.refresh(product)
    return product
