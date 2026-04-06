from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.seed_service import seed_demo_data

router = APIRouter(prefix="/seed", tags=["Seed"])


@router.post("")
def seed_database(db: Session = Depends(get_db)):
    return seed_demo_data(db)