"""Venue schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import Field, ConfigDict
from pydantic.networks import HttpUrl

from app.schemas.base import BaseSchema


class VenueBase(BaseSchema):
    """Base venue schema."""
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: str = Field(..., min_length=2, max_length=2)
    postal_code: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    amenities: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class VenueCreate(VenueBase):
    """Schema for creating a venue."""
    organization_id: UUID


class VenueUpdate(BaseSchema):
    """Schema for updating a venue."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    postal_code: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    amenities: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class VenueResponse(VenueBase):
    """Venue response schema."""
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


class VenueList(BaseSchema):
    """Paginated venue list."""
    items: List["VenueResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int


class CourtBase(BaseSchema):
    """Base court schema."""
    name: str = Field(..., min_length=1, max_length=100)
    number: int = Field(..., ge=1)
    type: str = Field(..., min_length=1, max_length=50)
    surface: Optional[str] = Field(None, max_length=100)
    dimensions: Optional[dict] = Field(default_factory=dict)
    has_streaming: bool = False
    has_scoreboard: bool = False
    camera_positions: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(default_factory=dict, alias="metadata")


class CourtCreate(CourtBase):
    """Schema for creating a court."""
    venue_id: UUID


class CourtUpdate(BaseSchema):
    """Schema for updating a court."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    number: Optional[int] = Field(None, ge=1)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    surface: Optional[str] = Field(None, max_length=100)
    dimensions: Optional[dict] = Field(default_factory=dict)
    has_streaming: Optional[bool] = None
    has_scoreboard: Optional[bool] = None
    camera_positions: Optional[dict] = Field(default_factory=dict)
    metadata_: Optional[dict] = Field(None, alias="metadata")


class CourtResponse(CourtBase):
    """Court response schema."""
    id: UUID
    venue_id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    is_active: bool
    is_deleted: bool
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VenueWithCourts(VenueResponse):
    """Venue with courts."""
    courts: List[CourtResponse] = []

    model_config = ConfigDict(from_attributes=True)


# Update forward references
VenueWithCourts.model_rebuild()