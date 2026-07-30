"""Season, Competition, and CompetitionTeam models."""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Date,
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
    CompetitionType,
    CompetitionStatus,
    SeasonStatus,
    MatchFormat,
    MatchStatus,
    SetStatus,
    PointType,
)


class Season(Base, BaseModelMixin):
    """Season - temporal container for competitions."""

    __tablename__ = "seasons"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    registration_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    registration_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[SeasonStatus] = mapped_column(
        Enum(SeasonStatus), default=SeasonStatus.UPCOMING, nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="seasons", lazy="selectin"
    )
    competitions: Mapped[List["Competition"]] = relationship(
        "Competition", back_populates="season", lazy="selectin", cascade="all, delete-orphan"
    )
    player_statistics: Mapped[List["PlayerSeasonStatistics"]] = relationship(
        "PlayerSeasonStatistics", back_populates="season", lazy="selectin"
    )
    team_statistics: Mapped[List["TeamSeasonStatistics"]] = relationship(
        "TeamSeasonStatistics", back_populates="season", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_seasons_organization_id", "organization_id"),
        Index("ix_seasons_status", "status"),
        Index("ix_seasons_dates", "start_date", "end_date"),
        UniqueConstraint("organization_id", "short_name", name="uq_org_season_short"),
    )

    def __repr__(self) -> str:
        return f"<Season(id={self.id}, name={self.name}, {self.start_date}-{self.end_date})>"


class Competition(Base, BaseModelMixin):
    """Competition - league, tournament, cup, etc."""

    __tablename__ = "competitions"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    season_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(50), nullable=False)
    competition_type: Mapped[CompetitionType] = mapped_column(
        Enum(CompetitionType), nullable=False
    )
    status: Mapped[CompetitionStatus] = mapped_column(
        Enum(CompetitionStatus), default=CompetitionStatus.PLANNING, nullable=False
    )
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # men, women, coed
    age_category: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    competition_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    max_teams: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    format_config: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)  # groups, knockout, etc.
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prize_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="competitions", lazy="selectin"
    )
    season: Mapped["Season"] = relationship("Season", back_populates="competitions", lazy="selectin")
    teams: Mapped[List["CompetitionTeam"]] = relationship(
        "CompetitionTeam", back_populates="competition", lazy="selectin", cascade="all, delete-orphan"
    )
    matches: Mapped[List["Match"]] = relationship(
        "Match", back_populates="competition", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_competitions_organization_id", "organization_id"),
        Index("ix_competitions_season_id", "season_id"),
        Index("ix_competitions_type", "competition_type"),
        Index("ix_competitions_status", "status"),
        UniqueConstraint("season_id", "short_name", name="uq_season_comp_short"),
    )

    def __repr__(self) -> str:
        return f"<Competition(id={self.id}, name={self.name}, type={self.competition_type})>"


class CompetitionTeam(Base):
    """Many-to-many between Competition and Team with additional data."""

    __tablename__ = "competition_teams"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    competition_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("competitions.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    group_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    competition: Mapped["Competition"] = relationship("Competition", back_populates="teams", lazy="selectin")
    team: Mapped["Team"] = relationship("Team", back_populates="competition_teams", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("competition_id", "team_id", name="uq_comp_team"),
        Index("ix_competition_teams_competition_id", "competition_id"),
        Index("ix_competition_teams_team_id", "team_id"),
    )

    def __repr__(self) -> str:
        return f"<CompetitionTeam(comp={self.competition_id}, team={self.team_id})>"