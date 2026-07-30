"""Response Formatter Middleware for standardized API responses."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
import json

# HTTP status codes that should not be wrapped
UNWRAPPED_STATUS_CODES = {204, 304}


class ResponseFormatterMiddleware(BaseHTTPMiddleware):
    """Middleware to standardize all API responses."""

    async def dispatch(self, request: Request, call_next):
        # Skip for non-API paths
        if not request.url.path.startswith("/api/"):
            return await call_next(request)

        # Skip for health endpoints
        if request.url.path.startswith("/health"):
            return await call_next(request)

        response = await call_next(request)

        # Skip wrapping for no-content responses
        if response.status_code in UNWRAPPED_STATUS_CODES:
            return response

        # Only wrap JSON responses
        if "application/json" not in response.headers.get("content-type", ""):
            return response

        # Read response body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        try:
            data = json.loads(body.decode())
        except json.JSONDecodeError:
            return response

        # Wrap response in standard format
        wrapped = {
            "success": True,
            "message": "Success",
            "data": data,
            "meta": {
                "path": request.url.path,
                "method": request.method,
            },
        }

        # Return new response with wrapped data
        return JSONResponse(
            content=wrapped,
            status_code=response.status_code,
            headers=dict(response.headers),
        )