# backend/app/routes/alerts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas, models
from ..utils.scheduler import send_daily_low_stock_notifications

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/low-stock", response_model=list[schemas.InventoryOut])
def low_stock_alerts(test_area: str | None = None, project: str | None = None, db: Session = Depends(get_db)):
    """Return list of items below minimum count, optionally filtered by test_area and/or project."""
    query = db.query(models.Inventory).filter(
        models.Inventory.item_current_quantity < models.Inventory.item_min_count
    )
    
    if test_area:
        query = query.filter(models.Inventory.test_area == test_area)
    
    if project:
        query = query.filter(models.Inventory.project_name == project)
    
    return query.order_by(models.Inventory.item_name).all()

@router.post("/send-notifications")
def send_low_stock_notifications_manual(db: Session = Depends(get_db)):
    """
    Manually trigger low stock email notifications to admin users.
    This endpoint can be used for testing or to send immediate notifications.
    """
    try:
        send_daily_low_stock_notifications()
        return {"message": "Low stock notifications sent successfully to all admin users"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notifications: {str(e)}")
