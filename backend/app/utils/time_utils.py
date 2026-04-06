from datetime import time


def make_time(hour: int, minute: int = 0) -> time:
    return time(hour=hour, minute=minute)


def time_to_minutes(value: time) -> int:
    return value.hour * 60 + value.minute


def duration_hours(start: time, end: time) -> float:
    return max(0, (time_to_minutes(end) - time_to_minutes(start)) / 60.0)