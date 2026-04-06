from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.child import Child
from app.models.parent import Parent
from app.schemas.child import ChildCreate, ChildRead

router = APIRouter(prefix="/children", tags=["Children"])


@router.get("", response_model=list[ChildRead])
def list_children(db: Session = Depends(get_db)):
    return db.query(Child).order_by(Child.id.asc()).all()


@router.post("", response_model=ChildRead)
def create_child(payload: ChildCreate, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.id == payload.parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    child = Child(
        parent_id=payload.parent_id,
        child_name=payload.child_name,
        age_years=payload.age_years,
        has_special_needs=payload.has_special_needs,
        special_needs_notes=payload.special_needs_notes,
        preferred_start_date=payload.preferred_start_date,
    )
    db.add(child)
    db.commit()
    db.refresh(child)
    return child