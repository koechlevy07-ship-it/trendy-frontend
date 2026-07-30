"""Base repository class for database operations."""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelType = TypeVar("ModelType", bound="Base")


class BaseRepository(Generic[ModelType]):
    """Base repository class providing common CRUD operations."""

    def __init__(self, model: Type[ModelType], session):
        self.model = model
        self.session = session

    async def get(self, id: UUID) -> Optional[ModelType]:
        """Get a single record by ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """Get all records with optional filtering and pagination."""
        query = select(self.model).offset(skip).limit(limit)
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_by_field(self, field: str, value: Any) -> Optional[ModelType]:
        """Get a single record by field value."""
        if not hasattr(self.model, field):
            return None
        
        result = await self.session.execute(
            select(self.model).where(getattr(self.model, field) == value)
        )
        return result.scalar_one_or_none()

    async def create(self, data: Dict[str, Any]) -> ModelType:
        """Create a new record."""
        obj = self.model(**data)
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def bulk_create(self, data_list: List[Dict[str, Any]]) -> List[ModelType]:
        """Create multiple records."""
        objects = [self.model(**data) for data in data_list]
        self.session.add_all(objects)
        await self.session.flush()
        for obj in objects:
            await self.session.refresh(obj)
        return objects

    async def update(self, id: UUID, data: Dict[str, Any]) -> Optional[ModelType]:
        """Update a record by ID."""
        obj = await self.get(id)
        if not obj:
            return None
        
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, id: UUID) -> bool:
        """Delete a record by ID."""
        obj = await self.get(id)
        if not obj:
            return False
        
        await self.session.delete(obj)
        await self.session.flush()
        return True

    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count records with optional filters."""
        query = select(func.count(self.model.id))
        
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        
        result = await self.session.execute(query)
        return result.scalar() or 0

    async def exists(self, field: str, value: Any) -> bool:
        """Check if a record exists with the given field value."""
        if not hasattr(self.model, field):
            return False
        
        result = await self.session.execute(
            select(func.count(self.model.id)).where(getattr(self.model, field) == value)
        )
        return (result.scalar() or 0) > 0