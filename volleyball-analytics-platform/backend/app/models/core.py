"""Core enums and base model mixin for the Volleyball Analytics Platform."""

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
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# =============================================================================
# ENUMS
# =============================================================================

class OrganizationType(str, enum.Enum):
    CLUB = "club"
    SCHOOL = "school"
    FEDERATION = "federation"
    ACADEMY = "academy"
    LEAGUE = "league"


class OrganizationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class TeamGender(str, enum.Enum):
    MEN = "men"
    WOMEN = "women"
    COED = "coed"


class AgeCategory(str, enum.Enum):
    U12 = "u12"
    U14 = "u14"
    U16 = "u16"
    U18 = "u18"
    U21 = "u21"
    SENIOR = "senior"


class CompetitionLevel(str, enum.Enum):
    AMATEUR = "amateur"
    SEMI_PRO = "semi_pro"
    PROFESSIONAL = "professional"


class VenueType(str, enum.Enum):
    INDOOR = "indoor"
    BEACH = "beach"
    GRASS = "grass"
    OUTDOOR = "outdoor"


class Position(str, enum.Enum):
    OH = "OH"  # Outside Hitter
    MB = "MB"  # Middle Blocker
    OPP = "OPP"  # Opposite
    S = "S"  # Setter
    L = "L"  # Libero
    DS = "DS"  # Defensive Specialist


class Handedness(str, enum.Enum):
    LEFT = "left"
    RIGHT = "right"


class CoachRole(str, enum.Enum):
    HEAD_COACH = "head_coach"
    ASSISTANT_COACH = "assistant_coach"
    CONDITIONING_COACH = "conditioning_coach"
    TECHNICAL_COACH = "technical_coach"
    MENTAL_COACH = "mental_coach"
    SCOUT = "scout"


class OfficialRole(str, enum.Enum):
    FIRST_REFEREE = "first_referee"
    SECOND_REFEREE = "second_referee"
    SCORER = "scorer"
    ASSISTANT_SCORER = "assistant_scorer"
    LINE_JUDGE = "line_judge"
    RESERVE_REFEREE = "reserve_referee"


class CompetitionType(str, enum.Enum):
    LEAGUE = "league"
    TOURNAMENT = "tournament"
    CUP = "cup"
    FRIENDLY = "friendly"
    PLAYOFF = "playoff"
    QUALIFIER = "qualifier"


class CompetitionStatus(str, enum.Enum):
    PLANNING = "planning"
    REGISTRATION_OPEN = "registration_open"
    REGISTRATION_CLOSED = "registration_closed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SeasonStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MatchStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


class MatchFormat(str, enum.Enum):
    BEST_OF_3 = "best_of_3"
    BEST_OF_5 = "best_of_5"


class SetStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class PointType(str, enum.Enum):
    KILL = "kill"
    ACE = "ace"
    BLOCK = "block"
    OPPONENT_ERROR = "opponent_error"
    SERVICE_ERROR = "service_error"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
    OTHER = "other"


class EventType(str, enum.Enum):
    SERVE = "serve"
    ACE = "ace"
    SERVICE_ERROR = "service_error"
    RECEPTION = "reception"
    SET = "set"
    SPIKE = "spike"
    KILL = "kill"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
    BLOCK = "block"
    SOLO_BLOCK = "solo_block"
    BLOCK_ASSIST = "block_assist"
    BLOCK_ERROR = "block_error"
    DIG = "dig"
    SAVE = "save"
    FREE_BALL = "free_ball"
    OVERPASS = "overpass"
    DOUBLE_CONTACT = "double_contact"
    LIFT = "lift"
    NET_TOUCH = "net_touch"
    ROTATION_FAULT = "rotation_fault"
    SUBSTITUTION = "substitution"
    TIMEOUT = "timeout"
    TECHNICAL_TIMEOUT = "technical_timeout"
    SET_END = "set_end"
    MATCH_END = "match_end"


class EventOutcome(str, enum.Enum):
    POINT = "point"
    SIDE_OUT = "side_out"
    ERROR = "error"
    NEUTRAL = "neutral"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    COACH = "coach"
    ASSISTANT_COACH = "assistant_coach"
    ANALYST = "analyst"
    PLAYER = "player"
    STATISTICIAN = "statistician"
    VIEWER = "viewer"
    OFFICIAL = "official"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class VideoSourceType(str, enum.Enum):
    UPLOAD = "upload"
    RTSP = "rtsp"
    WEBCAM = "webcam"
    FILE = "file"


class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CameraType(str, enum.Enum):
    RTSP = "rtsp"
    USB = "usb"
    IP = "ip"
    FILE = "file"


class ReportType(str, enum.Enum):
    MATCH_SUMMARY = "match_summary"
    PLAYER_PERFORMANCE = "player_performance"
    TEAM_ANALYSIS = "team_analysis"
    SEASON_REVIEW = "season_review"
    SCOUTING_REPORT = "scouting_report"
    TACTICAL_ANALYSIS = "tactical_analysis"


class ReportStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class NotificationType(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    MATCH_START = "match_start"
    MATCH_END = "match_end"
    REPORT_READY = "report_ready"
    VIDEO_PROCESSED = "video_processed"
    SYSTEM_ALERT = "system_alert"


class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"
    WEBHOOK = "webhook"


class AuditAction(str, enum.Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    PROCESS = "process"


class TeamCategory(str, enum.Enum):
    """Team categories for classification."""
    SENIOR_MEN = "senior_men"
    SENIOR_WOMEN = "senior_women"
    UNDER_21 = "under_21"
    UNDER_19 = "under_19"
    UNDER_17 = "under_17"
    UNDER_15 = "under_15"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"


class PlayerCategory(str, enum.Enum):
    """Player categories for classification."""
    SENIOR = "senior"
    UNDER_21 = "under_21"
    UNDER_19 = "under_19"
    UNDER_17 = "under_17"
    UNDER_15 = "under_15"
    YOUTH = "youth"
    JUNIOR = "junior"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"
    MASTER = "master"


class StaffRole(str, enum.Enum):
    """Staff roles in the organization."""
    # Coaching staff
    HEAD_COACH = "head_coach"
    ASSISTANT_COACH = "assistant_coach"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUT = "scout"
    
    # Medical staff
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"
    
    # Technical staff
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    EQUIPMENT_MANAGER = "equipment_manager"
    
    # Referee
    FIRST_REFEREE = "first_referee"
    SECOND_REFEREE = "second_referee"
    SCORER = "scorer"
    ASSISTANT_SCORER = "assistant_scorer"
    LINE_JUDGE = "line_judge"
    RESERVE_REFEREE = "reserve_referee"
    
    # Administration
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    CLUB_ADMIN = "club_admin"
    LEAGUE_ADMIN = "league_admin"
    FEDERATION_ADMIN = "federation_admin"
    
    # Player
    PLAYER = "player"
    CAPTAIN = "captain"
    LIBERO = "libero"
    
    # Support
    ANALYST = "analyst"


class StaffEmploymentType(str, enum.Enum):
    """Staff employment type."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, enum.Enum):
    """Staff employment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


class PlayerStatus(str, enum.Enum):
    """Player status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    INJURED = "injured"
    SUSPENDED = "suspended"
    RETIRED = "retired"
    TRANSFERRED = "transferred"
    LOANED = "loaned"
    RELEASED = "released"


class ClubStatus(str, enum.Enum):
    """Club status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DISSOLVED = "dissolved"


class AIModelType(str, enum.Enum):
    PLAYER_DETECTION = "player_detection"
    BALL_DETECTION = "ball_detection"
    POSE_ESTIMATION = "pose_estimation"
    ACTION_RECOGNITION = "action_recognition"
    JERSEY_OCR = "jersey_ocr"
    COURT_DETECTION = "court_detection"
    TRACKING = "tracking"
    EVENT_DETECTION = "event_detection"


# =============================================================================
# CHAPTER 10 - PLAYER & STAFF MANAGEMENT ENUMS
# =============================================================================

class PlayerCategory(str, enum.Enum):
    """Player categories for classification."""
    SENIOR = "senior"
    UNDER_21 = "under_21"
    UNDER_19 = "under_19"
    UNDER_17 = "under_17"
    UNDER_15 = "under_15"
    YOUTH = "youth"
    JUNIOR = "junior"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"
    MASTER = "master"


class PlayerStatus(str, enum.Enum):
    """Player status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    INJURED = "injured"
    SUSPENDED = "suspended"
    RETIRED = "retired"
    TRANSFERRED = "transferred"
    LOANED = "loaned"
    RELEASED = "released"


class ClubStatus(str, enum.Enum):
    """Club status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DISSOLVED = "dissolved"


class StaffEmploymentType(str, enum.Enum):
    """Staff employment type."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, enum.Enum):
    """Staff employment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


class MedicalRole(str, enum.Enum):
    """Medical staff role types."""
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"
    PSYCHOLOGIST = "psychologist"
    MASSAGE_THERAPIST = "massage_therapist"
    ATHLETIC_TRAINER = "athletic_trainer"


class TechnicalRole(str, enum.Enum):
    """Technical staff role types."""
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUTING_COACH = "scouting_coach"


class RefereeLevel(str, enum.Enum):
    """Referee certification levels."""
    INTERNATIONAL = "international"
    NATIONAL = "national"
    REGIONAL = "regional"
    LOCAL = "local"
    TRAINEE = "trainee"


# =============================================================================
# BASE MODEL MIXIN
# =============================================================================

class BaseModelMixin:
    """Common fields and behavior for all models."""

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    updated_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    @property
    def is_soft_deleted(self) -> bool:
        return self.is_deleted

    def soft_delete(self, user_id: Optional[UUID] = None):
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        if user_id:
            self.updated_by = user_id