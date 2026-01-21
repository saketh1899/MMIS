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


@router.get("/{fixture_id}", response_model=schemas.FixtureOut)
def get_single_fixture(fixture_id: int, db: Session = Depends(get_db)):
    """Get a single fixture by ID."""
    fixture = db.query(models.Fixture).filter(models.Fixture.fixture_id == fixture_id).first()
    if not fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    return fixture


@router.put("/{fixture_id}", response_model=schemas.FixtureOut)
def update_fixture(fixture_id: int, fixture: schemas.FixtureBase, db: Session = Depends(get_db)):
    """Update an existing fixture by ID."""
    db_fixture = db.query(models.Fixture).filter(models.Fixture.fixture_id == fixture_id).first()
    if not db_fixture:
        raise HTTPException(status_code=404, detail="Fixture not found")
    
    # Update all fields, converting None to empty string for optional fields
    update_data = fixture.dict()
    for key, value in update_data.items():
        # Convert None to empty string for optional fields
        final_value = value if value is not None else ""
        setattr(db_fixture, key, final_value)
    
    db.commit()
    db.refresh(db_fixture)
    return db_fixture


@router.post("/", response_model=schemas.FixtureOut)
def add_fixture(data: dict, db: Session = Depends(get_db)):
    """Add a new fixture and create transaction record if employee_id provided."""
    # Extract employee_id if provided
    employee_id = data.get("employee_id")
    
    # Create FixtureBase from the data (excluding employee_id)
    # Convert None to empty string for optional fields
    fixture_data = {k: (v if v is not None else "") for k, v in data.items() if k != "employee_id"}
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
