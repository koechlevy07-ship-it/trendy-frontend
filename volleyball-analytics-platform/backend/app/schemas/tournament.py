"""Tournament schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, EmailStr
from pydantic.config import ConfigDict

from app.schemas.base import BaseSchema


class TournamentFormat(str, Enum):
    ROUND_ROBIN = "round_robin"
    SINGLE_ELIMINATION = "single_elimination"
    DOUBLE_ELIMINATION = "double_elimination"
    SWISS = "swiss"
    GROUP_STAGE_KNOCKOUT = "group_stage_knockout"


class TournamentStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TournamentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    format: TournamentFormat
    start_date: datetime
    end_date: datetime
    venue: Optional[str] = None
    max_teams: int = Field(default=16, ge=2, le=128)
    registration_deadline: Optional[datetime] = None
    registration_fee: Optional[float] = None
    rules: Optional[str] = None


class TournamentCreate(TournamentBase):
    organization_id: str
    teams: Optional[List[str]] = None


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    format: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    venue: Optional[str] = None
    max_teams: Optional[int] = None
    registration_deadline: Optional[datetime] = None
    registration_fee: Optional[float] = None
    rules: Optional[str] = None
    status: Optional[str] = None


class TournamentResponse(BaseModel):
    id: str
    name: str
    format: str
    start_date: datetime
    end_date: datetime
    venue: Optional[str] = None
    status: str
    max_teams: int
    registration_deadline: Optional[datetime] = None
    registration_fee: Optional[float] = None
    rules: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TournamentListResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int