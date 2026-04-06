from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.childminder import Childminder
from app.models.parent import Parent
from app.models.request import Request
from app.models.match import Match

def get_demand_supply_by_zone(db: Session):
    demand_rows = (
        db.query(
            Request.requested_location_zone.label("zone"),
            func.count(Request.id).label("demand_count"),
        )
        .group_by(Request.requested_location_zone)
        .all()
    )

    supply_rows = (
        db.query(
            Childminder.location_zone.label("zone"),
            func.sum(Childminder.max_capacity - Childminder.current_capacity).label("supply_count"),
        )
        .group_by(Childminder.location_zone)
        .all()
    )

    demand_map = {row.zone: row.demand_count for row in demand_rows}
    supply_map = {row.zone: int(row.supply_count or 0) for row in supply_rows}

    zones = sorted(set(demand_map.keys()) | set(supply_map.keys()))

    return [
        {
            "zone": zone,
            "demand_count": demand_map.get(zone, 0),
            "supply_count": supply_map.get(zone, 0),
            "shortage": max(0, demand_map.get(zone, 0) - supply_map.get(zone, 0)),
        }
        for zone in zones
    ]


def get_totals(db: Session):
    total_parents = db.query(func.count(Parent.id)).scalar() or 0
    total_childminders = db.query(func.count(Childminder.id)).scalar() or 0
    total_requests = db.query(func.count(Request.id)).scalar() or 0

    from app.models.match import Match
    total_matches = db.query(func.count(Match.id)).scalar() or 0

    return {
        "total_parents": total_parents,
        "total_childminders": total_childminders,
        "total_requests": total_requests,
        "total_matches": total_matches,
    }

def get_cluster_distribution(db: Session):
    parent_clusters = (
        db.query(
            Parent.cluster_label.label("cluster_label"),
            func.count(Parent.id).label("count"),
        )
        .group_by(Parent.cluster_label)
        .all()
    )

    childminder_clusters = (
        db.query(
            Childminder.cluster_label.label("cluster_label"),
            func.count(Childminder.id).label("count"),
        )
        .group_by(Childminder.cluster_label)
        .all()
    )

    return {
        "parent_clusters": [
            {"cluster_label": row.cluster_label or "unknown", "count": row.count}
            for row in parent_clusters
        ],
        "childminder_clusters": [
            {"cluster_label": row.cluster_label or "unknown", "count": row.count}
            for row in childminder_clusters
        ],
    }


def get_waiting_list(db: Session):
    rows = (
        db.query(
            Parent.cluster_label.label("cluster_label"),
            func.count(Request.id).label("pending_requests"),
        )
        .join(Request, Request.parent_id == Parent.id)
        .filter(Request.status.in_(["pending", "reviewing"]))
        .group_by(Parent.cluster_label)
        .all()
    )

    return [
        {
            "cluster_label": row.cluster_label or "unknown",
            "pending_requests": row.pending_requests,
        }
        for row in rows
    ]


def get_heatmap(db: Session):
    demand = (
        db.query(
            Request.requested_location_zone.label("zone"),
            func.count(Request.id).label("count"),
        )
        .group_by(Request.requested_location_zone)
        .all()
    )

    supply = (
        db.query(
            Childminder.location_zone.label("zone"),
            func.count(Childminder.id).label("count"),
        )
        .group_by(Childminder.location_zone)
        .all()
    )

    demand_map = {row.zone: row.count for row in demand}
    supply_map = {row.zone: row.count for row in supply}

    zones = sorted(set(demand_map.keys()) | set(supply_map.keys()))

    return [
        {
            "zone": zone,
            "demand_intensity": demand_map.get(zone, 0),
            "supply_intensity": supply_map.get(zone, 0),
        }
        for zone in zones
    ]