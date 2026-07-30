"""Error Handler Middleware for centralized exception handling."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from pydantic import ValidationError as PydanticValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.exceptions import (
    AppException,
    ValidationError,
    NotFoundError,
    AlreadyExistsError,
    UnauthorizedError,
    ForbiddenError,
    RateLimitError,
    AIModelError,
    VideoProcessingError,
)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware to catch and format all exceptions consistently."""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            return self._handle_exception(request, exc)

    def _handle_exception(self, request: Request, exc: Exception) -> JSONResponse:
        """Convert exception to standardized error response."""
        from datetime import datetime
        
        correlation_id = getattr(request.state, "correlation_id", None)

        # App exceptions (known business errors)
        if isinstance(exc, AppException):
            return self._format_error(
                status_code=exc.status_code,
                error_code=exc.code,
                message=exc.message,
                details=exc.details,
                correlation_id=correlation_id,
            )

        # Pydantic validation errors
        if isinstance(exc, PydanticValidationError):
            details = [
                {
                    "field": ".".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"],
                    "type": error["type"],
                }
                for error in exc.errors()
            ]
            return self._format_error(
                status_code=HTTP_422_UNPROCESSABLE_ENTITY,
                error_code="VALIDATION_ERROR",
                message="Request validation failed",
                details=details,
                correlation_id=correlation_id,
            )

        # SQLAlchemy integrity errors (duplicates, foreign keys)
        if isinstance(exc, IntegrityError):
            if "unique" in str(exc).lower() or "duplicate" in str(exc).lower():
                return self._format_error(
                    status_code=409,
                    error_code="DUPLICATE_RESOURCE",
                    message="A resource with this identifier already exists",
                    details={"databaseError": str(exc.orig)},
                    correlation_id=correlation_id,
                )
            return self._format_error(
                status_code=400,
                error_code="DATABASE_CONSTRAINT_VIOLATION",
                message="Database constraint violation",
                details={"databaseError": str(exc.orig)},
                correlation_id=correlation_id,
            )

        # Other SQLAlchemy errors
        if isinstance(exc, SQLAlchemyError):
            return self._format_error(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                error_code="DATABASE_ERROR",
                message="Database operation failed",
                details={"databaseError": str(exc)},
                correlation_id=correlation_id,
            )

        # HTTP exceptions (Starlette)
        if hasattr(exc, "status_code"):
            return self._format_error(
                status_code=exc.status_code,
                error_code=f"HTTP_{exc.status_code}",
                message=str(exc.detail),
                correlation_id=correlation_id,
            )

        # Unknown errors
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Unhandled exception: {exc}")
        
        return self._format_error(
            status_code=500,
            error_code="INTERNAL_ERROR",
            message="An unexpected error occurred",
            correlation_id=correlation_id,
        )

    def _format_error(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: list = None,
        correlation_id: str = None,
    ) -> JSONResponse:
        """Format error response consistently."""
        from datetime import datetime
        
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "statusCode": status_code,
                "error": {
                    "code": error_code,
                    "message": message,
                    "details": details or [],
                    "correlationId": correlation_id,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                }
            }
        )