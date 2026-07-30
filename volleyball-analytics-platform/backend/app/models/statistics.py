"""Statistics models - Team and Player statistics for matches and seasons."""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.core import BaseModelMixin


class PlayerMatchStatistics(Base, BaseModelMixin):
    """Per-match player statistics (can be per-set or match aggregate)."""

    __tablename__ = "player_match_statistics"

    player_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    set_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("sets.id", ondelete="SET NULL"), nullable=True
    )

    # Serving
    total_serves: Mapped[int] = mapped_column(Integer, default=0)
    service_aces: Mapped[int] = mapped_column(Integer, default=0)
    service_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Attacking
    attack_attempts: Mapped[int] = mapped_column(Integer, default=0)
    kills: Mapped[int] = mapped_column(Integer, default=0)
    attack_errors: Mapped[int] = mapped_column(Integer, default=0)
    blocked_attacks: Mapped[int] = mapped_column(Integer, default=0)

    # Blocking
    solo_blocks: Mapped[int] = mapped_column(Integer, default=0)
    block_assists: Mapped[int] = mapped_column(Integer, default=0)
    block_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Defense
    digs: Mapped[int] = mapped_column(Integer, default=0)
    saves: Mapped[int] = mapped_column(Integer, default=0)

    # Receiving
    reception_attempts: Mapped[int] = mapped_column(Integer, default=0)
    perfect_receptions: Mapped[int] = mapped_column(Integer, default=0)
    positive_receptions: Mapped[int] = mapped_column(Integer, default=0)
    poor_receptions: Mapped[int] = mapped_column(Integer, default=0)
    reception_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Setting
    set_attempts: Mapped[int] = mapped_column(Integer, default=0)
    assists: Mapped[int] = mapped_column(Integer, default=0)
    setting_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Movement
    distance_covered_m: Mapped[float] = mapped_column(default=0.0)
    avg_speed_kmh: Mapped[float] = mapped_column(default=0.0)
    max_speed_kmh: Mapped[float] = mapped_column(default=0.0)

    # Jumps
    jump_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_jump_height_cm: Mapped[float] = mapped_column(default=0.0)
    max_jump_height_cm: Mapped[float] = mapped_column(default=0.0)

    # Playing time
    playing_time_seconds: Mapped[float] = mapped_column(default=0.0)
    sets_played: Mapped[int] = mapped_column(Integer, default=0)

    # Calculated efficiencies (computed fields)
    attack_efficiency: Mapped[float] = mapped_column(default=0.0)
    serve_efficiency: Mapped[float] = mapped_column(default=0.0)
    reception_efficiency: Mapped[float] = mapped_column(default=0.0)
    setting_efficiency: Mapped[float] = mapped_column(default=0.0)

    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    player: Mapped["Player"] = relationship("Player", back_populates="match_statistics", lazy="selectin")
    match: Mapped["Match"] = relationship("Match", back_populates="player_statistics", lazy="selectin")
    set: Mapped[Optional["Set"]] = relationship("Set", back_populates="player_statistics", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("player_id", "match_id", "set_id", name="uq_player_match_set"),
        Index("ix_pms_player_match", "player_id", "match_id"),
        Index("ix_pms_match", "match_id"),
        Index("ix_pms_set", "set_id"),
    )

    def __repr__(self) -> str:
        return f"<PlayerMatchStats(player={self.player_id}, match={self.match_id}, set={self.set_id})>"


class TeamMatchStatistics(Base, BaseModelMixin):
    """Team statistics per match (per set or aggregate)."""

    __tablename__ = "team_match_statistics"

    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    set_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("sets.id", ondelete="SET NULL"), nullable=True
    )

    # Aggregated team stats
    total_kills: Mapped[int] = mapped_column(Integer, default=0)
    total_aces: Mapped[int] = mapped_column(Integer, default=0)
    total_blocks: Mapped[int] = mapped_column(Integer, default=0)
    total_digs: Mapped[int] = mapped_column(Integer, default=0)
    total_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Efficiency metrics
    attack_efficiency: Mapped[float] = mapped_column(default=0.0)
    serve_efficiency: Mapped[float] = mapped_column(default=0.0)
    reception_efficiency: Mapped[float] = mapped_column(default=0.0)
    block_efficiency: Mapped[float] = mapped_column(default=0.0)

    # Detailed breakdown (JSON)
    serving_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    attacking_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    blocking_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    defense_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    receiving_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    setting_stats: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    team: Mapped["Team"] = relationship("Team", lazy="selectin")
    match: Mapped["Match"] = relationship("Match", back_populates="team_statistics", lazy="selectin")
    set: Mapped[Optional["Set"]] = relationship("Set", back_populates="team_statistics", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("team_id", "match_id", "set_id", name="uq_team_match_set"),
        Index("ix_tms_team_match", "team_id", "match_id"),
        Index("ix_tms_match", "match_id"),
    )

    def __repr__(self) -> str:
        return f"<TeamMatchStats(team={self.team_id}, match={self.match_id})>"


class PlayerSeasonStatistics(Base, BaseModelMixin):
    """Aggregated season statistics for a player."""

    __tablename__ = "player_season_statistics"

    player_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    season_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )

    matches_played: Mapped[int] = mapped_column(Integer, default=0)
    sets_played: Mapped[int] = mapped_column(Integer, default=0)

    # Serving
    total_serves: Mapped[int] = mapped_column(Integer, default=0)
    service_aces: Mapped[int] = mapped_column(Integer, default=0)
    service_errors: Mapped[int] = mapped_column(Integer, default=0)
    serve_percentage: Mapped[float] = mapped_column(default=0.0)
    ace_percentage: Mapped[float] = mapped_column(default=0.0)

    # Attacking
    attack_attempts: Mapped[int] = mapped_column(Integer, default=0)
    kills: Mapped[int] = mapped_column(Integer, default=0)
    attack_errors: Mapped[int] = mapped_column(Integer, default=0)
    blocked_attacks: Mapped[int] = mapped_column(Integer, default=0)
    kill_percentage: Mapped[float] = mapped_column(default=0.0)
    hitting_efficiency: Mapped[float] = mapped_column(default=0.0)

    # Blocking
    solo_blocks: Mapped[int] = mapped_column(Integer, default=0)
    block_assists: Mapped[int] = mapped_column(Integer, default=0)
    block_errors: Mapped[int] = mapped_column(Integer, default=0)
    blocks_per_set: Mapped[float] = mapped_column(default=0.0)

    # Defense
    digs: Mapped[int] = mapped_column(Integer, default=0)
    saves: Mapped[int] = mapped_column(Integer, default=0)
    digs_per_set: Mapped[float] = mapped_column(default=0.0)

    # Receiving
    reception_attempts: Mapped[int] = mapped_column(Integer, default=0)
    perfect_receptions: Mapped[int] = mapped_column(Integer, default=0)
    positive_receptions: Mapped[int] = mapped_column(Integer, default=0)
    poor_receptions: Mapped[int] = mapped_column(Integer, default=0)
    reception_errors: Mapped[int] = mapped_column(Integer, default=0)
    reception_percentage: Mapped[float] = mapped_column(default=0.0)

    # Setting
    set_attempts: Mapped[int] = mapped_column(Integer, default=0)
    assists: Mapped[int] = mapped_column(Integer, default=0)
    setting_errors: Mapped[int] = mapped_column(Integer, default=0)
    assist_percentage: Mapped[float] = mapped_column(default=0.0)

    # Movement
    distance_covered_m: Mapped[float] = mapped_column(default=0.0)
    avg_speed_kmh: Mapped[float] = mapped_column(default=0.0)
    max_speed_kmh: Mapped[float] = mapped_column(default=0.0)

    # Jumping
    jump_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_jump_height_cm: Mapped[float] = mapped_column(default=0.0)
    max_jump_height_cm: Mapped[float] = mapped_column(default=0.0)

    # Playing time
    playing_time_seconds: Mapped[float] = mapped_column(default=0.0)

    # Advanced metrics
    rating: Mapped[Optional[float]] = mapped_column(nullable=True)  # Overall player rating
    mvp_points: Mapped[int] = mapped_column(Integer, default=0)

    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    player: Mapped["Player"] = relationship("Player", back_populates="season_statistics", lazy="selectin")
    season: Mapped["Season"] = relationship("Season", back_populates="player_statistics", lazy="selectin")
    team: Mapped["Team"] = relationship("Team", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("player_id", "season_id", name="uq_player_season"),
        Index("ix_pss_player_season", "player_id", "season_id"),
        Index("ix_pss_team_season", "team_id", "season_id"),
        Index("ix_pss_rating", "rating"),
    )

    def __repr__(self) -> str:
        return f"<PlayerSeasonStats(player={self.player_id}, season={self.season_id})>"


class TeamSeasonStatistics(Base, BaseModelMixin):
    """Aggregated season statistics for a team."""

    __tablename__ = "team_season_statistics"

    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    season_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False
    )

    matches_played: Mapped[int] = mapped_column(Integer, default=0)
    wins: Mapped[int] = mapped_column(Integer, default=0)
    losses: Mapped[int] = mapped_column(Integer, default=0)
    sets_won: Mapped[int] = mapped_column(Integer, default=0)
    sets_lost: Mapped[int] = mapped_column(Integer, default=0)
    points_scored: Mapped[int] = mapped_column(Integer, default=0)
    points_conceded: Mapped[int] = mapped_column(Integer, default=0)

    # Aggregated stats
    total_kills: Mapped[int] = mapped_column(Integer, default=0)
    total_aces: Mapped[int] = mapped_column(Integer, default=0)
    total_blocks: Mapped[int] = mapped_column(Integer, default=0)
    total_digs: Mapped[int] = mapped_column(Integer, default=0)
    total_errors: Mapped[int] = mapped_column(Integer, default=0)

    # Efficiency
    attack_efficiency: Mapped[float] = mapped_column(default=0.0)
    serve_efficiency: Mapped[float] = mapped_column(default=0.0)
    reception_quality: Mapped[float] = mapped_column(default=0.0)
    block_efficiency: Mapped[float] = mapped_column(default=0.0)

    # Standings
    standing: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    playoff_seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    team: Mapped["Team"] = relationship("Team", lazy="selectin")
    season: Mapped["Season"] = relationship("Season", back_populates="team_statistics", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("team_id", "season_id", name="uq_team_season"),
        Index("ix_tss_team_season", "team_id", "season_id"),
        Index("ix_tss_standing", "standing"),
    )

    def __repr__(self) -> str:
        return f"<TeamSeasonStats(team={self.team_id}, season={self.season_id}, W-L={self.wins}-{self.losses})>"