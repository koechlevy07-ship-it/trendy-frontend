"""Team and Club schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from pydantic.networks import HttpUrl

from app.schemas.base import BaseSchema


# =============================================================================
# Team Category Enum
# =============================================================================


class TeamCategory(str):
    SENIOR_MEN = "senior_men"
    SENIOR_WOMEN = "senior_women"
    UNDER_21 = "under_21"
    UNDER_19 = "under_19"
    UNDER_17 = "under_17"
    UNDER_15 = "under_15"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"


# =============================================================================
# Club Schemas
# =============================================================================


class ClubBase(BaseSchema):
    """Base club schema."""
    name: str = Field(..., min_length=1, max_length=200)
    short_name: str = Field(..., min_length=1, max_length=20)
    code: Optional[str] = Field(None, max_length=20)
    category: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=2000)
    founded_year: Optional[int] = Field(None, ge=1800, le=2100)
    logo_url: Optional[HttpUrl] = None
    banner_url: Optional[HttpUrl] = None
    primary_color: str = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")
    secondary_color: str = Field(default="#1E40AF", pattern=r"^#[0-9A-Fa-f]{6}$")
    accent_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    short_name: str = Field(..., min_length=1, max_length=30)
    display_name: Optional[str] = Field(None, max_length=100)
    website: Optional[HttpUrl] = None
    social_media: Optional[dict] = Field(default_factory=dict)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: str = Field(..., min_length=2, max_length=2)
    status: str = Field(default="active", pattern="^(active|inactive|archived)$")
    metadata_: Optional[dict] = Field(None, alias="metadata")


class ClubCreate(ClubBase):
    """Schema for creating a club."""
    organization_id: UUID
    home_venue_id: Optional[UUID] = None


class ClubUpdate(BaseSchema):
    """Schema for updating a club."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    short_name: Optional[str] = Field(None, min_length=1, max_length=20)
    code: Optional[str] = Field(None, max_length=20)
    category: Optional[str] = None
    description: Optional[str] = None
    founded_year: Optional[int] = Field(None, ge=1800, le=2100)
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    primary_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    secondary_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    accent_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    short_name: Optional[str] = Field(None, min_length=1, max_length=30)
    display_name: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = None
    social_media: Optional[dict] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")
    home_venue_id: Optional[UUID] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class ClubResponse(ClubBase):
    """Club response schema."""
    id: UUID
    organization_id: UUID
    home_venue_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ClubDetailResponse(ClubResponse):
    """Club detail response with additional data."""
    teams_count: int = 0
    administrators_count: int = 0
    home_venue: Optional[dict] = None


class ClubList(BaseSchema):
    """Paginated club list."""
    items: List["ClubResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


# Update forward references
ClubList.model_rebuild()


# =============================================================================
# Team Schemas
# =============================================================================


class TeamBase(BaseSchema):
    """Base team schema."""
    name: str = Field(..., min_length=1, max_length=100)
    short_name: str = Field(..., min_length=1, max_length=20)
    code: Optional[str] = Field(None, max_length=20)
    category: str = Field(..., min_length=1, max_length=50)
    gender: str = Field(..., min_length=1, max_length=20)
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=50)
    logo_url: Optional[str] = None
    primary_color: str = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")
    secondary_color: str = Field(default="#1E40AF", pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = None
    founded_year: Optional[int] = Field(None, ge=1800, le=2100)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class TeamCreate(TeamBase):
    """Schema for creating a team."""
    club_id: UUID
    organization_id: UUID
    home_venue_id: Optional[UUID] = None


class TeamUpdate(BaseSchema):
    """Schema for updating a team."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    short_name: Optional[str] = Field(None, min_length=1, max_length=20)
    code: Optional[str] = Field(None, max_length=20)
    category: Optional[str] = None
    gender: Optional[str] = None
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=50)
    logo_url: Optional[str] = None
    primary_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    secondary_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = None
    founded_year: Optional[int] = Field(None, ge=1800, le=2100)
    home_venue_id: Optional[UUID] = None
    status: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class TeamResponse(TeamBase):
    """Team response schema."""
    id: UUID
    club_id: UUID
    organization_id: UUID
    home_venue_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TeamDetailResponse(TeamResponse):
    """Team detail response with additional data."""
    club: Optional[dict] = None
    club_name: Optional[str] = None
    home_venue: Optional[dict] = None
    players_count: int = 0
    coaches_count: int = 0
    competitions_count: int = 0


class TeamList(BaseSchema):
    """Paginated team list."""
    items: List["TeamResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


# Update forward references
TeamList.model_rebuild()


class TeamListResponse(BaseSchema):
    """Paginated team list response."""
    items: List[TeamResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# =============================================================================
# Club Administrator Schemas
# =============================================================================


class ClubAdministratorCreate(BaseSchema):
    """Schema for adding a club administrator."""
    user_id: UUID
    club_id: UUID
    role: str = Field(default="admin", max_length=50)


class ClubAdministratorUpdate(BaseSchema):
    """Schema for updating a club administrator."""
    role: Optional[str] = Field(None, max_length=50)


class ClubAdministratorResponse(BaseSchema):
    """Club administrator response."""
    user_id: UUID
    club_id: UUID
    role: str
    assigned_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Team Participation Schemas
# =============================================================================


class TeamParticipationCreate(BaseSchema):
    """Schema for registering a team to a competition."""
    team_id: UUID
    competition_id: UUID
    season_id: UUID
    group_name: Optional[str] = Field(None, max_length=50)
    seed: Optional[int] = Field(None, ge=1)


class TeamParticipationUpdate(BaseSchema):
    """Schema for updating team participation."""
    group_name: Optional[str] = Field(None, max_length=50)
    seed: Optional[int] = Field(None, ge=1)
    status: Optional[str] = None


class TeamParticipationResponse(BaseSchema):
    """Team participation response."""
    id: UUID
    team_id: UUID
    competition_id: UUID
    season_id: UUID
    group_name: Optional[str] = None
    seed: Optional[int] = None
    status: str
    registered_at: datetime
    confirmed_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    withdrawal_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamParticipationList(BaseSchema):
    """Paginated team participation list."""
    items: List["TeamParticipationResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


# Update forward references
TeamParticipationList.model_rebuild()