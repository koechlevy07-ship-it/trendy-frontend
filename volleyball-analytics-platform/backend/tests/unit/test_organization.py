"""Unit tests for Organization service."""

import pytest
from datetime import datetime
from uuid import uuid4, UUID

from app.models.organization import Organization
from app.models.reports import AuditLog
from app.models.core import OrganizationType, OrganizationStatus, AuditAction
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.services.organization import OrganizationService


@pytest.mark.asyncio
async def test_create_organization(async_session):
    """Test creating an organization."""
    service = OrganizationService(async_session)
    data = OrganizationCreate(
        name="Test Volleyball Club",
        type="club",
        country="KE",
        region="Nairobi",
        contact_email="info@testclub.com",
        time_zone="Africa/Nairobi",
    )
    org = await service.create_organization(data, user_id=uuid4())
    assert org.id is not None
    assert org.name == "Test Volleyball Club"
    assert org.type == OrganizationType.CLUB
    assert org.country == "KE"
    assert org.status == OrganizationStatus.ACTIVE


@pytest.mark.asyncio
async def test_create_organization_with_parent(async_session):
    """Test creating an organization with a parent."""
    service = OrganizationService(async_session)
    parent_data = OrganizationCreate(
        name="National Federation",
        type="federation",
        country="KE",
    )
    parent = await service.create_organization(parent_data)

    child_data = OrganizationCreate(
        name="Regional Club",
        type="club",
        country="KE",
        parent_organization_id=parent.id,
    )
    child = await service.create_organization(child_data)
    assert child.parent_organization_id == parent.id


@pytest.mark.asyncio
async def test_create_organization_nonexistent_parent(async_session):
    """Test creating org with nonexistent parent raises error."""
    service = OrganizationService(async_session)
    data = OrganizationCreate(
        name="Orphan Club",
        type="club",
        country="KE",
        parent_organization_id=uuid4(),
    )
    with pytest.raises(ValueError, match="Parent organization not found"):
        await service.create_organization(data)


@pytest.mark.asyncio
async def test_get_organization(async_session):
    """Test retrieving an organization."""
    service = OrganizationService(async_session)
    data = OrganizationCreate(name="Test Club", type="club", country="KE")
    created = await service.create_organization(data)
    retrieved = await service.get_organization(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.name == "Test Club"


@pytest.mark.asyncio
async def test_get_nonexistent_organization(async_session):
    """Test retrieving a nonexistent organization returns None."""
    service = OrganizationService(async_session)
    result = await service.get_organization(uuid4())
    assert result is None


@pytest.mark.asyncio
async def test_list_organizations(async_session):
    """Test listing organizations with filters."""
    service = OrganizationService(async_session)
    for i in range(3):
        data = OrganizationCreate(
            name=f"Club {i}", type="club", country="KE"
        )
        await service.create_organization(data)

    orgs = await service.list_organizations()
    assert len(orgs) == 3


@pytest.mark.asyncio
async def test_list_organizations_filter_by_country(async_session):
    """Test filtering organizations by country."""
    service = OrganizationService(async_session)
    await service.create_organization(OrganizationCreate(name="KE Club", type="club", country="KE"))
    await service.create_organization(OrganizationCreate(name="US Club", type="club", country="US"))

    ke_orgs = await service.list_organizations(country="KE")
    assert len(ke_orgs) == 1
    assert ke_orgs[0].country == "KE"


@pytest.mark.asyncio
async def test_update_organization(async_session):
    """Test updating an organization."""
    service = OrganizationService(async_session)
    data = OrganizationCreate(name="Old Name", type="club", country="KE")
    org = await service.create_organization(data, user_id=uuid4())

    update = OrganizationUpdate(name="New Name", region="Coast")
    updated = await service.update_organization(org.id, update, user_id=uuid4())
    assert updated is not None
    assert updated.name == "New Name"
    assert updated.region == "Coast"


@pytest.mark.asyncio
async def test_update_organization_self_parent(async_session):
    """Test setting self as parent raises error."""
    service = OrganizationService(async_session)
    org = await service.create_organization(
        OrganizationCreate(name="Self Parent", type="club", country="KE")
    )
    with pytest.raises(ValueError, match="cannot be its own parent"):
        await service.update_organization(
            org.id,
            OrganizationUpdate(parent_organization_id=org.id),
        )


@pytest.mark.asyncio
async def test_update_organization_circular_parent(async_session):
    """Test circular parent reference raises error."""
    service = OrganizationService(async_session)
    a = await service.create_organization(OrganizationCreate(name="Org A", type="club", country="KE"))
    b = await service.create_organization(
        OrganizationCreate(name="Org B", type="club", country="KE", parent_organization_id=a.id)
    )
    with pytest.raises(ValueError, match="circular"):
        await service.update_organization(a.id, OrganizationUpdate(parent_organization_id=b.id))


@pytest.mark.asyncio
async def test_delete_organization(async_session):
    """Test soft deleting an organization."""
    service = OrganizationService(async_session)
    org = await service.create_organization(
        OrganizationCreate(name="Delete Me", type="club", country="KE")
    )
    result = await service.delete_organization(org.id, user_id=uuid4())
    assert result is True

    deleted = await service.get_organization(org.id)
    assert deleted is None


@pytest.mark.asyncio
async def test_get_sub_organizations(async_session):
    """Test getting child organizations."""
    service = OrganizationService(async_session)
    parent = await service.create_organization(OrganizationCreate(name="Parent", type="federation", country="KE"))
    for i in range(3):
        await service.create_organization(
            OrganizationCreate(name=f"Child {i}", type="club", country="KE", parent_organization_id=parent.id)
        )
    children = await service.get_sub_organizations(parent.id)
    assert len(children) == 3


@pytest.mark.asyncio
async def test_get_all_descendants(async_session):
    """Test recursive descendants retrieval."""
    service = OrganizationService(async_session)
    root = await service.create_organization(OrganizationCreate(name="Root", type="federation", country="KE"))
    child = await service.create_organization(
        OrganizationCreate(name="Child", type="league", country="KE", parent_organization_id=root.id)
    )
    await service.create_organization(
        OrganizationCreate(name="Grandchild", type="club", country="KE", parent_organization_id=child.id)
    )
    descendants = await service.get_all_descendants(root.id)
    assert len(descendants) == 2


@pytest.mark.asyncio
async def test_organization_hierarchy_audit(async_session):
    """Test that creating an organization creates an audit log entry."""
    service = OrganizationService(async_session)
    user_id = uuid4()
    await service.create_organization(
        OrganizationCreate(name="Audited Org", type="club", country="KE"),
        user_id=user_id,
    )
    from sqlalchemy import select
    result = await async_session.execute(
        select(AuditLog).where(AuditLog.resource_type == "organization")
    )
    logs = result.scalars().all()
    assert len(logs) >= 1
    assert logs[0].action == AuditAction.CREATE
