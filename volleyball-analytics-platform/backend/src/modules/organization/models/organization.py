"""Organization MongoDB Document Models - Chapter 11 Part 2"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, HttpUrl
from bson import ObjectId
from enum import Enum


class OrganizationType(str, Enum):
    FEDERATION = "federation"
    LEAGUE = "league"
    CLUB = "club"
    ACADEMY = "academy"
    SCHOOL = "school"
    UNIVERSITY = "university"
    REGIONAL = "regional"
    NATIONAL_TEAM = "national_team"
    NATIONAL_FEDERATION = "national_federation"
    REGIONAL_FEDERATION = "regional_federation"
    AMATEUR_LEAGUE = "amateur_league"
    PROFESSIONAL_LEAGUE = "professional_league"


class OrganizationStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"
    DISSOLVED = "dissolved"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class OrganizationRegistration(BaseModel):
    registration_number: str
    registration_authority: str
    registration_date: datetime
    tax_identification_number: Optional[str] = None
    business_license_number: Optional[str] = None
    verification_status: VerificationStatus = VerificationStatus.PENDING
    verification_documents: List[str] = []
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None


class OrganizationAddress(BaseModel):
    country: str = Field(..., min_length=2, max_length=2)
    state_province: Optional[str] = None
    county: Optional[str] = None
    city: str
    postal_code: str
    physical_address: str
    gps_coordinates: Optional[Dict[str, float]] = None


class OrganizationContact(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[HttpUrl] = None
    primary_contact_person: Optional[str] = None
    primary_contact_phone: Optional[str] = None
    support_email: Optional[EmailStr] = None


class OrganizationGovernance(BaseModel):
    parent_organization_id: Optional[str] = None
    governing_body_id: Optional[str] = None
    president: Optional[str] = None
    secretary: Optional[str] = None
    treasurer: Optional[str] = None
    organization_administrator: Optional[str] = None
    board_members: List[str] = []


class OrganizationBranding(BaseModel):
    logo: Optional[str] = None
    primary_color: str = "#3B82F6"
    secondary_color: str = "#1E40AF"
    accent_color: Optional[str] = None
    official_jersey_template: Optional[Dict[str, Any]] = None
    mascot: Optional[str] = None
    organization_theme: Optional[str] = None


class OrganizationAIMetadata(BaseModel):
    organization_recognition_id: Optional[str] = None
    logo_recognition_profile: Optional[Dict[str, Any]] = None
    jersey_recognition_template: Optional[Dict[str, Any]] = None
    preferred_court_template: Optional[str] = None
    recognition_metadata_version: int = 1


class OrganizationAuditInfo(BaseModel):
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_by: Optional[str] = None
    version: int = 1
    audit_reference: Optional[str] = None


class OrganizationDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    organization_id: str
    document_type: str
    title: str
    file_url: str
    file_size: int
    mime_type: str
    issued_at: datetime
    expires_at: Optional[datetime] = None
    issued_by: str
    is_verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None


class OrganizationAdministrator(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    organization_id: str
    user_id: str
    role: str
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_by: str


class OrganizationHierarchy(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    parent_organization_id: str
    child_organization_id: str
    relationship_type: str
    effective_date: datetime
    status: str = "active"


class OrganizationInvitation(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    organization_id: str
    email: str
    role: str
    invited_by: str
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    status: str = "pending"


class TeamInvitation(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    team_id: str
    email: str
    role: str
    invited_by: str
    invited_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    status: str = "pending"


class OrganizationAuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    changed_fields: Optional[List[str]] = None
    correlation_id: Optional[str] = None
    request_id: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    device: Optional[str] = None
    user_agent: Optional[str] = None
    result: str = "success"
    error_message: Optional[str] = None


class Organization(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    organization_id: str
    organization_code: str
    organization_name: str
    short_name: str
    organization_type: str
    status: str = "pending_verification"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None
    
    registration: Any
    address: Any
    contact: Any
    governance: Any
    branding: Any
    ai_metadata: Any
    references: Dict[str, List[str]] = {}
    audit: Any
    settings: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
    version: int = 1
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None


class TeamCategory(str, Enum):
    SENIOR_MEN = "senior_men"
    SENIOR_WOMEN = "senior_women"
    U23 = "u23"
    U21 = "u21"
    U19 = "u19"
    U17 = "u17"
    YOUTH = "youth"
    JUNIOR = "junior"
    PARA_VOLLEYBALL = "para_volleyball"
    BEACH_VOLLEYBALL = "beach_volleyball"
    SITTING_VOLLEYBALL = "sitting_volleyball"
    DEVELOPMENT = "development"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"


class TeamGender(str, Enum):
    MEN = "men"
    WOMEN = "women"
    COED = "coed"


class TeamStatus(str, Enum):
    REGISTERING = "registering"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"
    DISBANDED = "disbanded"


class TeamSeasonRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    season_id: str
    season_name: str
    league_id: str
    league_name: str
    division: Optional[str] = None
    final_standing: Optional[int] = None
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    points_for: int = 0
    points_against: int = 0
    sets_won: int = 0
    sets_lost: int = 0
    points_for: int = 0
    points_against: int = 0
    roster_snapshot: List[str] = []
    is_archived: bool = False
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None


class TeamRosterEntry(BaseModel):
    player_id: str
    player_name: str
    jersey_number: int
    position: str
    join_date: datetime
    leave_date: Optional[datetime] = None
    is_active: bool = True
    is_captain: bool = False
    is_libero: bool = False
    is_vice_captain: bool = False
    season_ids: List[str] = []
    added_by: str
    removed_by: Optional[str] = None
    removal_reason: Optional[str] = None
    is_historical: bool = False


class TeamCoachingStaffEntry(BaseModel):
    staff_id: str
    staff_name: str
    role: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_head_coach: bool = False
    responsibilities: List[str] = []
    certifications: List[str] = []
    is_active: bool = True


class TeamSeasonStats(BaseModel):
    season_id: str
    season_name: str
    league_id: str
    league_name: str
    division: Optional[str] = None
    final_standing: Optional[int] = None
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    points_for: int = 0
    points_against: int = 0
    sets_won: int = 0
    sets_lost: int = 0
    roster_snapshot: List[str] = []
    is_archived: bool = False
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None


class TeamSeasonStats(BaseModel):
    season_id: str
    season_name: str
    league_id: str
    league_name: str
    division: Optional[str] = None
    final_standing: Optional[int] = None
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    points_for: int = 0
    points_against: int = 0
    sets_won: int = 0
    sets_lost: int = 0
    roster_snapshot: List[str] = []
    is_archived: bool = False
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None


class TeamBranding(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo_url: Optional[str] = None
    mascot: Optional[str] = None
    nickname: Optional[str] = None
    motto: Optional[str] = None
    kit_design: Optional[Dict[str, Any]] = None


class TeamAIMetadata(BaseModel):
    team_embedding: Optional[List[float]] = None
    jersey_recognition: Optional[Dict[str, Any]] = None
    logo_url: Optional[str] = None
    team_photo_url: Optional[str] = None
    court_side_preference: Optional[str] = None
    recognition_confidence_threshold: Optional[float] = None


class TeamRosterEntry(BaseModel):
    player_id: str
    player_name: str
    jersey_number: int
    position: str
    join_date: datetime
    leave_date: Optional[datetime] = None
    is_active: bool = True
    is_captain: bool = False
    is_libero: bool = False
    is_vice_captain: bool = False
    season_ids: List[str] = []
    added_by: str
    removed_by: Optional[str] = None
    removal_reason: Optional[str] = None
    is_historical: bool = False


class TeamCoachingStaffEntry(BaseModel):
    staff_id: str
    staff_name: str
    role: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_head_coach: bool = False
    responsibilities: List[str] = []
    certifications: List[str] = []
    is_active: bool = True


class TeamSeasonRecord(BaseModel):
    season_id: str
    season_name: str
    league_id: str
    league_name: str
    division: Optional[str] = None
    final_standing: Optional[int] = None
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    points_for: int = 0
    points_against: int = 0
    sets_won: int = 0
    sets_lost: int = 0
    roster_snapshot: List[str] = []
    is_archived: bool = False
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None


class TeamBranding(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo_url: Optional[str] = None
    mascot: Optional[str] = None
    nickname: Optional[str] = None
    motto: Optional[str] = None
    kit_design: Optional[Dict[str, Any]] = None


class TeamAIMetadata(BaseModel):
    team_embedding: Optional[List[float]] = None
    jersey_recognition: Optional[Dict[str, Any]] = None
    logo_url: Optional[str] = None
    team_photo_url: Optional[str] = None
    court_side_preference: Optional[str] = None
    recognition_confidence_threshold: Optional[float] = None


class TeamRosterSnapshot(BaseModel):
    season_id: str
    season_name: str
    players: List[Any]
    coaching_staff: List[Any]
    snapshot_date: datetime


class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    team_id: str
    organization_id: str
    team_code: str
    team_name: str
    short_name: str
    status: str = "registering"
    category: str
    gender: str
    division: Optional[str] = None
    competition_level: Optional[str] = None
    playing_category: Optional[str] = None
    league: Optional[str] = None
    season: Optional[str] = None
    competition_status: Optional[str] = None
    ranking: Optional[int] = None
    points: int = 0
    wins: int = 0
    losses: int = 0
    head_coach: Optional[str] = None
    assistant_coaches: List[str] = []
    team_manager: Optional[str] = None
    captain: Optional[str] = None
    vice_captain: Optional[str] = None
    active_roster: List[str] = []
    reserve_roster: List[str] = []
    medical_staff: List[str] = []
    team_logo: Optional[str] = None
    primary_color: str = "#3B82F6"
    secondary_color: str = "#1E40AF"
    warmup_kit: Optional[str] = None
    competition_kit: Optional[str] = None
    training_kit: Optional[str] = None
    jersey_template: Optional[str] = None
    player_tracking_profile: Optional[str] = None
    court_side_preference: Optional[str] = None
    camera_calibration_profile: Optional[str] = None
    team_recognition_model: Optional[str] = None
    training_schedules: List[str] = []
    match_schedules: List[str] = []
    statistics: List[str] = []
    medical_records: List[str] = []
    video_library: List[str] = []
    performance_analytics: List[str] = []
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    deleted_by: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


# =============================================================================
# HISTORICAL RECORD MODELS (Immutable after archival)
# =============================================================================

class TeamHistoricalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    team_id: str
    team_name: str
    record_type: str  # created, updated, status_changed, organization_changed, roster_changed, coaching_staff_changed, season_record_added, archived, disbanded, ai_metadata_updated, branding_updated
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    changed_by: str
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
    remarks: Optional[str] = None


class OrganizationHistoricalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    organization_id: str
    organization_name: str
    record_type: str  # created, updated, status_changed, parent_changed, branding_updated, registration_updated, suspended, archived, restored, dissolved
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    changed_by: str
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
    remarks: Optional[str] = None


# =============================================================================
# COLLECTION NAMES
# ============================================================================

COLLECTIONS = {
    "organizations": "organizations",
    "teams": "teams",
    "organization_types": "organizationTypes",
    "league_memberships": "leagueMemberships",
    "organization_licenses": "organizationLicenses",
    "organization_facilities": "organizationFacilities",
    "team_branding": "teamBranding",
    "team_seasons": "teamSeasons",
    "team_histories": "teamHistories",
    "organization_documents": "organizationDocuments",
    "organization_administrators": "organizationAdministrators",
    "organization_hierarchy": "organizationHierarchy",
    "organization_invitations": "organizationInvitations",
    "team_invitations": "teamInvitations",
    "organization_audit_logs": "organizationAuditLogs",
}