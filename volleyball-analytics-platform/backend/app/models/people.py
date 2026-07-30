"""Player, Coach, Official, Season, and Competition models."""

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
    CompetitionType,
    CompetitionStatus,
    SeasonStatus,
)


class Player(Base, BaseModelMixin):
    """Player entity - athlete rostered to a team."""

    __tablename__ = "players"

    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    jersey_number: Mapped[int] = mapped_column(Integer, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[Position] = mapped_column(Enum(Position), nullable=False)
    height_cm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)  # ISO 3166-1 alpha-3
    dominant_hand: Mapped[Optional[Handedness]] = mapped_column(Enum(Handedness), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_libero: Mapped[bool] = mapped_column(Boolean, default=False)
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False)
    is_starting: Mapped[bool] = mapped_column(Boolean, default=False)
    medical_info: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="players", lazy="selectin")
    user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")
    match_statistics: Mapped[List["PlayerMatchStatistics"]] = relationship(
        "PlayerMatchStatistics", back_populates="player", lazy="selectin"
    )
    season_statistics: Mapped[List["PlayerSeasonStatistics"]] = relationship(
        "PlayerSeasonStatistics", back_populates="player", lazy="selectin"
    )
    events: Mapped[List["Event"]] = relationship("Event", back_populates="player", lazy="selectin")
    lineups: Mapped[List["Lineup"]] = relationship("Lineup", back_populates="player", lazy="selectin")
    track_records: Mapped[List["TrackRecord"]] = relationship("TrackRecord", back_populates="player", lazy="selectin")
    pose_records: Mapped[List["PoseRecord"]] = relationship("PoseRecord", back_populates="player", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("team_id", "jersey_number", name="uq_team_jersey"),
        Index("ix_players_team_id", "team_id"),
        Index("ix_players_user_id", "user_id"),
        Index("ix_players_jersey_number", "jersey_number"),
        Index("ix_players_position", "position"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Player(id={self.id}, #{self.jersey_number} {self.full_name}, {self.position})>"


class Coach(Base, BaseModelMixin):
    """Coaching staff member."""

    __tablename__ = "coaches"

    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[CoachRole] = mapped_column(Enum(CoachRole), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    license_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    biography: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    specializations: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="coaches", lazy="selectin")
    user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")

    __table_args__ = (
        Index("ix_coaches_team_id", "team_id"),
        Index("ix_coaches_user_id", "user_id"),
        Index("ix_coaches_role", "role"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Coach(id={self.id}, {self.full_name}, {self.role}, team={self.team_id})>"


class Official(Base, BaseModelMixin):
    """Match official (referee, scorer, line judge)."""

    __tablename__ = "officials"

    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    organization_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[OfficialRole] = mapped_column(Enum(OfficialRole), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    license_expiry: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", lazy="selectin")
    match_officials: Mapped[List["MatchOfficial"]] = relationship(
        "MatchOfficial", back_populates="official", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_officials_organization_id", "organization_id"),
        Index("ix_officials_user_id", "user_id"),
        Index("ix_officials_role", "role"),
        Index("ix_officials_license", "license_number"),
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<Official(id={self.id}, {self.full_name}, {self.role})>"


class MatchOfficial(Base, BaseModelMixin):
    """Association between match and official with specific role."""

    __tablename__ = "match_officials"

    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    official_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("officials.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[OfficialRole] = mapped_column(Enum(OfficialRole), nullable=False)
    assigned_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="officials", lazy="selectin")
    official: Mapped["Official"] = relationship("Official", back_populates="match_officials", lazy="selectin")
    assigned_by_user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("match_id", "official_id", "role", name="uq_match_official_role"),
        Index("ix_match_officials_match_id", "match_id"),
        Index("ix_match_officials_official_id", "official_id"),
    )

    def __repr__(self) -> str:
        return f"<MatchOfficial(match={self.match_id}, official={self.official_id}, role={self.role})>"


class Season(Base, BaseModelMixin):
    """Season - temporal container for competitions."""

    __tablename__ = "seasons"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    registration_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    registration_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[SeasonStatus] = mapped_column(Enum(SeasonStatus), default=SeasonStatus.UPCOMING, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="seasons", lazy="selectin")
    competitions: Mapped[List["Competition"]] = relationship(
        "Competition", back_populates="season", lazy="selectin"
    )
    matches: Mapped[List["Match"]] = relationship("Match", lazy="selectin")
    player_statistics: Mapped[List["PlayerSeasonStatistics"]] = relationship(
        "PlayerSeasonStatistics", back_populates="season", lazy="selectin"
    )
    team_statistics: Mapped[List["TeamSeasonStatistics"]] = relationship(
        "TeamSeasonStatistics", back_populates="season", lazy="selectin"
    )

    __table_args__ = (
        UniqueConstraint("organization_id", "short_name", name="uq_org_season_short"),
        Index("ix_seasons_organization_id", "organization_id"),
        Index("ix_seasons_status", "status"),
        Index("ix_seasons_dates", "start_date", "end_date"),
    )

    def __repr__(self) -> str:
        return f"<Season(id={self.id}, {self.name}, {self.status})>"


class Competition(Base, BaseModelMixin):
    """Competition - league, tournament, cup within a season."""

    __tablename__ = "competitions"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    season_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[CompetitionType] = mapped_column(Enum(CompetitionType), nullable=False)
    status: Mapped[CompetitionStatus] = mapped_column(Enum(CompetitionStatus), default=CompetitionStatus.PLANNING, nullable=False)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rules: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)  # format, points system, etc.
    max_teams: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    prize_pool: Mapped[Optional[float]] = mapped_column(nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="competitions", lazy="selectin")
    season: Mapped["Season"] = relationship("Season", back_populates="competitions", lazy="selectin")
    teams: Mapped[List["CompetitionTeam"]] = relationship(
        "CompetitionTeam", back_populates="competition", lazy="selectin"
    )
    matches: Mapped[List["Match"]] = relationship("Match", back_populates="competition", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("season_id", "short_name", name="uq_season_comp_short"),
        Index("ix_competitions_organization_id", "organization_id"),
        Index("ix_competitions_season_id", "season_id"),
        Index("ix_competitions_type", "type"),
        Index("ix_competitions_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Competition(id={self.id}, {self.name}, {self.type}, {self.status})>"