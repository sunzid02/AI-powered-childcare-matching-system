from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("parents.id", ondelete="CASCADE"), nullable=False)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    requested_weekdays: Mapped[str] = mapped_column(Text, nullable=False)
    requested_start_time: Mapped[str] = mapped_column(Time, nullable=False)
    requested_end_time: Mapped[str] = mapped_column(Time, nullable=False)
    requested_location_zone: Mapped[str] = mapped_column(String(20), nullable=False)
    needs_special_support: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending", nullable=False)
    selected_childminder_id: Mapped[int | None] = mapped_column(
        ForeignKey("childminders.id", ondelete="SET NULL"),
        nullable=True,
    )
    selected_match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    parent = relationship("Parent", back_populates="requests")
    child = relationship("Child", back_populates="requests")
    matches = relationship("Match", back_populates="request", cascade="all, delete-orphan")