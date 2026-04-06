from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.matching_service import (
    generate_matches_for_request,
    get_saved_matches_for_request,
)

router = APIRouter(tags=["Matches"])


@router.post("/match/{request_id}")
def generate_matches(request_id: int, db: Session = Depends(get_db)):
    try:
        return generate_matches_for_request(db, request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/matches/{request_id}")
def get_matches(request_id: int, db: Session = Depends(get_db)):
    try:
        return get_saved_matches_for_request(db, request_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/matches/{request_id}/explanations")
def get_match_explanations(request_id: int, db: Session = Depends(get_db)):
    try:
        result = get_saved_matches_for_request(db, request_id)
        return {
            "request_id": request_id,
            "explanations": [
                {
                    "rank_position": item.rank_position,
                    "childminder_id": item.childminder_id,
                    "childminder_name": item.childminder_name,
                    "explanation": item.explanation,
                }
                for item in result.results
            ],
        }
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))