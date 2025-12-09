# backend/app/auth.py
# ----------------------------------------------------------
# Endpoint logic for employee login & JWT issuance.
# ----------------------------------------------------------
# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from fastapi.security import OAuth2PasswordRequestForm
# from . import crud
# from .database import get_db
# from .utils.security import verify_password, hash_password
# from .utils.jwt_handler import create_access_token
# from .schemas import EmployeeCreate

# router = APIRouter(prefix="/auth", tags=["Auth"])

# @router.post("/register")
# def register(emp: EmployeeCreate, db: Session = Depends(get_db)):
#     """Register new employee (admin use)."""
#     from .models import Employee
#     if db.query(Employee).filter(Employee.employee_username == emp.employee_username).first():
#         raise HTTPException(status_code=400, detail="Username already exists")
#     hashed_pw = hash_password(emp.employee_password)
#     new_emp = crud.create_employee(db, emp, hashed_pw)
#     return {"message": "Employee registered", "employee_id": new_emp.employee_id}

# @router.post("/login")
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     """Employee login with username & password."""
#     user = crud.get_employee_by_username(db, form_data.username)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid username")

#     # TEMPORARY: Plain text comparison (for testing only)
#     if form_data.password != user.employee_password:
#         raise HTTPException(status_code=401, detail="Invalid password")


#     token = create_access_token({"sub": user.employee_username, "role": user.employee_access_level})
#     return {"access_token": token, "token_type": "bearer"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from . import crud
from .database import get_db
from .utils.jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# ----------------------------------------------------------
# Define a JSON model for login request
# ----------------------------------------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Employee login using JSON data (not form-encoded)."""
    user = crud.get_employee_by_username(db, credentials.username)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username")

    # Plain-text comparison (no hashing)
    if credentials.password != user.employee_password:
        print(user.employee_password)
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
    "sub": user.employee_username,
    "role": user.employee_access_level,
    "employee_id": user.employee_id
    }
    )

    return {"access_token": token, "token_type": "bearer"}
