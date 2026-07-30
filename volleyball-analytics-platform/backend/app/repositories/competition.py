"""Competition repositories for Season, Competition, and CompetitionTeam operations."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.competition import Season, Competition, CompetitionTeam


class SeasonRepository(BaseRepository):
    """Repository for Season entity."""

    def __init__(self, session):
        super().__init__(Season, session)

    async def get_by_organization(self, org_id: UUID) -> List[Season]:
        """Get all seasons for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_with_competitions(self, season_id: UUID) -> Optional[Season]:
        """Get season with competitions."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == season_id)
            .options(selectinload(Season.competitions))
        )
        return result.scalar_one_or_none()

    async def get_active_season(self, org_id: UUID) -> Optional[Season]:
        """Get active season for organization."""
        from app.models.core import SeasonStatus
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.status == SeasonStatus.ACTIVE)
        )
        return result.scalar_one_or_none()


class CompetitionRepository(BaseRepository):
    """Repository for Competition entity."""

    def __init__(self, session):
        super().__init__(Competition, session)

    async def get_by_season(self, season_id: UUID) -> List[Competition]:
        """Get all competitions in a season."""
        result = await self.session.execute(
            select(self.model).where(self.model.season_id == season_id)
        )
        return result.scalars().all()

    async def get_with_teams(self, competition_id: UUID) -> Optional[Competition]:
        """Get competition with teams."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == competition_id)
            .options(selectinload(Competition.teams).selectinload(CompetitionTeam.team))
        )
        return result.scalar_one_or_none()

    async def get_by_type(self, season_id: UUID, comp_type: str) -> List[Competition]:
        """Get competitions by type."""
        from app.models.core import CompetitionType
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .where(self.model.competition_type == CompetitionType(comp_type))
        )
        return result.scalars().all()

    async def add_team(self, competition_id: UUID, team_id: UUID, group_name: str = None, seed: int = None) -> CompetitionTeam:
        """Add team to competition."""
        obj = CompetitionTeam(
            competition_id=competition_id,
            team_id=team_id,
            group_name=group_name,
            seed=seed
        )
        self.session.add(obj)
        await self.session.flush()
        return obj

    async def remove_team(self, competition_id: UUID, team_id: UUID) -> bool:
        """Remove team from competition."""
        obj = await self.session.execute(
            select(CompetitionTeam)
            .where(CompetitionTeam.competition_id == competition_id)
            .where(CompetitionTeam.team_id == team_id)
        )
        obj = obj.scalar_one_or_none()
        if obj:
            await self.session.delete(obj)
            await self.session.flush()
            return True
        return False


class CompetitionTeamRepository(BaseRepository):
    """Repository for CompetitionTeam entity."""

    def __init__(self, session):
        super().__init__(CompetitionTeam, session)

    async def get_by_competition(self, competition_id: UUID) -> List[CompetitionTeam]:
        """Get all competition teams for a competition."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.competition_id == competition_id)
            .options(selectinload(CompetitionTeam.team))
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[CompetitionTeam]:
        """Get all competitions for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .options(selectinload(CompetitionTeam.competition))
        )
        return result.scalars().all()

    async def get_teams_in_group(self, competition_id: UUID, group_name: str) -> List[CompetitionTeam]:
        """Get teams in a specific group."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.competition_id == competition_id)
            .where(self.model.group_name == group_name)
            .options(selectinload(CompetitionTeam.team))
        )
        return result.scalars().all()