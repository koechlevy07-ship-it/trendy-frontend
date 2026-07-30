"""Rate Limiting Middleware for API protection."""

import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_429_TOO_MANY_REQUESTS


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce rate limits on API endpoints."""

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_limit: int = 10,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_limit = burst_limit
        self.minute_counts = defaultdict(list)
        self.hour_counts = defaultdict(list)
        self.burst_counts = defaultdict(int)

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path.startswith("/health"):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        current_time = time.time()

        # Clean old entries
        self._cleanup_old_entries(current_time)

        # Check burst limit (short-term)
        if self.burst_counts[client_ip] >= self.burst_limit:
            return self._rate_limit_response("Burst limit exceeded")

        # Check minute limit
        if len(self.minute_counts[client_ip]) >= self.requests_per_minute:
            return self._rate_limit_response("Rate limit exceeded (per minute)")

        # Check hour limit
        if len(self.hour_counts[client_ip]) >= self.requests_per_hour:
            return self._rate_limit_response("Rate limit exceeded (per hour)")

        # Record request
        self.minute_counts[client_ip].append(current_time)
        self.hour_counts[client_ip].append(current_time)
        self.burst_counts[client_ip] += 1

        response = await call_next(request)

        # Decrease burst count after response
        self.burst_counts[client_ip] = max(0, self.burst_counts[client_ip] - 1)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit-Minute"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining-Minute"] = str(
            max(0, self.requests_per_minute - len(self.minute_counts[client_ip]))
        )
        response.headers["X-RateLimit-Limit-Hour"] = str(self.requests_per_hour)
        response.headers["X-RateLimit-Remaining-Hour"] = str(
            max(0, self.requests_per_hour - len(self.hour_counts[client_ip]))
        )

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup_old_entries(self, current_time: float):
        """Remove expired time entries."""
        minute_ago = current_time - 60
        hour_ago = current_time - 3600

        for client_ip in list(self.minute_counts.keys()):
            self.minute_counts[client_ip] = [
                t for t in self.minute_counts[client_ip] if t > minute_ago
            ]
            if not self.minute_counts[client_ip]:
                del self.minute_counts[client_ip]

        for client_ip in list(self.hour_counts.keys()):
            self.hour_counts[client_ip] = [
                t for t in self.hour_counts[client_ip] if t > hour_ago
            ]
            if not self.hour_counts[client_ip]:
                del self.hour_counts[client_ip]

    def _rate_limit_response(self, message: str) -> JSONResponse:
        """Return 429 Too Many Requests response."""
        from datetime import datetime
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "statusCode": 429,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": message,
                    "details": [],
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            }
        )