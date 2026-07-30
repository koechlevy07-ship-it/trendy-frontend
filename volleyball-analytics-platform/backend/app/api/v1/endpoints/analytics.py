"""Analytics endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.personnel import Player
from app.models.statistics import PlayerMatchStatistics
from app.models.team import Team

router = APIRouter()


@router.get("/players/{player_id}", response_model=dict)
async def get_player_analytics(
    player_id: str,
    match_id: Optional[str] = None,
    season_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get comprehensive analytics for a player."""
    from app.models.personnel import Player, PlayerMatchStatistics
    from app.models.match import Match
    from sqlalchemy import select, func, and_
    from uuid import UUID
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Build query for statistics
    query = select(PlayerMatchStatistics).where(
        PlayerMatchStatistics.player_id == player_id
    )
    
    if match_id:
        query = query.where(PlayerMatchStatistics.match_id == match_id)
    
    result = await session.execute(query)
    stats = result.scalars().all()
    
    if not stats:
        return {"message": "No statistics available for this player"}
    
    # Aggregate statistics
    total_matches = len(stats)
    total_kills = sum(s.kills for s in stats)
    total_attempts = sum(s.attack_attempts for s in stats)
    total_errors = sum(s.attack_errors for s in stats)
    total_blocks = sum(s.solo_blocks + s.block_assists for s in stats)
    total_digs = sum(s.digs for s in stats)
    total_aces = sum(s.service_aces for s in stats)
    total_serves = sum(s.total_serves for s in stats)
    total_service_errors = sum(s.service_errors for s in stats)
    
    # Calculate derived metrics
    kill_pct = round(total_kills / max(total_attempts, 1) * 100, 1) if total_attempts > 0 else 0
    attack_efficiency = 0
    if total_attempts > 0:
        attack_eff = (total_kills - total_errors - sum(s.blocked_attacks for s in stats)) / total_attempts * 100
    
    serve_pct = 0
    total_serves = sum(s.total_serves for s in stats)
    if total_serves > 0:
        serve_pct = (total_serves - sum(s.service_errors for s in stats)) / total_serves * 100
    
    return {
        "player_id": str(player.id),
        "player_name": f"{player.first_name} {player.last_name}",
        "jersey_number": player.jersey_number,
        "position": player.position,
        "matches_analyzed": len(stats),
        "serving": {
            "total_serves": sum(s.total_serves for s in stats),
            "aces": sum(s.service_aces for s in stats),
            "errors": sum(s.service_errors for s in stats),
            "serve_percentage": round((sum(s.total_serves for s in stats) - sum(s.service_errors for s in stats)) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
            "ace_rate": round(sum(s.service_aces for s in stats) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
        },
        "attacking": {
            "attempts": sum(s.attack_attempts for s in stats),
            "kills": sum(s.kills for s in stats),
            "errors": sum(s.attack_errors for s in stats),
            "blocked": sum(s.blocked_attacks for s in stats),
            "kill_percentage": round(sum(s.kills for s in stats) / max(sum(s.attack_attempts for s in stats), 1) * 100, 1),
            "efficiency": round((sum(s.kills for s in stats) - sum(s.attack_errors for s in stats) - sum(s.blocked_attacks for s in stats)) / max(sum(s.attack_attempts for s in stats), 1) * 100, 1),
        },
        "blocking": {
            "solo_blocks": sum(s.solo_blocks for s in stats),
            "block_assists": sum(s.block_assists for s in stats),
            "total_blocks": sum(s.solo_blocks + s.block_assists for s in stats),
            "block_errors": sum(s.block_errors for s in stats),
        },
        "defense": {
            "digs": sum(s.digs for s in stats),
            "saves": sum(s.saves for s in stats),
        },
        "serving": {
            "total_serves": sum(s.total_serves for s in stats),
            "aces": sum(s.service_aces for s in stats),
            "errors": sum(s.service_errors for s in stats),
            "serve_percentage": round(sum(s.total_serves for s in stats) - sum(s.service_errors for s in stats) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
            "ace_rate": round(sum(s.service_aces for s in stats) / max(sum(s.total_serves for s in stats), 1) * 100, 1),
        },
        "receiving": {
            "attempts": sum(s.reception_attempts for s in stats),
            "perfect": sum(s.perfect_receptions for s in stats),
            "errors": sum(s.reception_errors for s in stats),
            "reception_percentage": round((sum(s.perfect_receptions for s in stats) + sum(s.good_receptions for s in stats)) / max(sum(s.reception_attempts for s in stats), 1) * 100, 1) if sum(s.reception_attempts for s in stats) > 0 else 0,
        },
        "setting": {
            "attempts": sum(s.set_attempts for s in stats),
            "assists": sum(s.assists for s in stats),
            "errors": sum(s.setting_errors for s in stats),
        },
        "movement": {
            "distance_covered_m": sum(s.distance_covered_m for s in stats),
            "avg_speed_kmh": round(sum(s.avg_speed_kmh for s in stats) / len(stats), 1) if stats else 0,
            "max_speed_kmh": max(s.max_speed_kmh for s in stats) if stats else 0,
        },
        "jumps": {
            "total_jumps": sum(s.jump_count for s in stats),
            "avg_height_cm": round(sum(s.avg_jump_height_cm for s in stats) / len(stats), 1) if stats else 0,
            "max_height_cm": max((s.max_jump_height_cm for s in stats), default=0),
        },
    }


@router.get("/teams/{team_id}", response_model=dict)
async def get_team_analytics(
    team_id: str,
    match_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Get team analytics."""
    from app.models.team import Team
    from app.models.personnel import Player
    from app.models.match import Match, Event
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func, or_
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get all players in team
    from sqlalchemy import select
    from app.models.personnel import Player
    
    players_result = await session.execute(
        select(Player.id).where(Player.team_id == team_id, Player.is_active == True)
    )
    player_ids = [str(p[0]) for p in result.scalars().all()]
    
    if not player_ids:
        return {"team_id": team_id, "message": "No players in team"}
    
    # Get aggregated statistics
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    
    stats_query = select(
        func.sum(PlayerMatchStatistics.total_serves).label("total_serves"),
        func.sum(PlayerMatchStatistics.service_aces).label("aces"),
        func.sum(PlayerMatchStatistics.service_errors).label("service_errors"),
        func.sum(PlayerMatchStatistics.attack_attempts).label("attack_attempts"),
        func.sum(PlayerMatchStatistics.kills).label("kills"),
        func.sum(PlayerMatchStatistics.attack_errors).label("attack_errors"),
        func.sum(PlayerMatchStatistics.blocked_attacks).label("blocked_attacks"),
        func.sum(PlayerMatchStatistics.solo_blocks).label("solo_blocks"),
        func.sum(PlayerMatchStatistics.block_assists).label("block_assists"),
        func.sum(PlayerMatchStatistics.digs).label("digs"),
        func.sum(PlayerMatchStatistics.reception_attempts).label("reception_attempts"),
        func.sum(PlayerMatchStatistics.perfect_receptions).label("perfect_receptions"),
        func.sum(PlayerMatchStatistics.reception_errors).label("reception_errors"),
        func.sum(PlayerMatchStatistics.assists).label("assists"),
        func.sum(PlayerMatchStatistics.setting_errors).label("setting_errors"),
        func.sum(PlayerMatchStatistics.digs).label("digs"),
        func.sum(PlayerMatchStatistics.solo_blocks).label("solo_blocks"),
        func.sum(PlayerMatchStatistics.block_assists).label("block_assists"),
    ).where(PlayerMatchStatistics.player_id.in_(player_ids))
    
    if match_id:
        stats_query = stats_query.where(PlayerMatchStatistics.match_id == match_id)
    
    result = await session.execute(stats_query)
    row = result.first()
    
    if not row or not row.total_serves:
        return {"team_id": team_id, "message": "No statistics available"}
    
    # Calculate derived metrics
    total_serves = row.total_serves or 0
    aces = row.aces or 0
    service_errors = row.service_errors or 0
    attack_attempts = row.attack_attempts or 0
    kills = row.kills or 0
    attack_errors = row.attack_errors or 0
    blocked_attacks = row.blocked_attacks or 0
    solo_blocks = row.solo_blocks or 0
    block_assists = row.block_assists or 0
    digs = row.digs or 0
    assists = row.assists or 0
    reception_attempts = row.reception_attempts or 0
    perfect_receptions = row.perfect_receptions or 0
    reception_errors = row.reception_errors or 0
    assists = row.assists or 0
    setting_errors = row.setting_errors or 0
    
    return {
        "team_id": team_id,
        "serving": {
            "total_serves": total_serves,
            "aces": aces,
            "errors": service_errors,
            "serve_percentage": round((total_serves - service_errors) / max(total_serves, 1) * 100, 1),
            "ace_rate": round(aces / max(total_serves, 1) * 100, 1),
        },
        "attacking": {
            "attempts": total_attempts,
            "kills": kills,
            "errors": attack_errors,
            "blocked": blocked_attacks,
            "kill_percentage": round(kills / max(total_attempts, 1) * 100, 1),
            "efficiency": round((kills - attack_errors - blocked) / max(total_attempts, 1) * 100, 1),
        },
        "blocking": {
            "solo_blocks": solo_blocks,
            "block_assists": block_assists,
            "total_blocks": solo_blocks + block_assists,
        },
        "defense": {
            "digs": digs,
            "saves": saves,
        },
        "receiving": {
            "attempts": reception_attempts,
            "perfect": perfect_receptions,
            "errors": reception_errors,
            "reception_percentage": round((perfect_receptions + good_receptions) / max(reception_attempts, 1) * 100, 1) if reception_attempts else 0,
        },
        "setting": {
            "attempts": set_attempts or 0,
            "assists": assists or 0,
            "errors": setting_errors or 0,
        },
    }


@router.get("/teams/{team_id}/comparison", response_model=dict)
async def compare_teams(
    team_id_1: str,
    team_id_2: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Compare two teams' statistics."""
    stats_1 = await get_team_analytics(team_id_1, session, current_user)
    stats_2 = await get_team_analytics(team_id_2, session, current_user)
    
    return {
        "team_1": stats_1,
        "team_2": stats_2,
        "comparison": {
            "attack_efficiency_diff": round(stats_1.get("attacking", {}).get("efficiency", 0) - stats_2.get("attacking", {}).get("efficiency", 0), 1),
            "serve_efficiency_diff": round(stats_1.get("serving", {}).get("serve_percentage", 0) - stats_2.get("serving", {}).get("serve_percentage", 0), 1),
            "block_efficiency_diff": round(stats_1.get("blocking", {}).get("total_blocks", 0) - stats_2.get("blocking", {}).get("total_blocks", 0), 1),
            "digs_diff": stats_1.get("defense", {}).get("digs", 0) - stats_2.get("defense", {}).get("digs", 0),
}
}


@router.get("/leaderboards", response_model=dict)
async def get_leaderboards(
    metric: str = Query("kills", regex="^(kills|aces|blocks|digs|assists|efficiency)$"),
    limit: int = Query(10, ge=1, le=50),
    season_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Get statistical leaderboards."""
    from app.models.personnel import PlayerMatchStatistics
    from app.models.personnel import Player
    from sqlalchemy import select, func, desc
    
    metric_map = {
        "kills": "kills",
        "aces": "service_aces",
        "blocks": "solo_blocks + block_assists",
        "digs": "digs",
        "assists": "assists",
        "efficiency": "attack_efficiency",
    }
    
    # For simplicity, return mock data structure
    return {
        "metric": metric,
        "leaders": [
            {
                "rank": 1,
                "player_id": "player_1",
                "player_name": "Jane Doe",
                "jersey_number": 7,
                "team": "Thunder Hawks",
                "value": 45,
                "matches_played": 12,
            },
            {
                "rank": 2,
                "player_id": "player_2",
                "player_name": "John Smith",
                "jersey_number": 10,
                "team": "Eagles",
                "value": 38,
                "matches_played": 11,
            },
        ],
    }