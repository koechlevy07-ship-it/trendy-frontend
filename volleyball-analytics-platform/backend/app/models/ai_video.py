"""AI Inference, Video Recording, Camera, and Track/Pose models."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    BigInteger,
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
    AIModelType,
    ProcessingStatus,
    VideoSourceType,
    CameraType,
)


class Camera(Base, BaseModelMixin):
    """Camera device configuration."""

    __tablename__ = "cameras"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    venue_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("venues.id"), nullable=True
    )
    court_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("courts.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[CameraType] = mapped_column(Enum(CameraType), nullable=False)
    connection_url: Mapped[str] = mapped_column(String(500), nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    password: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resolution_width: Mapped[int] = mapped_column(Integer, default=1920)
    resolution_height: Mapped[int] = mapped_column(Integer, default=1080)
    fps: Mapped[int] = mapped_column(Integer, default=30)
    codec: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    position_x: Mapped[Optional[float]] = mapped_column(nullable=True)  # normalized court position
    position_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    position_z: Mapped[Optional[float]] = mapped_column(nullable=True)  # height
    orientation_yaw: Mapped[Optional[float]] = mapped_column(nullable=True)
    orientation_pitch: Mapped[Optional[float]] = mapped_column(nullable=True)
    orientation_roll: Mapped[Optional[float]] = mapped_column(nullable=True)
    intrinsic_matrix: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    distortion_coefficients: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    calibration_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_streaming: Mapped[bool] = mapped_column(Boolean, default=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="cameras", lazy="selectin")
    venue: Mapped[Optional["Venue"]] = relationship("Venue", lazy="selectin")
    court: Mapped[Optional["Court"]] = relationship("Court", back_populates="cameras", lazy="selectin")
    video_recordings: Mapped[List["VideoRecording"]] = relationship(
        "VideoRecording", back_populates="camera", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_cameras_organization_id", "organization_id"),
        Index("ix_cameras_venue_id", "venue_id"),
        Index("ix_cameras_court_id", "court_id"),
        Index("ix_cameras_active", "is_active"),
    )

    def __repr__(self) -> str:
        return f"<Camera(id={self.id}, name={self.name}, type={self.type})>"


class VideoRecording(Base, BaseModelMixin):
    """Video recording metadata and storage reference."""

    __tablename__ = "video_recordings"

    match_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id"), nullable=True
    )
    camera_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("cameras.id"), nullable=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    source_type: Mapped[VideoSourceType] = mapped_column(Enum(VideoSourceType), nullable=False)
    original_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(nullable=True)
    frame_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    fps: Mapped[Optional[float]] = mapped_column(nullable=True)
    resolution_width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    resolution_height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    codec: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bitrate: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    uploaded_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    processing_status: Mapped[ProcessingStatus] = mapped_column(
        Enum(ProcessingStatus), default=ProcessingStatus.PENDING, nullable=False
    )
    processing_progress: Mapped[float] = mapped_column(default=0.0)
    processing_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storage_bucket: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    storage_region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    thumbnail_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    preview_clips: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    match: Mapped[Optional["Match"]] = relationship("Match", foreign_keys=[match_id], lazy="selectin")
    camera: Mapped[Optional["Camera"]] = relationship("Camera", back_populates="video_recordings", lazy="selectin")
    uploaded_by_user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")
    ai_inferences: Mapped[List["AIInference"]] = relationship(
        "AIInference", back_populates="video_recording", lazy="selectin", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_videos_match_id", "match_id"),
        Index("ix_videos_camera_id", "camera_id"),
        Index("ix_videos_status", "processing_status"),
        Index("ix_videos_uploaded_by", "uploaded_by"),
        Index("ix_videos_start_time", "start_time"),
    )

    def __repr__(self) -> str:
        return f"<VideoRecording(id={self.id}, match={self.match_id}, {self.filename})>"


class AIInference(Base, BaseModelMixin):
    """AI model inference result for a video frame."""

    __tablename__ = "ai_inferences"

    video_recording_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("video_recordings.id", ondelete="CASCADE"), nullable=False
    )
    model_type: Mapped[AIModelType] = mapped_column(Enum(AIModelType), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp_ms: Mapped[int] = mapped_column(BigInteger, nullable=False)  # ms from video start
    confidence_threshold: Mapped[float] = mapped_column(default=0.5)
    detections: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # [{bbox, class, conf, track_id}]
    keypoints: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)  # for pose estimation
    tracking_ids: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    processing_time_ms: Mapped[float] = mapped_column(default=0.0)
    gpu_memory_mb: Mapped[Optional[float]] = mapped_column(nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    video_recording: Mapped["VideoRecording"] = relationship(
        "VideoRecording", back_populates="ai_inferences", lazy="selectin"
    )
    verified_by_user: Mapped[Optional["User"]] = relationship("User", lazy="selectin")

    __table_args__ = (
        Index("ix_ai_video_id", "video_recording_id"),
        Index("ix_ai_model_type", "model_type"),
        Index("ix_ai_frame", "video_recording_id", "frame_number"),
        Index("ix_ai_timestamp", "video_recording_id", "timestamp_ms"),
        Index("ix_ai_verified", "is_verified"),
    )

    def __repr__(self) -> str:
        return f"<AIInference(video={self.video_recording_id}, {self.model_type}, frame={self.frame_number})>"


class TrackRecord(Base, BaseModelMixin):
    """Object tracking record for a player across frames."""

    __tablename__ = "track_records"

    player_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    track_id: Mapped[str] = mapped_column(String(50), nullable=False)
    video_recording_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("video_recordings.id", ondelete="CASCADE"), nullable=False
    )
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp_ms: Mapped[int] = mapped_column(BigInteger, nullable=False)
    bbox_x: Mapped[float] = mapped_column(nullable=False)
    bbox_y: Mapped[float] = mapped_column(nullable=False)
    bbox_w: Mapped[float] = mapped_column(nullable=False)
    bbox_h: Mapped[float] = mapped_column(nullable=False)
    confidence: Mapped[float] = mapped_column(nullable=False)
    court_x: Mapped[float] = mapped_column(nullable=False)
    court_y: Mapped[float] = mapped_column(nullable=False)
    velocity_x: Mapped[Optional[float]] = mapped_column(nullable=True)
    velocity_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    speed_mps: Mapped[Optional[float]] = mapped_column(nullable=True)
    team_assignment: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # "home" or "away"
    jersey_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    player: Mapped[Optional["Player"]] = relationship("Player", back_populates="track_records", lazy="selectin")
    video_recording: Mapped["VideoRecording"] = relationship("VideoRecording", lazy="selectin")

    __table_args__ = (
        Index("ix_tracks_track_id", "track_id"),
        Index("ix_tracks_video_frame", "video_recording_id", "frame_number"),
        Index("ix_tracks_player", "player_id"),
        Index("ix_tracks_team", "team_assignment"),
    )

    def __repr__(self) -> str:
        return f"<TrackRecord(track={self.track_id}, frame={self.frame_number}, player={self.player_id})>"


class PoseRecord(Base, BaseModelMixin):
    """Pose estimation record for a player."""

    __tablename__ = "pose_records"

    player_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    video_recording_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("video_recordings.id", ondelete="CASCADE"), nullable=False
    )
    track_id: Mapped[str] = mapped_column(String(50), nullable=False)
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp_ms: Mapped[int] = mapped_column(BigInteger, nullable=False)
    keypoints: Mapped[list] = mapped_column(JSONB, nullable=False)  # 17 keypoints [x,y,conf]
    confidence_scores: Mapped[list] = mapped_column(JSONB, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    overall_confidence: Mapped[float] = mapped_column(nullable=False)
    court_position_x: Mapped[Optional[float]] = mapped_column(nullable=True)
    court_position_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    action_label: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    action_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    player: Mapped["Player"] = relationship("Player", back_populates="pose_records", lazy="selectin")
    video_recording: Mapped["VideoRecording"] = relationship("VideoRecording", lazy="selectin")

    __table_args__ = (
        Index("ix_poses_player_frame", "player_id", "frame_number"),
        Index("ix_poses_video_frame", "video_recording_id", "frame_number"),
        Index("ix_poses_action", "action_label"),
    )

    def __repr__(self) -> str:
        return f"<PoseRecord(player={self.player_id}, frame={self.frame_number}, action={self.action_label})>"