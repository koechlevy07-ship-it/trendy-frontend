"""Organization schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import EmailStr, Field, ConfigDict
from pydantic.networks import HttpUrl

from app.schemas.base import BaseSchema


class OrganizationBase(BaseSchema):
    """Base organization schema."""
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., min_length=1, max_length=50)
    country: str = Field(..., min_length=2, max_length=2)
    region: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[HttpUrl] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    website: Optional[HttpUrl] = None
    address: Optional[str] = None
    time_zone: Optional[str] = Field(None, max_length=50)
    settings: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class OrganizationCreate(OrganizationBase):
    """Schema for creating an organization."""
    owner_id: Optional[UUID] = None
    parent_organization_id: Optional[UUID] = None


class OrganizationUpdate(BaseSchema):
    """Schema for updating an organization."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    region: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[HttpUrl] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    website: Optional[HttpUrl] = None
    address: Optional[str] = None
    time_zone: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, min_length=1, max_length=20)
    parent_organization_id: Optional[UUID] = None
    settings: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class OrganizationResponse(OrganizationBase):
    """Organization response schema."""
    id: UUID
    parent_organization_id: Optional[UUID] = None
    owner_id: Optional[UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OrganizationList(BaseSchema):
    """Paginated organization list."""
    items: List["OrganizationResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


class OrganizationTree(BaseSchema):
    """Organization tree node."""
    id: UUID
    name: str
    type: str
    country: str
    status: str
    children: List["OrganizationTree"] = []


# Update forward references
OrganizationList.model_rebuild()
OrganizationTree.model_rebuild()


# Competition schemas
class CompetitionBase(BaseSchema):
    """Base competition schema."""
    name: str = Field(..., min_length=1, max_length=200)
    short_name: str = Field(..., min_length=1, max_length=50)
    competition_type: str = Field(..., min_length=1, max_length=50)
    gender: Optional[str] = Field(None, min_length=1, max_length=10)
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=20)
    max_teams: Optional[int] = Field(None, ge=2)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format_config: Optional[dict] = Field(default_factory=dict)
    rules: Optional[str] = None
    prize_info: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class CompetitionCreate(CompetitionBase):
    """Schema for creating a competition."""
    organization_id: UUID
    season_id: UUID


class CompetitionUpdate(BaseSchema):
    """Schema for updating a competition."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    short_name: Optional[str] = Field(None, min_length=1, max_length=50)
    competition_type: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[str] = Field(None, min_length=1, max_length=20)
    gender: Optional[str] = Field(None, max_length=10)
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=20)
    max_teams: Optional[int] = Field(None, ge=2)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format_config: Optional[dict] = Field(default_factory=dict)
    rules: Optional[str] = None
    prize_info: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class CompetitionResponse(CompetitionBase):
    """Competition response schema."""
    id: UUID
    organization_id: UUID
    season_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompetitionList(BaseSchema):
    """Paginated competition list."""
    items: List["CompetitionResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


# Season schemas
class SeasonBase(BaseSchema):
    """Base season schema."""
    name: str = Field(..., min_length=1, max_length=200)
    short_name: str = Field(..., min_length=1, max_length=50)
    start_date: datetime
    end_date: datetime
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    status: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class SeasonCreate(SeasonBase):
    """Schema for creating a season."""
    organization_id: UUID
    status: Optional[str] = "upcoming"


class SeasonUpdate(BaseSchema):
    """Schema for updating a season."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    short_name: Optional[str] = Field(None, min_length=1, max_length=50)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    status: Optional[str] = Field(None, min_length=1, max_length=20)
    description: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class SeasonResponse(SeasonBase):
    """Season response schema."""
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SeasonList(BaseSchema):
    """Paginated season list."""
    items: List["SeasonResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


# Update forward references
OrganizationList.model_rebuild()
CompetitionList.model_rebuild()
SeasonList.model_rebuild()