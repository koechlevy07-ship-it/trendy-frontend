"""Database models package for Volleyball Analytics Platform."""

# Core enums and base
from app.models.core import (
    Base,
    BaseModelMixin,
    OrganizationType,
    OrganizationStatus,
    TeamGender,
    AgeCategory,
    CompetitionLevel,
    VenueType,
    Position,
    CoachRole,
    OfficialRole,
    CompetitionType,
    CompetitionStatus,
    SeasonStatus,
    MatchStatus,
    MatchFormat,
    SetStatus,
    PointType,
    EventType,
    EventOutcome,
    UserRole,
    UserStatus,
    VideoSourceType,
    ProcessingStatus,
    CameraType,
    ReportType,
    ReportStatus,
    NotificationType,
    NotificationChannel,
    AuditAction,
    AIModelType,
    TeamCategory,
    PlayerCategory,
    StaffRole,
    StaffEmploymentType,
    StaffEmploymentStatus,
    PlayerStatus,
    ClubStatus,
)

# Organization models
from app.models.organization import Organization, Club, Team, Venue, Court

# Authentication models
from app.models.user import User, UserRole, UserStatus
from app.models.auth import Role, Permission, user_roles, role_permissions

# Personnel models
from app.models.personnel import Player, Coach, Official, MatchOfficial

# Competition models
from app.models.competition import Season, Competition, CompetitionTeam

# Match models
from app.models.match import Match, Set, Rally, Event, Lineup

# Statistics models
from app.models.statistics import (
    PlayerMatchStatistics,
    TeamMatchStatistics,
    PlayerSeasonStatistics,
    TeamSeasonStatistics,
)

# AI/Video models
from app.models.ai_video import Camera, VideoRecording, AIInference, TrackRecord, PoseRecord

# Report models
from app.models.reports import Report, Notification, AuditLog
from app.models.audit import AuditLog as AuditLogModel

__all__ = [
    # Core
    "Base",
    "BaseModelMixin",
    # Enums
    "OrganizationType",
    "OrganizationStatus",
    "TeamGender",
    "AgeCategory",
    "CompetitionLevel",
    "VenueType",
    "Position",
    "CoachRole",
    "OfficialRole",
    "CompetitionType",
    "CompetitionStatus",
    "SeasonStatus",
    "MatchStatus",
    "MatchFormat",
    "SetStatus",
    "PointType",
    "EventType",
    "EventOutcome",
    "UserRole",
    "UserStatus",
    "VideoSourceType",
    "ProcessingStatus",
    "CameraType",
    "ReportType",
    "ReportStatus",
    "NotificationType",
    "NotificationChannel",
    "AuditAction",
    "AIModelType",
    "TeamCategory",
    "PlayerCategory",
    "StaffRole",
    "StaffEmploymentType",
    "StaffEmploymentStatus",
    "PlayerStatus",
    "ClubStatus",
    # Organization
    "Organization",
    "Club",
    "Team",
    "Venue",
    "Court",
    # Auth
    "User",
    "Role",
    "Permission",
    "user_roles",
    "role_permissions",
    # Personnel
    "Player",
    "Coach",
    "Official",
    "MatchOfficial",
    # Competition
    "Season",
    "Competition",
    "CompetitionTeam",
    # Match
    "Match",
    "Set",
    "Rally",
    "Event",
    "Lineup",
    # Statistics
    "PlayerMatchStatistics",
    "TeamMatchStatistics",
    "PlayerSeasonStatistics",
    "TeamSeasonStatistics",
    # AI/Video
    "Camera",
    "VideoRecording",
    "AIInference",
    "TrackRecord",
    "PoseRecord",
    # Reports
    "Report",
    "Notification",
    "AuditLog",
    "AuditLogModel",
]