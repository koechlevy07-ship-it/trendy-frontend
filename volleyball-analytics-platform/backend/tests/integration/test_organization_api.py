"""Integration tests for Organization API endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from uuid import uuid4


@pytest.fixture
def app():
    """Create the FastAPI app for testing."""
    from app.main import create_application
    return create_application()


@pytest.fixture
def test_client(app):
    """Create test client."""
    from app.core.database import get_db
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test", follow_redirects=False)


@pytest.mark.asyncio
async def test_health_check(test_client):
    """Test health check endpoint."""
    response = await test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_create_organization_unauthorized(test_client):
    """Test creating organization without auth returns 401."""
    response = await test_client.post(
        "/api/v1/organizations",
        json={"name": "Test", "type": "club", "country": "KE"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_organizations_unauthorized(test_client):
    """Test listing organizations without auth returns 401."""
    response = await test_client.get("/api/v1/organizations")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_organization_unauthorized(test_client):
    """Test getting organization without auth returns 401."""
    response = await test_client.get(f"/api/v1/organizations/{uuid4()}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_organization_unauthorized(test_client):
    """Test updating organization without auth returns 401."""
    response = await test_client.patch(
        f"/api/v1/organizations/{uuid4()}",
        json={"name": "Updated"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_organization_unauthorized(test_client):
    """Test deleting organization without auth returns 401."""
    response = await test_client.delete(f"/api/v1/organizations/{uuid4()}")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_competition_endpoints_unauthorized(test_client):
    """Test competition endpoints without auth."""
    org_id = uuid4()
    response = await test_client.post(
        f"/api/v1/organizations/{org_id}/competitions",
        json={"name": "Comp", "short_name": "C", "competition_type": "league", "season_id": str(uuid4()), "organization_id": str(org_id)},
    )
    assert response.status_code == 401

    response = await test_client.get(f"/api/v1/organizations/{org_id}/competitions")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_season_endpoints_unauthorized(test_client):
    """Test season endpoints without auth."""
    org_id = uuid4()
    response = await test_client.post(
        f"/api/v1/organizations/{org_id}/seasons",
        json={"name": "Season 2024", "start_date": "2024-01-01", "end_date": "2024-12-31", "organization_id": str(org_id)},
    )
    assert response.status_code == 401

    response = await test_client.get(f"/api/v1/organizations/{org_id}/seasons")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_venue_endpoints_unauthorized(test_client):
    """Test venue endpoints without auth."""
    org_id = uuid4()
    response = await test_client.post(
        f"/api/v1/organizations/{org_id}/venues",
        json={"name": "Stadium", "type": "indoor", "city": "Nairobi", "country": "KE"},
    )
    assert response.status_code == 401

    response = await test_client.get(f"/api/v1/organizations/{org_id}/venues")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_organization_tree_endpoint(test_client):
    """Test organization tree endpoint."""
    response = await test_client.get("/api/v1/organizations/tree")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_organization_children_endpoint(test_client):
    """Test organization children endpoint."""
    org_id = uuid4()
    response = await test_client.get(f"/api/v1/organizations/{org_id}/children")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_organization_descendants_endpoint(test_client):
    """Test organization descendants endpoint."""
    org_id = uuid4()
    response = await test_client.get(f"/api/v1/organizations/{org_id}/descendants")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_court_endpoints_unauthorized(test_client):
    """Test court endpoints without auth."""
    org_id = uuid4()
    venue_id = uuid4()
    response = await test_client.post(
        f"/api/v1/organizations/{org_id}/venues/{venue_id}/courts",
        json={"name": "Court 1", "venue_id": str(uuid4())},
    )
    assert response.status_code == 401

    response = await test_client.get(f"/api/v1/organizations/{org_id}/venues/{uuid4()}/courts")
    assert response.status_code == 401