"""Player endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.personnel import Player, Position
from app.models.team import Team
from app.models.user import User, UserRole
from app.schemas.player import PlayerCreate, PlayerUpdate, PlayerResponse, PlayerDetailResponse, PlayerListResponse
from app.core.database import get_db as get_db
from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.models.personnel import Player, Position
from app.models.team import Team
from app.models.user import User, UserRole
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.personnel import Player, Position
from app.models.team import Team
from app.models.user import User, UserRole
from app.schemas.player import PlayerCreate, PlayerUpdate, PlayerResponse, PlayerDetailResponse, PlayerListResponse
from app.core.database import get_db as get_db
from app.api.v1.endpoints.auth import get_current_active_user, require_role

router = APIRouter()


@router.post("", response_model=PlayerResponse, status_code=201)
async def create_player(
    player_data: PlayerCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Create a new player."""
    from app.models.personnel import Player
    from app.models.team import Team
    from uuid import UUID
    
    # Validate team exists
    team = await session.get(Team, UUID(player_data.team_id))
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check jersey number uniqueness within team
    result = await session.execute(
        select(Player).where(
            Player.team_id == UUID(player_data.team_id),
            Player.jersey_number == player_data.jersey_number,
            Player.is_active == True
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail=f"Jersey number {player_data.jersey_number} already taken in this team"
        )
    
    player = Player(
        team_id=UUID(player_data.team_id),
        jersey_number=player_data.jersey_number,
        first_name=player_data.first_name,
        last_name=player_data.last_name,
        position=player_data.position,
        height_cm=player_data.height_cm,
        weight_kg=player_data.weight_kg,
        date_of_birth=player_data.date_of_birth,
        nationality=player_data.nationality,
        dominant_hand=player_data.dominant_hand,
        photo_url=player_data.photo_url,
        is_libero=player_data.is_libero,
        is_captain=player_data.is_captain,
    )
    
    session.add(player)
    await session.commit()
    await session.refresh(player)
    
    return player


@router.get("", response_model=PlayerListResponse)
async def list_players(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    team_id: Optional[str] = None,
    position: Optional[str] = None,
    active_only: bool = True,
    search: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List players with filtering and pagination."""
    from sqlalchemy import select, func, or_
    from app.models.personnel import Player
    from sqlalchemy import select, func, or_
    
    query = select(Player)
    
    if active_only:
        query = query.where(Player.is_active == True)
    
    if team_id:
        query = query.where(Player.team_id == UUID(team_id))
    
    if position:
        query = query.where(Player.position == position)
    
    if search:
        query = query.where(
            (Player.first_name.ilike(f"%{search}%")) |
            (Player.last_name.ilike(f"%{search}%")) |
            (Player.jersey_number == int(search) if search.isdigit() else False)
        )
    
    # Count total
    count_query = select(func.count()).select_from(Player)
    # Apply same filters...
    
    query = query.offset(skip).limit(limit).order_by(Player.last_name, Player.first_name)
    
    result = await session.execute(query)
    players = result.scalars().all()
    
    # Count total
    count_query = select(func.count()).select_from(Player)
    total = await session.scalar(count_query)
    
    return PlayerListResponse(
        items=[PlayerResponse.model_validate(p) for p in players],
        total=total,
        page=skip // limit + 1,
        size=limit,
    )


@router.get("/{player_id}", response_model=PlayerDetailResponse)
async def get_player(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get player details with statistics."""
    from sqlalchemy.orm import selectinload
    from app.models.personnel import Player
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import select, func
    from uuid import UUID
    
    query = select(Player).where(Player.id == UUID(player_id)).options(
        selectinload(Player.team),
        selectinload(Player.statistics)
    )
    
    result = await session.execute(query)
    player = result.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get statistics
    from app.models.personnel import PlayerMatchStatistics
    from sqlalchemy import func
    
    stats_query = select(
        func.sum(PlayerMatchStatistics.kills).label("total_kills"),
        func.sum(PlayerMatchStatistics.attack_attempts).label("total_attacks"),
        func.sum(PlayerMatchStatistics.kills).label("total_kills"),
        func.sum(PlayerMatchStatistics.attack_errors).label("total_errors"),
        func.sum(PlayerMatchStatistics.blocked_attacks).label("total_blocked"),
        func.sum(PlayerMatchStatistics.solo_blocks).label("solo_blocks"),
        func.sum(PlayerMatchStatistics.block_assists).label("block_assists"),
        func.sum(PlayerMatchStatistics.digs).label("total_digs"),
        func.sum(PlayerMatchStatistics.saves).label("total_saves"),
        func.sum(PlayerMatchStatistics.service_aces).label("total_aces"),
        func.sum(PlayerMatchStatistics.service_errors).label("total_service_errors"),
        func.sum(PlayerMatchStatistics.total_serves).label("total_serves"),
        func.sum(PlayerMatchStatistics.assists).label("total_assists"),
        func.sum(PlayerMatchStatistics.setting_errors).label("total_setting_errors"),
        func.sum(PlayerMatchStatistics.reception_attempts).label("reception_attempts"),
        func.sum(PlayerMatchStatistics.perfect_receptions).label("perfect_receptions"),
        func.sum(PlayerMatchStatistics.reception_errors).label("reception_errors"),
    ).where(
        PlayerMatchStatistics.player_id == UUID(player_id)
    )
    
    result = await session.execute(stats_query)
    stats = result.first()
    
    # Calculate derived stats
    total_attacks = player.total_attacks or 0
    total_kills = player.total_kills or 0
    total_errors = player.total_errors or 0
    total_blocked = player.blocked_attacks or 0
    total_attempts = player.attack_attempts or 0
    
    attack_efficiency = 0.0
    if player.total_attacks and player.total_attacks > 0:
        efficiency = (player.total_kills - player.attack_errors - player.blocked_attacks) / player.total_attacks * 100
    else:
        efficiency = 0.0
    
    serve_pct = 0.0
    if player.total_serves and player.total_serves > 0:
        serve_pct = (player.total_serves - player.service_errors) / player.total_serves * 100
    
    player_dict = {
        "id": str(player.id),
        "team_id": str(player.team_id),
        "jersey_number": player.jersey_number,
        "first_name": player.first_name,
        "last_name": player.last_name,
        "full_name": f"{player.first_name} {player.last_name}",
        "position": player.position.value if player.position else None,
        "height_cm": player.height_cm,
        "weight_kg": player.weight_kg,
        "date_of_birth": player.date_of_birth.isoformat() if player.date_of_birth else None,
        "nationality": player.nationality,
        "dominant_hand": player.dominant_hand,
        "photo_url": player.photo_url,
        "is_libero": player.is_libero,
        "is_captain": player.is_captain,
        "is_active": player.is_active,
        "created_at": player.created_at,
        "updated_at": player.updated_at,
        "statistics": {
            "matches_played": player.sets_played or 0,
            "total_serves": player.total_serves or 0,
            "service_aces": player.service_aces or 0,
            "service_errors": player.service_errors or 0,
            "serve_percentage": round((player.total_serves - player.service_errors) / player.total_serves * 100, 1) if player.total_serves else 0,
            "attack_attempts": player.attack_attempts or 0,
            "kills": player.kills or 0,
            "attack_errors": player.attack_errors or 0,
            "blocked_attacks": player.blocked_attacks or 0,
            "kill_percentage": round(player.kills / max(player.attack_attempts, 1) * 100, 1) if player.attack_attempts else 0,
            "attack_efficiency": round((player.kills - player.attack_errors - player.blocked_attacks) / max(player.attack_attempts, 1) * 100, 1) if player.attack_attempts else 0,
            "solo_blocks": player.solo_blocks or 0,
            "block_assists": player.block_assists or 0,
            "total_blocks": (player.solo_blocks or 0) + (player.block_assists or 0),
            "digs": player.digs or 0,
            "saves": player.saves or 0,
            "reception_attempts": player.reception_attempts or 0,
            "perfect_receptions": player.perfect_receptions or 0,
            "reception_errors": player.reception_errors or 0,
            "reception_percentage": round((player.perfect_receptions or 0) / max(player.reception_attempts, 1) * 100, 1) if player.reception_attempts else 0,
            "set_attempts": player.set_attempts or 0,
            "assists": player.assists or 0,
            "setting_errors": player.setting_errors or 0,
            "solo_blocks": player.solo_blocks or 0,
            "block_assists": player.block_assists or 0,
            "block_errors": player.block_errors or 0,
            "digs": player.digs or 0,
            "saves": player.saves or 0,
            "total_serves": player.total_serves or 0,
            "service_aces": player.service_aces or 0,
            "service_errors": player.service_errors or 0,
            "serve_percentage": round((player.total_serves - player.service_errors) / max(player.total_serves, 1) * 100, 1) if player.total_serves else 0,
            "kill_percentage": round((player.kills or 0) / max(player.attack_attempts, 1) * 100, 1) if player.attack_attempts else 0,
            "attack_efficiency": round((player.kills - player.attack_errors - player.blocked_attacks) / max(player.attack_attempts, 1) * 100, 1) if player.attack_attempts else 0,
            "serve_percentage": round((player.total_serves - player.service_errors) / max(player.total_serves, 1) * 100, 1) if player.total_serves else 0,
            "assist_percentage": round(player.assists / max(player.set_attempts, 1) * 100, 1) if player.set_attempts else 0,
            "reception_percentage": round((player.perfect_receptions + player.good_receptions) / max(player.reception_attempts, 1) * 100, 1) if player.reception_attempts else 0,
        }
    }

    return PlayerDetailResponse(**player_dict)


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: UUID,
    player_data: PlayerUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Update player information."""
    from app.models.personnel import Player
    from sqlalchemy import select
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Check jersey number uniqueness if changed
    if player_data.jersey_number is not None and player_data.jersey_number != player.jersey_number:
        from sqlalchemy import select
        existing = await session.execute(
            select(Player).where(
                Player.team_id == player.team_id,
                Player.jersey_number == player_data.jersey_number,
                Player.id != player.id,
                Player.is_active == True
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Jersey number already taken in this team")
    
    update_data = player_data.model_dump(exclude_unset=True)
    for field, value in player_data.model_dump(exclude_unset=True).items():
        setattr(player, field, value)
    
    player.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(player)
    
    return PlayerResponse.model_validate(player)


@router.delete("/{player_id}", status_code=204)
async def delete_player(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Deactivate a player (soft delete)."""
    from app.models.personnel import Player
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player.is_active = False
    await session.commit()
    return None


@router.post("/{player_id}/captain", status_code=200)
async def set_captain(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Set a player as team captain."""
    from app.models.personnel import Player
    from sqlalchemy import update
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Remove captain from other players on same team
    from sqlalchemy import update
    await session.execute(
        update(Player)
        .where(Player.team_id == player.team_id)
        .values(is_captain=False)
    )
    
    player.is_captain = True
    await session.commit()
    
    return {"message": "Player set as captain"}


@router.post("/{player_id}/captain", status_code=200)
async def remove_captain(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Remove captain designation from player."""
    from app.models.personnel import Player
    from sqlalchemy import update
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player.is_captain = False
    await session.commit()
    
    return {"message": "Captain designation removed"}


@router.post("/{player_id}/libero", status_code=200)
async def set_libero(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Set player as libero."""
    from app.models.personnel import Player
    from sqlalchemy import update
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Remove libero from other players on team
    from sqlalchemy import update
    await session.execute(
        update(Player)
        .where(Player.team_id == player.team_id)
        .values(is_libero=False)
    )
    
    player.is_libero = True
    await session.commit()
    
    return {"message": "Player set as libero"}


@router.delete("/{player_id}/libero", status_code=200)
async def remove_libero(
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Remove libero designation from player."""
    from app.models.personnel import Player
    
    player = await session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    player.is_libero = False
    await session.commit()
    
    return {"message": "Libero designation removed"}


@router.get("/team/{team_id}/roster", response_model=list)
async def get_team_roster(
    team_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get full team roster with player details."""
    from app.models.personnel import Player
    from app.models.team import Team
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    from sqlalchemy import select
    from app.models.personnel import Player
    from sqlalchemy.orm import selectinload
    
    query = select(Team).where(Team.id == team_id).options(selectinload(Team.players))
    result = await session.execute(query)
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    roster = []
    for player in sorted(team.players, key=lambda p: p.jersey_number):
        roster.append({
            "id": str(p.id),
            "jersey_number": p.jersey_number,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "position": p.position.value if p.position else None,
            "height_cm": p.height_cm,
            "weight_kg": p.weight_kg,
            "is_libero": p.is_libero,
            "is_captain": p.is_captain,
            "is_active": p.is_active,
        })
    
    return {
        "team_id": str(team.id),
        "team_name": team.name,
        "roster": sorted(roster, key=lambda x: x["jersey_number"])
    }