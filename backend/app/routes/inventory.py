from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..database import get_db
import os
import shutil
from pathlib import Path
from typing import Optional

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
def add_inventory(data: dict, db: Session = Depends(get_db)):
    """Add new inventory item and create transaction record if employee_id provided."""
    # Extract employee_id if provided
    employee_id = data.get("employee_id")
    
    # Create InventoryBase from the data
    item_data = {k: v for k, v in data.items() if k != "employee_id"}
    item = schemas.InventoryBase(**item_data)
    
    # Get first available fixture before creating inventory (needed for transaction)
    default_fixture = None
    if employee_id:
        default_fixture = db.query(models.Fixture).first()
        if not default_fixture:
            raise HTTPException(status_code=400, detail="No fixtures available. Please create at least one fixture.")
    
    db_item = crud.create_or_update_inventory(db, item)
    
    # Create transaction record if employee_id is provided (for activity history)
    if employee_id and default_fixture:
        transaction = models.Transaction(
            item_id=db_item.item_id,
            employee_id=employee_id,
            fixture_id=default_fixture.fixture_id,
            quantity_used=item.item_current_quantity,
            transaction_type="restock",  # Using "restock" for new items added
            remarks="New item added",
            test_area=item.test_area,
            project_name=item.project_name,
        )
        db.add(transaction)
        db.commit()
        db.refresh(db_item)
    
    return db_item


@router.put("/{item_id}")
def update_inventory(item_id: int, item: schemas.InventoryBase, db: Session = Depends(get_db)):
    """Update an existing inventory item by ID."""
    db_item = db.query(models.Inventory).filter(models.Inventory.item_id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update all fields except quantity (quantity is handled by restock endpoint)
    update_data = item.dict(exclude={"item_current_quantity"})
    for key, value in update_data.items():
        if value is not None:
            setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item



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


@router.post("/restock")
def restock_item(data: dict, db: Session = Depends(get_db)):
    """Restock an item by adding quantity."""
    item_id = data.get("item_id")
    quantity = data.get("quantity")
    remarks = data.get("remarks", "")
    employee_id = data.get("employee_id")

    if not item_id or quantity is None:
        raise HTTPException(status_code=400, detail="item_id and quantity are required")

    if not employee_id:
        raise HTTPException(status_code=400, detail="employee_id is required")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    # Lock the row to prevent race conditions
    item = (
        db.query(models.Inventory)
        .filter(models.Inventory.item_id == item_id)
        .with_for_update()
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Add quantity
    item.item_current_quantity += quantity
    
    # Create transaction record for restock
    # Use first available fixture as default for restock (restock doesn't require a specific fixture)
    default_fixture = db.query(models.Fixture).first()
    if not default_fixture:
        # If no fixtures exist, create a dummy transaction without fixture
        # But since fixture_id is required, we'll need at least one fixture
        # For now, raise an error or use a workaround
        raise HTTPException(status_code=400, detail="No fixtures available. Please create at least one fixture.")
    
    fixture_id = default_fixture.fixture_id
    
    transaction = models.Transaction(
        item_id=item_id,
        employee_id=employee_id,
        fixture_id=fixture_id,
        quantity_used=quantity,
        transaction_type="restock",
        remarks=remarks,
        test_area=item.test_area,
        project_name=item.project_name,
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(item)

    return {"message": "Restock successful", "new_quantity": item.item_current_quantity}


@router.post("/upload-image")
async def upload_item_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload an image file and return the URL path."""
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_dir = Path(backend_dir) / "uploads" / "item_images"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Generate unique filename (using timestamp + original filename)
    import time
    timestamp = int(time.time() * 1000)  # milliseconds
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = upload_dir / safe_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the URL path
    image_url = f"/uploads/item_images/{safe_filename}"
    return {"image_url": image_url, "filename": safe_filename}


@router.post("/upload-image/{item_id}")
async def upload_and_update_item_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload an image for a specific inventory item and update the database."""
    # Verify item exists
    item = db.query(models.Inventory).filter(models.Inventory.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Get the backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_dir = Path(backend_dir) / "uploads" / "item_images"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Generate filename using item_id to ensure uniqueness
    safe_filename = f"item_{item_id}{file_extension}"
    file_path = upload_dir / safe_filename
    
    # Delete old image if it exists
    if item.item_image_url:
        old_image_path = Path(backend_dir) / item.item_image_url.lstrip("/")
        if old_image_path.exists() and old_image_path.is_file():
            try:
                old_image_path.unlink()
            except Exception:
                pass  # Ignore errors when deleting old file
    
    # Save new file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update item with image URL
    item.item_image_url = f"/uploads/item_images/{safe_filename}"
    db.commit()
    db.refresh(item)
    
    return {"message": "Image uploaded successfully", "image_url": item.item_image_url}
    
