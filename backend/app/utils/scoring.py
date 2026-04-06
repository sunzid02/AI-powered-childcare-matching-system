from datetime import time

from app.utils.geo import haversine_km
from app.utils.time_utils import time_to_minutes


def clamp_score(value: float) -> float:
    return max(0.0, min(1.0, value))


def location_score(
    parent_lat: float,
    parent_lng: float,
    childminder_lat: float,
    childminder_lng: float,
    same_zone: bool,
) -> float:
    distance_km = haversine_km(parent_lat, parent_lng, childminder_lat, childminder_lng)

    distance_component = clamp_score(1 - (distance_km / 15.0))
    zone_bonus = 0.15 if same_zone else 0.0

    return clamp_score(distance_component + zone_bonus)


def overlap_ratio(
    req_start: time,
    req_end: time,
    avail_start: time,
    avail_end: time,
) -> float:
    req_start_m = time_to_minutes(req_start)
    req_end_m = time_to_minutes(req_end)
    avail_start_m = time_to_minutes(avail_start)
    avail_end_m = time_to_minutes(avail_end)

    overlap_start = max(req_start_m, avail_start_m)
    overlap_end = min(req_end_m, avail_end_m)
    overlap = max(0, overlap_end - overlap_start)

    requested_duration = max(1, req_end_m - req_start_m)

    return clamp_score(overlap / requested_duration)


def cluster_score(parent_cluster: str, childminder_cluster: str) -> float:
    preferred_pairs = {
        ("working_parents", "early_available"): 1.0,
        ("part_time_parents", "part_time_flexible"): 1.0,
        ("special_needs", "special_support_provider"): 1.0,
    }

    if (parent_cluster, childminder_cluster) in preferred_pairs:
        return 1.0

    if parent_cluster == "special_needs":
        return 0.2

    if parent_cluster == "working_parents" and childminder_cluster == "part_time_flexible":
        return 0.55

    if parent_cluster == "part_time_parents" and childminder_cluster == "early_available":
        return 0.7

    return 0.5


def vector_similarity_score(
    parent_embedding,
    childminder_embedding,
) -> float:
    if parent_embedding is None or childminder_embedding is None:
        return 0.0

    parent_vec = list(parent_embedding)
    childminder_vec = list(childminder_embedding)

    if len(parent_vec) == 0 or len(childminder_vec) == 0:
        return 0.0

    if len(parent_vec) != len(childminder_vec):
        return 0.0

    dot = sum(a * b for a, b in zip(parent_vec, childminder_vec))
    norm_a = sum(a * a for a in parent_vec) ** 0.5
    norm_b = sum(b * b for b in childminder_vec) ** 0.5

    if norm_a == 0 or norm_b == 0:
        return 0.0

    cosine = dot / (norm_a * norm_b)
    return clamp_score((cosine + 1) / 2)