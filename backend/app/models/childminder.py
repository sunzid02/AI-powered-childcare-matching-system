from sqlalchemy import Boolean, Float, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.db import Base


class Childminder(Base):
    __tablename__ = "childminders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    location_zone: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    max_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_capacity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    earliest_start_time: Mapped[str] = mapped_column(Time, nullable=False)
    latest_end_time: Mapped[str] = mapped_column(Time, nullable=False)
    supports_special_needs: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    years_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    cluster_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(8), nullable=True)

    availabilities = relationship("Availability", back_populates="childminder", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="childminder", cascade="all, delete-orphan")