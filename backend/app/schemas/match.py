from datetime import datetime
from pydantic import BaseModel


class MatchResultItem(BaseModel):
    childminder_id: int
    childminder_name: str
    location_score: float
    time_score: float
    cluster_score: float
    vector_score: float
    final_score: float
    rank_position: int
    explanation: str


class MatchResultResponse(BaseModel):
    request_id: int
    generated_at: datetime
    results: list[MatchResultItem]