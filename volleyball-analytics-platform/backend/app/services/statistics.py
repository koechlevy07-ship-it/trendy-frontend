"""Statistics service for computing player and team statistics."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.personnel import Player
from app.models.personnel import PlayerMatchStatistics
from app.models.match import Match, Event
from app.models.team import Team
from app.models.match import Match, Set, Event, EventType


class StatisticsService:
    """Service for computing and managing volleyball statistics."""
    
    def __init__(self, session):
        self.session = session
    
    async def get_player_match_stats(self, player_id: str, match_id: str = None) -> dict:
        """Get player statistics for a specific match or all matches."""
        from app.models.personnel import PlayerMatchStatistics
        from sqlalchemy import select
        
        query = select(PlayerMatchStatistics).where(
            PlayerMatchStatistics.player_id == UUID(player_id)
        )
        
        if match_id:
            query = query.where(PlayerMatchStatistics.match_id == UUID(match_id))
        
        result = await self.session.execute(query)
        stats = result.scalars().all()
        
        if not stats:
            return {}
        
        # Aggregate stats
        total_serves = sum(s.total_serves for s in stats)
        total_aces = sum(s.service_aces for s in stats)
        total_serve_errors = sum(s.service_errors for s in stats)
        total_attacks = sum(s.attack_attempts for s in stats)
        total_kills = sum(s.kills for s in stats)
        total_attack_errors = sum(s.attack_errors for s in stats)
        total_blocked = sum(s.blocked_attacks for s in stats)
        total_digs = sum(s.digs for s in stats)
        total_blocks = sum(s.solo_blocks + s.block_assists for s in stats)
        total_assists = sum(s.assists for s in stats)
        total_receptions = sum(s.reception_attempts for s in stats)
        
        # Calculate efficiencies
        attack_eff = 0.0
        if stats[0].attack_attempts > 0:
            total_kills = sum(s.kills for s in stats)
            total_errors = sum(s.attack_errors for s in stats)
            total_blocked = sum(s.blocked_attacks for s in stats)
            total_attempts = sum(s.attack_attempts for s in stats)
            attack_eff = (sum(s.kills for s in stats) - total_blocked - total_errors) / total_attempts * 100
        
        serve_pct = 0.0
        if sum(s.total_serves for s in stats) > 0:
            serve_pct = (sum(s.total_serves for s in stats) - sum(s.service_errors for s in stats)) / sum(s.total_serves for s in stats) * 100
        
        return {
            "player_id": player_id,
            "matches_played": len(set(s.match_id for s in stats)),
            "sets_played": sum(s.sets_played for s in stats),
            
            # Serving
            "total_serves": sum(s.total_serves for s in stats),
            "service_aces": sum(s.service_aces for s in stats),
            "service_errors": sum(s.service_errors for s in stats),
            "serve_percentage": round(serve_pct, 1),
            
            # Attacking
            "attack_attempts": sum(s.attack_attempts for s in stats),
            "kills": sum(s.kills for s in stats),
            "attack_errors": sum(s.attack_errors for s in stats),
            "blocked_attacks": sum(s.blocked_attacks for s in stats),
            "kill_percentage": round(sum(s.kills for s in stats) / max(sum(s.attack_attempts for s in stats), 1) * 100, 1),
            "attack_efficiency": round((sum(s.kills for s in stats) - sum(s.attack_errors for s in stats) - sum(s.blocked_attacks for s in stats)) / max(sum(s.attack_attempts for s in stats), 1) * 100, 1),
            
            # Blocking
            "solo_blocks": sum(s.solo_blocks for s in stats),
            "block_assists": sum(s.block_assists for s in stats),
            "total_blocks": sum(s.solo_blocks + s.block_assists for s in stats),
            
            # Defense
            "digs": sum(s.digs for s in stats),
            "saves": sum(s.saves for s in stats),
            
            # Receiving
            "reception_attempts": sum(s.reception_attempts for s in stats),
            "perfect_receptions": sum(s.perfect_receptions for s in stats),
            "reception_errors": sum(s.reception_errors for s in stats),
            
            # Setting
            "set_attempts": sum(s.set_attempts for s in stats),
            "assists": sum(s.assists for s in stats),
            "setting_errors": sum(s.setting_errors for s in stats),
            
            # Movement
            "distance_covered_m": sum(s.distance_covered_m for s in stats),
            "avg_speed_kmh": round(sum(s.avg_speed_kmh for s in stats) / max(len(stats), 1), 1),
            "max_speed_kmh": max(s.max_speed_kmh for s in stats) if stats else 0,
            
            # Jumps
            "jump_count": sum(s.jump_count for s in stats),
            "avg_jump_height_cm": round(sum(s.avg_jump_height_cm for s in stats) / len(stats), 1),
            "max_jump_height_cm": max(s.max_jump_height_cm for s in stats) if stats else 0,
            
            # Playing time
            "playing_time_seconds": sum(s.playing_time_seconds for s in stats),
            "sets_played": sum(s.sets_played for s in stats),
        }
    
    async def get_team_stats(self, team_id: str, match_id: str = None) -> dict:
        """Get aggregated team statistics."""
        from app.models.personnel import PlayerMatchStatistics
        from sqlalchemy import select, func, or_
        
        # Get all players in team
        from app.models.personnel import Player
        from sqlalchemy import select
        
        players_result = await self.session.execute(
            select(Player.id).where(Player.team_id == player_id)
        )
        player_ids = [str(p[0]) for p in result.all()]
        
        if not player_ids:
            return {}
        
        # Get aggregated stats for all players in team
        query = select(
            func.sum(PlayerMatchStatistics.total_serves).label("total_serves"),
            func.sum(PlayerMatchStatistics.service_aces).label("service_aces"),
            func.sum(PlayerMatchStatistics.service_errors).label("service_errors"),
            func.sum(PlayerMatchStatistics.attack_attempts).label("attack_attempts"),
            func.sum(PlayerMatchStatistics.kills).label("kills"),
            func.sum(PlayerMatchStatistics.attack_errors).label("attack_errors"),
            func.sum(PlayerMatchStatistics.blocked_attacks).label("blocked_attacks"),
            func.sum(PlayerMatchStatistics.solo_blocks).label("solo_blocks"),
            func.sum(PlayerMatchStatistics.block_assists).label("block_assists"),
            func.sum(PlayerMatchStatistics.digs).label("digs"),
            func.sum(PlayerMatchStatistics.assists).label("assists"),
            func.sum(PlayerMatchStatistics.reception_attempts).label("reception_attempts"),
            func.sum(PlayerMatchStatistics.perfect_receptions).label("perfect_receptions"),
            func.sum(PlayerMatchStatistics.reception_errors).label("reception_errors"),
            func.sum(PlayerMatchStatistics.assists).label("assists"),
            func.sum(PlayerMatchStatistics.setting_errors).label("setting_errors"),
        )
        
        if match_id:
            query = query.where(PlayerMatchStatistics.match_id == UUID(match_id))
        
        query = query.where(PlayerMatchStatistics.player_id.in_(player_ids))
        
        result = await self.session.execute(query)
        row = result.first()
        
        if not row or not row[0]:
            return {}
        
        # Calculate derived stats
        stats = {
            "total_serves": row.total_serves or 0,
            "service_aces": row.service_aces or 0,
            "service_errors": row.service_errors or 0,
            "serve_percentage": round((row.total_serves - row.service_errors) / max(row.total_serves, 1) * 100, 1),
            "ace_rate": round(row.service_aces / max(row.total_serves, 1) * 100, 1),
            
            "attack_attempts": row.attack_attempts or 0,
            "kills": row.kills or 0,
            "attack_errors": row.attack_errors or 0,
            "blocked_attacks": row.blocked_attacks or 0,
            "kill_percentage": round(row.kills / max(row.attack_attempts, 1) * 100, 1),
            "attack_efficiency": round((row.kills - row.attack_errors - row.blocked_attacks) / max(row.attack_attempts, 1) * 100, 1),
            
            "solo_blocks": row.solo_blocks or 0,
            "block_assists": row.block_assists or 0,
            "total_blocks": (row.solo_blocks or 0) + (row.block_assists or 0),
            
            "digs": row.digs or 0,
            
            "assists": row.assists or 0,
        }
        
        if row.total_serves > 0:
            stats["serve_percentage"] = round((row.total_serves - row.service_errors) / row.total_serves * 100, 1)
            stats["ace_rate"] = round(row.service_aces / row.total_serves * 100, 1)
        
        if row.attack_attempts > 0:
            stats["kill_percentage"] = round(row.kills / row.attack_attempts * 100, 1)
            stats["attack_efficiency"] = round((row.kills - row.attack_errors - row.blocked_attacks) / row.attack_attempts * 100, 1)
        
        stats["blocks_per_set"] = round((row.solo_blocks + row.block_assists) / max(stats.get("sets_played", 1), 1), 2)
        stats["digs_per_set"] = round(row.digs / max(stats.get("sets_played", 1), 1), 2)
        
        return stats
    
    async def get_team_season_stats(self, team_id: str, season_id: str = None) -> dict:
        """Get team statistics for a season."""
        # Aggregate all player stats in team
        from app.models.personnel import Player
        from sqlalchemy import select
        
        players_result = await self.session.execute(
            select(Player.id).where(Player.team_id == UUID(team_id))
        )
        player_ids = [str(p[0]) for p in await self.session.execute(select(Player.id).where(Player.team_id == UUID(team_id)))]
        
        if not player_ids:
            return {}
        
        # Aggregate stats
        stats = await self.get_team_stats(team_id)
        
        # Add team-level aggregates
        from app.models.match import Match
        from sqlalchemy import select, func
        
        matches_result = await self.session.execute(
            select(Match)
            .where(
                (Match.home_team_id == UUID(team_id)) | (Match.away_team_id == UUID(team_id))
            )
        )
        matches = list(matches_result.scalars().all())
        
        total_matches = len(matches)
        wins = sum(1 for m in matches if m.winner_team_id and str(m.winner_team_id) == team_id)
        losses = len(matches) - sum(1 for m in matches if m.winner_team_id and str(m.winner_team_id) == team_id)
        
        return {
            "team_id": team_id,
            "total_matches": len(matches),
            "wins": sum(1 for m in matches if m.winner_team_id and str(m.winner_team_id) == team_id),
            "losses": len(matches) - sum(1 for m in matches if str(m.winner_team_id) == team_id),
            "win_percentage": round(sum(1 for m in matches if str(m.winner_team_id) == team_id) / max(len(matches), 1) * 100, 1),
            "player_statistics": player_stats,
        }
    
    async def get_player_career_stats(self, player_id: str) -> dict:
        """Get player's career statistics across all seasons."""
        from app.models.personnel import Player
        from app.models.personnel import PlayerMatchStatistics
        from sqlalchemy import select, func
        
        # Get player info
        player_result = await self.session.execute(
            select(Player).where(Player.id == UUID(player_id))
        )
        player = result.scalar_one_or_none()
        if not player:
            return {}
        
        # Get all match statistics
        stats_result = await self.session.execute(
            select(PlayerMatchStatistics)
            .where(PlayerMatchStatistics.player_id == UUID(player_id))
        )
        all_stats = list(stats_result.scalars().all())
        
        if not all_stats:
            return {"player": player.full_name, "career_stats": {}}
        
        # Aggregate career stats
        total_matches = len(set(s.match_id for s in stats))
        total_sets = sum(s.sets_played for s in stats)
        
        return {
            "player": {
                "id": str(player.id),
                "name": f"{player.first_name} {player.last_name}",
                "jersey_number": player.jersey_number,
                "position": player.position,
                "team": player.team.name if player.team else None,
            },
            "career_stats": {
                "matches_played": len(set(s.match_id for s in stats)),
                "sets_played": sum(s.sets_played for s in stats),
                
                "total_serves": sum(s.total_serves for s in stats),
                "service_aces": sum(s.service_aces for s in stats),
                "service_errors": sum(s.service_errors for s in stats),
                "serve_percentage": round((sum(s.total_serves for s in stats) - sum(s.service_errors for s in stats)) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
                "ace_rate": round(sum(s.service_aces for s in stats) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
                
                "attack_attempts": sum(s.attack_attempts for s in stats),
                "kills": sum(s.kills for s in stats),
                "attack_errors": sum(s.attack_errors for s in stats),
                "kill_percentage": round(sum(s.kills for s in stats) / max(sum(s.attack_attempts for s in stats), 1) * 100, 1),
                "attack_efficiency": round(
                    (sum(s.kills for s in stats) - sum(s.attack_errors for s in stats) - sum(s.blocked_attacks for s in stats)) 
                    / max(sum(s.attack_attempts for s in stats), 1) * 100, 1
                ),
                
                "solo_blocks": sum(s.solo_blocks for s in stats),
                "block_assists": sum(s.block_assists for s in stats),
                "total_blocks": sum(s.solo_blocks + s.block_assists for s in stats),
                
                "digs": sum(s.digs for s in stats),
                "saves": sum(s.saves for s in stats),
                
                "reception_attempts": sum(s.reception_attempts for s in stats),
                "perfect_receptions": sum(s.perfect_receptions for s in stats),
                "reception_errors": sum(s.reception_errors for s in stats),
                "reception_percentage": round(
                    (sum(s.perfect_receptions + s.positive_receptions for s in stats)) 
                    / max(sum(s.reception_attempts for s in stats), 1) * 100, 1
                ),
                
                "assists": sum(s.assists for s in stats),
                "setting_errors": sum(s.setting_errors for s in stats),
                
                "total_jumps": sum(s.jump_count for s in stats),
                "avg_jump_height": round(sum(s.avg_jump_height_cm for s in stats) / max(total_jumps, 1), 1),
                "max_jump_height": max([s.max_jump_height_cm for s in stats], default=0),
                
                "total_distance_m": round(sum(s.distance_covered_m for s in stats), 1),
                "avg_speed_kmh": round(sum(s.avg_speed_kmh for s in stats) / max(len(stats), 1), 1),
                "max_speed_kmh": max([s.max_speed_kmh for s in stats], default=0),
            }
        }
    
    async def get_team_comparison(self, team1_id: str, team2_id: str) -> dict:
        """Compare two teams statistics."""
        team1_stats = await self.get_team_stats(team1_id)
        team2_stats = await self.get_team_stats(team2_id)
        
        return {
            "team1": team1_stats,
            "team2": team2_stats,
            "comparison": {
                "attack_efficiency_diff": round(team1_stats.get("attack_efficiency", 0) - team2_stats.get("attack_efficiency", 0), 1),
                "serve_efficiency_diff": round(team1_stats.get("serve_percentage", 0) - team2_stats.get("serve_percentage", 0), 1),
                "block_efficiency_diff": round(
                    (team1_stats.get("solo_blocks", 0) + team1_stats.get("block_assists", 0)) / max(1, 1) 
                    - (team2_stats.get("solo_blocks", 0) + team2_stats.get("block_assists", 0)) / 1, 1
                ),
            }
        }
    
    async def get_leaderboard(self, season_id: str = None, limit: int = 10, category: str = "kills") -> List[dict]:
        """Get leaderboard for a specific stat category."""
        from app.models.personnel import Player
        from app.models.personnel import PlayerMatchStatistics
        from sqlalchemy import select, func, desc
        
        # Map category to column
        category_map = {
            "kills": PlayerMatchStatistics.kills,
            "aces": PlayerMatchStatistics.service_aces,
            "blocks": PlayerMatchStatistics.solo_blocks + PlayerMatchStatistics.block_assists,
            "digs": PlayerMatchStatistics.digs,
            "assists": PlayerMatchStatistics.assists,
            "aces": PlayerMatchStatistics.service_aces,
            "kill_pct": PlayerMatchStatistics.kills / PlayerMatchStatistics.attack_attempts,
            "attack_efficiency": (PlayerMatchStatistics.kills - PlayerMatchStatistics.attack_errors - PlayerMatchStatistics.blocked_attacks) / PlayerMatchStatistics.attack_attempts,
        }
        
        if category not in category_map:
            category = "kills"
        
        column = category_map[category]
        
        query = select(
            Player.id,
            Player.first_name,
            Player.last_name,
            Player.jersey_number,
            Player.position,
            func.sum(category_map[category]).label("total"),
            func.count().label("matches_played"),
        ).select_from(
            Player
        ).join(
            PlayerMatchStatistics, Player.id == PlayerMatchStatistics.player_id
        ).group_by(
            Player.id, Player.first_name, Player.last_name, Player.jersey_number, Player.position
        ).order_by(
            desc("total")
        ).limit(limit)
        
        result = await self.session.execute(query)
        rows = result.all()
        
        return [
            {
                "player_id": str(row.id),
                "name": f"{row.first_name} {row.last_name}",
                "jersey_number": row.jersey_number,
                "position": row.position,
                "total": row.total,
                "matches_played": row.matches_played,
            }
            for row in rows
        ]