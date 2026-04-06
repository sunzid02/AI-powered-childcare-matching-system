from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.analytics_service import (
    get_cluster_distribution,
    get_demand_supply_by_zone,
    get_heatmap,
    get_waiting_list,
    get_totals,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/demand-supply")
def demand_supply(db: Session = Depends(get_db)):
    return get_demand_supply_by_zone(db)


@router.get("/clusters")
def clusters(db: Session = Depends(get_db)):
    return get_cluster_distribution(db)


@router.get("/waiting-list")
def waiting_list(db: Session = Depends(get_db)):
    return get_waiting_list(db)


@router.get("/heatmap")
def heatmap(db: Session = Depends(get_db)):
    return get_heatmap(db)


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    return {
        "totals": get_totals(db),
        "demand_supply": get_demand_supply_by_zone(db),
        **get_cluster_distribution(db),
        "waiting_list": get_waiting_list(db),
        "heatmap": get_heatmap(db),
    }