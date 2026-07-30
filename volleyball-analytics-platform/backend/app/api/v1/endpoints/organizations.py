"""Organization API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationList,
    OrganizationTree,
)
from app.schemas.competition import (
    CompetitionCreate,
    CompetitionUpdate,
    CompetitionResponse,
    CompetitionList,
)
from app.schemas.season import (
    SeasonCreate,
    SeasonUpdate,
    SeasonResponse,
    SeasonList,
)
from app.schemas.venue import (
    VenueCreate,
    VenueUpdate,
    VenueResponse,
    VenueList,
    CourtCreate,
    CourtUpdate,
    CourtResponse,
    VenueWithCourts,
)
from app.schemas.organization import OrganizationTree
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

router = APIRouter(redirect_slashes=False)


# =============================================================================
# Organization Endpoints
# =============================================================================

@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreate,
    current_user: User = Depends(get_current_active_user),
    service: OrganizationService = Depends(get_organization_service),
):
    """Create a new organization."""
    try:
        org = await service.create_organization(data, user_id=str(current_user.id))
        return org
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=OrganizationList)
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    country: Optional[str] = Query(None, min_length=2, max_length=2),
    org_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = None,
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """List organizations with filters."""
    orgs = await service.list_organizations(
        skip=skip,
        limit=limit,
        country=country,
        org_type=org_type,
        status=status,
    )
    total = len(orgs)  # In production, use count query
    return OrganizationList(
        items=orgs,
        total=total,
        page=skip // limit + 1,
        per_page=limit,
        total_pages=(total + limit - 1) // limit,
    )


@router.get("/tree", response_model=List[OrganizationTree])
async def get_organization_tree(
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get organization hierarchy tree."""
    orgs = await service.get_organization_tree()
    return _build_tree(orgs)


def _build_tree(orgs: List) -> List[dict]:
    """Build tree structure from flat list."""
    result = []
    for org in orgs:
        children = _build_tree(org.children) if hasattr(org, 'children') else []
        result.append({
            "id": org.id,
            "name": org.name,
            "type": org.type.value if hasattr(org.type, 'value') else org.type,
            "country": org.country,
            "status": org.status.value if hasattr(org.status, 'value') else org.status,
            "children": children,
        })
    return result


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get organization by ID."""
    org = await service.get_organization_with_relations(org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org


@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    data: OrganizationUpdate,
    current_user: User = Depends(get_current_active_user),
    service: OrganizationService = Depends(get_organization_service),
):
    """Update an organization."""
    try:
        org = await service.update_organization(org_id, data, user_id=str(current_user.id))
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        return org
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: OrganizationService = Depends(get_organization_service),
):
    """Soft delete an organization."""
    success = await service.delete_organization(org_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")


@router.post("/{org_id}/archive", response_model=OrganizationResponse)
async def archive_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: OrganizationService = Depends(get_organization_service),
):
    """Archive an organization (set status to inactive)."""
    org = await service.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    updated = await service.update_organization(
        org_id,
        OrganizationUpdate(status=OrganizationStatus.INACTIVE),
        user_id=str(current_user.id),
    )
    return updated


@router.get("/search", response_model=List[OrganizationResponse])
async def search_organizations(
    q: str = Query(..., min_length=1, max_length=100),
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """Search organizations by name."""
    orgs = await service.search_organizations(q)
    return orgs


@router.get("/{org_id}/children", response_model=List[OrganizationResponse])
async def get_sub_organizations(
    org_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get direct child organizations."""
    children = await service.get_sub_organizations(org_id)
    return children


@router.get("/{org_id}/descendants", response_model=List[OrganizationResponse])
async def get_all_descendants(
    org_id: UUID,
    service: OrganizationService = Depends(get_organization_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get all descendant organizations recursively."""
    descendants = await service.get_all_descendants(org_id)
    return descendants


# =============================================================================
# Competition Endpoints
# =============================================================================

competition_router = APIRouter(prefix="/{org_id}/competitions", tags=["competitions"])


@competition_router.post("", response_model=CompetitionResponse, status_code=status.HTTP_201_CREATED)
async def create_competition(
    org_id: UUID,
    data: CompetitionCreate,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Create a new competition."""
    if data.organization_id != org_id:
        raise HTTPException(status_code=400, detail="Organization ID mismatch")
    try:
        comp = await service.create_competition(data, user_id=str(current_user.id))
        return comp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@competition_router.get("", response_model=CompetitionList)
async def list_competitions(
    org_id: UUID,
    season_id: Optional[str] = Query(None),
    competition_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    service: CompetitionService = Depends(get_competition_service),
    current_user: User = Depends(get_current_active_user),
):
    """List competitions with filters."""
    comps = await service.list_competitions(
        organization_id=UUID(org_id) if org_id else None,
        season_id=UUID(season_id) if season_id else None,
        competition_type=competition_type,
        status=status,
        skip=skip,
        limit=limit,
    )
    total = len(comps)
    return CompetitionList(
        items=comps,
        total=total,
        page=1,
        per_page=limit,
        total_pages=1,
    )


@competition_router.get("/search", response_model=List[CompetitionResponse])
async def search_competitions(
    org_id: UUID,
    q: str = Query(..., min_length=1, max_length=100),
    service: CompetitionService = Depends(get_competition_service),
    current_user: User = Depends(get_current_active_user),
):
    """Search competitions by name."""
    comps = await service.search_competitions(org_id, q)
    return comps


@competition_router.get("/{comp_id}", response_model=CompetitionResponse)
async def get_competition(
    org_id: UUID,
    comp_id: UUID,
    with_teams: bool = Query(False),
    service: CompetitionService = Depends(get_competition_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get competition by ID."""
    if with_teams:
        comp = await service.get_competition_with_teams(comp_id)
    else:
        comp = await service.get_competition(comp_id)
    if not comp or str(comp.organization_id) != str(org_id):
        raise HTTPException(status_code=404, detail="Competition not found")
    return comp


@competition_router.patch("/{comp_id}", response_model=CompetitionResponse)
async def update_competition(
    org_id: UUID,
    comp_id: UUID,
    data: CompetitionUpdate,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Update a competition."""
    try:
        comp = await service.update_competition(comp_id, data, user_id=str(current_user.id))
        if not comp:
            raise HTTPException(status_code=404, detail="Competition not found")
        return comp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@competition_router.post("/{comp_id}/archive", response_model=CompetitionResponse)
async def archive_competition(
    org_id: UUID,
    comp_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Archive a competition."""
    comp = await service.update_competition(
        comp_id,
        CompetitionUpdate(status=CompetitionStatus.CANCELLED),
        user_id=str(current_user.id),
    )
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    return comp


@competition_router.delete("/{comp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_competition(
    org_id: UUID,
    comp_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Delete a competition (soft delete)."""
    success = await service.delete_competition(comp_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Competition not found")


@competition_router.post("/{comp_id}/teams", response_model="CompetitionTeamResponse", status_code=201)
async def add_team_to_competition(
    org_id: UUID,
    comp_id: UUID,
    team_id: UUID,
    group_name: Optional[str] = None,
    seed: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Add a team to competition."""
    ct = await service.add_team(comp_id, UUID(team_id), group_name, seed)
    if not ct:
        raise HTTPException(status_code=404, detail="Competition or team not found")
    return ct


@competition_router.delete("/{comp_id}/teams/{team_id}", status_code=204)
async def remove_team_from_competition(
    org_id: UUID,
    comp_id: UUID,
    team_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: CompetitionService = Depends(get_competition_service),
):
    """Remove a team from competition."""
    success = await service.remove_team(comp_id, UUID(team_id))
    if not success:
        raise HTTPException(status_code=404, detail="Team not found in competition")


# =============================================================================
# Season Endpoints
# =============================================================================

season_router = APIRouter(prefix="/{org_id}/seasons", tags=["seasons"])


@season_router.post("", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED)
async def create_season(
    org_id: UUID,
    data: SeasonCreate,
    current_user: User = Depends(get_current_active_user),
    service: SeasonService = Depends(get_season_service),
):
    """Create a new season."""
    if data.organization_id != org_id:
        raise HTTPException(status_code=400, detail="Organization ID mismatch")
    try:
        season = await service.create_season(data, user_id=str(current_user.id))
        return season
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@season_router.get("", response_model=SeasonList)
async def list_seasons(
    org_id: UUID,
    status: Optional[str] = Query(None),
    service: SeasonService = Depends(get_season_service),
    current_user: User = Depends(get_current_active_user),
):
    """List seasons for an organization."""
    seasons = await service.list_seasons(org_id, status=status)
    total = len(seasons)
    return SeasonList(
        items=seasons,
        total=total,
        page=1,
        per_page=len(seasons),
        total_pages=1,
    )


@season_router.get("/{season_id}", response_model=SeasonResponse)
async def get_season(
    org_id: UUID,
    season_id: UUID,
    with_competitions: bool = Query(False),
    service: SeasonService = Depends(get_season_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get season by ID."""
    if with_competitions:
        season = await service.get_season_with_competitions(season_id)
    else:
        season = await service.get_season(season_id)
    if not season or str(season.organization_id) != str(org_id):
        raise HTTPException(status_code=404, detail="Season not found")
    return season


@season_router.patch("/{season_id}", response_model=SeasonResponse)
async def update_season(
    org_id: UUID,
    season_id: UUID,
    data: SeasonUpdate,
    current_user: User = Depends(get_current_active_user),
    service: SeasonService = Depends(get_season_service),
):
    """Update a season."""
    try:
        season = await service.update_season(season_id, data, user_id=str(current_user.id))
        if not season:
            raise HTTPException(status_code=404, detail="Season not found")
        return season
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@season_router.post("/{season_id}/activate", response_model=SeasonResponse)
async def activate_season(
    org_id: UUID,
    season_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: SeasonService = Depends(get_season_service),
):
    """Activate a season (deactivates others)."""
    season = await service.activate_season(season_id, user_id=str(current_user.id))
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season


@season_router.delete("/{season_id}", status_code=204)
async def delete_season(
    org_id: UUID,
    season_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: SeasonService = Depends(get_season_service),
):
    """Soft delete a season."""
    success = await service.delete_season(season_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Season not found")


# =============================================================================
# Venue Endpoints
# =============================================================================

venue_router = APIRouter(prefix="/{org_id}/venues", tags=["venues"])


@venue_router.post("", response_model=VenueResponse, status_code=201)
async def create_venue(
    org_id: UUID,
    data: VenueCreate,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Create a venue."""
    if data.organization_id != org_id:
        raise HTTPException(status_code=400, detail="Organization ID mismatch")
    try:
        venue = await service.create_venue(data, user_id=str(current_user.id))
        return venue
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@venue_router.get("/search", response_model=List[VenueResponse])
async def search_venues(
    org_id: UUID,
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(20, ge=1, le=100),
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """Search venues by name."""
    venues = await service.search_venues(org_id, q, limit)
    return venues


@venue_router.get("", response_model=VenueList)
async def list_venues(
    org_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """List venues for an organization."""
    venues = await service.list_venues(org_id, skip=skip, limit=limit)
    total = len(venues)
    return VenueList(
        items=venues,
        total=total,
        page=1,
        per_page=limit,
        total_pages=(total + limit - 1) // limit,
    )


@venue_router.get("/{venue_id}", response_model=VenueResponse)
async def get_venue(
    org_id: UUID,
    venue_id: UUID,
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get venue by ID."""
    venue = await service.get_venue(venue_id)
    if not venue or str(venue.organization_id) != str(org_id):
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@venue_router.get("/{venue_id}/courts", response_model=VenueWithCourts)
async def get_venue_with_courts(
    org_id: UUID,
    venue_id: UUID,
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get venue with courts."""
    venue = await service.get_venue_with_courts(venue_id)
    if not venue or str(venue.organization_id) != str(org_id):
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@venue_router.patch("/{venue_id}", response_model=VenueResponse)
async def update_venue(
    org_id: UUID,
    venue_id: UUID,
    data: VenueUpdate,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Update a venue."""
    venue = await service.update_venue(venue_id, data, user_id=str(current_user.id))
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@venue_router.delete("/{venue_id}", status_code=204)
async def delete_venue(
    org_id: UUID,
    venue_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Soft delete a venue."""
    success = await service.delete_venue(venue_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Venue not found")


# =============================================================================
# Court Endpoints
# =============================================================================

court_router = APIRouter(prefix="/{org_id}/venues/{venue_id}/courts", tags=["courts"])


@court_router.post("", response_model=CourtResponse, status_code=201)
async def create_court(
    org_id: UUID,
    venue_id: UUID,
    data: CourtCreate,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Create a court."""
    if data.venue_id != venue_id:
        raise HTTPException(status_code=400, detail="Venue ID mismatch")
    court = await service.create_court(data, user_id=str(current_user.id))
    return court


@court_router.get("", response_model=List[CourtResponse])
async def list_courts(
    org_id: UUID,
    venue_id: UUID,
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """List courts for a venue."""
    courts = await service.list_courts(venue_id)
    return courts


@court_router.get("/{court_id}", response_model=CourtResponse)
async def get_court(
    org_id: UUID,
    venue_id: UUID,
    court_id: UUID,
    service: VenueService = Depends(get_venue_service),
    current_user: User = Depends(get_current_active_user),
):
    """Get court by ID."""
    court = await service.get_court(court_id)
    if not court or str(court.venue_id) != str(venue_id):
        raise HTTPException(status_code=404, detail="Court not found")
    return court


@court_router.patch("/{court_id}", response_model=CourtResponse)
async def update_court(
    org_id: UUID,
    venue_id: UUID,
    court_id: UUID,
    data: CourtUpdate,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Update a court."""
    court = await service.update_court(court_id, data, user_id=str(current_user.id))
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    return court


@court_router.delete("/{court_id}", status_code=204)
async def delete_court(
    org_id: UUID,
    venue_id: UUID,
    court_id: UUID,
    current_user: User = Depends(get_current_active_user),
    service: VenueService = Depends(get_venue_service),
):
    """Delete a court."""
    success = await service.delete_court(court_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Court not found")


# Include sub-routers
router.include_router(competition_router)
router.include_router(season_router)
router.include_router(venue_router)
router.include_router(court_router)