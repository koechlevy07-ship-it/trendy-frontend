"""Unit tests for Season service."""

import pytest
import pytest_asyncio
from datetime import date
from uuid import uuid4

from app.schemas.season import SeasonCreate, SeasonUpdate
from app.schemas.organization import OrganizationCreate
from app.services.organization import SeasonService, OrganizationService


@pytest_asyncio.fixture
async def org(async_session):
    """Create a test organization."""
    service = OrganizationService(async_session)
    return await service.create_organization(
        OrganizationCreate(name="Test Fed", type="federation", country="KE")
    )


@pytest.mark.asyncio
async def test_create_season(async_session, org):
    """Test creating a season."""
    service = SeasonService(async_session)
    data = SeasonCreate(
        organization_id=org.id,
        name="2026 Season",
        short_name="2026",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
        status="upcoming",
        description="Main competition season",
    )
    season = await service.create_season(data, user_id=uuid4())
    assert season.id is not None
    assert season.name == "2026 Season"
    assert season.short_name == "2026"
    assert season.organization_id == org.id
    assert season.description == "Main competition season"


@pytest.mark.asyncio
async def test_create_season_nonexistent_org(async_session):
    """Test creating season with nonexistent org."""
    service = SeasonService(async_session)
    data = SeasonCreate(
        organization_id=uuid4(),
        name="Bad Season",
        short_name="BAD",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 12, 31),
        status="upcoming",
    )
    with pytest.raises(ValueError, match="Organization not found"):
        await service.create_season(data)


@pytest.mark.asyncio
async def test_only_one_active_season(async_session, org):
    """Test only one active season per organization."""
    service = SeasonService(async_session)
    await service.create_season(SeasonCreate(
        organization_id=org.id, name="2025 Season", short_name="2025",
        start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
        status="active",
    ))
    with pytest.raises(ValueError, match="already has an active season"):
        await service.create_season(SeasonCreate(
            organization_id=org.id, name="2026 Season", short_name="2026",
            start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
            status="active",
        ))


@pytest.mark.asyncio
async def test_get_season(async_session, org):
    """Test retrieving a season."""
    service = SeasonService(async_session)
    data = SeasonCreate(
        organization_id=org.id, name="Test Season", short_name="TS",
        start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
        status="upcoming",
    )
    created = await service.create_season(data)
    retrieved = await service.get_season(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id


@pytest.mark.asyncio
async def test_list_seasons(async_session, org):
    """Test listing seasons."""
    service = SeasonService(async_session)
    for year in ["2024", "2025", "2026"]:
        await service.create_season(SeasonCreate(
            organization_id=org.id, name=f"{year} Season", short_name=year,
            start_date=date(int(year), 1, 1), end_date=date(int(year), 12, 31),
            status="completed" if year != "2026" else "active",
        ))
    seasons = await service.list_seasons(org.id)
    assert len(seasons) == 3


@pytest.mark.asyncio
async def test_update_season(async_session, org):
    """Test updating a season."""
    service = SeasonService(async_session)
    season = await service.create_season(SeasonCreate(
        organization_id=org.id, name="Old Season", short_name="OS",
        start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
        status="upcoming",
    ))
    updated = await service.update_season(
        season.id,
        SeasonUpdate(name="Updated Season", status="active"),
        user_id=uuid4(),
    )
    assert updated.name == "Updated Season"
    assert updated.status == "active"


@pytest.mark.asyncio
async def test_activate_season(async_session, org):
    """Test activating a season deactivates others."""
    service = SeasonService(async_session)
    s1 = await service.create_season(SeasonCreate(
        organization_id=org.id, name="Season 1", short_name="S1",
        start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
        status="active",
    ))
    s2 = await service.create_season(SeasonCreate(
        organization_id=org.id, name="Season 2", short_name="S2",
        start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
        status="upcoming",
    ))

    activated = await service.activate_season(s2.id, user_id=uuid4())
    assert activated is not None
    assert activated.status == "active"

    deactivated = await service.get_season(s1.id)
    assert deactivated.status == "archived"


@pytest.mark.asyncio
async def test_delete_season(async_session, org):
    """Test soft deleting a season."""
    service = SeasonService(async_session)
    season = await service.create_season(SeasonCreate(
        organization_id=org.id, name="Delete Me", short_name="DEL",
        start_date=date(2026, 1, 1), end_date=date(2026, 12, 31),
        status="upcoming",
    ))
    result = await service.delete_season(season.id, user_id=uuid4())
    assert result is True
    assert await service.get_season(season.id) is None
