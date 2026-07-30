"""Player and statistics models."""

import enum
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
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
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.core import PlayerCategory, PlayerStatus


class Position(str, enum.Enum):
    OH = "OH"  # Outside Hitter
    MB = "MB"  # Middle Blocker
    OPP = "OPP"  # Opposite
    S = "S"  # Setter
    L = "L"  # Libero
    DS = "DS"  # Defensive Specialist


class Player(Base):
    __tablename__ = "players"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    jersey_number: Mapped[int] = mapped_column(Integer, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[str] = mapped_column(
        Enum(Position), nullable=False
    )
    height_cm: Mapped[Optional[int]] = mapped_column(nullable=True)
    weight_kg: Mapped[Optional[int]] = mapped_column(nullable=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    dominant_hand: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_libero: Mapped[bool] = mapped_column(default=False)
    is_captain: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    team = relationship("Team", back_populates="players")
    statistics = relationship("PlayerMatchStatistics", back_populates="player")
    track_records = relationship("TrackRecord", back_populates="player")
    pose_records = relationship("PoseRecord", back_populates="player")
    registration = relationship("PlayerRegistration", back_populates="player", uselist=False)
    career_history = relationship("CareerHistory", back_populates="player")
    face_embeddings = relationship("PlayerFaceEmbedding", back_populates="player")
    
    __table_args__ = (
        UniqueConstraint("team_id", "jersey_number", name="uq_team_jersey"),
        Index("ix_players_team_id", "team_id"),
        Index("ix_players_jersey_number", "jersey_number"),
        {"extend_existing": True},
    )


class PlayerMatchStatistics(Base):
    __tablename__ = "player_match_statistics"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    match_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    set_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("sets.id"), nullable=True)
    
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
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    player = relationship("Player", back_populates="statistics")
    match = relationship("Match")
    set = relationship("Set")
    
    __table_args__ = (
        UniqueConstraint("player_id", "match_id", name="uq_player_match"),
        Index("idx_player_match_stats_player", "player_id"),
        Index("idx_player_match_stats_match", "match_id"),
        {"extend_existing": True},
    )


class TrackRecord(Base):
    __tablename__ = "track_records"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    track_id: Mapped[str] = mapped_column(String(50), nullable=False)
    player_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp_ms: Mapped[int] = mapped_column(BigInteger, nullable=False)
    bbox_x: Mapped[float] = mapped_column(nullable=False)
    bbox_y: Mapped[float] = mapped_column(nullable=False)
    bbox_w: Mapped[float] = mapped_column(nullable=False)
    bbox_h: Mapped[float] = mapped_column(nullable=False)
    confidence: Mapped[float] = mapped_column(nullable=False)
    court_x: Mapped[float] = mapped_column(nullable=False)
    court_y: Mapped[float] = mapped_column(nullable=False)
    team_assignment: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # Relationships
    player = relationship("Player", back_populates="track_records")
    
    __table_args__ = (
        Index("ix_track_records_track_id", "track_id"),
        Index("ix_track_records_frame", "frame_number"),
        {"extend_existing": True},
    )


class PoseRecord(Base):
    __tablename__ = "pose_records"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    track_id: Mapped[str] = mapped_column(String(50), nullable=False)
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False)
    keypoints: Mapped[dict] = mapped_column(JSONB, nullable=False)
    confidence_scores: Mapped[list] = mapped_column(JSONB, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    timestamp_ms: Mapped[int] = mapped_column(BigInteger, nullable=False)
    
    # Relationships
    player = relationship("Player", back_populates="pose_records")
    
    __table_args__ = (
        Index("ix_pose_records_player_frame", "player_id", "frame_number"),
        {"extend_existing": True},
    )


# =============================================================================
# CHAPTER 10 PART 2 - ADDITIONAL MODELS
# =============================================================================

class PlayerRegistration(Base):
    """Player registration and licensing information."""
    
    __tablename__ = "player_registrations"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False, unique=True)
    
    # Registration details
    registration_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    registration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    registration_authority: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    
    # Verification documents
    verification_documents: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    verified_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    player = relationship("Player", back_populates="registration")
    
    __table_args__ = (
        Index("ix_player_registrations_player_id", "player_id"),
        Index("ix_player_registrations_registration_id", "registration_id"),
        Index("ix_player_registrations_status", "status"),
        Index("ix_player_registrations_expiry_date", "expiry_date"),
    )


class CareerHistory(Base):
    """Player career history - historical records remain immutable once archived."""
    
    __tablename__ = "career_history"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    career_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    
    # Career details
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    league: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    season: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    position: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    matches_played: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    coach: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Awards and recognition
    awards: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    
    # Notes
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Audit - immutable after archival
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    player = relationship("Player", back_populates="career_history")
    
    __table_args__ = (
        Index("ix_career_history_player_id", "player_id"),
        Index("ix_career_history_season", "season"),
        Index("ix_career_history_organization", "organization"),
        Index("ix_career_history_career_id", "career_id"),
        Index("ix_career_history_dates", "start_date", "end_date"),
    )


class PlayerFaceEmbedding(Base):
    """AI face embedding references for computer vision player identification."""
    
    __tablename__ = "player_face_embeddings"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    embedding_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    
    # Embedding metadata
    embedding_version: Mapped[int] = mapped_column(Integer, default=1)
    feature_vector_reference: Mapped[str] = mapped_column(String(500), nullable=False)  # Reference to external vector DB
    capture_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    camera_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    quality_score: Mapped[Optional[float]] = mapped_column(nullable=True)
    algorithm_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    player = relationship("Player", back_populates="face_embeddings")
    
    __table_args__ = (
        Index("ix_face_embeddings_player_id", "player_id"),
        Index("ix_face_embeddings_embedding_version", "embedding_version"),
        Index("ix_face_embeddings_status", "status"),
        Index("ix_face_embeddings_embedding_id", "embedding_id"),
    )