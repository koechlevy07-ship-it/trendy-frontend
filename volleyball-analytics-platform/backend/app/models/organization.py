"""Organization, Club, Team, and Venue models."""

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
from app.models.core import (
    BaseModelMixin,
    OrganizationType,
    OrganizationStatus,
    TeamGender,
    AgeCategory,
    CompetitionLevel,
    VenueType,
    TeamCategory,
)

# Association tables
club_administrators = Table(
    "club_administrators",
    Base.metadata,
    Column("club_id", PGUUID(as_uuid=True), ForeignKey("clubs.id"), primary_key=True),
    Column("user_id", PGUUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("role", String(50), default="admin"),
    Column("assigned_at", DateTime(timezone=True), server_default=func.now()),
    extend_existing=True,
)

team_administrators = Table(
    "team_administrators",
    Base.metadata,
    Column("team_id", PGUUID(as_uuid=True), ForeignKey("teams.id"), primary_key=True),
    Column("user_id", PGUUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("role", String(50), default="admin"),
    Column("assigned_at", DateTime(timezone=True), server_default=func.now()),
    extend_existing=True,
)


class Organization(Base, BaseModelMixin):
    """Organization/Club entity - root of multi-tenancy."""

    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[OrganizationType] = mapped_column(
        Enum(OrganizationType), nullable=False
    )
    parent_organization_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    time_zone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[OrganizationStatus] = mapped_column(
        Enum(OrganizationStatus), default=OrganizationStatus.ACTIVE, nullable=False
    )
    settings: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    parent: Mapped[Optional["Organization"]] = relationship(
        "Organization", remote_side="Organization.id", back_populates="children", lazy="selectin"
    )
    children: Mapped[List["Organization"]] = relationship(
        "Organization", back_populates="parent", lazy="selectin"
    )
    teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="organization", lazy="selectin"
    )
    clubs: Mapped[List["Club"]] = relationship(
        "Club", back_populates="organization", lazy="selectin"
    )
    users: Mapped[List["User"]] = relationship(
        "User", foreign_keys="User.organization_id", back_populates="organization", lazy="selectin"
    )
    venues: Mapped[List["Venue"]] = relationship(
        "Venue", back_populates="organization", lazy="selectin"
    )
    seasons: Mapped[List["Season"]] = relationship(
        "Season", back_populates="organization", lazy="selectin"
    )
    competitions: Mapped[List["Competition"]] = relationship(
        "Competition", back_populates="organization", lazy="selectin"
    )
    cameras: Mapped[List["Camera"]] = relationship(
        "Camera", back_populates="organization", lazy="selectin"
    )
    owner_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    owner: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[owner_id], back_populates="owned_organizations"
    )

    __table_args__ = (
        Index("ix_organizations_name", "name"),
        Index("ix_organizations_type", "type"),
        Index("ix_organizations_country", "country"),
        Index("ix_organizations_status", "status"),
        Index("ix_organizations_parent", "parent_organization_id"),
        {"extend_existing": True},
    )

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, name={self.name}, type={self.type})>"


class Club(Base, BaseModelMixin):
    """Club entity - a club within an organization that can have multiple teams."""
    
    __tablename__ = "clubs"
    
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    category: Mapped[TeamCategory] = mapped_column(Enum(TeamCategory), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    banner_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#3B82F6")
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#1E40AF")
    accent_color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    short_name: Mapped[str] = mapped_column(String(30), nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    social_media: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "inactive", "archived", name="club_status"),
        default="active",
        nullable=False
    )
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="clubs", lazy="selectin"
    )
    teams: Mapped[List["Team"]] = relationship(
        "Team", back_populates="club", lazy="selectin"
    )
    administrators: Mapped[List["User"]] = relationship(
        "User", secondary="club_administrators", back_populates="administered_clubs", lazy="selectin"
    )
    home_venue_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("venues.id"), nullable=True
    )
    home_venue: Mapped[Optional["Venue"]] = relationship(
        "Venue", foreign_keys=[home_venue_id], lazy="selectin"
    )
    
    __table_args__ = (
        UniqueConstraint("organization_id", "name", name="uq_org_club_name"),
        UniqueConstraint("organization_id", "code", name="uq_org_club_code"),
        Index("ix_clubs_organization_id", "organization_id"),
        Index("ix_clubs_name", "name"),
        Index("ix_clubs_category", "category"),
        Index("ix_clubs_status", "status"),
    )
    
def __repr__(self) -> str:
        return f"<Club(id={self.id}, name={self.name}, org={self.organization_id})>"


class Team(Base, BaseModelMixin):
    """Team entity belonging to a club within an organization."""
    
    __tablename__ = "teams"
    
    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    club_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("clubs.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[TeamGender] = mapped_column(Enum(TeamGender), nullable=False)
    age_category: Mapped[AgeCategory] = mapped_column(Enum(AgeCategory), nullable=False)
    competition_level: Mapped[CompetitionLevel] = mapped_column(
        Enum(CompetitionLevel), nullable=False
    )
    category: Mapped[TeamCategory] = mapped_column(Enum(TeamCategory), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#3B82F6")
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#1E40AF")
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    home_venue_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("venues.id"), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_name: Mapped[str] = mapped_column(String(30), nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    social_media: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "inactive", "archived", name="team_status"),
        default="active",
        nullable=False
    )
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="teams", lazy="selectin"
    )
    club: Mapped[Optional["Club"]] = relationship(
        "Club", back_populates="teams", lazy="selectin"
    )
    players: Mapped[List["Player"]] = relationship(
        "Player", back_populates="team", lazy="selectin"
    )
    coaches: Mapped[List["Coach"]] = relationship(
        "Coach", back_populates="team", lazy="selectin"
    )
    home_matches: Mapped[List["Match"]] = relationship(
        "Match", foreign_keys="Match.home_team_id", back_populates="home_team", lazy="selectin"
    )
    away_matches: Mapped[List["Match"]] = relationship(
        "Match", foreign_keys="Match.away_team_id", back_populates="away_team", lazy="selectin"
    )
    home_venue: Mapped[Optional["Venue"]] = relationship(
        "Venue", foreign_keys=[home_venue_id], lazy="selectin"
    )
    competition_teams: Mapped[List["CompetitionTeam"]] = relationship(
        "CompetitionTeam", back_populates="team", lazy="selectin"
    )
    administrators: Mapped[List["User"]] = relationship(
        "User", secondary="team_administrators", back_populates="administered_teams", lazy="selectin"
    )
    
    __table_args__ = (
        UniqueConstraint("organization_id", "name", name="uq_org_team_name"),
        UniqueConstraint("club_id", "name", name="uq_club_team_name"),
        Index("ix_teams_organization_id", "organization_id"),
        Index("ix_teams_club_id", "club_id"),
        Index("ix_teams_name", "name"),
        Index("ix_teams_gender_age", "gender", "age_category"),
        Index("ix_teams_category", "category"),
        Index("ix_teams_status", "status"),
    )
    
    def __repr__(self) -> str:
        return f"<Team(id={self.id}, name={self.name}, org={self.organization_id})>"


class Venue(Base, BaseModelMixin):
    """Physical venue/location with courts."""

    __tablename__ = "venues"

    organization_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[VenueType] = mapped_column(Enum(VenueType), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amenities: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="venues", lazy="selectin"
    )
    courts: Mapped[List["Court"]] = relationship(
        "Court", back_populates="venue", lazy="selectin"
    )
    matches: Mapped[List["Match"]] = relationship(
        "Match", back_populates="venue", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_venues_organization_id", "organization_id"),
        Index("ix_venues_name", "name"),
        Index("ix_venues_city_country", "city", "country"),
    )

    def __repr__(self) -> str:
        return f"<Venue(id={self.id}, name={self.name}, city={self.city})>"


class Court(Base, BaseModelMixin):
    """Individual court within a venue."""

    __tablename__ = "courts"

    venue_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("venues.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[VenueType] = mapped_column(Enum(VenueType), nullable=False)
    surface: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    dimensions: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    has_streaming: Mapped[bool] = mapped_column(Boolean, default=False)
    has_scoreboard: Mapped[bool] = mapped_column(Boolean, default=False)
    camera_positions: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict, nullable=False)

    # Relationships
    venue: Mapped["Venue"] = relationship(
        "Venue", back_populates="courts", lazy="selectin"
    )
    matches: Mapped[List["Match"]] = relationship(
        "Match", back_populates="court", lazy="selectin"
    )
    cameras: Mapped[List["Camera"]] = relationship(
        "Camera", back_populates="court", lazy="selectin"
    )

    __table_args__ = (
        UniqueConstraint("venue_id", "number", name="uq_venue_court_number"),
        Index("ix_courts_venue_id", "venue_id"),
    )

    def __repr__(self) -> str:
        return f"<Court(id={self.id}, name={self.name}, venue={self.venue_id})>"