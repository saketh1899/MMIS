# backend/app/routes/fixtures.py
from fastapi import APIRouter, Depends
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
def add_fixture(fx: schemas.FixtureBase, db: Session = Depends(get_db)):
    """Add a new fixture."""
    return crud.create_fixture(db, fx)
