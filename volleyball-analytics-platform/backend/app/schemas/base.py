"""Base schemas for the Volleyball Analytics Platform."""

from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        use_enum_values=True,
    )


class ResponseSchema(BaseModel):
    """Standard response wrapper."""
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    meta: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Error response schema."""
    success: bool = False
    error: dict


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = 1
    per_page: int = 20
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page
    
    @property
    def limit(self) -> int:
        return self.per_page


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""
    items: List[T]
    total: int
    page: int
    per_page: int
    total_pages: int
    
    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages
    
    @property
    def has_prev(self) -> bool:
        return self.page > 1


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    per_page: int
    total: int
    total_pages: int


class MessageResponse(BaseModel):
    """Simple message response."""
    message: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: str
    environment: str
    database: str
    redis: str


# Pagination utility
def paginate_response(
    items: List[T],
    total: int,
    page: int,
    per_page: int,
) -> PaginatedResponse[T]:
    """Create paginated response."""
    total_pages = (total + per_page - 1) // per_page
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


T = TypeVar("T")