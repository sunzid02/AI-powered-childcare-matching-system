from datetime import date
from pydantic import BaseModel


class ChildCreate(BaseModel):
    parent_id: int
    child_name: str
    age_years: int
    has_special_needs: bool = False
    special_needs_notes: str | None = None
    preferred_start_date: date


class ChildRead(BaseModel):
    id: int
    parent_id: int
    child_name: str
    age_years: int
    has_special_needs: bool
    special_needs_notes: str | None
    preferred_start_date: date

    model_config = {"from_attributes": True}