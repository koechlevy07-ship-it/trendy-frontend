"""Custom exceptions for the Volleyball Analytics Platform."""

from typing import Any, Dict, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception."""
    
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class ValidationError(Exception):
    """Validation error."""
    
    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.field = field
        self.details = details or {}
        super().__init__(message)


class NotFoundError(Exception):
    """Resource not found."""
    
    def __init__(
        self,
        resource: str,
        identifier: Any,
        message: Optional[str] = None,
    ):
        self.resource = resource
        self.identifier = identifier
        self.message = message or f"{resource} with id {identifier} not found"
        super().__init__(self.message)


class AlreadyExistsError(Exception):
    """Resource already exists."""
    
    def __init__(
        self,
        resource: str,
        field: str,
        value: Any,
        message: Optional[str] = None,
    ):
        self.resource = resource
        self.field = field
        self.value = value
        self.message = message or f"{resource} with {field}={value} already exists"
        super().__init__(self.message)


class UnauthorizedError(Exception):
    """Unauthorized access."""
    
    def __init__(self, message: str = "Unauthorized"):
        self.message = message
        super().__init__(message)


class ForbiddenError(Exception):
    """Forbidden access."""
    
    def __init__(self, message: str = "Access denied"):
        self.message = message
        super().__init__(message)


class RateLimitError(Exception):
    """Rate limit exceeded."""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: Optional[int] = None,
    ):
        self.message = message
        self.retry_after = retry_after
        super().__init__(message)


class AIModelError(Exception):
    """AI model inference error."""
    
    def __init__(
        self,
        message: str,
        model: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.model = model
        self.details = details or {}
        super().__init__(message)


class VideoProcessingError(Exception):
    """Video processing error."""
    
    def __init__(
        self,
        message: str,
        video_id: Optional[str] = None,
        frame: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.video_id = video_id
        self.frame = frame
        self.details = details or {}
        super().__init__(message)


# Exception handlers for FastAPI

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle application exceptions."""
    logger.error(f"AppException: {exc.message}", extra={"code": exc.code, "details": exc.details})
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(f"Validation error: {errors}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": {"errors": errors},
            },
        },
    )


async def pydantic_validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(f"Pydantic validation error: {errors}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed",
                "details": {"errors": errors},
            },
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
            },
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions."""
    return await http_exception_handler(request, exc)


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught exceptions."""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            },
        },
    )


def register_exception_handlers(app):
    """Register all exception handlers with the FastAPI app."""
    from fastapi import FastAPI
    
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)


# Export all exception classes
__all__ = [
    "AppException",
    "ValidationError",
    "NotFoundError",
    "AlreadyExistsError",
    "UnauthorizedError",
    "ForbiddenError",
    "RateLimitError",
    "AIModelError",
    "VideoProcessingError",
    "register_exception_handlers",
    "app_exception_handler",
    "validation_error_handler",
    "pydantic_validation_error_handler",
    "http_exception_handler",
    "general_exception_handler",
]