from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.childminder import Childminder
from app.schemas.childminder import ChildminderRead

router = APIRouter(prefix="/childminders", tags=["Childminders"])


@router.get("", response_model=list[ChildminderRead])
def list_childminders(db: Session = Depends(get_db)):
    return db.query(Childminder).order_by(Childminder.id.asc()).all()


@router.get("/{childminder_id}", response_model=ChildminderRead)
def get_childminder(childminder_id: int, db: Session = Depends(get_db)):
    childminder = (
        db.query(Childminder)
        .options(joinedload(Childminder.availabilities))
        .filter(Childminder.id == childminder_id)
        .first()
    )
    if not childminder:
        raise HTTPException(status_code=404, detail="Childminder not found")
    return childminder