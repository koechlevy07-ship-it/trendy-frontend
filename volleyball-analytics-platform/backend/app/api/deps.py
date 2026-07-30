"""
Database session dependency.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal


async def get_async_session() -> AsyncGenerator:
    """Dependency for FastAPI to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Type alias for dependency injection
from typing import Annotated
from fastapi import Depends

AsyncSessionDep = Annotated[AsyncSession, Depends(get_async_session)]