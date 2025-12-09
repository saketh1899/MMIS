# backend/app/routes/transactions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/request")
def request_item(t: schemas.TransactionBase, db: Session = Depends(get_db)):
    """Employee requests an item (decrease quantity)."""
    updated_item = crud.subtract_item_quantity(db, t.item_id, t.quantity_used)
    if not updated_item:
        raise HTTPException(status_code=400, detail="Insufficient stock or invalid item")
    

    
    crud.create_transaction(db, t)
    return {"message": "Request confirmed", "item": updated_item.item_name}


@router.get("/all")
def get_all(db: Session = Depends(get_db)):
    """View all transactions."""
    return crud.get_all_transactions(db)

"""
@router.get("/user/{employee_id}", response_model=list[schemas.TransactionOut])
def get_user_transactions(employee_id: int, db: Session = Depends(get_db)):
    
    Returns all active (not returned) REQUEST transactions for this user.
    
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.employee_id == employee_id)
        .filter(models.Transaction.transaction_type == "request")
        .order_by(models.Transaction.created_at.desc())
        .all()
    )
"""


@router.get("/user/{employee_id}", response_model=list[schemas.TransactionOut])
def get_user_transactions_full(employee_id: int, db: Session = Depends(get_db)):
    """Returns user transactions WITH item details."""
    return crud.get_transactions_by_employee(db, employee_id)

@router.get("/{transaction_id}", response_model=schemas.TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = (
        db.query(models.Transaction)
        .join(models.Inventory, models.Transaction.item_id == models.Inventory.item_id)
        .join(models.Fixture, models.Transaction.fixture_id == models.Fixture.fixture_id)
        .join(models.Employee, models.Transaction.employee_id == models.Employee.employee_id)
        .filter(models.Transaction.transaction_id == transaction_id)
        .first()
    )

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "transaction_id": tx.transaction_id,
        "item_id": tx.item_id,
        "fixture_id": tx.fixture_id,
        "employee_id": tx.employee_id,
        "transaction_type": tx.transaction_type,
        "quantity_used": tx.quantity_used,
        "created_at": tx.created_at,
        "remarks": tx.remarks,
        "test_area": tx.test_area,
        "project_name": tx.project_name,

        # Item info
        "item_name": tx.item.item_name,
        "item_part_number": tx.item.item_part_number,
        "item_description": tx.item.item_description,
        "item_manufacturer": tx.item.item_manufacturer,

        # Fixture info
        "fixture_name": tx.fixture.fixture_name,

        # Employee info
        "employee_name": tx.employee.employee_name,

        

    }

@router.post("/return")
def return_item(t: schemas.TransactionBase, db: Session = Depends(get_db)):
    """Employee returns an item (increase quantity)."""
    print("recieving")
    print(t)
    print("end-----------")
    # Add quantity back
    crud.add_item_quantity(db, t.item_id, t.quantity_used)

    # Create the return transaction
    new_tx = models.Transaction(
        item_id=t.item_id,
        employee_id=t.employee_id,
        fixture_id=t.fixture_id,
        quantity_used=t.quantity_used,
        transaction_type="return",
        remarks=t.remarks,
        test_area=t.test_area,
        project_name=t.project_name
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return {"message": "Return logged"}


