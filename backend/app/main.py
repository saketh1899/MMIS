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
from .utils.scheduler import start_scheduler, stop_scheduler
import os
import atexit

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

# CORS configuration - production ready with environment variable support
# Default allows all origins for development, use CORS_ORIGINS env var for production
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    # Split comma-separated origins and strip whitespace
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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

@app.on_event("startup")
def startup_event():
    """Start the scheduler when the application starts."""
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    """Stop the scheduler when the application shuts down."""
    stop_scheduler()

# Register shutdown handler
atexit.register(stop_scheduler) 