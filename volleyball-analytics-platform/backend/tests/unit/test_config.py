"""Unit tests for configuration."""

import pytest
from app.core.config import Settings


def test_settings_loading():
    """Test that settings load correctly from environment."""
    from app.core.config import Settings

    # Test with defaults
    settings = Settings(
        SECRET_KEY="test-secret",
        JWT_SECRET_KEY="test-jwt-secret",
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        REDIS_URL="redis://localhost:6379/0",
    )

    assert settings.PROJECT_NAME == "Volleyball Analytics Platform"
    assert settings.VERSION == "1.0.0"
    assert settings.API_V1_STR == "/api/v1"
    # DEBUG defaults to True in test environment
    assert settings.DEBUG is True
    assert settings.ENVIRONMENT == "development"
    assert settings.SECRET_KEY == "test-secret"
    assert settings.JWT_SECRET_KEY == "test-jwt-secret"
    assert settings.JWT_ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 15
    assert settings.REFRESH_TOKEN_EXPIRE_DAYS == 7


def test_cors_origins_parsing():
    """Test CORS origins parsing from string."""
    from app.core.config import Settings
    
    settings = Settings(
        SECRET_KEY="test",
        JWT_SECRET_KEY="test",
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        REDIS_URL="redis://localhost:6379/0",
        CORS_ORIGINS="http://localhost:3000,http://localhost:5173,https://example.com",
    )
    
    assert len(settings.CORS_ORIGINS) == 3
    assert "http://localhost:5173" in settings.CORS_ORIGINS
    assert "https://example.com" in settings.CORS_ORIGINS


def test_database_url_validation():
    """Test database URL validation."""
    from app.core.config import Settings
    
    settings = Settings(
        SECRET_KEY="test",
        JWT_SECRET_KEY="test",
        DATABASE_URL="postgresql+asyncpg://user:pass@localhost/db",
        REDIS_URL="redis://localhost:6379/0",
    )
    
    assert settings.DATABASE_URL == "postgresql+asyncpg://user:pass@localhost/db"


def test_cors_origins_list():
    """Test CORS origins parsing from comma-separated string."""
    from app.core.config import Settings
    
    settings = Settings(
        SECRET_KEY="test",
        JWT_SECRET_KEY="test",
        DATABASE_URL="sqlite+aiosqlite:///:memory:",
        REDIS_URL="redis://localhost:6379/0",
        CORS_ORIGINS="http://localhost:3000,http://localhost:5173,https://example.com",
    )
    
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert "http://localhost:5173" in settings.CORS_ORIGINS
    assert "https://example.com" in settings.CORS_ORIGINS
    assert len(settings.CORS_ORIGINS) == 3