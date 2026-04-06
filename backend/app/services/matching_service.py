from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.availability import Availability
from app.models.childminder import Childminder
from app.models.match import Match
from app.models.request import Request
from app.schemas.match import MatchResultItem, MatchResultResponse
from app.utils.scoring import (
    cluster_score,
    location_score,
    overlap_ratio,
    vector_similarity_score,
)


MATCH_WEIGHTS = {
    "location": 0.4,
    "time": 0.4,
    "cluster": 0.2,
}

VECTOR_BONUS_WEIGHT = 0.05


def _parse_weekdays(raw: str) -> set[str]:
    return {item.strip() for item in raw.split(",") if item.strip()}


def _availability_coverage_score(
    request_weekdays: set[str],
    request_start,
    request_end,
    availabilities: list[Availability],
) -> float:
    if not request_weekdays:
        return 0.0

    scores = []
    availability_by_day = {a.weekday: a for a in availabilities if a.available_slots > 0}

    for day in request_weekdays:
        availability = availability_by_day.get(day)
        if not availability:
            scores.append(0.0)
            continue

        scores.append(
            overlap_ratio(
                request_start,
                request_end,
                availability.start_time,
                availability.end_time,
            )
        )

    if not scores:
        return 0.0

    return sum(scores) / len(scores)


def _build_explanation(
    same_zone: bool,
    location_score_value: float,
    time_score_value: float,
    cluster_score_value: float,
    childminder: Childminder,
) -> str:
    reasons = []

    if same_zone or location_score_value >= 0.8:
        reasons.append("the childminder is nearby")
    elif location_score_value >= 0.6:
        reasons.append("the childminder is within a reasonable distance")

    if time_score_value >= 0.85:
        reasons.append("the requested hours are strongly covered")
    elif time_score_value >= 0.6:
        reasons.append("the requested hours are mostly compatible")

    if cluster_score_value >= 0.95:
        reasons.append("the provider profile is a strong fit for this family need")
    elif cluster_score_value >= 0.65:
        reasons.append("the provider profile is a decent fit")

    if childminder.supports_special_needs:
        reasons.append("special support capability is available")

    if not reasons:
        reasons.append("the overall profile fit is acceptable")

    return "Recommended because " + ", ".join(reasons) + "."


def generate_matches_for_request(db: Session, request_id: int) -> MatchResultResponse:
    request = (
        db.query(Request)
        .options(
            joinedload(Request.parent),
            joinedload(Request.child),
        )
        .filter(Request.id == request_id)
        .first()
    )

    if not request:
        raise ValueError(f"Request {request_id} not found")

    db.query(Match).filter(Match.request_id == request_id).delete()
    db.commit()

    request_days = _parse_weekdays(request.requested_weekdays)

    childminders = (
        db.query(Childminder)
        .options(joinedload(Childminder.availabilities))
        .all()
    )

    ranked_results: list[dict] = []

    for childminder in childminders:
        remaining_capacity = childminder.max_capacity - childminder.current_capacity
        if remaining_capacity <= 0:
            continue

        if request.needs_special_support and not childminder.supports_special_needs:
            continue

        same_zone = request.requested_location_zone == childminder.location_zone

        loc_score = location_score(
            parent_lat=request.parent.latitude,
            parent_lng=request.parent.longitude,
            childminder_lat=childminder.latitude,
            childminder_lng=childminder.longitude,
            same_zone=same_zone,
        )

        time_score_value = _availability_coverage_score(
            request_days,
            request.requested_start_time,
            request.requested_end_time,
            childminder.availabilities,
        )

        cl_score = cluster_score(
            request.parent.cluster_label or "working_parents",
            childminder.cluster_label or "early_available",
        )

        vec_score = vector_similarity_score(
            request.parent.embedding,
            childminder.embedding,
        )

        base_final = (
            MATCH_WEIGHTS["location"] * loc_score
            + MATCH_WEIGHTS["time"] * time_score_value
            + MATCH_WEIGHTS["cluster"] * cl_score
        )

        final_score = min(1.0, base_final + VECTOR_BONUS_WEIGHT * vec_score)

        explanation = _build_explanation(
            same_zone=same_zone,
            location_score_value=loc_score,
            time_score_value=time_score_value,
            cluster_score_value=cl_score,
            childminder=childminder,
        )

        ranked_results.append(
            {
                "childminder": childminder,
                "location_score": round(loc_score, 4),
                "time_score": round(time_score_value, 4),
                "cluster_score": round(cl_score, 4),
                "vector_score": round(vec_score, 4),
                "final_score": round(final_score, 4),
                "explanation": explanation,
            }
        )

    ranked_results.sort(key=lambda x: x["final_score"], reverse=True)
    top_results = ranked_results[:3]

    created_matches = []
    response_items = []

    for idx, result in enumerate(top_results, start=1):
        childminder = result["childminder"]

        match_row = Match(
            request_id=request.id,
            childminder_id=childminder.id,
            location_score=result["location_score"],
            time_score=result["time_score"],
            cluster_score=result["cluster_score"],
            vector_score=result["vector_score"],
            final_score=result["final_score"],
            explanation=result["explanation"],
            rank_position=idx,
        )
        db.add(match_row)
        created_matches.append(match_row)

        response_items.append(
            MatchResultItem(
                childminder_id=childminder.id,
                childminder_name=childminder.full_name,
                location_score=result["location_score"],
                time_score=result["time_score"],
                cluster_score=result["cluster_score"],
                vector_score=result["vector_score"],
                final_score=result["final_score"],
                rank_position=idx,
                explanation=result["explanation"],
            )
        )

    db.commit()

    return MatchResultResponse(
        request_id=request.id,
        generated_at=datetime.utcnow(),
        results=response_items,
    )


def get_saved_matches_for_request(db: Session, request_id: int) -> MatchResultResponse:
    request = db.query(Request).filter(Request.id == request_id).first()
    if not request:
        raise ValueError(f"Request {request_id} not found")

    saved = (
        db.query(Match)
        .options(joinedload(Match.childminder))
        .filter(Match.request_id == request_id)
        .order_by(Match.rank_position.asc())
        .all()
    )

    return MatchResultResponse(
        request_id=request_id,
        generated_at=datetime.utcnow(),
        results=[
            MatchResultItem(
                childminder_id=row.childminder_id,
                childminder_name=row.childminder.full_name,
                location_score=row.location_score,
                time_score=row.time_score,
                cluster_score=row.cluster_score,
                vector_score=row.vector_score,
                final_score=row.final_score,
                rank_position=row.rank_position,
                explanation=row.explanation,
            )
            for row in saved
        ],
    )