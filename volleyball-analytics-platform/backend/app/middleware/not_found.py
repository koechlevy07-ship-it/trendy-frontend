"""Not Found Middleware for 404 handling."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_404_NOT_FOUND


class NotFoundMiddleware(BaseHTTPMiddleware):
    """Middleware to handle 404 Not Found responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if response.status_code == 404:
            # Only wrap API responses
            if request.url.path.startswith("/api/"):
                from datetime import datetime
                return JSONResponse(
                    status_code=404,
                    content={
                        "success": False,
                        "statusCode": 404,
                        "error": {
                            "code": "NOT_FOUND",
                            "message": f"Endpoint not found: {request.method} {request.url.path}",
                            "details": [],
                            "correlationId": getattr(request.state, "correlation_id", None),
                            "timestamp": datetime.utcnow().isoformat() + "Z"
                        }
                    }
                )

        return response