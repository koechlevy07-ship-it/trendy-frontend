"""Competition schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import Field, ConfigDict

from app.schemas.base import BaseSchema


class CompetitionBase(BaseSchema):
    """Base competition schema."""
    name: str = Field(..., min_length=1, max_length=200)
    short_name: str = Field(..., min_length=1, max_length=50)
    competition_type: str = Field(..., min_length=1, max_length=50)
    gender: Optional[str] = Field(None, max_length=10)
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=20)
    max_teams: Optional[int] = Field(None, ge=2)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    format_config: Optional[dict] = Field(default_factory=dict)
    rules: Optional[str] = None
    prize_info: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class CompetitionCreate(CompetitionBase):
    """Schema for creating a competition."""
    season_id: UUID
    organization_id: UUID


class CompetitionUpdate(BaseSchema):
    """Schema for updating a competition."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    short_name: Optional[str] = Field(None, min_length=1, max_length=50)
    competition_type: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, max_length=10)
    age_category: Optional[str] = Field(None, max_length=20)
    competition_level: Optional[str] = Field(None, max_length=20)
    max_teams: Optional[int] = Field(None, ge=2)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
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
    items: List[CompetitionResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CompetitionTeamBase(BaseSchema):
    """Base competition team schema."""
    team_id: UUID
    group_name: Optional[str] = Field(None, max_length=50)
    seed: Optional[int] = Field(None, ge=1)
    status: str = Field(default="active", max_length=20)
    metadata_: Optional[dict] = Field(default_factory=dict, alias="metadata")


class CompetitionTeamCreate(CompetitionTeamBase):
    """Schema for adding a team to competition."""
    competition_id: UUID


class CompetitionTeamUpdate(BaseSchema):
    """Schema for updating competition team."""
    group_name: Optional[str] = Field(None, max_length=50)
    seed: Optional[int] = Field(None, ge=1)
    status: Optional[str] = Field(None, max_length=20)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class CompetitionTeamResponse(CompetitionTeamBase):
    """Competition team response schema."""
    id: UUID
    competition_id: UUID
    joined_at: datetime
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompetitionWithTeams(CompetitionResponse):
    """Competition with teams."""
    teams: List[CompetitionTeamResponse] = []