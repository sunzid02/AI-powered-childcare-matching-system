from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel


class RequestCreate(BaseModel):
    parent_id: int
    child_id: int
    requested_weekdays: list[str]
    requested_start_time: time
    requested_end_time: time
    requested_location_zone: str
    needs_special_support: bool = False


class RequestStatusUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"]


class RequestChildminderSelection(BaseModel):
    selected_childminder_id: int
    selected_match_score: float
    


class RequestRead(BaseModel):
    id: int
    parent_id: int
    child_id: int
    requested_weekdays: str
    requested_start_time: time
    requested_end_time: time
    requested_location_zone: str
    needs_special_support: bool
    status: str
    selected_childminder_id: int | None = None
    selected_match_score: float | None = None
    selected_childminder_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}