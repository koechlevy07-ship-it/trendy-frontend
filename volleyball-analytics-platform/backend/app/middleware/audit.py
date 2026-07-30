"""Audit Logging Middleware for tracking all data modifications."""

from typing import Optional, Dict, Any
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging
import json
from datetime import datetime

from app.core.database import get_db
from app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware to automatically audit all data modifications."""

    MUTATION_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
    ENTITY_TYPES = {
        "/players": "player",
        "/staff": "staff",
        "/assignments": "assignment",
        "/registrations": "registration",
        "/career": "career",
        "/face-embeddings": "face_embedding",
        "/roles": "role",
        "/teams": "team",
        "/organizations": "organization",
        "/matches": "match",
        "/competitions": "competition",
    }

    async def dispatch(self, request: Request, call_next):
        # Skip audit for non-mutation methods
        if request.method not in self.MUTATION_METHODS:
            return await call_next(request)

        # Skip health and docs endpoints
        if request.url.path.startswith(("/health", "/docs", "/redoc", "/openapi", "/auth")):
            return await call_next(request)

        # Read request body for audit
        request_body = None
        if request.method in ("POST", "PUT", "PATCH"):
            try:
                body_bytes = await request.body()
                if body_bytes:
                    request_body = json.loads(body_bytes)
                # Need to restore body for downstream handlers
                async def receive():
                    return {"type": "http.request", "body": body_bytes}
                request._receive = receive
            except Exception:
                pass

        # Extract user info from request state
        user_id = getattr(request.state, "user_id", None)
        user_role = getattr(request.state, "user_role", None)

        # Determine entity type and ID from path
        entity_type = self._get_entity_type(request.url.path)
        entity_id = self._extract_entity_id(request.url.path)

        # Process request
        response = await call_next(request)

        # Create audit log for successful operations
        if response.status_code < 400 and entity_type:
            await self._create_audit_log(
                request=request,
                entity_type=entity_type,
                entity_id=entity_id,
                request_body=request_body,
                user_id=user_id,
                user_role=user_role,
                response_status=response.status_code,
            )

        return response

    def _get_entity_type(self, path: str) -> Optional[str]:
        """Extract entity type from request path."""
        for prefix, entity_type in self.ENTITY_TYPES.items():
            if path.startswith(prefix):
                return entity_type
        return None

    def _extract_entity_id(self, path: str) -> Optional[str]:
        """Extract entity ID from request path."""
        parts = path.strip("/").split("/")
        if len(parts) >= 3:
            # Path format: /entity/{id}/... or /entity/{id}
            candidate = parts[2]
            # Skip action endpoints
            if candidate not in ("restore", "archive", "deactivate", "activate", "status", "captain", "libero", "medical", "documents", "search", "current", "history", "expiring"):
                return candidate
        return None

    async def _create_audit_log(
        self,
        request: Request,
        entity_type: str,
        entity_id: Optional[str],
        request_body: Optional[Dict],
        user_id: Optional[str],
        user_role: Optional[str],
        response_status: int,
    ) -> None:
        """Create audit log entry."""
        try:
            async for db in get_db():
                action = request.method
                if request.method == "PATCH":
                    action = "UPDATE"
                elif request.method == "POST":
                    action = "CREATE"
                elif request.method == "DELETE":
                    action = "DELETE"

                audit = AuditLog(
                    user_id=user_id,
                    user_role=user_role,
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    old_values=None,  # Would require fetching before update
                    new_values=request_body,
                    timestamp=datetime.utcnow(),
                    ip_address=request.client.host if request.client else None,
                    device=request.headers.get("user-agent"),
                    browser=None,
                    operating_system=None,
                    correlation_id=getattr(request.state, "correlation_id", None),
                    result="success" if response_status < 400 else "failure",
                    remarks=f"{request.method} {request.url.path}",
                )
                
                db.add(audit)
                await db.commit()
                break
        except Exception as e:
            logger.warning(f"Audit logging failed: {e}")
            # Don't let audit failures affect the main request