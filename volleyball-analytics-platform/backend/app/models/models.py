"""Database models for the Volleyball Analytics Platform."""

import enum
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
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User roles in the platform."""
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    COACH = "coach"
    ASSISTANT_COACH = "assistant_coach"
    ANALYST = "analyst"
    PLAYER = "player"
    STATISTICIAN = "statistician"
    VIEWER = "viewer"


class UserStatus(str, enum.Enum):
    """User account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class Organization(Base):
    """Organization/Club entity."""
    __tablename__ = "organizations"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("club", "school", "federation", "academy", name="org_type"),
        nullable=False,
    )
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("active", "inactive", "suspended", name="org_status"),
        default="active",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    teams = relationship("Team", back_populates="organization")
    users = relationship("User", back_populates="organization")


class Team(Base):
    """Team entity."""
    __tablename__ = "teams"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)
    gender: Mapped[str] = mapped_column(
        Enum("men", "women", "coed", name="team_gender"),
        nullable=False,
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
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#3B82F6")
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#1E40AF")
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("active", "inactive", name="team_status"),
        default="active",
        nullable=False,
    )
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
    coaches = relationship("Coach", back_populates="team")


class Player(Base):
    """Player entity."""
    __tablename__ = "players"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    team_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    jersey_number: Mapped[int] = mapped_column(Integer, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[str] = mapped_column(
        Enum("OH", "MB", "OPP", "S", "L", "DS", name="position"),
        nullable=False,
    )
    height_cm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    dominant_hand: Mapped[Optional[str]] = mapped_column(
        Enum("left", "right", name="handedness"),
        nullable=True,
    )
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_libero: Mapped[bool] = mapped_column(Boolean, default=False)
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
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
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("team_id", "jersey_number", name="uq_team_jersey"),
    )


class User(Base):
    """User account entity."""
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.VIEWER, nullable=False
    )
    organization_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )
    team_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION, nullable=False
    )
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    team = relationship("Team")


class PlayerMatchStatistics(Base):
    """Player statistics per match."""
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
    distance_covered_m: float = mapped_column(default=0.0)
    avg_speed_kmh: float = mapped_column(default=0.0)
    max_speed_kmh: float = mapped_column(default=0.0)
    
    # Jumps
    jump_count: int = mapped_column(default=0)
    avg_jump_height_cm: float = mapped_column(default=0.0)
    max_jump_height_cm: float = mapped_column(default=0.0)
    
    # Playing time
    playing_time_seconds: float = mapped_column(default=0.0)
    sets_played: int = mapped_column(default=0)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    player = relationship("Player", back_populates="statistics")
    match = relationship("Match")
    set = relationship("Set")
    
    __table_args__ = (
        Index("idx_player_match", "player_id", "match_id"),
        UniqueConstraint("player_id", "match_id", name="uq_player_match"),
    )


class Match(Base):
    """Match entity."""
    __tablename__ = "matches"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tournament_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tournaments.id"), nullable=True
    )
    home_team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    away_team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    court_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("courts.id"), nullable=True)
    match_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sets_format: Mapped[str] = mapped_column(
        Enum("best_of_3", "best_of_5", name="sets_format"),
        default="best_of_5",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum("scheduled", "live", "paused", "completed", "cancelled", name="match_status"),
        default="scheduled",
        nullable=False,
    )
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"))
    home_score: Mapped[int] = mapped_column(Integer, default=0)
    away_score: Mapped[int] = mapped_column(Integer, default=0)
    video_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=True)
    processing_status: Mapped[str] = mapped_column(
        Enum("pending", "processing", "completed", "failed", name="processing_status"),
        default="pending",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    sets = relationship("Set", back_populates="match")
    events = relationship("Event", back_populates="match")
    statistics = relationship("PlayerMatchStatistics", back_populates="match")
    videos = relationship("Video", back_populates="match")


class Set(Base):
    """Individual set within a match."""
    __tablename__ = "sets"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    home_points: Mapped[int] = mapped_column(Integer, default=0)
    away_points: Mapped[int] = mapped_column(Integer, default=0)
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("pending", "in_progress", "completed", name="set_status"),
        default="pending",
        nullable=False,
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    match = relationship("Match", back_populates="sets")
    rallies = relationship("Rally", back_populates="set")
    player_stats = relationship("PlayerMatchStatistics", back_populates="set")
    lineups = relationship("Lineup", back_populates="set")


class Rally(Base):
    """Individual rally within a set."""
    __tablename__ = "rallies"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    set_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sets.id"), nullable=False)
    rally_number: Mapped[int] = mapped_column(Integer, nullable=False)
    serving_team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    receiving_team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(nullable=True)
    winner_team_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True)
    point_type: Mapped[str] = mapped_column(
        Enum("kill", "ace", "block", "opponent_error", "service_error", "attack_error", "blocked_attack", "other", name="point_type"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    set = relationship("Set", back_populates="rallies")
    events = relationship("Event", back_populates="rally")


class Event(Base):
    """Volleyball events/actions detected by AI."""
    __tablename__ = "events"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    set_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sets.id"), nullable=True)
    rally_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rallies.id"), nullable=True)
    player_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    team_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(
        Enum(
            "serve", "ace", "service_error", "reception", "set", "spike", "kill",
            "attack_error", "blocked_attack", "block", "solo_block", "block_assist",
            "block_error", "dig", "save", "free_ball", "overpass", "double_contact",
            "lift", "net_touch", "rotation_fault", "substitution", "timeout",
            "technical_timeout", "set_end", "match_end",
            name="event_type"
        ),
        nullable=False,
    )
    confidence: Mapped[float] = mapped_column(default=0.0)
    timestamp_seconds: Mapped[float] = mapped_column(default=0.0)
    frame_number: Mapped[int] = mapped_column(Integer, nullable=True)
    court_position_x: Mapped[Optional[float]] = mapped_column(nullable=True)
    court_position_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    outcome: Mapped[str] = mapped_column(
        Enum("point", "side_out", "error", "neutral", name="event_outcome"),
        nullable=False,
    )
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    match = relationship("Match", back_populates="events")
    set = relationship("Set")
    rally = relationship("Rally", back_populates="events")
    player = relationship("Player")
    team = relationship("Team")


class Video(Base):
    """Video recording of a match."""
    __tablename__ = "videos"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    camera_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(nullable=True)
    resolution_width: Mapped[int] = mapped_column(Integer, nullable=True)
    resolution_height: Mapped[int] = mapped_column(Integer, nullable=True)
    fps: Mapped[float] = mapped_column(nullable=True)
    source_type: Mapped[str] = mapped_column(
        Enum("upload", "rtsp", "webcam", "file", name="video_source"),
        default="upload",
        nullable=False,
    )
    processing_status: Mapped[str] = mapped_column(
        Enum("pending", "processing", "completed", "failed", name="processing_status"),
        default="pending",
        nullable=False,
    )
    processing_progress: Mapped[float] = mapped_column(default=0.0)
    uploaded_by: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processing_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    match = relationship("Match", back_populates="videos")
    camera = relationship("Camera")


class Camera(Base):
    """Camera configuration."""
    __tablename__ = "cameras"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    camera_type: Mapped[str] = mapped_column(
        Enum("rtsp", "usb", "ip", "file", name="camera_type"),
        nullable=False,
    )
    connection_url: Mapped[str] = mapped_column(String(500), nullable=False)
    resolution_width: Mapped[int] = mapped_column(Integer, default=1920)
    resolution_height: Mapped[int] = mapped_column(Integer, default=1080)
    fps: Mapped[int] = mapped_column(Integer, default=30)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    calibration_data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    videos = relationship("Video", back_populates="camera")