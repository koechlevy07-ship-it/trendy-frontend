"""Authentication repositories for user, role, and permission operations."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.user import User
from app.models.auth import Role, Permission, user_roles, role_permissions


class UserRepository(BaseRepository):
    """Repository for User entity."""

    def __init__(self, session):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.session.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        result = await self.session.execute(
            select(self.model).where(self.model.username == username)
        )
        return result.scalar_one_or_none()

    async def get_with_roles(self, user_id: UUID) -> Optional[User]:
        """Get user with roles and permissions."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == user_id)
            .options(selectinload(User.roles).selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_by_organization(self, org_id: UUID) -> List[User]:
        """Get all users in an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_role(self, role_name: str) -> List[User]:
        """Get users by role."""
        from app.models.auth import UserRole
        result = await self.session.execute(
            select(self.model)
            .where(self.model.default_role == UserRole(role_name))
        )
        return result.scalars().all()

    async def add_role(self, user_id: UUID, role_id: UUID, org_id: UUID = None) -> None:
        """Add role to user."""
        stmt = user_roles.insert().values(
            user_id=user_id,
            role_id=role_id,
            organization_id=org_id
        )
        await self.session.execute(stmt)

    async def remove_role(self, user_id: UUID, role_id: UUID) -> None:
        """Remove role from user."""
        await self.session.execute(
            user_roles.delete().where(
                user_roles.c.user_id == user_id,
                user_roles.c.role_id == role_id
            )
        )


class RoleRepository(BaseRepository):
    """Repository for Role entity."""

    def __init__(self, session):
        super().__init__(Role, session)

    async def get_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        result = await self.session.execute(
            select(self.model).where(self.model.name == name)
        )
        return result.scalar_one_or_none()

    async def get_with_permissions(self, role_id: UUID) -> Optional[Role]:
        """Get role with permissions."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == role_id)
            .options(selectinload(Role.permissions))
        )
        return result.scalar_one_or_none()

    async def get_system_roles(self) -> List[Role]:
        """Get all system roles."""
        result = await self.session.execute(
            select(self.model).where(self.model.is_system == True)
        )
        return result.scalars().all()

    async def add_permission(self, role_id: UUID, permission_id: UUID) -> None:
        """Add permission to role."""
        stmt = role_permissions.insert().values(
            role_id=role_id,
            permission_id=permission_id
        )
        await self.session.execute(stmt)

    async def remove_permission(self, role_id: UUID, permission_id: UUID) -> None:
        """Remove permission from role."""
        await self.session.execute(
            role_permissions.delete().where(
                role_permissions.c.role_id == role_id,
                role_permissions.c.permission_id == permission_id
            )
        )


class PermissionRepository(BaseRepository):
    """Repository for Permission entity."""

    def __init__(self, session):
        super().__init__(Permission, session)

    async def get_by_resource_action(self, resource: str, action: str) -> Optional[Permission]:
        """Get permission by resource and action."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.resource == resource)
            .where(self.model.action == action)
        )
        return result.scalar_one_or_none()

    async def get_by_resource(self, resource: str) -> List[Permission]:
        """Get all permissions for a resource."""
        result = await self.session.execute(
            select(self.model).where(self.model.resource == resource)
        )
        return result.scalars().all()