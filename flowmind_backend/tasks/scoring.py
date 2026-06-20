import math
from datetime import datetime, timezone


def compute_focus_score(task):
    """
    score = base_priority × urgency_multiplier × staleness_boost

    urgency_multiplier: exponential decay on days until deadline.
    staleness_boost:    tasks that have waited longer get a slight bump
                        so nothing stays buried forever.
    """
    base = task.priority  # 1–5

    urgency = 1.0
    if task.deadline:
        now = datetime.now(timezone.utc)
        days_left = (task.deadline - now).total_seconds() / 86400
        if days_left <= 0:
            urgency = 4.0
        elif days_left <= 1:
            urgency = 3.0
        elif days_left <= 3:
            urgency = 2.0
        elif days_left <= 7:
            urgency = 1.5
        else:
            # Halves roughly every 14 days past the 7-day window
            urgency = max(1.0, 1.5 * math.exp(-0.05 * (days_left - 7)))

    days_old = (datetime.now(timezone.utc) - task.created_at).total_seconds() / 86400
    staleness = 1.0 + min(days_old / 30, 0.3)  # up to +30% for month-old tasks

    return base * urgency * staleness
