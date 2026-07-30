"""Season schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import Field, ConfigDict

from app.schemas.base import BaseSchema


class SeasonBase(BaseSchema):
    """Base season schema."""
    name: str = Field(..., min_length=1, max_length=200)
    short_name: str = Field(..., min_length=1, max_length=50)
    start_date: date
    end_date: date
    registration_start: Optional[date] = None
    registration_end: Optional[date] = None
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
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    registration_start: Optional[date] = None
    registration_end: Optional[date] = None
    status: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")


class SeasonResponse(SeasonBase):
    """Season response schema."""
    id: UUID
    organization_id: UUID
    status: str
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
    items: List[SeasonResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class SeasonWithCompetitions(SeasonResponse):
    """Season with competitions."""
    competitions: List["CompetitionResponse"] = []

    model_config = ConfigDict(from_attributes=True)


# Update forward reference
from app.schemas.competition import CompetitionResponse  # noqa: E402, F811
SeasonWithCompetitions.model_rebuild()