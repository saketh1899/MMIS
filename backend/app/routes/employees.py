# backend/app/routes/employees.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import crud, schemas, models
from ..utils.security import verify_password, hash_password


router = APIRouter(prefix="/employees", tags=["Employees"])

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{employee_id}/change-password")
def change_password(
    employee_id: int,
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db)
):
    """Allow employee to change their own password."""
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Verify current password (plain text comparison for now, as per current auth system)
    if password_data.current_password != emp.employee_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password (storing as plain text for now, matching current system)
    # If you want to use hashing, uncomment the next line and comment the line after
    # emp.employee_password = hash_password(password_data.new_password)
    emp.employee_password = password_data.new_password
    
    db.commit()
    db.refresh(emp)
    
    return {"message": "Password changed successfully"}

