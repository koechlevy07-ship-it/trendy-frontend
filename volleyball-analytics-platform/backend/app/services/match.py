"""Match service for managing match operations."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.match import Match, MatchStatus, MatchFormat, Set, Rally, Event
from app.models.team import Team
from app.models.personnel import Player
from app.models.match import Set, Rally, Event
from app.repositories.match import MatchRepository
from app.schemas.match import MatchCreate, MatchUpdate, MatchSetScore


class MatchService:
    """Service layer for match operations."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = MatchRepository(session)
    
    async def create_match(self, match_data: MatchCreate, current_user_id: str) -> dict:
        """Create a new match."""
        # Validate teams exist and are from user's organization
        # (would check permissions here)
        
        match = Match(
            tournament_id=UUID(match_data.tournament_id) if match_data.tournament_id else None,
            court_id=UUID(match_data.court_id) if match_data.court_id else None,
            home_team_id=UUID(match_data.home_team_id),
            away_team_id=UUID(match_data.away_team_id),
            match_date=match_data.match_date,
            start_time=match_data.start_time,
            sets_format=match_data.sets_format,
            venue=match_data.venue,
            status="scheduled",
        )
        
        self.session.add(match)
        await self.session.flush()
        
        # Create empty sets
        num_sets = 5 if match_data.sets_format == "best_of_5" else 3
        for i in range(1, num_sets + 1):
            set_obj = Set(
                match_id=match.id,
                set_number=i,
                home_points=0,
                away_points=0,
                status="pending"
            )
            self.session.add(set_obj)
        
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def get_match_details(self, match_id: str) -> Optional[dict]:
        """Get match with all related data."""
        match = await self.repo.get_with_details(match_id)
        return match
    
    async def get_match_summary(self, match_id: str) -> Optional[dict]:
        """Get match summary for listings."""
        match = await self.repo.get_by_id(match_id)
        if not match:
            return None
        
        return {
            "id": str(match.id),
            "match_date": match.match_date.isoformat() if match.match_date else None,
            "venue": match.venue,
            "home_team": {"id": str(match.home_team_id), "name": match.home_team.name} if match.home_team else None,
            "away_team": {"id": str(match.away_team_id), "name": match.away_team.name} if match.away_team else None,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "status": match.status,
            "sets_format": match.sets_format,
            "home_score": match.home_score,
            "away_score": match.away_score,
        }
    
    async def list_matches(
        self,
        skip: int = 0,
        limit: int = 20,
        status: str = None,
        team_id: str = None,
        tournament_id: str = None,
        date_from: str = None,
        date_to: str = None,
    ) -> list:
        """List matches with filters."""
        from sqlalchemy import select, or_, func, desc
        
        query = select(Match)
        
        if status:
            query = query.where(Match.status == status)
        if team_id:
            from sqlalchemy import or_
            query = query.where(
                or_(
                    Match.home_team_id == UUID(team_id),
                    Match.away_team_id == UUID(team_id)
                )
            )
        if tournament_id:
            query = query.where(Match.tournament_id == UUID(tournament_id))
        if date_from:
            query = query.where(Match.match_date >= date_from)
        if date_to:
            query = query.where(Match.match_date <= date_to)
        
        query = query.order_by(desc(Match.match_date)).offset(skip).limit(limit)
        
        result = await self.session.execute(query)
        matches = result.scalars().all()
        
        return [
            {
                "id": str(m.id),
                "match_date": m.match_date.isoformat() if m.match_date else None,
                "venue": m.venue,
                "home_team": {"id": str(m.home_team_id), "name": m.home_team.name} if m.home_team else None,
                "away_team": {"id": str(m.away_team_id), "name": m.away_team.name} if m.away_team else None,
                "home_score": m.home_score,
                "away_score": m.away_score,
                "status": m.status,
                "sets_format": m.sets_format,
            }
            for m in matches
        ]
    
    async def get_match_details(self, match_id: str) -> Optional[dict]:
        """Get detailed match information."""
        from sqlalchemy.orm import selectinload
        from app.models.match import Match, Set, Event, Rally
        
        result = await self.session.execute(
            select(Match)
            .where(Match.id == UUID(match_id))
            .options(
                selectinload(Match.home_team),
                selectinload(Match.away_team),
                selectinload(Match.sets),
                selectinload(Match.lineups),
                selectinload(Match.events),
                selectinload(Match.videos),
            )
        )
        match = result.scalar_one_or_none()
        
        if not match:
            return None
        
        return {
            "id": str(match.id),
            "tournament_id": str(match.tournament_id) if match.tournament_id else None,
            "court_id": str(match.court_id) if match.court_id else None,
            "home_team": {"id": str(match.home_team_id), "name": match.home_team.name, "short_name": match.home_team.short_name} if match.home_team else None,
            "away_team": {"id": str(match.away_team_id), "name": match.away_team.name} if match.away_team else None,
            "match_date": match.match_date.isoformat() if match.match_date else None,
            "start_time": match.start_time.isoformat() if match.start_time else None,
            "end_time": match.end_time.isoformat() if match.end_time else None,
            "sets_format": match.sets_format,
            "status": match.status,
            "winner_team_id": str(match.winner_team_id) if match.winner_team_id else None,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "venue": match.venue,
            "sets": [
                {
                    "id": str(s.id),
                    "set_number": s.set_number,
                    "home_points": s.home_points,
                    "away_points": s.away_points,
                    "duration_seconds": s.duration_seconds,
                    "status": s.status,
                    "winner_team_id": str(s.winner_team_id) if s.winner_team_id else None,
                }
                for s in match.sets
            ],
            "home_score": match.home_score,
            "away_score": match.away_score,
            "status": match.status,
            "sets_format": match.sets_format,
            "created_at": match.created_at.isoformat() if match.created_at else None,
            "updated_at": match.updated_at.isoformat() if match.updated_at else None,
        }
    
    async def start_match(self, match_id: str) -> dict:
        """Start a match (change status to live)."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            raise ValueError("Match not found")
        
        if match.status != "scheduled":
            raise ValueError(f"Cannot start match with status {match.status}")
        
        match.status = "live"
        match.start_time = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def pause_match(self, match_id: str) -> dict:
        """Pause a live match."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            raise ValueError("Match not found")
        
        if match.status != "live":
            raise ValueError("Can only pause live matches")
        
        match.status = "paused"
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def resume_match(self, match_id: str) -> dict:
        """Resume a paused match."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            raise ValueError("Match not found")
        
        if match.status != "paused":
            raise ValueError("Can only resume paused matches")
        
        match.status = "live"
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def end_match(self, match_id: str) -> dict:
        """End a match."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            raise ValueError("Match not found")
        
        if match.status not in ["live", "paused"]:
            raise ValueError("Can only end live or paused matches")
        
        match.status = "completed"
        match.end_time = datetime.utcnow()
        
        # Determine winner based on sets won
        sets_won_home = sum(1 for s in match.sets if s.winner_team_id == match.home_team_id)
        sets_won_away = sum(1 for s in match.sets if s.winner_team_id == match.away_team_id)
        
        match.winner_team_id = match.home_team_id if sets_won_home > sets_won_away else match.away_team_id
        match.status = "completed"
        match.end_time = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def update_match(self, match_id: str, match_data: dict) -> dict:
        """Update match details."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            raise ValueError("Match not found")
        
        update_data = match_data.model_dump(exclude_unset=True)
        for field, value in match_data.items():
            setattr(match, field, value)
        
        match.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(match)
        
        return await self.get_match_details(str(match.id))
    
    async def delete_match(self, match_id: str) -> bool:
        """Delete a match (only if not started)."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            return False
        
        if match.status not in ["scheduled", "cancelled"]:
            raise ValueError("Can only delete scheduled or cancelled matches")
        
        await self.session.delete(match)
        await self.session.commit()
        return True
    
    async def update_set_score(self, set_id: str, home_points: int, away_points: int) -> dict:
        """Update set score."""
        set_obj = await self.session.get(Set, UUID(set_id))
        if not set_obj:
            raise ValueError("Set not found")
        
        if set_obj.status == "completed":
            raise ValueError("Cannot update completed set")
        
        set_obj.home_points = home_points
        set_obj.away_points = away_points
        
        # Check if set is complete
        max_points = 25
        if set_obj.set_number == 5:
            max_points = 15
        
        if (home_points >= max_points or away_points >= max_points) and abs(home_points - away_points) >= 2:
            set_obj.status = "completed"
            winner_team = None
            if home_points > away_points:
                winner_team = home_team_id
            elif away_points > home_points:
                winner_team = away_team_id
            set_obj.winner_team_id = winner_team_id
        
        await self.session.commit()
        await self.session.refresh(set_obj)
        
        return {"id": str(set_obj.id), "home_points": set_obj.home_points, "away_points": set_obj.away_points, "status": set_obj.status}

    async def get_match_events(self, match_id: str) -> list:
        """Get all events for a match."""
        from app.models.match import Event
        from sqlalchemy import select
        
        result = await self.session.execute(
            select(Event)
            .where(Event.match_id == UUID(match_id))
            .order_by(Event.timestamp_seconds)
        )
        events = result.scalars().all()
        
        return [
            {
                "id": str(e.id),
                "match_id": str(e.match_id),
                "set_id": str(e.set_id) if e.set_id else None,
                "rally_id": str(e.rally_id) if e.rally_id else None,
                "event_type": e.event_type,
                "player_id": str(e.player_id) if e.player_id else None,
                "team_id": str(e.team_id),
                "confidence": e.confidence,
                "timestamp": e.timestamp_seconds,
                "outcome": e.outcome,
                "court_position": [e.court_position_x, e.court_position_y] if e.court_position_x else None,
            }
            for e in events
        ]
    
    async def get_match_rallies(self, match_id: str) -> list:
        """Get all rallies for a match."""
        from sqlalchemy import select
        
        result = await self.session.execute(
            select(Rally)
            .where(Rally.match_id == UUID(match_id))
            .order_by(Rally.rally_number)
        )
        rallies = result.scalars().all()
        
        return [
            {
                "id": str(r.id),
                "rally_number": r.rally_number,
                "serving_team": str(r.serving_team_id) if r.serving_team_id else None,
                "receiving_team": str(r.receiving_team_id) if r.receiving_team_id else None,
                "start_time": r.start_time.isoformat() if r.start_time else None,
                "end_time": r.end_time.isoformat() if r.end_time else None,
                "duration_seconds": r.duration_seconds,
                "winner_team": str(r.winner_team_id) if r.winner_team_id else None,
                "point_type": r.point_type,
            }
            for r in rallies
        ]
    
    async def get_match_statistics(self, match_id: str) -> dict:
        """Get comprehensive match statistics."""
        match = await self.session.get(Match, UUID(match_id))
        if not match:
            return None
        
        from app.models.match import Event, Set
        from sqlalchemy import func
        
        # Get events
        events_result = await self.session.execute(
            select(Event).where(Event.match_id == UUID(match_id))
        )
        events = list(events_result.scalars().all())
        
        # Team stats
        home_events = [e for e in events if str(e.team_id) == str(match.home_team_id)]
        away_events = [e for e in events if str(e.team_id) == str(match.away_team_id)]
        
        # Count events by type
        def count_events(events, event_type):
            return sum(1 for e in events if e.event_type == event_type)
        
        home_stats = {
            "kills": len([e for e in home_events if e.event_type == "kill"]),
            "attacks": len([e for e in home_events if e.event_type in ["spike", "tip", "roll_shot"]]),
            "attack_errors": count_events(home_events, "attack_error"),
            "blocked": count_events(home_events, "blocked_attack"),
            "aces": count_events(home_events, "ace"),
            "service_errors": count_events(home_events, "service_error"),
            "blocks": count_events(home_events, "block") + count_events(home_events, "solo_block") + count_events(home_events, "block_assist"),
            "digs": count_events(home_events, "dig") + count_events(home_events, "save"),
            "assists": count_events(home_events, "set"),
            "receptions": len([e for e in home_events if e.event_type == "reception"]),
            "reception_errors": count_events(home_events, "reception_error"),
            "service_aces": count_events(home_events, "ace"),
            "service_errors": count_events(home_events, "service_error"),
        }
        
        away_stats = {}
        for key in home_stats:
            away_stats[key] = len([e for e in away_events if e.event_type == key.replace("home_", "")])
        
        return {
            "match_id": match_id,
            "home_team": {"id": str(match.home_team_id), "name": match.home_team.name if match.home_team else "Unknown"},
            "away_team": {"id": str(match.away_team_id), "name": match.away_team.name if match.away_team else "Unknown"},
            "score": {"home": match.home_score, "away": match.away_score},
            "sets_format": match.sets_format,
            "status": match.status,
            "home_stats": home_stats,
            "away_stats": away_stats,
            "sets": [
                {
                    "set_number": s.set_number,
                    "home_points": s.home_points,
                    "away_points": s.away_points,
                    "status": s.status,
                    "duration_seconds": s.duration_seconds,
                }
                for s in match.sets
            ]
        }