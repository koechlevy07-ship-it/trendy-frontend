"""Audit Log model for immutable audit trail."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.core import BaseModelMixin


AUDIT_ACTION_VALUES = [
    "create", "read", "update", "delete", "login", "logout", "export", "import",
    "process", "archive", "restore", "assign", "transfer", "terminate", "confirm",
    "reject", "approve", "verify"
]

AUDIT_ENTITY_VALUES = [
    "player", "staff", "team", "organization", "competition", "season", "match",
    "user", "role", "assignment", "registration", "career_history", "face_embedding",
    "document", "medical_info", "video", "report"
]


class AuditAction(str, Enum):
    """Audit action types."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    PROCESS = "process"
    ARCHIVE = "archive"
    RESTORE = "restore"
    ASSIGN = "assign"
    TRANSFER = "transfer"
    TERMINATE = "terminate"
    CONFIRM = "confirm"
    REJECT = "reject"
    APPROVE = "approve"
    VERIFY = "verify"


class AuditEntityType(str, Enum):
    """Entity types that can be audited."""
    PLAYER = "player"
    STAFF = "staff"
    TEAM = "team"
    ORGANIZATION = "organization"
    COMPETITION = "competition"
    SEASON = "season"
    MATCH = "match"
    USER = "user"
    ROLE = "role"
    ASSIGNMENT = "assignment"
    REGISTRATION = "registration"
    CAREER_HISTORY = "career_history"
    FACE_EMBEDDING = "face_embedding"
    DOCUMENT = "document"
    MEDICAL_INFO = "medical_info"
    VIDEO = "video"
    REPORT = "report"


class AuditLog(Base):
    """Immutable audit log for all data modifications."""

    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    
    # Actor information
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    user_role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    device_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Action details
    action: Mapped[str] = mapped_column(
        Enum(*AUDIT_ACTION_VALUES, name="audit_action"),
        nullable=False
    )
    entity_type: Mapped[str] = mapped_column(
        Enum(*AUDIT_ENTITY_VALUES, name="audit_entity_type"),
        nullable=False
    )
    entity_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    
    # Change details
    old_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    new_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    changed_fields: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    
    # Context
    correlation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    request_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    endpoint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    method: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # Result
    result: Mapped[str] = mapped_column(String(20), default="success")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Metadata
    metadata_: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Timestamp
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    
    __table_args__ = (
        Index("ix_audit_logs_user_id", "user_id"),
        Index("ix_audit_logs_entity", "entity_type", "entity_id"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_timestamp", "timestamp"),
        Index("ix_audit_logs_correlation", "correlation_id"),
        Index("ix_audit_logs_entity_action", "entity_type", "entity_id", "action"),
        {"extend_existing": True},
    )

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action={self.action}, entity={self.entity_type}:{self.entity_id})>"