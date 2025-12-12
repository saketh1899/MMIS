# backend/app/routes/fixtures.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas
from .. import models

router = APIRouter(prefix="/fixtures", tags=["Fixtures"])

@router.get("/", response_model=list[schemas.FixtureOut])
def list_fixtures(db: Session = Depends(get_db)):
    """Return all fixtures."""
    return crud.get_all_fixtures(db)


@router.get("/filter", response_model=list[schemas.FixtureOut])
def filter_fixtures(
    project: str | None = None,
    test_area: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Filter fixtures by project and/or test area.
    Example:
        /fixtures/filter?project=Athena
        /fixtures/filter?project=Athena&test_area=FBT
    """
    query = db.query(models.Fixture)

    if project:
        query = query.filter(models.Fixture.project_name == project)

    if test_area:
        query = query.filter(models.Fixture.test_area == test_area)

    return query.order_by(models.Fixture.fixture_name).all()


@router.post("/", response_model=schemas.FixtureOut)
def add_fixture(data: dict, db: Session = Depends(get_db)):
    """Add a new fixture and create transaction record if employee_id provided."""
    # Extract employee_id if provided
    employee_id = data.get("employee_id")
    
    # Create FixtureBase from the data (excluding employee_id)
    fixture_data = {k: v for k, v in data.items() if k != "employee_id"}
    fx = schemas.FixtureBase(**fixture_data)
    
    # Create the fixture
    db_fixture = crud.create_fixture(db, fx)
    
    # Create transaction record if employee_id is provided (for activity history)
    if employee_id:
        transaction = models.Transaction(
            item_id=None,  # Fixtures are not inventory items
            employee_id=employee_id,
            fixture_id=db_fixture.fixture_id,
            quantity_used=1,  # Representing that one fixture was added
            transaction_type="restock",  # Using "restock" for new fixtures added
            remarks="New fixture added",
            test_area=fx.test_area,
            project_name=fx.project_name,
        )
        db.add(transaction)
        db.commit()
        db.refresh(db_fixture)
    
    return db_fixture
