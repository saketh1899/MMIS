# backend/app/routes/alerts.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/low-stock")
def low_stock_alerts(db: Session = Depends(get_db)):
    """Return list of items below minimum count."""
    items = crud.get_low_stock_items(db)
    return {"low_stock": [i.item_name for i in items], "count": len(items)}
