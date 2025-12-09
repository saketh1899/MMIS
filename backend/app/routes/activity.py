# backend/app/routes/activity.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/activity", tags=["Activity"])

@router.get("/all", response_model=list[schemas.TransactionOut])
def get_employee_history(db: Session = Depends(get_db)):
    return crud.get_transactions_by_employee(db, None)
