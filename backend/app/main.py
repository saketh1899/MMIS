# backend/app/main.py
# ----------------------------------------------------------
# FastAPI entrypoint: initializes DB, includes routers,
# and sets up middleware.
# ----------------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import employees, inventory, transactions, reports, alerts, activity, fixtures
from . import auth

app = FastAPI(title="Machine Maintenance Inventory System (MMIS)")

# Auto-create tables if not exist
Base.metadata.create_all(bind=engine)

# CORS so React frontend (localhost:5173) can access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(inventory.router)
app.include_router(transactions.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(activity.router)
app.include_router(fixtures.router)

@app.get("/")
def root():
    return {"message": "Inventory Management System API running!"} 