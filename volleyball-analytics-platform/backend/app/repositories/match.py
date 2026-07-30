"""Match repositories for Match, Set, Rally, Event, and Lineup operations."""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.match import Match, Set, Rally, Event, Lineup


class MatchRepository(BaseRepository):
    """Repository for Match entity."""

    def __init__(self, session):
        super().__init__(Match, session)

    async def get_with_details(self, match_id: UUID) -> Optional[Match]:
        """Get match with all related data."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == match_id)
            .options(
                selectinload(Match.home_team),
                selectinload(Match.away_team),
                selectinload(Match.venue),
                selectinload(Match.court),
                selectinload(Match.sets),
                selectinload(Match.events),
                selectinload(Match.lineups),
                selectinload(Match.officials).selectinload(MatchOfficial.official),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_competition(self, competition_id: UUID) -> List[Match]:
        """Get all matches in a competition."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.competition_id == competition_id)
            .order_by(self.model.match_date)
        )
        return result.scalars().all()

    async def get_by_season(self, season_id: UUID) -> List[Match]:
        """Get all matches in a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .order_by(self.model.match_date)
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[Match]:
        """Get all matches for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(
                or_(
                    self.model.home_team_id == team_id,
                    self.model.away_team_id == team_id
                )
            )
            .order_by(desc(self.model.match_date))
        )
        return result.scalars().all()

    async def get_upcoming(self, team_id: UUID = None, limit: int = 10) -> List[Match]:
        """Get upcoming matches."""
        query = select(self.model).where(
            self.model.status.in_(["scheduled", "live"])
        )
        if team_id:
            query = query.where(
                or_(
                    self.model.home_team_id == team_id,
                    self.model.away_team_id == team_id
                )
            )
        query = query.order_by(self.model.match_date).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_live_matches(self) -> List[Match]:
        """Get all currently live matches."""
        result = await self.session.execute(
            select(self.model).where(self.model.status == "live")
        )
        return result.scalars().all()

    async def update_status(self, match_id: UUID, status: str) -> Optional[Match]:
        """Update match status."""
        obj = await self.get(match_id)
        if obj:
            obj.status = status
            if status == "live":
                obj.start_time = datetime.utcnow()
            elif status == "completed":
                obj.end_time = datetime.utcnow()
            await self.session.flush()
        return obj


class SetRepository(BaseRepository):
    """Repository for Set entity."""

    def __init__(self, session):
        super().__init__(Set, session)

    async def get_by_match(self, match_id: UUID) -> List[Set]:
        """Get all sets for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(self.model.number)
        )
        return result.scalars().all()

    async def get_current_set(self, match_id: UUID) -> Optional[Set]:
        """Get current/in-progress set for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .where(self.model.status == "in_progress")
        )
        return result.scalar_one_or_none()

    async def get_completed_sets(self, match_id: UUID) -> List[Set]:
        """Get completed sets for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .where(self.model.status == "completed")
            .order_by(self.model.number)
        )
        return result.scalars().all()


class RallyRepository(BaseRepository):
    """Repository for Rally entity."""

    def __init__(self, session):
        super().__init__(Rally, session)

    async def get_by_match(self, match_id: UUID) -> List[Rally]:
        """Get all rallies for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(self.model.rally_number)
        )
        return result.scalars().all()

    async def get_by_set(self, set_id: UUID) -> List[Rally]:
        """Get all rallies for a set."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.set_id == set_id)
            .order_by(self.model.rally_number)
        )
        return result.scalars().all()

    async def get_last_rally(self, match_id: UUID) -> Optional[Rally]:
        """Get the most recent rally for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(desc(self.model.rally_number))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_rally_stats(self, match_id: UUID) -> Dict[str, Any]:
        """Get rally statistics for a match."""
        result = await self.session.execute(
            select(
                func.count(self.model.id).label("total_rallies"),
                func.sum(self.model.duration_seconds).label("total_duration"),
                func.avg(self.model.duration_seconds).label("avg_duration"),
            )
            .where(self.model.match_id == match_id)
        )
        row = result.first()
        return {
            "total_rallies": row.total_rallies or 0,
            "total_duration": row.total_duration or 0,
            "avg_duration": row.avg_duration or 0,
        }


class EventRepository(BaseRepository):
    """Repository for Event entity."""

    def __init__(self, session):
        super().__init__(Event, session)

    async def get_by_match(self, match_id: UUID) -> List[Event]:
        """Get all events for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(self.model.timestamp_seconds)
        )
        return result.scalars().all()

    async def get_by_player(self, player_id: UUID, match_id: UUID = None) -> List[Event]:
        """Get events for a player."""
        query = select(self.model).where(self.model.player_id == player_id)
        if match_id:
            query = query.where(self.model.match_id == match_id)
        result = await self.session.execute(query.order_by(self.model.timestamp_seconds))
        return result.scalars().all()

    async def get_by_type(self, match_id: UUID, event_type: str) -> List[Event]:
        """Get events by type for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .where(self.model.event_type == event_type)
            .order_by(self.model.timestamp_seconds)
        )
        return result.scalars().all()

    async def get_recent_events(self, match_id: UUID, limit: int = 10) -> List[Event]:
        """Get most recent events for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(desc(self.model.timestamp_seconds))
            .limit(limit)
        )
        return result.scalars().all()


class LineupRepository(BaseRepository):
    """Repository for Lineup entity."""

    def __init__(self, session):
        super().__init__(Lineup, session)

    async def get_by_match(self, match_id: UUID) -> List[Lineup]:
        """Get all lineups for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .options(selectinload(Lineup.player))
        )
        return result.scalars().all()

    async def get_by_set(self, set_id: UUID) -> List[Lineup]:
        """Get all lineups for a set."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.set_id == set_id)
            .options(selectinload(Lineup.player))
        )
        return result.scalars().all()

    async def get_team_lineup(self, match_id: UUID, team_id: UUID, set_id: UUID = None) -> List[Lineup]:
        """Get lineup for a team."""
        query = select(self.model).where(
            self.model.match_id == match_id,
            self.model.team_id == team_id
        )
        if set_id:
            query = query.where(self.model.set_id == set_id)
        query = query.options(selectinload(Lineup.player))
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_starting_lineup(self, match_id: UUID, team_id: UUID, set_id: UUID = None) -> List[Lineup]:
        """Get starting lineup for a team."""
        query = select(self.model).where(
            self.model.match_id == match_id,
            self.model.team_id == team_id,
            self.model.is_starter == True
        )
        if set_id:
            query = query.where(self.model.set_id == set_id)
        query = query.options(selectinload(Lineup.player)).order_by(Lineup.position)
        result = await self.session.execute(query)
        return result.scalars().all()