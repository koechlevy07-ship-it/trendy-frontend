"""Match, Set, Rally, Event, and Lineup models."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    BigInteger,
    CheckConstraint,
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
    MatchStatus,
    MatchFormat,
    SetStatus,
    PointType,
    EventType,
    EventOutcome,
)


class Match(Base, BaseModelMixin):
    """Match entity - scheduled or played competitive encounter."""

    __tablename__ = "matches"

    competition_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("competitions.id"), nullable=True
    )
    season_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id"), nullable=True
    )
    home_team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    away_team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    venue_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("venues.id"), nullable=True
    )
    court_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("courts.id"), nullable=True
    )
    match_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    format: Mapped[MatchFormat] = mapped_column(Enum(MatchFormat), default=MatchFormat.BEST_OF_5, nullable=False)
    status: Mapped[MatchStatus] = mapped_column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, nullable=False)
    round_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g., "Quarterfinals"
    round_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    home_score: Mapped[int] = mapped_column(Integer, default=0)
    away_score: Mapped[int] = mapped_column(Integer, default=0)
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    processing_status: Mapped[str] = mapped_column(
        Enum("pending", "processing", "completed", "failed", name="processing_status"),
        default="pending", nullable=False
    )
    processing_progress: Mapped[float] = mapped_column(default=0.0)
    video_recording_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("video_recordings.id"), nullable=True
    )
    live_stream_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    competition: Mapped[Optional["Competition"]] = relationship(
        "Competition", back_populates="matches", lazy="selectin"
    )
    season: Mapped[Optional["Season"]] = relationship("Season", lazy="selectin")
    home_team: Mapped["Team"] = relationship(
        "Team", foreign_keys=[home_team_id], back_populates="home_matches", lazy="selectin"
    )
    away_team: Mapped["Team"] = relationship(
        "Team", foreign_keys=[away_team_id], back_populates="away_matches", lazy="selectin"
    )
    winner_team: Mapped[Optional["Team"]] = relationship(
        "Team", foreign_keys=[winner_team_id], lazy="selectin"
    )
    venue: Mapped[Optional["Venue"]] = relationship("Venue", back_populates="matches", lazy="selectin")
    court: Mapped[Optional["Court"]] = relationship("Court", back_populates="matches", lazy="selectin")
    sets: Mapped[List["Set"]] = relationship(
        "Set", back_populates="match", lazy="selectin", cascade="all, delete-orphan", order_by="Set.number"
    )
    rallies: Mapped[List["Rally"]] = relationship(
        "Rally", back_populates="match", lazy="selectin", cascade="all, delete-orphan"
    )
    events: Mapped[List["Event"]] = relationship(
        "Event", back_populates="match", lazy="selectin", cascade="all, delete-orphan"
    )
    lineups: Mapped[List["Lineup"]] = relationship(
        "Lineup", back_populates="match", lazy="selectin", cascade="all, delete-orphan"
    )
    player_statistics: Mapped[List["PlayerMatchStatistics"]] = relationship(
        "PlayerMatchStatistics", back_populates="match", lazy="selectin"
    )
    team_statistics: Mapped[List["TeamMatchStatistics"]] = relationship(
        "TeamMatchStatistics", back_populates="match", lazy="selectin"
    )
    officials: Mapped[List["MatchOfficial"]] = relationship(
        "MatchOfficial", back_populates="match", lazy="selectin", cascade="all, delete-orphan"
    )
    video_recording: Mapped[Optional["VideoRecording"]] = relationship(
        "VideoRecording", foreign_keys=[video_recording_id], lazy="selectin"
    )

    __table_args__ = (
        Index("ix_matches_competition_id", "competition_id"),
        Index("ix_matches_season_id", "season_id"),
        Index("ix_matches_home_team_id", "home_team_id"),
        Index("ix_matches_away_team_id", "away_team_id"),
        Index("ix_matches_venue_id", "venue_id"),
        Index("ix_matches_match_date", "match_date"),
        Index("ix_matches_status", "status"),
        Index("ix_matches_processing_status", "processing_status"),
        CheckConstraint("home_team_id != away_team_id", name="ck_matches_different_teams"),
    )

    def __repr__(self) -> str:
        return f"<Match(id={self.id}, {self.home_team_id} vs {self.away_team_id}, {self.status})>"


class Set(Base, BaseModelMixin):
    """Individual set within a match."""

    __tablename__ = "sets"

    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 2, 3, 4, 5
    home_points: Mapped[int] = mapped_column(Integer, default=0)
    away_points: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[SetStatus] = mapped_column(Enum(SetStatus), default=SetStatus.PENDING, nullable=False)
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="sets", lazy="selectin")
    winner_team: Mapped[Optional["Team"]] = relationship("Team", lazy="selectin")
    rallies: Mapped[List["Rally"]] = relationship(
        "Rally", back_populates="set", lazy="selectin", cascade="all, delete-orphan"
    )
    events: Mapped[List["Event"]] = relationship(
        "Event", back_populates="set", lazy="selectin"
    )
    lineups: Mapped[List["Lineup"]] = relationship(
        "Lineup", back_populates="set", lazy="selectin"
    )
    player_statistics: Mapped[List["PlayerMatchStatistics"]] = relationship(
        "PlayerMatchStatistics", back_populates="set", lazy="selectin"
    )
    team_statistics: Mapped[List["TeamMatchStatistics"]] = relationship(
        "TeamMatchStatistics", back_populates="set", lazy="selectin"
    )

    __table_args__ = (
        UniqueConstraint("match_id", "number", name="uq_match_set_number"),
        Index("ix_sets_match_id", "match_id"),
        Index("ix_sets_number", "match_id", "number"),
    )

    def __repr__(self) -> str:
        return f"<Set(match={self.match_id}, #{self.number}, {self.home_points}-{self.away_points})>"


class Rally(Base, BaseModelMixin):
    """Individual rally within a set."""

    __tablename__ = "rallies"

    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    set_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("sets.id", ondelete="CASCADE"), nullable=False
    )
    rally_number: Mapped[int] = mapped_column(Integer, nullable=False)
    serving_team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    receiving_team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(nullable=True)
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    point_type: Mapped[PointType] = mapped_column(Enum(PointType), nullable=False)
    point_by_player_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    rotation_home: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-6
    rotation_away: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-6
    score_before_home: Mapped[int] = mapped_column(Integer, default=0)
    score_before_away: Mapped[int] = mapped_column(Integer, default=0)
    score_after_home: Mapped[int] = mapped_column(Integer, default=0)
    score_after_away: Mapped[int] = mapped_column(Integer, default=0)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="rallies", lazy="selectin")
    set: Mapped["Set"] = relationship("Set", back_populates="rallies", lazy="selectin")
    serving_team: Mapped["Team"] = relationship("Team", foreign_keys=[serving_team_id], lazy="selectin")
    receiving_team: Mapped["Team"] = relationship("Team", foreign_keys=[receiving_team_id], lazy="selectin")
    winner_team: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[winner_team_id], lazy="selectin")
    point_by_player: Mapped[Optional["Player"]] = relationship("Player", lazy="selectin")
    events: Mapped[List["Event"]] = relationship(
        "Event", back_populates="rally", lazy="selectin", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("match_id", "rally_number", name="uq_match_rally_number"),
        Index("ix_rallies_match_id", "match_id"),
        Index("ix_rallies_set_id", "set_id"),
        Index("ix_rallies_rally_number", "match_id", "rally_number"),
    )

    def __repr__(self) -> str:
        return f"<Rally(match={self.match_id}, set={self.set_id}, #{self.rally_number}, {self.point_type})>"


class Event(Base, BaseModelMixin):
    """Volleyball event/action detected by AI or manually logged."""

    __tablename__ = "events"

    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    set_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("sets.id", ondelete="SET NULL"), nullable=True
    )
    rally_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("rallies.id", ondelete="SET NULL"), nullable=True
    )
    player_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    event_type: Mapped[EventType] = mapped_column(Enum(EventType), nullable=False)
    outcome: Mapped[EventOutcome] = mapped_column(Enum(EventOutcome), nullable=False)
    confidence: Mapped[float] = mapped_column(default=0.0)  # AI confidence 0-1
    timestamp_seconds: Mapped[float] = mapped_column(default=0.0)  # seconds from match start
    frame_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    court_position_x: Mapped[Optional[float]] = mapped_column(nullable=True)  # normalized 0-1
    court_position_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    zone: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-6 court zones
    sub_zone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # e.g., "front_left"
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="events", lazy="selectin")
    set: Mapped[Optional["Set"]] = relationship("Set", back_populates="events", lazy="selectin")
    rally: Mapped[Optional["Rally"]] = relationship("Rally", back_populates="events", lazy="selectin")
    player: Mapped[Optional["Player"]] = relationship("Player", back_populates="events", lazy="selectin")
    team: Mapped["Team"] = relationship("Team", lazy="selectin")

    __table_args__ = (
        Index("ix_events_match_id", "match_id"),
        Index("ix_events_set_id", "set_id"),
        Index("ix_events_rally_id", "rally_id"),
        Index("ix_events_player_id", "player_id"),
        Index("ix_events_team_id", "team_id"),
        Index("ix_events_event_type", "event_type"),
        Index("ix_events_timestamp", "match_id", "timestamp_seconds"),
        Index("ix_events_confidence", "confidence"),
    )

    def __repr__(self) -> str:
        return f"<Event(match={self.match_id}, {self.event_type}, player={self.player_id}, outcome={self.outcome})>"


class Lineup(Base, BaseModelMixin):
    """Player lineup for a match/set with position and rotation."""

    __tablename__ = "lineups"

    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    set_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("sets.id", ondelete="CASCADE"), nullable=True
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    player_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-6 court position
    rotation: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-6 rotation number
    is_libero: Mapped[bool] = mapped_column(Boolean, default=False)
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False)
    is_starter: Mapped[bool] = mapped_column(Boolean, default=True)
    substitution_order: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    time_in: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    time_out: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped["Match"] = relationship("Match", back_populates="lineups", lazy="selectin")
    set: Mapped[Optional["Set"]] = relationship("Set", back_populates="lineups", lazy="selectin")
    team: Mapped["Team"] = relationship("Team", lazy="selectin")
    player: Mapped["Player"] = relationship("Player", back_populates="lineups", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("match_id", "set_id", "team_id", "player_id", name="uq_lineup_player_set"),
        UniqueConstraint("match_id", "set_id", "team_id", "position", "rotation", name="uq_lineup_position"),
        Index("ix_lineups_match_id", "match_id"),
        Index("ix_lineups_set_id", "set_id"),
        Index("ix_lineups_team_id", "team_id"),
        Index("ix_lineups_player_id", "player_id"),
    )

    def __repr__(self) -> str:
        return f"<Lineup(match={self.match_id}, team={self.team_id}, player={self.player_id}, pos={self.position})>"