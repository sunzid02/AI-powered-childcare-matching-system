from datetime import time
from pydantic import BaseModel, EmailStr


class AvailabilityRead(BaseModel):
    id: int
    childminder_id: int
    weekday: str
    start_time: time
    end_time: time
    available_slots: int

    model_config = {"from_attributes": True}


class ChildminderRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    location_zone: str
    latitude: float
    longitude: float
    max_capacity: int
    current_capacity: int
    earliest_start_time: time
    latest_end_time: time
    supports_special_needs: bool
    years_experience: int
    tags: str | None
    profile_summary: str | None
    cluster_label: str | None
    availabilities: list[AvailabilityRead] = []

    model_config = {"from_attributes": True}