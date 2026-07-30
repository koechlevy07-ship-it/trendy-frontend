"""Team repository for team-related database operations."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.team import Team
from app.models.personnel import Player
from app.models.match import Match


class TeamRepository(BaseRepository):
    """Repository for Team entity."""
    
    def __init__(self, session):
        super().__init__(Team, session)

    async def get_with_players(self, team_id: str) -> Optional[dict]:
        """Get team with all players."""
        from sqlalchemy.orm import selectinload
        
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == team_id)
            .options(selectinload(Team.players))
        )
        team = result.scalar_one_or_none()
        
        if not team:
            return None
        
        return {
            "id": str(team.id),
            "organization_id": str(team.organization_id),
            "name": team.name,
            "short_name": team.short_name,
            "gender": team.gender,
            "age_category": team.age_category,
            "competition_level": team.competition_level,
            "logo_url": team.logo_url,
            "primary_color": team.primary_color,
            "secondary_color": team.secondary_color,
            "founded_year": team.founded_year,
            "home_venue": team.home_venue,
            "is_active": team.is_active,
            "created_at": team.created_at,
            "updated_at": team.updated_at,
            "players": [
                {
                    "id": str(p.id),
                    "jersey_number": p.jersey_number,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "position": p.position,
                    "height_cm": p.height_cm,
                    "weight_kg": p.weight_kg,
                    "is_libero": p.is_libero,
                    "is_captain": p.is_captain,
                }
                for p in team.players
            ],
        }

    async def get_with_stats(self, team_id: str) -> Optional[dict]:
        """Get team with statistics."""
        from sqlalchemy import func, or_
        
        team_data = await self.get_with_players(team_id)
        if not team_data:
            return None
        
        # Get match statistics
        from app.models.match import Match
        from sqlalchemy import func, or_, select, and_
        
        matches_result = await self.session.execute(
            select(Match).where(
                or_(
                    Match.home_team_id == team_id,
                    Match.away_team_id == team_id
                )
            )
        )
        matches = list(matches_result.scalars().all())
        
        # Calculate stats
        total_matches = len(matches)
        wins = sum(1 for m in matches if m.winner_team_id == team_id)
        losses = total_matches - wins
        
        home_matches = [m for m in matches if str(m.home_team_id) == team_id]
        away_matches = [m for m in matches if m.away_team_id == team_id]
        
        home_wins = sum(1 for m in home_matches if m.winner_team_id == team_id)
        away_wins = sum(1 for m in away_matches if m.winner_team_id == team_id)
        
        total_points = sum(m.home_score for m in home_matches) + sum(m.away_score for m in away_matches)
        total_opponent_points = sum(m.away_score for m in home_matches) + sum(m.home_score for m in away_matches)
        
        return {
            **team_data,
            "statistics": {
                "total_matches": total_matches,
                "wins": wins,
                "losses": losses,
                "win_rate": wins / total_matches if total_matches > 0 else 0,
                "home_wins": home_wins,
                "away_wins": away_wins,
                "total_points_scored": total_points,
                "total_points_conceded": total_opponent_points,
                "points_difference": total_points - total_opponent_points,
                "home_record": f"{len([m for m in home_matches if m.winner_team_id == team_id])}-{len(home_matches)}",
                "away_record": f"{len([m for m in away_matches if m.winner_team_id == team_id])}-{len(away_matches)}",
            }
        }

    async def get_all_with_stats(self, organization_id: str = None, limit: int = 50, skip: int = 0) -> List[dict]:
        """Get all teams with basic stats."""
        query = select(self.model)
        
        # If organization_id provided, filter by organization
        # (would need organization_id field on team)
        
        result = await self.session.execute(
            select(self.model)
            .where(self.model.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        teams = result.scalars().all()
        
        return [
            {
                "id": str(t.id),
                "name": t.name,
                "short_name": t.short_name,
                "gender": t.gender,
                "age_category": t.age_category,
                "competition_level": t.competition_level,
                "primary_color": t.primary_color,
                "secondary_color": t.secondary_color,
                "logo_url": t.logo_url,
                "is_active": t.is_active,
            }
            for t in teams
        ]

    async def get_by_organization(self, org_id: str) -> List[dict]:
        """Get all teams in an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == UUID(org_id))
            .where(self.model.is_active == True)
        )
        teams = result.scalars().all()
        
        return [
            {
                "id": str(t.id),
                "name": t.name,
                "short_name": t.short_name,
                "gender": t.gender,
                "age_category": t.age_category,
                "competition_level": t.competition_level,
                "primary_color": t.primary_color,
                "secondary_color": t.secondary_color,
            }
            for t in teams
        ]

    async def get_team_roster(self, team_id: str) -> Optional[dict]:
        """Get full team roster with player details."""
        from sqlalchemy.orm import selectinload
        
        result = await self.session.execute(
            select(Team)
            .where(Team.id == UUID(team_id))
            .options(selectinload(Team.players))
        )
        team = result.scalar_one_or_none()
        
        if not team:
            return None
        
        return {
            "id": str(team.id),
            "name": team.name,
            "short_name": team.short_name,
            "players": [
                {
                    "id": str(p.id),
                    "jersey_number": p.jersey_number,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "position": p.position,
                    "height_cm": p.height_cm,
                    "weight_kg": p.weight_kg,
                    "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
                    "nationality": p.nationality,
                    "dominant_hand": p.dominant_hand,
                    "is_libero": p.is_libero,
                    "is_captain": p.is_captain,
                }
                for p in team.players
            ],
            "coach": team.coach_id,
        }