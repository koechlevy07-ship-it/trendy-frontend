"""Player, Coach, and Official models."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.core import (
    BaseModelMixin,
    Position,
    Handedness,
    CoachRole,
    OfficialRole,
)


class Player(Base, BaseModelMixin):
    """Player entity linked to a team."""

    __tablename__ = "players"

    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    jersey_number: Mapped[int] = mapped_column(Integer, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[Position] = mapped_column(Enum(Position), nullable=False)
    height_cm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    dominant_hand: Mapped[Optional[Handedness]] = mapped_column(Enum(Handedness), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_libero: Mapped[bool] = mapped_column(Boolean, default=False)
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False)
    medical_info: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    team: Mapped["Team"] = relationship("Team", back_populates="players", lazy="selectin")
    match_statistics: Mapped[List["PlayerMatchStatistics"]] = relationship(
        "PlayerMatchStatistics", back_populates="player", lazy="selectin"
    )
    season_statistics: Mapped[List["PlayerSeasonStatistics"]] = relationship(
        "PlayerSeasonStatistics", back_populates="player", lazy="selectin"
    )
    track_records: Mapped[List["TrackRecord"]] = relationship(
        "TrackRecord", back_populates="player", lazy="selectin"
    )
    pose_records: Mapped[List["PoseRecord"]] = relationship(
        "PoseRecord", back_populates="player", lazy="selectin"
    )
    events: Mapped[List["Event"]] = relationship(
        "Event", back_populates="player", lazy="selectin"
    )
    lineups: Mapped[List["Lineup"]] = relationship(
        "Lineup", back_populates="player", lazy="selectin"
    )

    __table_args__ = (
        UniqueConstraint("team_id", "jersey_number", name="uq_team_jersey"),
        Index("ix_players_team_id", "team_id"),
        Index("ix_players_user_id", "user_id"),
        Index("ix_players_position", "position"),
        Index("ix_players_active", "is_active"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Player(id={self.id}, #{self.jersey_number} {self.full_name}, pos={self.position})>"


class Coach(Base, BaseModelMixin):
    """Coaching staff entity."""

    __tablename__ = "coaches"

    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[CoachRole] = mapped_column(Enum(CoachRole), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    specializations: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    team: Mapped["Team"] = relationship("Team", back_populates="coaches", lazy="selectin")

    __table_args__ = (
        Index("ix_coaches_team_id", "team_id"),
        Index("ix_coaches_user_id", "user_id"),
        Index("ix_coaches_role", "role"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Coach(id={self.id}, {self.full_name}, role={self.role}, team={self.team_id})>"


class Official(Base, BaseModelMixin):
    """Match official (referee, scorer, line judge)."""

    __tablename__ = "officials"

    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True
    )
    organization_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[OfficialRole] = mapped_column(Enum(OfficialRole), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    certifications: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    organization: Mapped[Optional["Organization"]] = relationship(
        "Organization", lazy="selectin"
    )
    match_officials: Mapped[List["MatchOfficial"]] = relationship(
        "MatchOfficial", back_populates="official", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_officials_organization_id", "organization_id"),
        Index("ix_officials_role", "role"),
        Index("ix_officials_user_id", "user_id"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Official(id={self.id}, {self.full_name}, role={self.role})>"


class MatchOfficial(Base):
    """Association between Match and Official with role."""

    __tablename__ = "match_officials"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    official_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("officials.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[OfficialRole] = mapped_column(Enum(OfficialRole), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    assigned_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="officials", lazy="selectin")
    official: Mapped["Official"] = relationship("Official", back_populates="match_officials", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("match_id", "official_id", "role", name="uq_match_official_role"),
        Index("ix_match_officials_match_id", "match_id"),
        Index("ix_match_officials_official_id", "official_id"),
    )

    def __repr__(self) -> str:
        return f"<MatchOfficial(match={self.match_id}, official={self.official_id}, role={self.role})>"