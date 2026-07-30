"""Authorization Middleware for RBAC enforcement."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.status import HTTP_403_FORBIDDEN

from app.core.exceptions import ForbiddenError
from app.middleware.auth import get_current_user


PERMISSION_MAP = {
    # Player permissions
    ("POST", "/players"): "player:create",
    ("GET", "/players"): "player:read",
    ("GET", "/players/{id}"): "player:read",
    ("PUT", "/players/{id}"): "player:update",
    ("PATCH", "/players/{id}"): "player:update",
    ("DELETE", "/players/{id}"): "player:delete",
    ("POST", "/players/{id}/restore"): "player:restore",
    
    # Staff permissions
    ("POST", "/staff"): "staff:create",
    ("GET", "/staff"): "staff:read",
    ("GET", "/staff/{id}"): "staff:read",
    ("PUT", "/staff/{id}"): "staff:update",
    ("PATCH", "/staff/{id}"): "staff:update",
    ("DELETE", "/staff/{id}"): "staff:delete",
    ("POST", "/staff/{id}/restore"): "staff:restore",
    
    # Assignment permissions
    ("POST", "/assignments"): "assignment:create",
    ("GET", "/assignments"): "assignment:read",
    ("PATCH", "/assignments/{id}/transfer"): "assignment:update",
    ("PATCH", "/assignments/{id}/terminate"): "assignment:update",
    
    # Career history
    ("POST", "/players/{id}/career"): "career:create",
    ("GET", "/players/{id}/career"): "career:read",
    ("PUT", "/career/{id}"): "career:update",
    ("POST", "/career/{id}/archive"): "career:update",
    
    # Registration
    ("POST", "/players/{id}/registration"): "registration:create",
    ("GET", "/players/{id}/registration"): "registration:read",
    ("PUT", "/players/{id}/registration"): "registration:update",
    
    # Face embeddings
    ("POST", "/players/{id}/face-embeddings"): "face:create",
    ("GET", "/players/{id}/face-embeddings"): "face:read",
    ("PUT", "/face-embeddings/{id}"): "face:update",
    ("POST", "/face-embeddings/{id}/deactivate"): "face:update",
    
    # Coach assignments
    ("POST", "/coach-assignments"): "assignment:create",
    ("GET", "/coach-assignments"): "assignment:read",
    
    # Referee assignments
    ("POST", "/referee-assignments"): "assignment:create",
    ("POST", "/referee-assignments/{match_id}/{staff_id}/{role}/confirm"): "assignment:update",
    
    # Medical assignments
    ("POST", "/medical-assignments"): "assignment:create",
    ("GET", "/medical-assignments"): "assignment:read",
    
    # Technical assignments
    ("POST", "/technical-assignments"): "assignment:create",
    ("GET", "/technical-assignments"): "assignment:read",
    
    # Staff management
    ("POST", "/staff/{id}/assign"): "assignment:create",
    ("POST", "/staff/{id}/transfer"): "assignment:update",
    ("GET", "/staff/{id}/assignments/current"): "assignment:read",
    ("GET", "/staff/{id}/assignments/history"): "assignment:read",
    ("POST", "/staff/{id}/medical"): "medical:create",
    ("GET", "/staff/{id}/medical"): "medical:read",
    ("POST", "/staff/{id}/documents"): "document:create",
    ("GET", "/staff/{id}/documents"): "document:read",
    ("GET", "/documents/expiring"): "document:read",
}


class AuthorizationMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce RBAC permissions."""

    def __init__(self, app, permission_map: dict = None):
        super().__init__(app)
        self.permission_map = permission_map or PERMISSION_MAP

    async def dispatch(self, request: Request, call_next):
        # Skip authorization for health endpoints
        if request.url.path.startswith("/health"):
            return await call_next(request)

        # Get required permission for this endpoint
        required_permission = self._get_required_permission(request)
        if not required_permission:
            return await call_next(request)

        # Get current user
        user = get_current_user(request)
        if not user.get("user_id"):
            from app.core.exceptions import UnauthorizedError
            raise UnauthorizedError("Authentication required")

        # Check if user has required permission
        if not self._has_permission(user, required_permission, request):
            from app.core.exceptions import ForbiddenError
            raise ForbiddenError(
                message=f"Permission '{required_permission}' required for this operation",
                details={"requiredPermission": required_permission}
            )

        return await call_next(request)

    def _get_required_permission(self, request: Request) -> str:
        """Get required permission for the current request."""
        # Match against permission map with path parameters
        for (method, path), permission in self.permission_map.items():
            if method == request.method and self._match_path(request.url.path, path):
                return permission
        return None

    def _match_path(self, request_path: str, pattern: str) -> bool:
        """Match request path against pattern with parameters."""
        import re
        # Convert path pattern to regex
        regex_pattern = pattern.replace("{id}", "[^/]+").replace("{staff_id}", "[^/]+")
        regex_pattern = regex_pattern.replace("{match_id}", "[^/]+").replace("{role}", "[^/]+")
        regex_pattern = regex_pattern.replace("{organization_id}", "[^/]+").replace("{season_id}", "[^/]+")
        regex_pattern = regex_pattern.replace("{staff_id}", "[^/]+")
        
        return bool(re.match(f"^{regex_pattern}$", request_path))

    def _has_permission(self, user: dict, required_permission: str, request: Request) -> bool:
        """Check if user has required permission."""
        user_permissions = user.get("permissions", [])
        user_role = user.get("role")
        
        # Super admin has all permissions
        if user_role in ["admin", "super_admin"]:
            return True
        
        # Check direct permission
        if required_permission in user_permissions:
            return True
        
        # Check wildcard permissions
        for perm in user_permissions:
            if perm.endswith(":*") and required_permission.startswith(perm[:-1]):
                return True
            if perm == "player:*" and required_permission.startswith("player:"):
                return True
            if perm == "staff:*" and required_permission.startswith("staff:"):
                return True
            if perm == "assignment:*" and required_permission.startswith("assignment:"):
                return True
            if perm == "career:*" and required_permission.startswith("career:"):
                return True
            if perm == "registration:*" and required_permission.startswith("registration:"):
                return True
            if perm == "face:*" and required_permission.startswith("face:"):
                return True
            if perm == "medical:*" and required_permission.startswith("medical:"):
                return True
            if perm == "document:*" and required_permission.startswith("document:"):
                return True
            if perm == "coach:*" and required_permission.startswith("coach:"):
                return True
            if perm == "referee:*" and required_permission.startswith("referee:"):
                return True
        
        return False