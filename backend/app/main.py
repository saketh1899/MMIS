# backend/app/main.py
# ----------------------------------------------------------
# FastAPI entrypoint: initializes DB, includes routers,
# and sets up middleware.
# ----------------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import Base, engine
from .routes import employees, inventory, transactions, reports, alerts, activity, fixtures
from . import auth
import os

app = FastAPI(title="Machine Maintenance Inventory System (MMIS)")

# Auto-create tables if not exist
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist (relative to backend directory)
# Get the backend directory (parent of app directory)
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
uploads_dir = os.path.join(backend_dir, "uploads", "item_images")
os.makedirs(uploads_dir, exist_ok=True)

# Mount static files directory for serving images
uploads_base_dir = os.path.join(backend_dir, "uploads")
app.mount("/uploads", StaticFiles(directory=uploads_base_dir), name="uploads")

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