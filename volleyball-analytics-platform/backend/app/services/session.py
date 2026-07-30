"""Session management service."""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID
import secrets

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings


class SessionService:
    """Session management service."""

    def __init__(self, session: AsyncSession = None):
        self.session = session
        # In production, this would use Redis
        self._sessions: Dict[str, Dict[str, Any]] = {}

    async def create_session(
        self,
        user_id: UUID,
        device_info: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new session."""
        session_id = secrets.token_urlsafe(32)
        
        session_data = {
            "session_id": session_id,
            "user_id": str(user_id),
            "device_info": device_info,
            "ip_address": ip_address,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=settings.SESSION_MAX_AGE_DAYS),
            "is_active": True,
        }
        
        # In production, store in Redis with TTL
        self._sessions[session_id] = session_data
        
        return session_data

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID."""
        session = self._sessions.get(session_id)
        if session and session.get("is_active") and session.get("expires_at", datetime.min) > datetime.utcnow():
            return session
        return None

    async def update_session_activity(self, session_id: str) -> None:
        """Update session last activity timestamp."""
        if session_id in self._sessions:
            self._sessions[session_id]["last_activity"] = datetime.utcnow()

    async def revoke_session(self, session_id: str) -> bool:
        """Revoke a session."""
        if session_id in self._sessions:
            self._sessions[session_id]["is_active"] = False
            return True
        return False

    async def revoke_user_sessions(self, user_id: UUID, except_session: Optional[str] = None) -> int:
        """Revoke all sessions for a user."""
        count = 0
        user_sessions = [
            sid for sid, sess in self._sessions.items()
            if sess.get("user_id") == str(user_id) and sess.get("is_active")
        ]
        for sid in user_sessions:
            if sid != except_session:
                self._sessions[sid]["is_active"] = False
                count += 1
        return count

    async def get_user_sessions(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Get all active sessions for a user."""
        return [
            {
                "session_id": sid,
                "user_id": sess["user_id"],
                "device_info": sess.get("device_info"),
                "ip_address": sess.get("ip_address"),
                "created_at": sess["created_at"],
                "last_activity": sess.get("last_activity"),
                "expires_at": sess["expires_at"],
                "is_active": sess.get("is_active", False),
            }
            for sid, sess in self._sessions.items()
            if sess.get("user_id") == str(user_id) and sess.get("is_active")
        ]

    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        count = 0
        expired = [
            sid for sid, sess in self._sessions.items()
            if sess.get("expires_at", datetime.min) < datetime.utcnow()
        ]
        for sid in expired:
            del self._sessions[sid]
            count += 1
        return count

    async def is_session_valid(self, session_id: str) -> bool:
        """Check if a session is valid and not expired."""
        session = await self.get_session(session_id)
        return session is not None


async def get_session_service():
    """Get session service instance."""
    return SessionService()