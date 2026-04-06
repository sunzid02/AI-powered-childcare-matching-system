from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.parent import Parent
from app.schemas.parent import ParentCreate, ParentRead
from app.services.clustering_service import classify_parent_cluster
from app.services.embedding_service import parent_embedding
from app.utils.constants import ZONE_CENTERS

router = APIRouter(prefix="/parents", tags=["Parents"])


@router.get("", response_model=list[ParentRead])
def list_parents(db: Session = Depends(get_db)):
    return db.query(Parent).order_by(Parent.id.asc()).all()


@router.get("/{parent_id}", response_model=ParentRead)
def get_parent(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


@router.post("", response_model=ParentRead)
def create_parent(payload: ParentCreate, db: Session = Depends(get_db)):
    if payload.location_zone not in ZONE_CENTERS:
        raise HTTPException(status_code=400, detail="Invalid zone")

    cluster_label = classify_parent_cluster(
        requires_special_support=payload.requires_special_support,
        preferred_dropoff_time=payload.preferred_dropoff_time,
        preferred_pickup_time=payload.preferred_pickup_time,
        work_type=payload.work_type,
    )

    zone_index = list(ZONE_CENTERS.keys()).index(payload.location_zone) + 1

    parent = Parent(
        full_name=payload.full_name,
        email=payload.email,
        location_zone=payload.location_zone,
        latitude=payload.latitude,
        longitude=payload.longitude,
        work_type=payload.work_type,
        preferred_dropoff_time=payload.preferred_dropoff_time,
        preferred_pickup_time=payload.preferred_pickup_time,
        requires_special_support=payload.requires_special_support,
        notes=payload.notes,
        cluster_label=cluster_label,
        embedding=parent_embedding(
            zone_index=zone_index,
            dropoff_hour=payload.preferred_dropoff_time.hour,
            pickup_hour=payload.preferred_pickup_time.hour,
            requires_special_support=payload.requires_special_support,
            work_type=payload.work_type,
            cluster_label=cluster_label,
        ),
    )

    db.add(parent)
    db.commit()
    db.refresh(parent)
    return parent