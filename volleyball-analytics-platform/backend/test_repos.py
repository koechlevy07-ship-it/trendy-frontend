import sys
sys.path.insert(0, '.')

from src.modules.organization.repositories.organization import OrganizationRepository, TeamRepository, PlayerRepository
print('Organization repositories OK')

from src.modules.organization.repositories.supporting import (
    OrganizationRepository as SupportingOrganizationRepository,
    TeamRepository as SupportingTeamRepository,
    StaffRepository,
    StaffAssignmentRepository,
    StaffMedicalInfoRepository,
    StaffDocumentRepository,
    MedicalAssignmentRepository,
    TechnicalAssignmentRepository,
    RefereeAssignmentRepository,
    CoachAssignmentRepository,
    PlayerRegistrationRepository,
    CareerHistoryRepository,
    PlayerFaceEmbeddingRepository,
    PlayerMatchStatisticsRepository,
    TrackRecordRepository,
    PoseRecordRepository,
    InvitationRepository,
    BrandingRepository,
    AuditRepository,
    get_repositories
)
print('Supporting repositories OK')
print('ALL REPOSITORIES LOADED SUCCESSFULLY')