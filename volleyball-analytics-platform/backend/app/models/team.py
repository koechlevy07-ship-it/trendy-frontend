"""Team and organization models."""

import enum
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.organization import Organization, OrganizationType


class Team(Base):
    __tablename__ = "teams"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    short_name: Mapped[str] = mapped_column(String(10), nullable=False)
    gender: Mapped[str] = mapped_column(
        Enum("men", "women", "coed", name="team_gender"), nullable=False
    )
    age_category: Mapped[str] = mapped_column(
        Enum("u12", "u14", "u16", "u18", "u21", "senior", name="age_category"),
        nullable=False,
    )
    competition_level: Mapped[str] = mapped_column(
        Enum("amateur", "semi_pro", "professional", name="competition_level"),
        nullable=False,
    )
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    home_venue: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#3B82F6")
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#1E40AF")
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="teams")
    players = relationship("Player", back_populates="team")
    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")
    
    __table_args__ = (
        {"extend_existing": True},
    )