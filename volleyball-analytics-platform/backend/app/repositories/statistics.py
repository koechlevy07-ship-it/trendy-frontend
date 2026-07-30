"""Statistics repositories for player and team statistics operations."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.statistics import (
    PlayerMatchStatistics,
    TeamMatchStatistics,
    PlayerSeasonStatistics,
    TeamSeasonStatistics,
)


class PlayerMatchStatisticsRepository(BaseRepository):
    """Repository for PlayerMatchStatistics entity."""

    def __init__(self, session):
        super().__init__(PlayerMatchStatistics, session)

    async def get_by_player_match(self, player_id: UUID, match_id: UUID) -> Optional[PlayerMatchStatistics]:
        """Get statistics for a player in a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.match_id == match_id)
        )
        return result.scalar_one_or_none()

    async def get_by_match(self, match_id: UUID) -> List[PlayerMatchStatistics]:
        """Get all player statistics for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .options(selectinload(PlayerMatchStatistics.player))
        )
        return result.scalars().all()

    async def get_by_player(self, player_id: UUID) -> List[PlayerMatchStatistics]:
        """Get all match statistics for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .options(selectinload(PlayerMatchStatistics.match))
            .order_by(desc(PlayerMatchStatistics.created_at))
        )
        return result.scalars().all()

    async def get_by_set(self, set_id: UUID) -> List[PlayerMatchStatistics]:
        """Get player statistics for a specific set."""
        result = await self.session.execute(
            select(self.model).where(self.model.set_id == set_id)
        )
        return result.scalars().all()

    async def get_aggregated_stats(self, player_id: UUID) -> Dict[str, Any]:
        """Get aggregated statistics for a player across all matches."""
        result = await self.session.execute(
            select(
                func.sum(self.model.total_serves).label("total_serves"),
                func.sum(self.model.service_aces).label("total_aces"),
                func.sum(self.model.service_errors).label("total_service_errors"),
                func.sum(self.model.attack_attempts).label("total_attack_attempts"),
                func.sum(self.model.kills).label("total_kills"),
                func.sum(self.model.attack_errors).label("total_attack_errors"),
                func.sum(self.model.blocked_attacks).label("total_blocked_attacks"),
                func.sum(self.model.solo_blocks).label("total_solo_blocks"),
                func.sum(self.model.block_assists).label("total_block_assists"),
                func.sum(self.model.digs).label("total_digs"),
                func.sum(self.model.assists).label("total_assists"),
                func.sum(self.model.reception_attempts).label("total_reception_attempts"),
                func.sum(self.model.perfect_receptions).label("total_perfect_receptions"),
                func.count(self.model.id).label("matches_played"),
            )
            .where(self.model.player_id == player_id)
        )
        row = result.first()
        return {
            "total_serves": row.total_serves or 0,
            "total_aces": row.total_aces or 0,
            "total_service_errors": row.total_service_errors or 0,
            "total_attack_attempts": row.total_attack_attempts or 0,
            "total_kills": row.total_kills or 0,
            "total_attack_errors": row.total_attack_errors or 0,
            "total_blocked_attacks": row.total_blocked_attacks or 0,
            "total_solo_blocks": row.total_solo_blocks or 0,
            "total_block_assists": row.total_block_assists or 0,
            "total_digs": row.total_digs or 0,
            "total_assists": row.total_assists or 0,
            "total_reception_attempts": row.total_reception_attempts or 0,
            "total_perfect_receptions": row.total_perfect_receptions or 0,
            "matches_played": row.matches_played or 0,
        }


class TeamMatchStatisticsRepository(BaseRepository):
    """Repository for TeamMatchStatistics entity."""

    def __init__(self, session):
        super().__init__(TeamMatchStatistics, session)

    async def get_by_team_match(self, team_id: UUID, match_id: UUID) -> Optional[TeamMatchStatistics]:
        """Get statistics for a team in a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.match_id == match_id)
        )
        return result.scalar_one_or_none()

    async def get_by_match(self, match_id: UUID) -> List[TeamMatchStatistics]:
        """Get all team statistics for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .options(selectinload(TeamMatchStatistics.team))
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[TeamMatchStatistics]:
        """Get all match statistics for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .order_by(desc(TeamMatchStatistics.created_at))
        )
        return result.scalars().all()


class PlayerSeasonStatisticsRepository(BaseRepository):
    """Repository for PlayerSeasonStatistics entity."""

    def __init__(self, session):
        super().__init__(PlayerSeasonStatistics, session)

    async def get_by_player_season(self, player_id: UUID, season_id: UUID) -> Optional[PlayerSeasonStatistics]:
        """Get season statistics for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.season_id == season_id)
        )
        return result.scalar_one_or_none()

    async def get_by_season(self, season_id: UUID) -> List[PlayerSeasonStatistics]:
        """Get all player statistics for a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .options(selectinload(PlayerSeasonStatistics.player))
        )
        return result.scalars().all()

    async def get_by_team_season(self, team_id: UUID, season_id: UUID) -> List[PlayerSeasonStatistics]:
        """Get all player statistics for a team in a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.season_id == season_id)
            .options(selectinload(PlayerSeasonStatistics.player))
        )
        return result.scalars().all()

    async def get_leaders(self, season_id: UUID, stat: str, limit: int = 10) -> List[PlayerSeasonStatistics]:
        """Get top players for a statistic in a season."""
        stat_column = getattr(self.model, stat, None)
        if stat_column is None:
            return []
        
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .where(stat_column > 0)
            .options(selectinload(PlayerSeasonStatistics.player))
            .order_by(desc(stat_column))
            .limit(limit)
        )
        return result.scalars().all()


class TeamSeasonStatisticsRepository(BaseRepository):
    """Repository for TeamSeasonStatistics entity."""

    def __init__(self, session):
        super().__init__(TeamSeasonStatistics, session)

    async def get_by_team_season(self, team_id: UUID, season_id: UUID) -> Optional[TeamSeasonStatistics]:
        """Get season statistics for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.season_id == season_id)
        )
        return result.scalar_one_or_none()

    async def get_by_season(self, season_id: UUID) -> List[TeamSeasonStatistics]:
        """Get all team statistics for a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .options(selectinload(TeamSeasonStatistics.team))
        )
        return result.scalars().all()

    async def get_standings(self, season_id: UUID) -> List[TeamSeasonStatistics]:
        """Get team standings for a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .where(self.model.standing != None)
            .options(selectinload(TeamSeasonStatistics.team))
            .order_by(self.model.standing)
        )
        return result.scalars().all()