from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.childminder import Childminder
from app.db import get_db
from app.models.child import Child
from app.models.childminder import Childminder
from app.models.match import Match
from app.models.parent import Parent
from app.models.request import Request
from app.schemas.request import (
    RequestChildminderSelection,
    RequestCreate,
    RequestRead,
    RequestStatusUpdate,
)

router = APIRouter(prefix="/requests", tags=["Requests"])


@router.get("", response_model=list[RequestRead])
def list_requests(
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Request).options(joinedload(Request.parent))

    if status:
        query = query.filter(Request.status == status)

    requests = query.order_by(Request.id.desc()).all()

    result = []
    for r in requests:
        name = None
        if r.selected_childminder_id:
            cm = db.query(Childminder).filter(
                Childminder.id == r.selected_childminder_id
            ).first()
            if cm:
                name = cm.full_name

        result.append(
            RequestRead.model_validate(
                {
                    **r.__dict__,
                    "selected_childminder_name": name,
                }
            )
        )

    return result


@router.get("/{request_id}", response_model=RequestRead)
def get_request(request_id: int, db: Session = Depends(get_db)):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request


@router.post("", response_model=RequestRead)
def create_request(payload: RequestCreate, db: Session = Depends(get_db)):
    parent = db.query(Parent).filter(Parent.id == payload.parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    child = db.query(Child).filter(Child.id == payload.child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    request = Request(
        parent_id=payload.parent_id,
        child_id=payload.child_id,
        requested_weekdays=",".join(payload.requested_weekdays),
        requested_start_time=payload.requested_start_time,
        requested_end_time=payload.requested_end_time,
        requested_location_zone=payload.requested_location_zone,
        needs_special_support=payload.needs_special_support,
        status="pending",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/select-childminder", response_model=RequestRead)
def select_childminder_for_request(
    request_id: int,
    payload: RequestChildminderSelection,
    db: Session = Depends(get_db),
):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    childminder = (
        db.query(Childminder)
        .filter(Childminder.id == payload.selected_childminder_id)
        .first()
    )
    if not childminder:
        raise HTTPException(status_code=404, detail="Childminder not found")

    matched_childminder = (
        db.query(Match)
        .filter(
            Match.request_id == request_id,
            Match.childminder_id == payload.selected_childminder_id,
        )
        .first()
    )
    if not matched_childminder:
        raise HTTPException(
            status_code=400,
            detail="Selected childminder is not part of this request's match results",
        )

    request.selected_childminder_id = payload.selected_childminder_id
    request.selected_match_score = payload.selected_match_score
    request.status = "pending"

    db.commit()
    db.refresh(request)
    return request


@router.patch("/{request_id}/status", response_model=RequestRead)
def update_request_status(
    request_id: int,
    payload: RequestStatusUpdate,
    db: Session = Depends(get_db),
):
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if payload.status == "approved" and request.selected_childminder_id is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve a request without a selected childminder",
        )

    request.status = payload.status
    db.commit()
    db.refresh(request)
    return request