"""User repository for user-related database operations."""

from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.models.user import User, UserRole, UserStatus


class UserRepository(BaseRepository):
    """Repository for User entity."""
    
    def __init__(self, session):
        from app.models.user import User
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        """Get user by email or username."""
        result = await self.session.execute(
            select(User).where(
                (User.email == identifier) | (User.username == identifier)
            )
        )
        return result.scalar_one_or_none()

    async def get_by_team(self, team_id: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all players in a team."""
        result = await self.session.execute(
            select(User)
            .where(User.team_id == team_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Get users by role."""
        result = await self.session.execute(
            select(User)
            .where(User.role == role)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all active users."""
        result = await self.session.execute(
            select(User)
            .where(User.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def search_users(
        self, 
        query: str, 
        skip: int = 0, 
        limit: int = 20
    ) -> List[User]:
        """Search users by name, email, or username."""
        from sqlalchemy import or_
        
        result = await self.session.execute(
            select(User)
            .where(
                or_(
                    User.full_name.ilike(f"%{query}%"),
                    User.email.ilike(f"%{query}%"),
                    User.username.ilike(f"%{query}%"),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_players_by_team(self, team_id: str) -> List[User]:
        """Get all players in a team."""
        return await self.get_by_field("team_id", team_id)

    async def get_coaches_by_organization(self, org_id: str) -> List[User]:
        """Get all coaches in an organization."""
        from sqlalchemy import or_
        
        result = await self.session.execute(
            select(User)
            .where(
                User.organization_id == UUID(org_id),
                User.role.in_([UserRole.COACH, UserRole.ASSISTANT_COACH])
            )
        )
        return result.scalars().all()

    async def deactivate_user(self, user_id: UUID) -> bool:
        """Deactivate a user."""
        return await self.update(user_id, {"is_active": False}) is not None

    async def activate_user(self, user_id: UUID) -> bool:
        """Activate a user."""
        return await self.update(user_id, {"is_active": True}) is not None

    async def update_last_login(self, user_id: UUID) -> bool:
        """Update user's last login timestamp."""
        from datetime import datetime
        result = await self.update(user_id, {"last_login": datetime.utcnow()})
        return result is not None