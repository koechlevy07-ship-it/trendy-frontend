"""Dependency injection for FastAPI."""

from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.redis import get_redis, RedisManager
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user import UserRepository

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        from app.core.security import decode_token
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    # Get user from database
    user_repo = UserRepository(db)
    user = await user_repo.get(UUID(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user",
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    """Get current superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    return current_user


async def get_current_coach(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current user with coach role."""
    if current_user.role not in ["coach", "assistant_coach"]:
        raise HTTPException(
            status_code=403,
            detail="Coach role required",
        )
    return current_user


async def get_current_analyst(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current user with analyst role."""
    if current_user.role not in ["analyst", "coach", "assistant_coach"]:
        raise HTTPException(
            status_code=403,
            detail="Analyst role required",
        )
    return current_user


def get_optional_user(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    """Get current user if token is valid, otherwise return None."""
    try:
        from app.core.security import decode_token
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            return None
        # Could fetch user here if needed
        return None
    except Exception:
        return None


def get_redis() -> RedisManager:
    """Get Redis manager instance."""
    return get_redis()


def get_db_session() -> AsyncSession:
    """Get database session for non-FastAPI contexts."""
    return get_db()