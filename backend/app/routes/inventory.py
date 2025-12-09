from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=list[schemas.InventoryOut])
def get_inventory(
    project: str | None = None,
    test_area: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Inventory)

    if project:
        query = query.filter(models.Inventory.project_name == project)

    if test_area:
        query = query.filter(models.Inventory.test_area == test_area)

    return query.order_by(models.Inventory.item_name).all()


@router.get("/{item_id}", response_model=schemas.InventoryOut)
def get_single_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Inventory).filter(models.Inventory.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/")
def add_inventory(item: schemas.InventoryBase, db: Session = Depends(get_db)):
    return crud.create_or_update_inventory(db, item)



@router.post("/request")
def request_item(data: schemas.RequestCreate, db: Session = Depends(get_db)):

    item_id = data.item_id
    qty = data.quantity

    # Lock the row to prevent race conditions
    item = (
        db.query(models.Inventory)
        .filter(models.Inventory.item_id == item_id)
        .with_for_update()
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.item_current_quantity < qty:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # Deduct quantity
    item.item_current_quantity -= qty

    # Create transaction record
    transaction = models.Transaction(
        item_id=item_id,
        employee_id=data.employee_id,
        fixture_id=data.fixture_id,
        quantity_used=qty,
        test_area=item.test_area,
        project_name=item.project_name,
        transaction_type="request",
    )

    db.add(transaction)
    db.commit()

    return {"message": "Request successful", "new_quantity": item.item_current_quantity}
    
