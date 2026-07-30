"""Authentication Middleware for JWT validation."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.status import HTTP_401_UNAUTHORIZED

from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError


EXCLUDED_PATHS = {
    "/health",
    "/health/live",
    "/health/ready",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
}


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware to authenticate requests using JWT tokens."""

    async def dispatch(self, request: Request, call_next):
        # Skip authentication for excluded paths
        if request.url.path in EXCLUDED_PATHS or request.url.path.startswith("/static"):
            return await call_next(request)

        # Get authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return self._unauthorized_response("Missing or invalid authorization header")

        # Extract token
        token = auth_header.split(" ")[1]
        
        try:
            # Decode and validate token
            payload = decode_token(token)
            
            # Attach user info to request state
            request.state.user_id = payload.get("sub")
            request.state.user_role = payload.get("role")
            request.state.user_permissions = payload.get("permissions", [])
            request.state.organization_id = payload.get("org_id")
            request.state.token_payload = payload
            
        except UnauthorizedError as e:
            return self._unauthorized_response(str(e))
        except Exception as e:
            return self._unauthorized_response(f"Token validation failed: {str(e)}")

        return await call_next(request)

    def _unauthorized_response(self, message: str) -> Response:
        """Return 401 Unauthorized response."""
        from app.schemas.base import ErrorResponse
        import json
        
        error_response = ErrorResponse(
            success=False,
            statusCode=HTTP_401_UNAUTHORIZED,
            error={
                "code": "UNAUTHORIZED",
                "message": message,
                "details": [],
                "correlationId": getattr(request.state, "correlation_id", None) if "request" in dir() else None,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
        
        return Response(
            content=json.dumps(error_response.dict()),
            status_code=HTTP_401_UNAUTHORIZED,
            media_type="application/json"
        )


def get_current_user(request: Request) -> dict:
    """Get current authenticated user from request state."""
    return {
        "user_id": getattr(request.state, "user_id", None),
        "role": getattr(request.state, "user_role", None),
        "permissions": getattr(request.state, "user_permissions", []),
        "organization_id": getattr(request.state, "organization_id", None),
    }


def require_auth(request: Request) -> dict:
    """Require authentication and return user info."""
    user = get_current_user(request)
    if not user["user_id"]:
        raise UnauthorizedError("Authentication required")
    return user