import random
from datetime import date, timedelta

from faker import Faker
from sqlalchemy.orm import Session

from app.models.availability import Availability
from app.models.child import Child
from app.models.childminder import Childminder
from app.models.parent import Parent
from app.models.request import Request
from app.services.clustering_service import (
    classify_childminder_cluster,
    classify_parent_cluster,
)
from app.services.embedding_service import (
    childminder_embedding,
    parent_embedding,
)
from app.utils.constants import (
    CHILDMINDER_TAGS,
    PARENT_WORK_TYPES,
    WEEKDAYS,
    ZONE_CENTERS,
)
from app.utils.time_utils import make_time

fake = Faker()


def _random_point_near_zone(zone: str) -> tuple[float, float]:
    lat, lng = ZONE_CENTERS[zone]
    return (
        round(lat + random.uniform(-0.008, 0.008), 6),
        round(lng + random.uniform(-0.008, 0.008), 6),
    )


def _pick_parent_schedule(persona: str):
    if persona == "working_parents":
        return make_time(random.choice([7, 8]), random.choice([0, 15, 30])), make_time(random.choice([16, 17, 18]), random.choice([0, 15, 30]))
    if persona == "part_time_parents":
        return make_time(random.choice([8, 9, 10]), random.choice([0, 30])), make_time(random.choice([12, 13, 14, 15]), random.choice([0, 30]))
    return make_time(random.choice([7, 8, 9]), random.choice([0, 30])), make_time(random.choice([15, 16, 17]), random.choice([0, 30]))


def _pick_childminder_schedule(persona: str):
    if persona == "early_available":
        return make_time(random.choice([6, 7]), random.choice([0, 30])), make_time(random.choice([16, 17, 18]), random.choice([0, 30]))
    if persona == "part_time_flexible":
        return make_time(random.choice([8, 9]), random.choice([0, 30])), make_time(random.choice([14, 15, 16]), random.choice([0, 30]))
    return make_time(random.choice([7, 8]), random.choice([0, 30])), make_time(random.choice([16, 17]), random.choice([0, 30]))


def clear_demo_data(db: Session) -> None:
    db.query(Availability).delete()
    db.query(Request).delete()
    db.query(Child).delete()
    db.query(Parent).delete()
    db.query(Childminder).delete()
    db.commit()


def seed_demo_data(
    db: Session,
    parent_count: int = 40,
    childminder_count: int = 30,
) -> dict:
    clear_demo_data(db)

    parents: list[Parent] = []
    children: list[Child] = []
    childminders: list[Childminder] = []
    requests: list[Request] = []
    availabilities: list[Availability] = []

    parent_personas = (
        ["working_parents"] * 18
        + ["part_time_parents"] * 14
        + ["special_needs"] * 8
    )
    random.shuffle(parent_personas)

    for i in range(parent_count):
        zone = random.choice(list(ZONE_CENTERS.keys()))
        lat, lng = _random_point_near_zone(zone)
        persona = parent_personas[i % len(parent_personas)]

        if persona == "working_parents":
            work_type = random.choice(["full_time", "hybrid", "shift_worker"])
            requires_special_support = False
        elif persona == "part_time_parents":
            work_type = "part_time"
            requires_special_support = False
        else:
            work_type = random.choice(PARENT_WORK_TYPES)
            requires_special_support = True

        dropoff, pickup = _pick_parent_schedule(persona)
        cluster_label = classify_parent_cluster(
            requires_special_support=requires_special_support,
            preferred_dropoff_time=dropoff,
            preferred_pickup_time=pickup,
            work_type=work_type,
        )

        zone_index = list(ZONE_CENTERS.keys()).index(zone) + 1

        parent = Parent(
            full_name=fake.name(),
            email=f"parent{i+1}@demo.com",
            location_zone=zone,
            latitude=lat,
            longitude=lng,
            work_type=work_type,
            preferred_dropoff_time=dropoff,
            preferred_pickup_time=pickup,
            requires_special_support=requires_special_support,
            notes=fake.sentence(nb_words=10) if random.random() > 0.4 else None,
            cluster_label=cluster_label,
            embedding=parent_embedding(
                zone_index=zone_index,
                dropoff_hour=dropoff.hour,
                pickup_hour=pickup.hour,
                requires_special_support=requires_special_support,
                work_type=work_type,
                cluster_label=cluster_label,
            ),
        )
        db.add(parent)
        parents.append(parent)

    db.commit()

    for parent in parents:
        has_special_needs = parent.requires_special_support or (random.random() < 0.15)
        child = Child(
            parent_id=parent.id,
            child_name=fake.first_name(),
            age_years=random.randint(1, 10),
            has_special_needs=has_special_needs,
            special_needs_notes=(
                random.choice(
                    [
                        "Speech support needed",
                        "Sensory support preferred",
                        "Routine stability important",
                        "Mild developmental support",
                    ]
                )
                if has_special_needs
                else None
            ),
            preferred_start_date=date.today() + timedelta(days=random.randint(7, 60)),
        )
        db.add(child)
        children.append(child)

    childminder_personas = (
        ["early_available"] * 12
        + ["part_time_flexible"] * 10
        + ["special_support_provider"] * 8
    )
    random.shuffle(childminder_personas)

    for i in range(childminder_count):
        zone = random.choice(list(ZONE_CENTERS.keys()))
        lat, lng = _random_point_near_zone(zone)
        persona = childminder_personas[i % len(childminder_personas)]

        if persona == "special_support_provider":
            supports_special_needs = True
        else:
            supports_special_needs = random.random() < 0.2

        earliest, latest = _pick_childminder_schedule(persona)
        cluster_label = classify_childminder_cluster(
            supports_special_needs=supports_special_needs,
            earliest_start_time=earliest,
            latest_end_time=latest,
        )

        max_capacity = random.randint(3, 8)
        current_capacity = random.randint(0, max_capacity - 1)
        zone_index = list(ZONE_CENTERS.keys()).index(zone) + 1

        tags = random.sample(CHILDMINDER_TAGS, k=random.randint(2, 4))
        if supports_special_needs and "special-needs-trained" not in tags:
            tags.append("special-needs-trained")

        cm = Childminder(
            full_name=fake.name(),
            email=f"childminder{i+1}@demo.com",
            location_zone=zone,
            latitude=lat,
            longitude=lng,
            max_capacity=max_capacity,
            current_capacity=current_capacity,
            earliest_start_time=earliest,
            latest_end_time=latest,
            supports_special_needs=supports_special_needs,
            years_experience=random.randint(1, 15),
            tags=", ".join(tags),
            profile_summary=fake.paragraph(nb_sentences=2),
            cluster_label=cluster_label,
            embedding=childminder_embedding(
                zone_index=zone_index,
                earliest_hour=earliest.hour,
                latest_hour=latest.hour,
                supports_special_needs=supports_special_needs,
                capacity_ratio=(max_capacity - current_capacity) / max_capacity,
                cluster_label=cluster_label,
            ),
        )
        db.add(cm)
        childminders.append(cm)

    db.commit()

    for cm in childminders:
        active_days = random.sample(WEEKDAYS, k=random.randint(3, 5))
        for weekday in active_days:
            start_time = cm.earliest_start_time
            end_time = cm.latest_end_time
            available_slots = max(0, cm.max_capacity - cm.current_capacity)
            availability = Availability(
                childminder_id=cm.id,
                weekday=weekday,
                start_time=start_time,
                end_time=end_time,
                available_slots=available_slots,
            )
            db.add(availability)
            availabilities.append(availability)

    db.commit()

    db.refresh(parents[0]) if parents else None
    db.refresh(children[0]) if children else None

    for parent, child in zip(parents, children):
        requested_days = random.sample(WEEKDAYS, k=random.randint(3, 5))
        request = Request(
            parent_id=parent.id,
            child_id=child.id,
            requested_weekdays=",".join(requested_days),
            requested_start_time=parent.preferred_dropoff_time,
            requested_end_time=parent.preferred_pickup_time,
            requested_location_zone=parent.location_zone,
            needs_special_support=child.has_special_needs or parent.requires_special_support,
            status=random.choice(["pending", "pending", "reviewing"]),
        )
        db.add(request)
        requests.append(request)

    db.commit()

    return {
        "parents": len(parents),
        "children": len(children),
        "childminders": len(childminders),
        "availabilities": len(availabilities),
        "requests": len(requests),
    }