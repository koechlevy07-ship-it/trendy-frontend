"""Report schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.base import BaseSchema


class ReportType(str, Enum):
    MATCH_SUMMARY = "match_summary"
    PLAYER_PERFORMANCE = "player_performance"
    TEAM_ANALYTICS = "team_analytics"
    SEASON_REVIEW = "season_review"
    TOURNAMENT_SUMMARY = "tournament_summary"
    PLAYER_COMPARISON = "player_comparison"


class ReportStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ReportCreate(BaseSchema):
    """Schema for creating a report."""
    report_type: ReportType
    match_id: Optional[UUID] = None
    tournament_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    player_id: Optional[UUID] = None
    season_id: Optional[UUID] = None
    parameters: Optional[dict] = Field(default_factory=dict)


class ReportUpdate(BaseSchema):
    """Schema for updating a report."""
    status: Optional[ReportStatus] = None
    content: Optional[dict] = None
    file_path: Optional[str] = None
    error_message: Optional[str] = None


class ReportResponse(BaseSchema):
    """Report response schema."""
    id: UUID
    report_type: ReportType
    status: ReportStatus
    match_id: Optional[UUID] = None
    tournament_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    player_id: Optional[UUID] = None
    season_id: Optional[UUID] = None
    parameters: dict
    content: Optional[dict] = None
    file_path: Optional[str] = None
    error_message: Optional[str] = None
    generated_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReportList(BaseSchema):
    """Paginated report list."""
    items: List["ReportResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# AUDIT LOG SCHEMAS
# =============================================================================

class AuditAction(str, Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXPORT = "EXPORT"
    IMPORT = "IMPORT"
    PROCESS = "PROCESS"


class AuditLogResponse(BaseSchema):
    """Audit log response schema."""
    id: UUID
    user_id: Optional[UUID] = None
    user_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    correlation_id: Optional[str] = None
    result: str
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuditLogList(BaseSchema):
    """Paginated audit log list."""
    items: List[AuditLogResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# Update forward references
ReportList.model_rebuild()
AuditLogList.model_rebuild()