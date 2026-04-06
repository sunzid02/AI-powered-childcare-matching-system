from sqlalchemy import Boolean, Float, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.db import Base


class Parent(Base):
    __tablename__ = "parents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    location_zone: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    work_type: Mapped[str] = mapped_column(String(50), nullable=False)
    preferred_dropoff_time: Mapped[str] = mapped_column(Time, nullable=False)
    preferred_pickup_time: Mapped[str] = mapped_column(Time, nullable=False)
    requires_special_support: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cluster_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(8), nullable=True)

    children = relationship("Child", back_populates="parent", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="parent", cascade="all, delete-orphan")