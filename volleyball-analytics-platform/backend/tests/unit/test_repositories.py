"""Unit tests for Organization-related repositories."""

import pytest
from datetime import date
from uuid import uuid4

from app.models.organization import Organization
from app.models.competition import Competition, Season
from app.models.core import OrganizationType, OrganizationStatus
from app.repositories.organization import (
    OrganizationRepository,
    CompetitionRepository,
    SeasonRepository,
    CompetitionTeamRepository,
)


@pytest.mark.asyncio
async def test_organization_repository_create(async_session):
    """Test creating an organization via repository."""
    repo = OrganizationRepository(async_session)
    org = await repo.create({
        "name": "Test Club",
        "type": OrganizationType.CLUB,
        "country": "KE",
    })
    assert org.id is not None
    assert org.name == "Test Club"


@pytest.mark.asyncio
async def test_organization_repository_get(async_session):
    """Test retrieving an organization via repository."""
    repo = OrganizationRepository(async_session)
    created = await repo.create({
        "name": "Test Club", "type": OrganizationType.CLUB, "country": "KE",
    })
    retrieved = await repo.get(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id


@pytest.mark.asyncio
async def test_organization_repository_update(async_session):
    """Test updating an organization via repository."""
    repo = OrganizationRepository(async_session)
    created = await repo.create({
        "name": "Old Name", "type": OrganizationType.CLUB, "country": "KE",
    })
    updated = await repo.update(created.id, {"name": "New Name"})
    assert updated is not None
    assert updated.name == "New Name"


@pytest.mark.asyncio
async def test_organization_repository_delete(async_session):
    """Test soft deleting via repository."""
    repo = OrganizationRepository(async_session)
    created = await repo.create({
        "name": "Delete Me", "type": OrganizationType.CLUB, "country": "KE",
    })
    org_id = created.id
    await repo.delete(org_id)
    assert await repo.get(org_id) is None


@pytest.mark.asyncio
async def test_organization_repository_get_root(async_session):
    """Test getting root organizations."""
    repo = OrganizationRepository(async_session)
    root = await repo.create({
        "name": "Root", "type": OrganizationType.FEDERATION, "country": "KE",
    })
    child = await repo.create({
        "name": "Child", "type": OrganizationType.CLUB, "country": "KE",
        "parent_organization_id": root.id,
    })
    roots = await repo.get_root_organizations()
    assert len(roots) >= 1
    assert any(r.id == root.id for r in roots)


@pytest.mark.asyncio
async def test_organization_repository_search(async_session):
    """Test searching organizations by name."""
    repo = OrganizationRepository(async_session)
    await repo.create({
        "name": "Nairobi Volleyball Club", "type": OrganizationType.CLUB, "country": "KE",
    })
    await repo.create({
        "name": "Mombasa Sports Club", "type": OrganizationType.CLUB, "country": "KE",
    })
    results = await repo.search_by_name("Nairobi")
    assert len(results) == 1
    assert "Nairobi" in results[0].name


@pytest.mark.asyncio
async def test_competition_repository(async_session):
    """Test CompetitionRepository basic operations."""
    org_repo = OrganizationRepository(async_session)
    org = await org_repo.create({
        "name": "Fed", "type": OrganizationType.FEDERATION, "country": "KE",
    })

    season_repo = SeasonRepository(async_session)
    season = await season_repo.create({
        "organization_id": org.id,
        "name": "2026 Season",
        "short_name": "2026",
        "start_date": date(2026, 1, 1),
        "end_date": date(2026, 12, 31),
        "status": "upcoming",
    })

    comp_repo = CompetitionRepository(async_session)
    comp = await comp_repo.create({
        "organization_id": org.id,
        "season_id": season.id,
        "name": "National League",
        "short_name": "NL",
        "competition_type": "league",
    })
    assert comp.id is not None

    by_org = await comp_repo.get_by_organization(org.id)
    assert len(by_org) == 1

    by_season = await comp_repo.get_by_season(season.id)
    assert len(by_season) == 1


@pytest.mark.asyncio
async def test_season_repository(async_session):
    """Test SeasonRepository basic operations."""
    org_repo = OrganizationRepository(async_session)
    org = await org_repo.create({
        "name": "Org", "type": OrganizationType.CLUB, "country": "KE",
    })

    season_repo = SeasonRepository(async_session)
    s1 = await season_repo.create({
        "organization_id": org.id, "name": "2025", "short_name": "25",
        "start_date": date(2025, 1, 1), "end_date": date(2025, 12, 31), "status": "completed",
    })
    s2 = await season_repo.create({
        "organization_id": org.id, "name": "2026", "short_name": "26",
        "start_date": date(2026, 1, 1), "end_date": date(2026, 12, 31), "status": "active",
    })

    seasons = await season_repo.get_by_organization(org.id)
    assert len(seasons) == 2

    active = await season_repo.get_active_by_organization(org.id)
    assert active is not None
    assert active.id == s2.id
