from datetime import time

from app.utils.time_utils import duration_hours


def classify_parent_cluster(
    requires_special_support: bool,
    preferred_dropoff_time: time,
    preferred_pickup_time: time,
    work_type: str,
) -> str:
    if requires_special_support:
        return "special_needs"

    hours = duration_hours(preferred_dropoff_time, preferred_pickup_time)

    if preferred_dropoff_time.hour <= 8 and hours >= 8:
        return "working_parents"

    if work_type == "part_time" or hours <= 6:
        return "part_time_parents"

    return "working_parents"


def classify_childminder_cluster(
    supports_special_needs: bool,
    earliest_start_time: time,
    latest_end_time: time,
) -> str:
    if supports_special_needs:
        return "special_support_provider"

    span = duration_hours(earliest_start_time, latest_end_time)

    if earliest_start_time.hour <= 7:
        return "early_available"

    if span <= 8:
        return "part_time_flexible"

    return "early_available"