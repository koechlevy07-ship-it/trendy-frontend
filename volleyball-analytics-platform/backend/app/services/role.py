"""Role Service for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.auth import Role, Permission
from app.core.exceptions import (
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
)
from app.core.events import EventPublisher


class RoleRepository(BaseRepository):
    """Repository for Role entity."""

    def __init__(self, session):
        super().__init__(Role, session)

    async def get_by_name(self, name: str) -> Optional[Role]:
        """Get role by name."""
        result = await self.session.execute(
            select(Role).where(Role.name == name)
        )
        return result.scalar_one_or_none()

    async def get_with_permissions(self, role_id: UUID) -> Optional[Role]:
        """Get role with permissions loaded."""
        result = await self.session.execute(
            select(Role)
            .options(selectinload(Role.permissions))
            .where(Role.id == role_id)
        )
        return result.scalar_one_or_none()


class RoleService:
    """Service for managing role operations."""

    def __init__(
        self,
        session,
        event_publisher=None,
    ):
        self.session = session
        self.role_repo = RoleRepository(session)
        self.event_publisher = event_publisher

    async def create_role(
        self,
        name: str,
        display_name: str,
        description: Optional[str] = None,
        is_system: bool = False,
        organization_id: Optional[UUID] = None,
        current_user_id: Optional[UUID] = None,
    ) -> Role:
        """Create a new role."""
        # Check if role name already exists
        existing = await self.role_repo.get_by_name(name)
        if existing:
            raise AlreadyExistsError(f"Role {name} already exists")

        role = Role(
            name=name,
            display_name=display_name,
            description=description,
            is_system=is_system,
            organization_id=organization_id,
        )

        self.session.add(role)
        await self.session.flush()
        await self.session.refresh(role)

        if self.event_publisher:
            await self.event_publisher.publish("RoleCreated", {
                "role_id": str(role.id),
                "name": role.name,
                "created_by": str(current_user_id) if current_user_id else None,
            })

        return role

    async def get_role(self, role_id: UUID) -> Role:
        """Get role by ID."""
        role = await self.role_repo.get(role_id)
        if not role:
            raise NotFoundError(f"Role {role_id} not found")
        return role

    async def get_role_by_name(self, name: str) -> Role:
        """Get role by name."""
        role = await self.role_repo.get_by_name(name)
        if not role:
            raise NotFoundError(f"Role {name} not found")
        return role

    async def list_roles(
        self,
        page: int = 1,
        per_page: int = 20,
        organization_id: Optional[UUID] = None,
    ) -> List[Role]:
        """List roles with pagination."""
        from app.repositories.base import BaseRepository
        role_repo = RoleRepository(self.session)
        filters = {}
        if organization_id:
            filters["organization_id"] = organization_id
        return await role_repo.paginate(page=page, per_page=per_page, filters=filters)

    async def update_role(
        self,
        role_id: UUID,
        display_name: Optional[str] = None,
        description: Optional[str] = None,
        is_system: Optional[bool] = None,
        organization_id: Optional[UUID] = None,
        current_user_id: Optional[UUID] = None,
    ) -> Role:
        """Update a role."""
        role = await self.get_role(role_id)

        # Check if name already exists (name is immutable)
        # We don't allow changing the name field

        if display_name is not None:
            role.display_name = display_name
        if description is not None:
            role.description = description
        if is_system is not None:
            role.is_system = is_system
        if organization_id is not None:
            role.organization_id = organization_id

        role.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(role)

        if self.event_publisher:
            await self.event_publisher.publish("RoleUpdated", {
                "role_id": str(role.id),
                "updated_by": str(current_user_id) if current_user_id else None,
            })

        return role

    async def soft_delete(self, role_id: UUID, current_user_id: UUID) -> bool:
        """Soft delete a role (mark as deleted via is_deleted pattern)."""
        role = await self.get_role(role_id)

        if role.is_system:
            raise ValidationError("Cannot delete system roles")

        # Mark as deleted - using is_active as a soft delete flag
        # The Role model doesn't have is_deleted, so we can use a different approach
        # For now, just raise an error since the model doesn't support soft delete
        raise ValidationError("Role deletion not supported - use organization scoping instead")

    async def get_permissions(self, role_id: UUID) -> List[str]:
        """Get permissions for a role."""
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise NotFoundError(f"Role {role_id} not found")
        return [p.name for p in role.permissions]

    async def add_permission(
        self,
        role_id: UUID,
        permission: Permission,
        current_user_id: Optional[UUID] = None,
    ) -> Role:
        """Add a permission to a role."""
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise NotFoundError(f"Role {role_id} not found")

        if permission not in role.permissions:
            role.permissions.append(permission)
            await self.session.flush()
            await self.session.refresh(role)

            if self.event_publisher:
                await self.event_publisher.publish("PermissionAddedToRole", {
                    "role_id": str(role.id),
                    "permission": permission.name,
                    "added_by": str(current_user_id) if current_user_id else None,
                })

        return role

    async def remove_permission(
        self,
        role_id: UUID,
        permission_name: str,
        current_user_id: Optional[UUID] = None,
    ) -> Role:
        """Remove a permission from a role."""
        role = await self.role_repo.get_with_permissions(role_id)
        if not role:
            raise NotFoundError(f"Role {role_id} not found")

        role.permissions = [p for p in role.permissions if p.name != permission_name]
        await self.session.flush()
        await self.session.refresh(role)

        if self.event_publisher:
            await self.event_publisher.publish("PermissionRemovedFromRole", {
                "role_id": str(role.id),
                "permission": permission_name,
                "removed_by": str(current_user_id) if current_user_id else None,
            })

        return role