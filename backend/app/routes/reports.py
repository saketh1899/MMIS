# backend/app/routes/reports.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/weekly", response_model=list[schemas.ReportOut])
def generate_report(db: Session = Depends(get_db)):
    """Generate and return weekly usage report."""
    return crud.generate_weekly_report(db)
