from datetime import time
from pydantic import BaseModel, EmailStr


class ParentCreate(BaseModel):
    full_name: str
    email: EmailStr
    location_zone: str
    latitude: float
    longitude: float
    work_type: str
    preferred_dropoff_time: time
    preferred_pickup_time: time
    requires_special_support: bool = False
    notes: str | None = None


class ParentRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    location_zone: str
    latitude: float
    longitude: float
    work_type: str
    preferred_dropoff_time: time
    preferred_pickup_time: time
    requires_special_support: bool
    notes: str | None
    cluster_label: str | None

    model_config = {"from_attributes": True}