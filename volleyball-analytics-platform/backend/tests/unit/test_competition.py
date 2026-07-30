"""Unit tests for Competition service."""

import pytest
import pytest_asyncio
from datetime import date, timedelta
from uuid import uuid4

from app.models.organization import Organization
from app.models.competition import Competition, Season
from app.models.core import CompetitionType, CompetitionStatus, SeasonStatus, OrganizationType
from app.schemas.competition import CompetitionCreate, CompetitionUpdate
from app.schemas.season import SeasonCreate
from app.services.organization import CompetitionService, SeasonService, OrganizationService
from app.schemas.organization import OrganizationCreate


@pytest_asyncio.fixture
async def org(async_session):
    """Create a test organization."""
    service = OrganizationService(async_session)
    return await service.create_organization(
        OrganizationCreate(name="Test Federation", type="federation", country="KE")
    )


@pytest_asyncio.fixture
async def season(async_session, org):
    """Create a test season."""
    service = SeasonService(async_session)
    return await service.create_season(
        SeasonCreate(
            organization_id=org.id,
            name="2026 Season",
            short_name="2026",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status="upcoming",
        )
    )


@pytest.mark.asyncio
async def test_create_competition(async_session, org, season):
    """Test creating a competition."""
    service = CompetitionService(async_session)
    data = CompetitionCreate(
        organization_id=org.id,
        season_id=season.id,
        name="National League 2026",
        short_name="NL2026",
        competition_type="league",
        max_teams=12,
        start_date=date(2026, 3, 1),
        end_date=date(2026, 11, 30),
    )
    comp = await service.create_competition(data, user_id=uuid4())
    assert comp.id is not None
    assert comp.name == "National League 2026"
    assert comp.competition_type == CompetitionType.LEAGUE
    assert comp.status == CompetitionStatus.PLANNING


@pytest.mark.asyncio
async def test_create_competition_nonexistent_season(async_session, org):
    """Test creating competition with nonexistent season raises error."""
    service = CompetitionService(async_session)
    data = CompetitionCreate(
        organization_id=org.id,
        season_id=uuid4(),
        name="Bad Comp",
        short_name="BAD",
        competition_type="league",
    )
    with pytest.raises(ValueError, match="Season not found"):
        await service.create_competition(data)


@pytest.mark.asyncio
async def test_create_competition_nonexistent_org(async_session, season):
    """Test creating competition with nonexistent org raises error."""
    service = CompetitionService(async_session)
    data = CompetitionCreate(
        organization_id=uuid4(),
        season_id=season.id,
        name="Bad Comp",
        short_name="BAD",
        competition_type="league",
    )
    with pytest.raises(ValueError, match="Organization not found"):
        await service.create_competition(data)


@pytest.mark.asyncio
async def test_get_competition(async_session, org, season):
    """Test retrieving a competition."""
    service = CompetitionService(async_session)
    data = CompetitionCreate(
        organization_id=org.id, season_id=season.id,
        name="Test Comp", short_name="TC", competition_type="cup",
    )
    created = await service.create_competition(data)
    retrieved = await service.get_competition(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id


@pytest.mark.asyncio
async def test_list_competitions(async_session, org, season):
    """Test listing competitions with filters."""
    service = CompetitionService(async_session)
    for name, short in [("League A", "LA"), ("League B", "LB"), ("Cup C", "CC")]:
        await service.create_competition(CompetitionCreate(
            organization_id=org.id, season_id=season.id,
            name=name, short_name=short, competition_type="league",
        ))
    comps = await service.list_competitions(organization_id=org.id)
    assert len(comps) == 3


@pytest.mark.asyncio
async def test_update_competition(async_session, org, season):
    """Test updating a competition."""
    service = CompetitionService(async_session)
    comp = await service.create_competition(CompetitionCreate(
        organization_id=org.id, season_id=season.id,
        name="Original", short_name="ORG", competition_type="league",
    ))
    updated = await service.update_competition(
        comp.id,
        CompetitionUpdate(name="Updated", status="in_progress"),
        user_id=uuid4(),
    )
    assert updated.name == "Updated"
    assert updated.status == CompetitionStatus.IN_PROGRESS


@pytest.mark.asyncio
async def test_delete_competition(async_session, org, season):
    """Test soft deleting a competition."""
    service = CompetitionService(async_session)
    comp = await service.create_competition(CompetitionCreate(
        organization_id=org.id, season_id=season.id,
        name="Delete Me", short_name="DEL", competition_type="league",
    ))
    result = await service.delete_competition(comp.id, user_id=uuid4())
    assert result is True
    deleted = await service.get_competition(comp.id)
    assert deleted is None


@pytest.mark.asyncio
async def test_add_team_to_competition(async_session, org, season):
    """Test adding a team to competition."""
    from app.models.organization import Team, TeamGender, AgeCategory, CompetitionLevel

    comp_svc = CompetitionService(async_session)
    comp = await comp_svc.create_competition(CompetitionCreate(
        organization_id=org.id, season_id=season.id,
        name="Test Comp", short_name="TC", competition_type="league",
    ))

    team = Team(
        organization_id=org.id, name="Test Team", short_name="TT",
        gender=TeamGender.MEN, age_category=AgeCategory.SENIOR,
        competition_level=CompetitionLevel.PROFESSIONAL,
        category="senior_men",
        country="KE",
    )
    async_session.add(team)
    await async_session.flush()

    ct = await comp_svc.add_team(comp.id, team.id)
    assert ct is not None
    assert ct.competition_id == comp.id
    assert ct.team_id == team.id


@pytest.mark.asyncio
async def test_remove_team_from_competition(async_session, org, season):
    """Test removing a team from competition."""
    from app.models.organization import Team, TeamGender, AgeCategory, CompetitionLevel

    comp_svc = CompetitionService(async_session)
    comp = await comp_svc.create_competition(CompetitionCreate(
        organization_id=org.id, season_id=season.id,
        name="Test Comp", short_name="TC", competition_type="league",
    ))

    team = Team(
        organization_id=org.id, name="Test Team", short_name="TT",
        gender=TeamGender.MEN, age_category=AgeCategory.SENIOR,
        competition_level=CompetitionLevel.PROFESSIONAL,
        category="senior_men",
        country="KE",
    )
    async_session.add(team)
    await async_session.flush()

    await comp_svc.add_team(comp.id, team.id)
    result = await comp_svc.remove_team(comp.id, team.id)
    assert result is True
