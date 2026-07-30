"""Unit tests for Venue service."""

import pytest
import pytest_asyncio
from uuid import uuid4

from app.models.organization import Venue, Court
from app.models.core import VenueType
from app.schemas.venue import VenueCreate, VenueUpdate, CourtCreate, CourtUpdate
from app.schemas.organization import OrganizationCreate
from app.services.organization import VenueService, OrganizationService


@pytest_asyncio.fixture
async def org(async_session):
    """Create a test organization."""
    service = OrganizationService(async_session)
    return await service.create_organization(
        OrganizationCreate(name="Test Org", type="club", country="KE")
    )


@pytest.mark.asyncio
async def test_create_venue(async_session, org):
    """Test creating a venue."""
    service = VenueService(async_session)
    data = VenueCreate(
        organization_id=org.id,
        name="Main Arena",
        type="indoor",
        address="123 Sports Road",
        city="Nairobi",
        country="KE",
        capacity=5000,
    )
    venue = await service.create_venue(data, user_id=uuid4())
    assert venue.id is not None
    assert venue.name == "Main Arena"
    assert venue.city == "Nairobi"
    assert venue.capacity == 5000


@pytest.mark.asyncio
async def test_get_venue(async_session, org):
    """Test retrieving a venue."""
    service = VenueService(async_session)
    data = VenueCreate(
        organization_id=org.id, name="Test Venue", type="indoor",
        address="456 Street", city="Mombasa", country="KE",
    )
    created = await service.create_venue(data)
    retrieved = await service.get_venue(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id


@pytest.mark.asyncio
async def test_list_venues(async_session, org):
    """Test listing venues for an organization."""
    service = VenueService(async_session)
    for name in ["Venue A", "Venue B", "Venue C"]:
        await service.create_venue(VenueCreate(
            organization_id=org.id, name=name, type="indoor",
            address="Addr", city="City", country="KE",
        ))
    venues = await service.list_venues(org.id)
    assert len(venues) == 3


@pytest.mark.asyncio
async def test_update_venue(async_session, org):
    """Test updating a venue."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Old Name", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    updated = await service.update_venue(
        venue.id,
        VenueUpdate(name="New Name", capacity=8000),
        user_id=uuid4(),
    )
    assert updated.name == "New Name"
    assert updated.capacity == 8000


@pytest.mark.asyncio
async def test_delete_venue(async_session, org):
    """Test soft deleting a venue."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Delete Me", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    result = await service.delete_venue(venue.id, user_id=uuid4())
    assert result is True
    assert await service.get_venue(venue.id) is None


@pytest.mark.asyncio
async def test_create_court(async_session, org):
    """Test creating a court within a venue."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Arena", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    court = await service.create_court(CourtCreate(
        venue_id=venue.id, name="Main Court", number=1, type="indoor",
    ), user_id=uuid4())
    assert court.id is not None
    assert court.name == "Main Court"
    assert court.number == 1


@pytest.mark.asyncio
async def test_list_courts(async_session, org):
    """Test listing courts for a venue."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Arena", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    for i in range(1, 4):
        await service.create_court(CourtCreate(
            venue_id=venue.id, name=f"Court {i}", number=i, type="indoor",
        ))
    courts = await service.list_courts(venue.id)
    assert len(courts) == 3


@pytest.mark.asyncio
async def test_get_venue_with_courts(async_session, org):
    """Test retrieving venue with its courts."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Complex", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    for i in range(1, 3):
        await service.create_court(CourtCreate(
            venue_id=venue.id, name=f"Court {i}", number=i, type="indoor",
        ))
    venue_with_courts = await service.get_venue_with_courts(venue.id)
    assert venue_with_courts is not None
    assert len(venue_with_courts.courts) == 2


@pytest.mark.asyncio
async def test_update_court(async_session, org):
    """Test updating a court."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Arena", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    court = await service.create_court(CourtCreate(
        venue_id=venue.id, name="Old Court", number=1, type="indoor",
    ))
    updated = await service.update_court(
        court.id,
        CourtUpdate(name="New Court", has_scoreboard=True),
    )
    assert updated.name == "New Court"
    assert updated.has_scoreboard is True


@pytest.mark.asyncio
async def test_delete_court(async_session, org):
    """Test soft deleting a court."""
    service = VenueService(async_session)
    venue = await service.create_venue(VenueCreate(
        organization_id=org.id, name="Arena", type="indoor",
        address="Addr", city="City", country="KE",
    ))
    court = await service.create_court(CourtCreate(
        venue_id=venue.id, name="Delete Court", number=1, type="indoor",
    ))
    result = await service.delete_court(court.id, user_id=uuid4())
    assert result is True
    assert await service.get_court(court.id) is None
