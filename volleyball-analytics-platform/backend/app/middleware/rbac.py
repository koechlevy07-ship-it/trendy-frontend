"""Authorization Middleware for Role-Based Access Control (RBAC)."""

from typing import List, Optional, Set
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_403_FORBIDDEN
import logging

from app.core.exceptions import ForbiddenError

logger = logging.getLogger(__name__)

# Define permission mappings for endpoints
ENDPOINT_PERMISSIONS = {
    # Player endpoints
    "POST /api/v1/players": ["player:create"],
    "GET /api/v1/players": ["player:read"],
    "GET /api/v1/players/{id}": ["player:read"],
    "PUT /api/v1/players/{id}": ["player:update"],
    "PATCH /api/v1/players/{id}/status": ["player:update"],
    "DELETE /api/v1/players/{id}": ["player:delete"],
    "POST /api/v1/players/{id}/restore": ["player:update"],
    "GET /api/v1/players/search": ["player:read"],
    "POST /api/v1/players/{id}/registration": ["player:create", "registration:create"],
    "GET /api/v1/players/{id}/registration": ["player:read", "registration:read"],
    "PUT /api/v1/players/{id}/registration": ["registration:update"],
    "GET /api/v1/registrations/expiring": ["registration:read"],
    "POST /api/v1/players/{id}/career": ["career:create"],
    "GET /api/v1/players/{id}/career": ["career:read"],
    "PUT /api/v1/career/{career_id}": ["career:update"],
    "POST /api/v1/career/{career_id}/archive": ["career:update"],
    "POST /api/v1/players/{id}/face-embeddings": ["player:update", "ai:write"],
    "GET /api/v1/players/{id}/face-embeddings": ["player:read", "ai:read"],
    "PUT /api/v1/face-embeddings/{embedding_id}": ["player:update", "ai:write"],
    "POST /api/v1/face-embeddings/{embedding_id}/deactivate": ["player:update", "ai:write"],
    "POST /api/v1/players/{id}/face-embeddings/deactivate-old": ["player:update", "ai:write"],

    # Staff endpoints
    "POST /api/v1/staff": ["staff:create"],
    "GET /api/v1/staff": ["staff:read"],
    "GET /api/v1/staff/{id}": ["staff:read"],
    "PUT /api/v1/staff/{id}": ["staff:update"],
    "DELETE /api/v1/staff/{id}": ["staff:delete"],
    "POST /api/v1/staff/{id}/restore": ["staff:update"],
    "GET /api/v1/staff/search": ["staff:read"],
    "POST /api/v1/staff/{id}/assign": ["assignment:create"],
    "POST /api/v1/staff/{id}/transfer": ["assignment:update"],
    "PATCH /api/v1/assignments/{id}/terminate": ["assignment:update"],
    "POST /api/v1/staff/{id}/activate": ["staff:update"],
    "POST /api/v1/staff/{id}/suspend": ["staff:update"],
    "POST /api/v1/staff/{id}/terminate": ["staff:update"],
    "POST /api/v1/staff/{id}/medical": ["staff:update", "medical:write"],
    "GET /api/v1/staff/{id}/medical": ["staff:read", "medical:read"],
    "POST /api/v1/staff/{id}/documents": ["staff:update"],
    "GET /api/v1/staff/{id}/documents": ["staff:read"],
    "GET /api/v1/staff/documents/expiring": ["staff:read"],

    # Assignment endpoints
    "POST /api/v1/assignments": ["assignment:create"],
    "GET /api/v1/assignments": ["assignment:read"],
    "GET /api/v1/assignments/current/{staff_id}": ["assignment:read"],
    "GET /api/v1/assignments/history/{staff_id}": ["assignment:read"],
    "POST /api/v1/assignments/transfer": ["assignment:update"],
    "PATCH /api/v1/assignments/{id}/terminate": ["assignment:update"],
    "GET /api/v1/assignments/season/{season_id}": ["assignment:read"],
    "GET /api/v1/assignments/organization/{organization_id}": ["assignment:read"],

    # Coach assignments
    "POST /api/v1/assignments/coach": ["assignment:create", "coach:write"],
    "GET /api/v1/assignments/coach/team/{team_id}": ["assignment:read"],
    "GET /api/v1/assignments/coach/head/{team_id}": ["assignment:read"],

    # Referee assignments
    "POST /api/v1/assignments/referee": ["assignment:create", "referee:write"],
    "POST /api/v1/referee-assignments/{match_id}/{staff_id}/{role}/confirm": ["assignment:update"],
    "GET /api/v1/referee-assignments/match/{match_id}": ["assignment:read"],

    # Medical assignments
    "POST /api/v1/assignments/medical": ["assignment:create", "medical:write"],
    "GET /api/v1/assignments/medical/organization/{organization_id}": ["assignment:read", "medical:read"],

    # Technical assignments
    "POST /api/v1/assignments/technical": ["assignment:create", "technical:write"],
    "GET /api/v1/assignments/technical/organization/{organization_id}": ["assignment:read"],

    # Role endpoints
    "POST /api/v1/roles": ["role:create"],
    "GET /api/v1/roles": ["role:read"],
    "GET /api/v1/roles/{id}": ["role:read"],
    "PUT /api/v1/roles/{id}": ["role:update"],
    "DELETE /api/v1/roles/{id}": ["role:delete"],
    "POST /api/v1/roles/{id}/permissions": ["role:update"],
    "DELETE /api/v1/roles/{id}/permissions/{permission}": ["role:update"],

    # Organization endpoints
    "POST /api/v1/organizations": ["organization:create"],
    "GET /api/v1/organizations": ["organization:read"],
    "GET /api/v1/organizations/{id}": ["organization:read"],
    "PUT /api/v1/organizations/{id}": ["organization:update"],
    "DELETE /api/v1/organizations/{id}": ["organization:delete"],
}

# Role-based permission inheritance
ROLE_PERMISSIONS = {
    "super_admin": ["*"],
    "federation_admin": [
        "organization:*",
        "staff:*",
        "player:*",
        "assignment:*",
        "role:*",
        "registration:*",
        "career:*",
        "referee:*",
        "coach:*",
        "medical:*",
        "technical:*",
    ],
    "league_admin": [
        "organization:read",
        "organization:update",
        "staff:create",
        "staff:read",
        "staff:update",
        "player:create",
        "player:read",
        "player:update",
        "assignment:create",
        "assignment:read",
        "assignment:update",
        "registration:*",
        "career:*",
        "coach:read",
        "referee:read",
    ],
    "club_admin": [
        "organization:read",
        "organization:update",
        "staff:create",
        "staff:read",
        "staff:update",
        "player:create",
        "player:read",
        "player:update",
        "assignment:create",
        "assignment:read",
        "assignment:update",
        "registration:*",
        "career:*",
        "coach:read",
    ],
    "head_coach": [
        "staff:read",
        "player:read",
        "player:update",
        "assignment:read",
        "coach:write",
        "registration:read",
        "career:read",
    ],
    "assistant_coach": [
        "staff:read",
        "player:read",
        "assignment:read",
    ],
    "analyst": [
        "player:read",
        "staff:read",
        "assignment:read",
        "analytics:read",
    ],
    "physiotherapist": [
        "staff:read",
        "player:read",
        "medical:write",
        "medical:read",
    ],
    "referee": [
        "staff:read",
        "assignment:read",
        "referee:write",
    ],
    "statistician": [
        "staff:read",
        "player:read",
        "assignment:read",
        "statistics:write",
    ],
    "player": [
        "player:read",
        "self:update",
    ],
}

# Permission to role mapping (reverse lookup for endpoint checks)
PERMISSION_ROLES = {}
for role, perms in ROLE_PERMISSIONS.items():
    for perm in perms:
        if perm not in PERMISSION_ROLES:
            PERMISSION_ROLES[perm] = []
        PERMISSION_ROLES[perm].append(role)


class AuthorizationMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce RBAC authorization on protected endpoints."""

    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Skip authorization for public paths
        if self._is_public_path(request.url.path):
            return await call_next(request)

        # Skip for WebSocket upgrade requests
        if request.headers.get("upgrade", "").lower() == "websocket":
            return await call_next(request)

        # Skip if no user is authenticated (auth middleware will handle)
        if not hasattr(request.state, "user_id") or not request.state.user_id:
            return await call_next(request)

        # Get required permissions for this endpoint
        required_permissions = self._get_required_permissions(request)
        if not required_permissions:
            # No specific permissions required, allow
            return await call_next(request)

        # Check if user has any of the required permissions
        user_permissions = getattr(request.state, "permissions", [])
        user_role = getattr(request.state, "user_role", "")

        if not self._has_permission(user_permissions, user_role, required_permissions):
            return self._forbidden_response(request, required_permissions)

        return await call_next(request)

    def _is_public_path(self, path: str) -> bool:
        """Check if path is public."""
        public_prefixes = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/auth/",
        ]
        for prefix in public_prefixes:
            if path.startswith(prefix):
                return True
        return False

    def _get_required_permissions(self, request: Request) -> List[str]:
        """Get required permissions for the current endpoint."""
        method = request.method
        path = request.url.path
        
        # Try exact match first
        endpoint_key = f"{method} {path}"
        if endpoint_key in ENDPOINT_PERMISSIONS:
            return ENDPOINT_PERMISSIONS[endpoint_key]
        
        # Try pattern matching for parameterized paths
        for endpoint_pattern, perms in ENDPOINT_PERMISSIONS.items():
            if self._match_path(path, endpoint_pattern) and request.method in endpoint_pattern.split(" ")[0]:
                return perms
        
        return []

    def _match_path(self, request_path: str, pattern: str) -> bool:
        """Match request path against pattern with path parameters."""
        pattern_parts = pattern.split(" ")[1].split("/")
        request_parts = request_path.split("/")
        
        if len(pattern_parts) != len(request_parts):
            return False
        
        for p_part, r_part in zip(pattern_parts, request_parts):
            if p_part.startswith("{") and p_part.endswith("}"):
                continue  # Path parameter matches anything
            if p_part != r_part:
                return False
        return True

    def _has_permission(self, user_permissions: List[str], user_role: str, required_permissions: List[str]) -> bool:
        """Check if user has any of the required permissions."""
        # Check direct permissions
        for req_perm in required_permissions:
            if req_perm in user_permissions:
                return True
        
        # Check role-based permissions
        if user_role and user_role in ROLE_PERMISSIONS:
            role_perms = ROLE_PERMISSIONS[user_role]
            for req_perm in required_permissions:
                if req_perm == "*" or req_perm in role_perms:
                    return True
        
        return False

    def _forbidden_response(self, request: Request, required_permissions: List[str]) -> JSONResponse:
        """Return standardized 403 response."""
        return JSONResponse(
            status_code=403,
            content={
                "success": False,
                "statusCode": 403,
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Insufficient permissions to access this resource",
                    "details": {
                        "requiredPermissions": required_permissions,
                        "path": request.url.path,
                        "method": request.method,
                    },
                    "correlationId": getattr(request.state, "correlation_id", None),
                    "timestamp": None,
                }
            }
        )


# Utility functions for permission checks in services
def has_permission(user_permissions: List[str], user_role: str, permission: str) -> bool:
    """Check if a user has a specific permission."""
    if permission in user_permissions:
        return True
    if user_role in ROLE_PERMISSIONS:
        return permission in ROLE_PERMISSIONS[user_role] or "*" in ROLE_PERMISSIONS[user_role]
    return False


def require_permission(user_permissions: List[str], user_role: str, permission: str) -> None:
    """Raise ForbiddenError if user doesn't have permission."""
    if not has_permission(user_permissions, user_role, permission):
        raise ForbiddenError(
            message=f"Permission '{permission}' required",
            details={"requiredPermission": permission}
        )


def require_any_permission(user_permissions: List[str], user_role: str, permissions: List[str]) -> None:
    """Raise ForbiddenError if user doesn't have any of the required permissions."""
    if not any(has_permission(user_permissions, user_role, perm) for perm in permissions):
        raise ForbiddenError(
            message=f"One of these permissions required: {', '.join(permissions)}",
            details={"requiredPermissions": permissions}
        )


def get_user_permissions(user_role: str) -> List[str]:
    """Get all permissions for a role."""
    return ROLE_PERMISSIONS.get(user_role, [])