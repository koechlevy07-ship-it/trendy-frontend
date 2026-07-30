"""Services package for Volleyball Analytics Platform."""

from app.services.auth import AuthService, get_auth_service
from app.services.permission import PermissionService, get_permission_service
from app.services.session import SessionService, get_session_service
from app.services.organization import (
    OrganizationService,
    VenueService,
    CompetitionService,
    SeasonService,
    get_organization_service,
    get_venue_service,
    get_competition_service,
    get_season_service,
)
from app.services.player import PlayerService
from app.services.staff import StaffService
from app.services.assignment import AssignmentService
from app.services.role import RoleService

__all__ = [
    "AuthService",
    "get_auth_service",
    "PermissionService",
    "get_permission_service",
    "SessionService",
    "get_session_service",
    "OrganizationService",
    "VenueService",
    "CompetitionService",
    "SeasonService",
    "get_organization_service",
    "get_venue_service",
    "get_competition_service",
    "get_season_service",
    # Chapter 10 Services
    "PlayerService",
    "StaffService",
    "AssignmentService",
    "RoleService",
]