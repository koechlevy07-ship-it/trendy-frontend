"""
Statistics endpoints.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.personnel import Player
from app.models.statistics import PlayerMatchStatistics
from app.models.match import Match
from app.models.team import Team
from app.models.user import User
from app.schemas.statistics import (
    PlayerStatisticsResponse,
    TeamStatisticsResponse,
    MatchStatisticsResponse,
    LeaderboardResponse,
    PlayerComparisonResponse,
)

router = APIRouter()


@router.get("/players/{player_id}", response_model=dict)
async def get_player_statistics(
    player_id: str,
    match_id: Optional[str] = None,
    season_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get player statistics for a specific match or season."""
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    
    query = select(PlayerMatchStatistics).where(
        PlayerMatchStatistics.player_id == player_id
    )
    
    if match_id:
        query = query.where(PlayerMatchStatistics.match_id == player_id)
    
    result = await session.execute(query)
    stats = result.scalars().all()
    
    if not stats:
        return {"message": "No statistics found for this player"}
    
    # Aggregate statistics
    total_kills = sum(s.kills for s in stats)
    total_attempts = sum(s.attack_attempts for s in stats)
    total_errors = sum(s.attack_errors for s in stats)
    total_blocks = sum(s.solo_blocks + s.block_assists for s in stats)
    total_digs = sum(s.digs for s in stats)
    total_aces = sum(s.service_aces for s in stats)
    total_service_errors = sum(s.service_errors for s in stats)
    
    # Calculate derived metrics
    kill_pct = 0
    if total_attempts > 0:
        kill_pct = round(sum(s.kills for s in stats) / total_attempts * 100, 1)
    
    attack_efficiency = 0
    if total_attempts > 0:
        attack_eff = (sum(s.kills for s in stats) - sum(s.attack_errors for s in stats) - sum(s.blocked_attacks for s in stats)) / total_attempts * 100
    
    serve_pct = 0
    if sum(s.total_serves for s in stats) > 0:
        serve_pct = (sum(s.total_serves for s in stats) - sum(s.service_errors for s in stats)) / sum(s.total_serves for s in stats) * 100
    
    reception_pct = 0
    if sum(s.reception_attempts for s in stats) > 0:
        reception_pct = (sum(s.perfect_receptions for s in stats) + sum(s.good_receptions for s in stats)) / sum(s.reception_attempts for s in stats) * 100
    
    return {
        "player_id": player_id,
        "matches_analyzed": len(stats),
        "serving": {
            "total_serves": sum(s.total_serves for s in stats),
            "aces": sum(s.service_aces for s in stats),
            "errors": sum(s.service_errors for s in stats),
            "serve_percentage": round(serve_pct, 1),
        },
        "attacking": {
            "attempts": sum(s.attack_attempts for s in stats),
            "kills": sum(s.kills for s in stats),
            "errors": sum(s.attack_errors for s in stats),
            "blocked": sum(s.blocked_attacks for s in stats),
            "kill_percentage": round(kill_pct, 1),
            "attack_efficiency": round(sum(s.kills for s in stats) - sum(s.attack_errors for s in stats) - sum(s.blocked_attacks for s in stats) / sum(s.attack_attempts for s in stats) * 100, 1) if total_attempts > 0 else 0,
        },
        "blocking": {
            "solo_blocks": sum(s.solo_blocks for s in stats),
            "block_assists": sum(s.block_assists for s in stats),
            "total_blocks": sum(s.solo_blocks + s.block_assists for s in stats),
        },
        "defense": {
            "digs": sum(s.digs for s in stats),
            "saves": sum(s.saves for s in stats),
        },
        "receiving": {
            "attempts": sum(s.reception_attempts for s in stats),
            "perfect": sum(s.perfect_receptions for s in stats),
            "good": sum(s.good_receptions for s in stats),
            "errors": sum(s.reception_errors for s in stats),
            "reception_percentage": round(reception_pct, 1) if 'reception_pct' in locals() else 0,
        },
        "setting": {
            "attempts": sum(s.set_attempts for s in stats),
            "assists": sum(s.assists for s in stats),
            "errors": sum(s.setting_errors for s in stats),
        },
        "movement": {
            "distance_covered_m": sum(s.distance_covered_m for s in stats),
            "avg_speed_kmh": round(sum(s.avg_speed_kmh for s in stats) / len(stats), 1) if stats else 0,
            "max_speed_kmh": max((s.max_speed_kmh for s in stats), default=0),
        },
        "jumps": {
            "total_jumps": sum(s.jump_count for s in stats),
            "avg_height_cm": round(sum(s.avg_jump_height_cm for s in stats) / len(stats), 1) if stats else 0,
            "max_height_cm": max((s.max_jump_height_cm for s in stats), default=0),
        },
    }


@router.get("/teams/{team_id}", response_model=dict)
async def get_team_statistics(
    team_id: str,
    match_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get team statistics."""
    from app.models.team import Team
    from app.models.match import Match, MatchStatus
    from app.models.personnel import Player
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    
    team = await session.get(Team, match_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get all players in team
    players_query = select(User).where(
        User.team_id == team_id,
        User.is_active == True
    )
    result = await session.execute(select(User).where(User.team_id == team_id, User.is_active == True))
    players = result.scalars().all()
    player_ids = [str(p.id) for p in players]
    
    if not player_ids:
        return {"message": "No players in team"}
    
    # Get aggregated stats
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    
    query = select(
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
        func.sum(PlayerMatchStatistics.assists).label("assists"),
        func.sum(PlayerMatchStatistics.reception_attempts).label("reception_attempts"),
        func.sum(PlayerMatchStatistics.perfect_receptions).label("perfect_receptions"),
        func.sum(PlayerMatchStatistics.reception_errors).label("reception_errors"),
    ).where(PlayerMatchStatistics.player_id.in_(player_ids))
    
    if match_id:
        query = query.where(PlayerMatchStatistics.match_id == match_id)
    
    result = await session.execute(query)
    row = result.first()
    
    return {
        "team_id": team_id,
        "serving": {
            "total_serves": row.total_serves or 0,
            "aces": row.aces or 0,
            "errors": row.service_errors or 0,
            "serve_percentage": round((row.total_serves - row.service_errors) / max(row.total_serves, 1) * 100, 1) if row.total_serves else 0,
            "ace_rate": round(row.aces / max(row.total_serves, 1) * 100, 1) if row.total_serves else 0,
        },
        "attacking": {
            "attempts": row.attack_attempts or 0,
            "kills": row.kills or 0,
            "errors": row.attack_errors or 0,
            "blocked": row.blocked_attacks or 0,
            "kill_percentage": round(row.kills / max(row.attack_attempts, 1) * 100, 1) if row.attack_attempts else 0,
            "attack_efficiency": round((row.kills - row.attack_errors - row.blocked_attacks) / max(row.attack_attempts, 1) * 100, 1) if row.attack_attempts else 0,
        },
        "blocking": {
            "solo_blocks": row.solo_blocks or 0,
            "block_assists": row.block_assists or 0,
            "total_blocks": (row.solo_blocks or 0) + (row.block_assists or 0),
        },
        "defense": {
            "digs": row.digs or 0,
            "saves": row.saves or 0,
        },
        "receiving": {
            "attempts": row.reception_attempts or 0,
            "perfect": row.perfect_receptions or 0,
            "errors": row.reception_errors or 0,
            "reception_percentage": round((row.perfect_receptions + row.good_receptions) / max(row.reception_attempts, 1) * 100, 1) if row.reception_attempts else 0,
        },
        "setting": {
            "attempts": row.set_attempts or 0,
            "assists": row.assists or 0,
            "errors": row.setting_errors or 0,
        },
        "movement": {
            "distance_covered_m": sum(s.distance_covered_m for s in stats) if stats else 0,
            "avg_speed_kmh": sum(s.avg_speed_kmh for s in stats) / len(stats) if stats else 0,
            "max_speed_kmh": max(s.max_speed_kmh for s in stats) if stats else 0,
        },
        "jumps": {
            "total_jumps": sum(s.jump_count for s in stats) if stats else 0,
            "avg_height_cm": round(sum(s.avg_jump_height_cm for s in stats) / len(stats), 1) if stats else 0,
            "max_height_cm": max(s.max_jump_height_cm for s in stats) if stats else 0,
        },
        "jumps": {
            "total_jumps": sum(s.jump_count for s in stats) if stats else 0,
            "avg_height_cm": round(sum(s.avg_jump_height_cm for s in stats) / len(stats), 1) if stats else 0,
            "max_height_cm": max(s.max_jump_height_cm for s in stats) if stats else 0,
        },
    }


@router.get("/matches/{match_id}", response_model=dict)
async def get_match_statistics(
    match_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get statistics for a specific match."""
    from app.models.match import Match, MatchStatus
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    from uuid import UUID
    
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Get all events for this match
    from app.models.match import Event
    from sqlalchemy import select
    
    events_result = await session.execute(
        select(Event).where(Event.match_id == UUID(match_id))
    )
    events = result.scalars().all()
    
    # Get player stats
    from app.models.personnel import PlayerMatchStatistics
    stats_result = await session.execute(
        select(PlayerMatchStatistics).where(
            PlayerMatchStatistics.match_id == UUID(match_id)
        )
    )
    player_stats = result.scalars().all()
    
    # Aggregate by team
    home_team_stats = {}
    away_team_stats = {}
    
    for stat in stats:
        team_id = str(stat.team_id) if stat.team_id else "unknown"
        if team_id not in team_stats:
            team_stats[team_id] = {
                "total_serves": 0,
                "aces": 0,
                "service_errors": 0,
                "attack_attempts": 0,
                "kills": 0,
                "attack_errors": 0,
                "blocked_attacks": 0,
                "solo_blocks": 0,
                "block_assists": 0,
                "digs": 0,
                "saves": 0,
                "reception_attempts": 0,
                "perfect_receptions": 0,
                "reception_errors": 0,
                "set_attempts": 0,
                "assists": 0,
                "setting_errors": 0,
                "distance_covered_m": 0,
                "jump_count": 0,
            }
        
        ts = team_stats[team_id]
        ts["total_serves"] += stat.total_serves or 0
        ts["aces"] += stat.service_aces or 0
        ts["service_errors"] += stat.service_errors or 0
        ts["attack_attempts"] += stat.attack_attempts or 0
        ts["kills"] += stat.kills or 0
        ts["attack_errors"] += stat.attack_errors or 0
        ts["blocked_attacks"] += stat.blocked_attacks or 0
        ts["solo_blocks"] += stat.solo_blocks or 0
        ts["block_assists"] += stat.block_assists or 0
        ts["digs"] += stat.digs or 0
        ts["saves"] += stat.saves or 0
        ts["reception_attempts"] += stat.reception_attempts or 0
        ts["perfect_receptions"] += stat.perfect_receptions or 0
        ts["reception_errors"] += stat.reception_errors or 0
        ts["set_attempts"] += stat.set_attempts or 0
        ts["assists"] += stat.assists or 0
        ts["setting_errors"] += stat.setting_errors or 0
        ts["distance_covered_m"] += stat.distance_covered_m or 0
        ts["jump_count"] += stat.jump_count or 0
    
    # Calculate derived stats
    for team_id, ts in team_stats.items():
        ts["serve_pct"] = round((ts["total_serves"] - ts["service_errors"]) / max(ts["total_serves"], 1) * 100, 1)
        ts["ace_rate"] = round(ts["aces"] / max(ts["total_serves"], 1) * 100, 1) if ts["total_serves"] else 0
        ts["kill_pct"] = round(ts["kills"] / max(ts["attack_attempts"], 1) * 100, 1) if ts["attack_attempts"] else 0
        ts["attack_efficiency"] = round((ts["kills"] - ts["attack_errors"] - ts["blocked_attacks"]) / max(ts["attack_attempts"], 1) * 100, 1) if ts["attack_attempts"] else 0
        ts["serve_pct"] = round((ts["total_serves"] - ts["service_errors"]) / max(ts["total_serves"], 1) * 100, 1) if ts["total_serves"] else 0
        ts["kill_pct"] = round(ts["kills"] / max(ts["attack_attempts"], 1) * 100, 1) if ts["attack_attempts"] else 0
        ts["attack_efficiency"] = round((ts["kills"] - ts["attack_errors"] - ts["blocked_attacks"]) / max(ts["attack_attempts"], 1) * 100, 1) if ts["attack_attempts"] else 0
        ts["serve_pct"] = round((ts["total_serves"] - ts["service_errors"]) / max(ts["total_serves"], 1) * 100, 1) if ts["total_serves"] else 0
        ts["reception_pct"] = round((ts["perfect_receptions"] + ts["good_receptions"]) / max(ts["reception_attempts"], 1) * 100, 1) if ts["reception_attempts"] else 0
    
    return {
        "match_id": match_id,
        "home_team_stats": team_stats.get(str(match.home_team_id), {}),
        "away_team_stats": team_stats.get(str(match.away_team_id), {}),
    }


@router.get("/leaderboards", response_model=dict)
async def get_leaderboards(
    season_id: Optional[str] = None,
    metric: str = "kills",
    limit: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get statistical leaderboards."""
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func, desc
    from app.models.personnel import Player
    
    # Map metric to column
    metric_map = {
        "kills": "kills",
        "aces": "service_aces",
        "blocks": "solo_blocks",
        "digs": "digs",
        "assists": "assists",
        "aces": "service_aces",
    }
    
    if metric not in metric_map:
        raise HTTPException(status_code=400, detail=f"Invalid metric. Valid options: {list(metric_map.keys())}")
    
    column_name = metric_map[metric]
    column = getattr(PlayerMatchStatistics, column_name)
    
    query = (
        select(
            PlayerMatchStatistics.player_id,
            Player.first_name,
            Player.last_name,
            Player.jersey_number,
            Player.position,
            func.sum(getattr(PlayerMatchStatistics, metric)).label("total"),
            func.count().label("matches_played"),
        )
        .join(Player, Player.id == PlayerMatchStatistics.player_id)
        .group_by(PlayerMatchStatistics.player_id, Player.first_name, Player.last_name, Player.jersey_number, Player.position)
        .order_by(desc("total"))
        .limit(limit)
    )
    
    result = await session.execute(query)
    leaders = result.all()
    
    return {
        "metric": metric,
        "leaders": [
            {
                "player_id": str(row.player_id),
                "name": f"{row.first_name} {row.last_name}",
                "jersey_number": row.jersey_number,
                "position": row.position,
                "total": row.total,
                "matches_played": row.matches_played,
            }
            for row in leaders
        ]
    }


@router.get("/comparison", response_model=dict)
async def compare_players(
    player_ids: List[str] = Query(...),
    match_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Compare statistics for multiple players."""
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    from uuid import UUID
    
    player_ids = [UUID(pid) for pid in player_ids]
    
    query = select(
        PlayerMatchStatistics.player_id,
        func.sum(PlayerMatchStatistics.kills).label("total_kills"),
        func.sum(PlayerMatchStatistics.attack_attempts).label("attack_attempts"),
        func.sum(PlayerMatchStatistics.kills).label("total_kills"),
        func.sum(PlayerMatchStatistics.attack_errors).label("attack_errors"),
        func.sum(PlayerMatchStatistics.blocked_attacks).label("blocked_attacks"),
        func.sum(PlayerMatchStatistics.solo_blocks).label("solo_blocks"),
        func.sum(PlayerMatchStatistics.block_assists).label("block_assists"),
        func.sum(PlayerMatchStatistics.digs).label("digs"),
        func.sum(PlayerMatchStatistics.assists).label("assists"),
        func.sum(PlayerMatchStatistics.service_aces).label("service_aces"),
    ).where(
        PlayerMatchStatistics.player_id.in_(player_ids)
    )
    
    if match_id:
        query = query.where(PlayerMatchStatistics.match_id == UUID(match_id))
    
    query = query.group_by(PlayerMatchStatistics.player_id)
    
    result = await session.execute(query)
    rows = result.all()
    
    return {
        "comparison": [
            {
                "player_id": str(row.player_id),
                "kills": row.total_kills or 0,
                "attack_attempts": row.attack_attempts or 0,
                "kill_percentage": round(row.total_kills / max(row.attack_attempts, 1) * 100, 1) if row.attack_attempts else 0,
                "attack_efficiency": round((row.total_kills - row.attack_errors - row.blocked_attacks) / max(row.attack_attempts, 1) * 100, 1) if row.attack_attempts else 0,
                "blocks": (row.solo_blocks or 0) + (row.block_assists or 0),
                "digs": row.digs or 0,
            }
            for row in rows
        ]
    }


@router.get("/trends", response_model=dict)
async def get_performance_trends(
    player_id: Optional[str] = None,
    team_id: Optional[str] = None,
    metric: str = "kills",
    matches: int = Query(10, ge=1, le=50),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get performance trends over recent matches."""
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func, desc
    from app.models.personnel import Player
    
    query = select(
        PlayerMatchStatistics.match_id,
        PlayerMatchStatistics.player_id,
        PlayerMatchStatistics.kills,
        PlayerMatchStatistics.attack_attempts,
        PlayerMatchStatistics.attack_errors,
        PlayerMatchStatistics.blocked_attacks,
        PlayerMatchStatistics.digs,
        PlayerMatchStatistics.service_aces,
        PlayerMatchStatistics.service_errors,
        Match.match_date,
    ).join(Match, PlayerMatchStatistics.match_id == Match.id)
    
    filters = []
    if player_id:
        query = query.where(PlayerMatchStatistics.player_id == UUID(player_id))
    if team_id:
        # Would need to join through team
        pass
    
    query = query.order_by(desc(Match.match_date)).limit(matches)
    result = await session.execute(query)
    rows = result.all()
    
    # Group by match date
    trends = {}
    for row in rows:
        date_key = row.match_date.isoformat() if row.match_date else "unknown"
        if date_key not in trends:
            trends[date_key] = {"date": date_key, "kills": 0, "errors": 0, "attempts": 0, "aces": 0}
        trends[date_key]["kills"] += row.kills or 0
        trends[date_key]["errors"] += row.attack_errors or 0
        trends[date_key]["attempts"] += row.attack_attempts or 0
        trends[date_key]["aces"] += row.service_aces or 0
        trends[date_key]["errors"] += row.service_errors or 0
    
    return {
        "metric": metric,
        "trends": [
            {
                "date": date,
                "kills": data["kills"],
                "errors": data["errors"],
                "attempts": data["attempts"],
                "aces": data["aces"],
                "service_errors": data["service_errors"],
                "efficiency": round((data["kills"] - data["errors"]) / max(data["attempts"], 1) * 100, 1) if data["attempts"] else 0,
            }
            for date, data in sorted(trends.items())
        ]
    }


@router.get("/reports/{report_id}", response_model=dict)
async def get_report(
    report_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a generated report."""
    # Would fetch from reports table
    return {"message": "Report retrieval not yet implemented"}


@router.post("/reports/generate", response_model=dict)
async def generate_report(
    match_id: Optional[str] = None,
    team_id: Optional[str] = None,
    player_id: Optional[str] = None,
    report_type: str = "match",
    format: str = "pdf",
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach", "analyst")),
):
    """Generate a report."""
    return {
        "message": "Report generation started",
        "report_id": "report_123",
        "status": "processing",
        "estimated_completion": "2 minutes"
    }


@router.get("/exports", response_model=list)
async def list_exports(
    skip: int = 0,
    limit: int = 20,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List generated exports/reports."""
    return [
        {
            "id": "export_1",
            "type": "match",
            "format": "pdf",
            "created_at": "2024-01-15T10:30:00Z",
            "download_url": "/api/v1/statistics/exports/export_1/download",
        }
    ]


@router.get("/exports/{export_id}/download")
async def download_export(
    export_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Download an exported report."""
    from fastapi.responses import StreamingResponse
    import io
    
    # Would generate and return the file
    return StreamingResponse(
        io.BytesIO(b"PDF content here"),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="report_{export_id}.pdf"'}
    )