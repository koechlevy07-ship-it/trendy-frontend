"""Repositories package for Volleyball Analytics Platform."""

from app.repositories.base import BaseRepository
from app.repositories.auth import UserRepository, RoleRepository, PermissionRepository
from app.repositories.organization import (
    OrganizationRepository,
    TeamRepository,
    VenueRepository,
    CourtRepository,
    CompetitionRepository,
    SeasonRepository,
    CompetitionTeamRepository,
)
from app.repositories.match import MatchRepository, SetRepository, RallyRepository, EventRepository, LineupRepository
from app.repositories.statistics import (
    PlayerMatchStatisticsRepository,
    TeamMatchStatisticsRepository,
    PlayerSeasonStatisticsRepository,
    TeamSeasonStatisticsRepository,
)
from app.repositories.ai_video import (
    CameraRepository,
    VideoRecordingRepository,
    AIInferenceRepository,
    TrackRecordRepository,
    PoseRecordRepository,
)
from app.repositories.reports import (
    ReportRepository,
    NotificationRepository,
    AuditLogRepository,
)
from app.repositories.personnel import (
    PlayerRepository,
    PlayerRegistrationRepository,
    CareerHistoryRepository,
    PlayerFaceEmbeddingRepository,
    StaffRepository,
    StaffAssignmentRepository,
    StaffMedicalInfoRepository,
    StaffDocumentRepository,
    MedicalAssignmentRepository,
    TechnicalAssignmentRepository,
    RefereeAssignmentRepository,
    CoachAssignmentRepository,
)

__all__ = [
    # Base
    "BaseRepository",
    # Auth
    "UserRepository",
    "RoleRepository",
    "PermissionRepository",
    # Organization
    "OrganizationRepository",
    "TeamRepository",
    "VenueRepository",
    "CourtRepository",
    "CompetitionRepository",
    "SeasonRepository",
    "CompetitionTeamRepository",
    # Match/Statistics
    "PlayerMatchStatisticsRepository",
    "TeamMatchStatisticsRepository",
    "PlayerSeasonStatisticsRepository",
    "TeamSeasonStatisticsRepository",
    # AI/Video
    "CameraRepository",
    "VideoRecordingRepository",
    "AIInferenceRepository",
    "TrackRecordRepository",
    "PoseRecordRepository",
    # Reports
    "ReportRepository",
    "NotificationRepository",
    "AuditLogRepository",
    # Personnel (Chapter 10)
    "PlayerRepository",
    "PlayerRegistrationRepository",
    "CareerHistoryRepository",
    "PlayerFaceEmbeddingRepository",
    "StaffRepository",
    "StaffAssignmentRepository",
    "StaffMedicalInfoRepository",
    "StaffDocumentRepository",
    "MedicalAssignmentRepository",
    "TechnicalAssignmentRepository",
    "RefereeAssignmentRepository",
    "CoachAssignmentRepository",
]