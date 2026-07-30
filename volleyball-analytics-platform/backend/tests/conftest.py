"""Test configuration and fixtures."""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from uuid import uuid4

from sqlalchemy import event
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy import JSON

from app.core.database import Base, get_db

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


# Test database URL - use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


def _replace_jsonb():
    """Replace PostgreSQL-specific types with SQLite-compatible types."""
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if isinstance(column.type, JSONB):
                column.type = JSON()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    
    # Create all tables
    from app.core.database import Base
    _replace_jsonb()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def async_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session_maker = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client():
    """Create test client for API testing."""
    from app.main import create_application
    from app.core.database import get_db
    
    # Import the app
    from app.main import create_application
    
    app = create_application()
    
    async with AsyncClient(app=app, base_url="http://test", follow_redirects=False) as client:
        yield client


@pytest.fixture
def sample_user():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123",
        "role": "coach",
    }


@pytest.fixture
def sample_team():
    """Sample team data for testing."""
    return {
        "name": "Test Team",
        "short_name": "TT",
        "gender": "men",
        "age_category": "senior",
        "competition_level": "professional",
        "primary_color": "#3B82F6",
        "secondary_color": "#1E40AF",
}


@ pytest.fixture
def sample_player():
    """Sample player data for testing."""
    return {
        "first_name": "John",
        "last_name": "Doe",
        "position": "OH",
        "jersey_number": 10,
        "height_cm": 190,
        "weight_kg": 85,
        "date_of_birth": "1995-01-15",
        "nationality": "USA",
        "dominant_hand": "right",
    }


@pytest.fixture
def sample_match():
    """Sample match data for testing."""
    return {
        "home_team_id": "123e4567-e89b-12d3-a456-426614174000",
        "away_team_id": "123e4567-e89b-12d3-a456-426614174001",
        "match_date": "2024-01-15",
        "start_time": "19:00:00",
        "venue": "Test Arena",
        "sets_format": "best_of_5",
        "tournament_id": None,
    }


# Test utilities
class TestUtils:
    """Utility functions for tests."""
    
    @staticmethod
    async def create_test_user(session, user_data=None):
        """Create a test user."""
        from app.models.user import User
        from app.core.security import get_password_hash
        
        user_data = user_data or {}
        user = User(
            email=user_data.get("email", "test@example.com"),
            username=user_data.get("username", "testuser"),
            full_name=user_data.get("full_name", "Test User"),
            hashed_password=get_password_hash(user_data.get("password", "testpassword123")),
            role=user_data.get("role", "player"),
            organization_id=user_data.get("organization_id"),
            team_id=user_data.get("team_id"),
        )
        return user
    
    @staticmethod
    def create_mock_user(user_id=None):
        """Create a mock user object for testing."""
        from app.models.user import User
        from uuid import uuid4
        
        user = User(
            id=user_id or uuid4(),
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            hashed_password="$2b$12$fakehashedpassword",
            role="coach",
            is_active=True,
            is_superuser=False,
        )
        return user


class MockRedis:
    """Mock Redis for testing."""
    
    def __init__(self):
        self.data = {}
    
    async def get(self, key: str):
        return self._data.get(key)
    
    async def set(self, key: str, value: str, ex=None):
        self._data[key] = value
        return True
    
    async def delete(self, key: str):
        if key in self._data:
            del self._data[key]
            return 1
        return 0
    
    async def exists(self, key):
        return key in self._data
    
    async def expire(self, key: str, seconds: int):
        return True
    
    async def incrby(self, key: str, amount: int = 1):
        current = int(self._data.get(key, 0))
        new_val = current + 1
        self._data[key] = str(new_val)
        return new_val
    
    async def close(self):
        pass
    
    async def hset(self, name, key, value):
        if name not in self._data:
            self._data[name] = {}
        self._data[name][key] = value
        return 1
    
    async def hget(self, name, key):
        return self._data.get(name, {}).get(key)
    
    async def hgetall(self, name):
        return self._data.get(name, {})
    
    async def hdel(self, name, *keys):
        if name in self._data:
            count = 0
            for key in keys:
                if key in self._data[name]:
                    del self._data[name][key]
                    count += 1
            return count
        return 0
    
    async def lpush(self, key, *values):
        if key not in self._data:
            self._data[key] = []
        self._data[key] = list(values) + self._data.get(key, [])
        return len(self._data[key])
    
    async def lrange(self, key, start, end):
        if key not in self._data:
            return []
        lst = self._data[key]
        if end == -1:
            return lst[start:]
        return lst[start:end+1]
    
    async def close(self):
        pass


def get_test_settings():
    """Override settings for testing."""
    from app.core.config import Settings
    
    return Settings(
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        REDIS_URL="redis://localhost:6379/0",
        SECRET_KEY="test-secret-key-for-testing-only",
        JWT_SECRET_KEY="test-jwt-secret",
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=15,
        REFRESH_TOKEN_EXPIRE_DAYS=7,
        DEBUG=True,
        ENVIRONMENT="testing",
        LOG_LEVEL="DEBUG",
    )