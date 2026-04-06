from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Child(Base):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("parents.id", ondelete="CASCADE"), nullable=False)
    child_name: Mapped[str] = mapped_column(String(120), nullable=False)
    age_years: Mapped[int] = mapped_column(Integer, nullable=False)
    has_special_needs: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    special_needs_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_start_date: Mapped[str] = mapped_column(Date, nullable=False)

    parent = relationship("Parent", back_populates="children")
    requests = relationship("Request", back_populates="child", cascade="all, delete-orphan")