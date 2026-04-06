def parent_embedding(
    zone_index: int,
    dropoff_hour: int,
    pickup_hour: int,
    requires_special_support: bool,
    work_type: str,
    cluster_label: str,
) -> list[float]:
    duration = max(0.0, pickup_hour - dropoff_hour)

    return [
        zone_index / 4.0,
        dropoff_hour / 24.0,
        pickup_hour / 24.0,
        duration / 12.0,
        1.0 if requires_special_support else 0.0,
        1.0 if work_type == "part_time" else 0.0,
        1.0 if cluster_label == "working_parents" else 0.0,
        1.0 if cluster_label == "special_needs" else 0.0,
    ]


def childminder_embedding(
    zone_index: int,
    earliest_hour: int,
    latest_hour: int,
    supports_special_needs: bool,
    capacity_ratio: float,
    cluster_label: str,
) -> list[float]:
    span = max(0.0, latest_hour - earliest_hour)

    return [
        zone_index / 4.0,
        earliest_hour / 24.0,
        latest_hour / 24.0,
        span / 12.0,
        1.0 if supports_special_needs else 0.0,
        capacity_ratio,
        1.0 if cluster_label == "early_available" else 0.0,
        1.0 if cluster_label == "special_support_provider" else 0.0,
    ]