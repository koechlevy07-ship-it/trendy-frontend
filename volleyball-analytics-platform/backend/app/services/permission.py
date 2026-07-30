"""Permission and authorization service."""

from typing import List, Dict
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole
from app.core.security import ROLE_PERMISSIONS, get_permissions_for_role, user_has_permission


class PermissionService:
    """Permission and authorization service."""

    def __init__(self, session: AsyncSession):
        self.session = session

    def get_permissions_for_role(self, role: str) -> List[str]:
        """Get permissions for a role."""
        return ROLE_PERMISSIONS.get(role, [])

    def user_has_permission(self, user: User, permission: str) -> bool:
        """Check if user has a permission."""
        role_perms = self.get_permissions_for_role(user.role.value)
        return permission in role_perms or "admin" in role_perms

    async def check_permission(self, user_id: UUID, permission: str) -> bool:
        """Check if user has a permission."""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return False
        return self.user_has_permission(user, permission)

    async def get_user_permissions(self, user_id: UUID) -> List[str]:
        """Get all permissions for a user."""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return []
        return self.get_permissions_for_role(user.role.value)

    async def get_role_permissions(self, role: str) -> List[str]:
        """Get permissions for a role."""
        return self.get_permissions_for_role(role)

    async def get_all_roles_permissions(self) -> Dict[str, List[str]]:
        """Get all roles and their permissions."""
        return ROLE_PERMISSIONS.copy()

    async def check_multiple_permissions(self, user_id: UUID, permissions: List[str]) -> Dict[str, bool]:
        """Check multiple permissions at once."""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            return {p: False for p in permissions}
        
        role_perms = self.get_permissions_for_role(user.role.value)
        return {p: p in role_perms or "admin" in role_perms for p in permissions}


async def get_permission_service(session: AsyncSession = None):
    """Get permission service instance."""
    from app.core.database import get_async_session
    if session is None:
        session = next(get_async_session())
    return PermissionService(session)