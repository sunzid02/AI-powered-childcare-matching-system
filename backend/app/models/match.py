from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    childminder_id: Mapped[int] = mapped_column(ForeignKey("childminders.id", ondelete="CASCADE"), nullable=False)
    location_score: Mapped[float] = mapped_column(Float, nullable=False)
    time_score: Mapped[float] = mapped_column(Float, nullable=False)
    cluster_score: Mapped[float] = mapped_column(Float, nullable=False)
    vector_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    final_score: Mapped[float] = mapped_column(Float, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    rank_position: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    request = relationship("Request", back_populates="matches")
    childminder = relationship("Childminder", back_populates="matches")