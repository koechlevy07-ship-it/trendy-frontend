"""Staff models for Player & Staff Management Module."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Table,
    Column,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.core import BaseModelMixin
from app.models.core import (
    StaffRole,
    StaffEmploymentType,
    StaffEmploymentStatus,
    MedicalRole,
    TechnicalRole,
    RefereeLevel,
    PlayerStatus,
    ClubStatus,
    OfficialRole,
    CoachRole,
)

from app.models.organization import Organization, Club, Team, Venue
from app.models.user import User


class Staff(BaseModelMixin):
    """Staff member entity - covers all staff roles (coaches, medical, technical, referees, admins)."""
    
    __tablename__ = "staff"
    
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    club_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("clubs.id"), nullable=True
    )
    user_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True, unique=True
    )
    
    # Identity
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Role & Classification
    role: Mapped[str] = mapped_column(Enum(StaffRole), nullable=False)
    employment_type: Mapped[str] = mapped_column(Enum(StaffEmploymentType), nullable=False)
    employment_status: Mapped[str] = mapped_column(Enum(StaffEmploymentStatus), default=StaffEmploymentStatus.ACTIVE, nullable=False)
    
    # Employment details
    hire_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    termination_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    contract_end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Qualifications
    licenses: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    certifications: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    qualifications: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    
    # Medical/Technical specific
    medical_role: Mapped[Optional[str]] = mapped_column(Enum(MedicalRole), nullable=True)
    technical_role: Mapped[Optional[str]] = mapped_column(Enum(TechnicalRole), nullable=True)
    referee_level: Mapped[Optional[str]] = mapped_column(Enum(RefereeLevel), nullable=True)
    
    # Bio
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    specializations: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    
    # Settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="staff", lazy="selectin"
    )
    club: Mapped[Optional["Club"]] = relationship(
        "Club", back_populates="staff", lazy="selectin"
    )
    user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    organization_ref: Mapped["Organization"] = relationship(
        "Organization", foreign_keys=[organization_id], lazy="selectin"
    )
    club_ref: Mapped[Optional["Club"]] = relationship(
        "Club", foreign_keys=[club_id], lazy="selectin"
    )
    user_ref: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[user_id], lazy="selectin"
    )
    assignments: Mapped[List["StaffAssignment"]] = relationship(
        "StaffAssignment", back_populates="staff", lazy="selectin"
    )
    
    # Medical/Technical relationships
    medical_assignments: Mapped[List["MedicalAssignment"]] = relationship(
        "MedicalAssignment", back_populates="staff", lazy="selectin"
    )
    technical_assignments: Mapped[List["TechnicalAssignment"]] = relationship(
        "TechnicalAssignment", back_populates="staff", lazy="selectin"
    )
    referee_assignments: Mapped[List["RefereeAssignment"]] = relationship(
        "RefereeAssignment", back_populates="official", lazy="selectin"
    )
    coach_assignments: Mapped[List["CoachAssignment"]] = relationship(
        "CoachAssignment", back_populates="coach", lazy="selectin"
    )
    
    __table_args__ = (
        Index("ix_staff_organization_id", "organization_id"),
        Index("ix_staff_user_id", "user_id"),
        Index("ix_staff_club_id", "club_id"),
        Index("ix_staff_role", "role"),
        Index("ix_staff_status", "employment_status"),
        Index("ix_staff_role_status", "role", "employment_status"),
        Index("ix_staff_organization_role", "organization_id", "role"),
    )
    
    def __repr__(self) -> str:
        return f"<Staff(id={self.id}, {self.full_name}, role={self.role}, status={self.employment_status})>"
    
    @property
    def full_name(self) -> str:
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"


class StaffAssignment(BaseModelMixin):
    """Staff assignment to organizations/clubs with history tracking."""
    
    __tablename__ = "staff_assignments"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    club_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("clubs.id"), nullable=True
    )
    team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    season_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id"), nullable=True
    )
    
    role: Mapped[str] = mapped_column(Enum(StaffRole), nullable=False)
    employment_type: Mapped[str] = mapped_column(Enum(StaffEmploymentType), nullable=False)
    employment_status: Mapped[str] = mapped_column(Enum(StaffEmploymentStatus), default=StaffEmploymentStatus.ACTIVE, nullable=False)
    
    # Dates
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Contract details
    contract_type: Mapped[str] = mapped_column(Enum(StaffEmploymentType), nullable=False)
    contract_end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Details
    responsibilities: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    salary_band: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reports_to_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=True
    )
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="assignments", foreign_keys=[staff_id], lazy="selectin"
    )
    organization: Mapped["Organization"] = relationship(
        "Organization", lazy="selectin"
    )
    club: Mapped[Optional["Club"]] = relationship(
        "Club", foreign_keys=[club_id], lazy="selectin"
    )
    team: Mapped[Optional["Team"]] = relationship(
        "Team", foreign_keys=[team_id], lazy="selectin"
    )
    season: Mapped[Optional["Season"]] = relationship(
        "Season", foreign_keys=[season_id], lazy="selectin"
    )
    reports_to: Mapped[Optional["Staff"]] = relationship(
        "Staff", foreign_keys=[reports_to_id], lazy="selectin"
    )
    subordinates: Mapped[List["StaffAssignment"]] = relationship(
        "StaffAssignment", foreign_keys=[reports_to_id], back_populates="reports_to", lazy="selectin"
    )
    reports_to: Mapped[Optional["StaffAssignment"]] = relationship(
        "StaffAssignment", foreign_keys=[reports_to_id], back_populates="subordinates", lazy="selectin"
    )
    
    __table_args__ = (
        Index("ix_staff_assignments_staff_id", "staff_id"),
        Index("ix_staff_assignments_org_id", "organization_id"),
        Index("ix_staff_assignments_club_id", "club_id"),
        Index("ix_staff_assignments_team_id", "team_id"),
        Index("ix_staff_assignments_season_id", "season_id"),
        Index("ix_staff_assignments_role", "role"),
        Index("ix_staff_assignments_status", "employment_status"),
        Index("ix_staff_assignments_dates", "start_date", "end_date"),
        Index("ix_staff_assignments_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<StaffAssignment(staff={self.staff_id}, org={self.organization_id}, role={self.role})>"


class StaffMedicalInfo(BaseModelMixin):
    """Medical information for staff members."""
    
    __tablename__ = "staff_medical_info"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False, unique=True
    )
    
    # Medical info
    blood_type: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    allergies: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    chronic_conditions: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    medications: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    emergency_contact_relationship: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    insurance_provider: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    insurance_policy_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    medical_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="medical_info", lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<StaffMedicalInfo(staff={self.staff_id})>"


class StaffDocument(BaseModelMixin):
    """Documents related to staff (contracts, licenses, certifications, etc.)"""
    
    __tablename__ = "staff_documents"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    issued_by: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="documents", lazy="selectin"
    )
    organization: Mapped["Organization"] = relationship(
        "Organization", lazy="selectin"
    )
    verified_by_user: Mapped[Optional["User"]] = relationship(
        "User", lazy="selectin"
    )
    
    __table_args__ = (
        Index("ix_staff_documents_staff_id", "staff_id"),
        Index("ix_staff_documents_type", "document_type"),
        Index("ix_staff_documents_expires", "expires_at"),
    )
    
    def __repr__(self) -> str:
        return f"<StaffDocument(staff={self.staff_id}, type={self.document_type})>"


class MedicalAssignment(BaseModelMixin):
    """Medical staff assignment to teams/players."""
    
    __tablename__ = "medical_assignments"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    player_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("players.id"), nullable=True
    )
    
    medical_role: Mapped[str] = mapped_column(Enum(MedicalRole), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    responsibilities: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="medical_assignments", foreign_keys=[staff_id], lazy="selectin"
    )
    organization: Mapped["Organization"] = relationship("Organization", lazy="selectin")
    team: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_id], lazy="selectin")
    player: Mapped[Optional["Player"]] = relationship("Player", foreign_keys=[player_id], lazy="selectin")
    
    __table_args__ = (
        Index("ix_medical_assignments_staff_id", "staff_id"),
        Index("ix_medical_assignments_org_id", "organization_id"),
        Index("ix_medical_assignments_team_id", "team_id"),
        Index("ix_medical_assignments_player_id", "player_id"),
        Index("ix_medical_assignments_dates", "start_date", "end_date"),
    )
    
    def __repr__(self) -> str:
        return f"<MedicalAssignment(staff={self.staff_id}, role={self.medical_role})>"


class TechnicalAssignment(BaseModelMixin):
    """Technical staff assignment to teams/analyses."""
    
    __tablename__ = "technical_assignments"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    team_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=True
    )
    competition_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("competitions.id"), nullable=True
    )
    
    technical_role: Mapped[str] = mapped_column(Enum(TechnicalRole), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    responsibilities: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="technical_assignments", foreign_keys=[staff_id], lazy="selectin"
    )
    organization: Mapped["Organization"] = relationship("Organization", lazy="selectin")
    team: Mapped[Optional["Team"]] = relationship("Team", foreign_keys=[team_id], lazy="selectin")
    competition: Mapped[Optional["Competition"]] = relationship("Competition", foreign_keys=[competition_id], lazy="selectin")
    
    __table_args__ = (
        Index("ix_technical_assignments_staff_id", "staff_id"),
        Index("ix_technical_assignments_org_id", "organization_id"),
        Index("ix_technical_assignments_team_id", "team_id"),
        Index("ix_technical_assignments_comp_id", "competition_id"),
    )
    
    def __repr__(self) -> str:
        return f"<TechnicalAssignment(staff={self.staff_id}, role={self.technical_role})>"


class RefereeAssignment(BaseModelMixin):
    """Referee assignment to matches."""
    
    __tablename__ = "referee_assignments"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    match_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("matches.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    
    role: Mapped[str] = mapped_column(Enum(OfficialRole), nullable=False)
    referee_level: Mapped[Optional[str]] = mapped_column(Enum(RefereeLevel), nullable=True)
    
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_by: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="referee_assignments", foreign_keys=[staff_id], lazy="selectin"
    )
    match: Mapped["Match"] = relationship("Match", foreign_keys=[match_id], lazy="selectin")
    organization: Mapped["Organization"] = relationship("Organization", lazy="selectin")
    confirmed_by_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[confirmed_by], lazy="selectin")
    
    __table_args__ = (
        UniqueConstraint("match_id", "staff_id", "role", name="uq_match_referee_role"),
        Index("ix_referee_assignments_staff_id", "staff_id"),
        Index("ix_referee_assignments_match_id", "match_id"),
        Index("ix_referee_assignments_org_id", "organization_id"),
    )
    
    def __repr__(self) -> str:
        return f"<RefereeAssignment(staff={self.staff_id}, match={self.match_id}, role={self.role})>"


class CoachAssignment(BaseModelMixin):
    """Coach assignment to teams."""
    
    __tablename__ = "coach_assignments"
    
    staff_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("staff.id"), nullable=False
    )
    team_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("teams.id"), nullable=False
    )
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    season_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("seasons.id"), nullable=True
    )
    
    role: Mapped[str] = mapped_column(Enum(CoachRole), nullable=False)
    is_head_coach: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    responsibilities: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    staff: Mapped["Staff"] = relationship(
        "Staff", back_populates="coach_assignments", foreign_keys=[staff_id], lazy="selectin"
    )
    team: Mapped["Team"] = relationship("Team", foreign_keys=[team_id], lazy="selectin")
    organization: Mapped["Organization"] = relationship("Organization", lazy="selectin")
    season: Mapped[Optional["Season"]] = relationship("Season", foreign_keys=[season_id], lazy="selectin")
    
    __table_args__ = (
        Index("ix_coach_assignments_staff_id", "staff_id"),
        Index("ix_coach_assignments_team_id", "team_id"),
        Index("ix_coach_assignments_org_id", "organization_id"),
        Index("ix_coach_assignments_season_id", "season_id"),
    )
    
    def __repr__(self) -> str:
        return f"<CoachAssignment(staff={self.staff_id}, team={self.team_id}, role={self.role})>"


# Association tables
staff_qualifications = Table(
    "staff_qualifications",
    Base.metadata,
    Column("staff_id", PGUUID(as_uuid=True), ForeignKey("staff.id"), primary_key=True),
    Column("qualification", String(200), primary_key=True),
    Column("issued_at", DateTime(timezone=True), server_default=func.now()),
    Column("expires_at", DateTime(timezone=True), nullable=True),
    Column("issued_by", PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
    Column("verified", Boolean, default=False),
    Column("verified_at", DateTime(timezone=True), nullable=True),
    Column("verified_by", PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
)

staff_certifications = Table(
    "staff_certifications",
    Base.metadata,
    Column("staff_id", PGUUID(as_uuid=True), ForeignKey("staff.id"), primary_key=True),
    Column("certification", String(200), primary_key=True),
    Column("issued_by", String(200), nullable=True),
    Column("issued_at", DateTime(timezone=True), nullable=True),
    Column("expires_at", DateTime(timezone=True), nullable=True),
    Column("verified", Boolean, default=False),
    Column("verified_at", DateTime(timezone=True), nullable=True),
    Column("verified_by", PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
)

staff_licenses = Table(
    "staff_licenses",
    Base.metadata,
    Column("staff_id", PGUUID(as_uuid=True), ForeignKey("staff.id"), primary_key=True),
    Column("license_type", String(100), primary_key=True),
    Column("license_number", String(100), nullable=True),
    Column("issued_by", String(200), nullable=True),
    Column("issued_at", DateTime(timezone=True), nullable=True),
    Column("expires_at", DateTime(timezone=True), nullable=True),
    Column("verified", Boolean, default=False),
    Column("verified_at", DateTime(timezone=True), nullable=True),
    Column("verified_by", PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
)