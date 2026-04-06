from sqlalchemy import ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Availability(Base):
    __tablename__ = "availability"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    childminder_id: Mapped[int] = mapped_column(ForeignKey("childminders.id", ondelete="CASCADE"), nullable=False)
    weekday: Mapped[str] = mapped_column(String(20), nullable=False)
    start_time: Mapped[str] = mapped_column(Time, nullable=False)
    end_time: Mapped[str] = mapped_column(Time, nullable=False)
    available_slots: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    childminder = relationship("Childminder", back_populates="availabilities")