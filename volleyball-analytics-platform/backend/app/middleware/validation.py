"""Validation Middleware for request DTO validation."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
import logging

logger = logging.getLogger(__name__)


class ValidationMiddleware(BaseHTTPMiddleware):
    """Middleware to execute DTO validation before controller execution."""

    async def dispatch(self, request: Request, call_next):
        # Validation is handled by FastAPI's dependency injection and Pydantic models
        # This middleware serves as a hook for additional validation if needed
        return await call_next(request)