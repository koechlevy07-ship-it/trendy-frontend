"""Team endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.organization import Team
from app.models.personnel import Player
from app.models.user import User, UserRole
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamDetailResponse, TeamListResponse

router = APIRouter()


@router.post("", response_model=TeamResponse, status_code=201)
async def create_team(
    team_data: TeamCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> TeamResponse:
    """Create a new team."""
    # Validate organization exists and user has access
    # For now, just create the team
    
    team = Team(
        organization_id=UUID(team_data.organization_id),
        name=team_data.name,
        short_name=team_data.short_name,
        gender=team_data.gender,
        age_category=team_data.age_category,
        competition_level=team_data.competition_level,
        logo_url=team_data.logo_url,
        primary_color=team_data.primary_color,
        secondary_color=team_data.secondary_color,
        home_venue=team_data.home_venue,
        founded_year=team_data.founded_year,
    )
    
    session.add(team)
    await session.commit()
    await session.refresh(team)
    
    return TeamResponse.model_validate(team)


@router.get("", response_model=TeamListResponse)
async def list_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    organization_id: Optional[str] = None,
    gender: Optional[str] = None,
    active_only: bool = True,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List teams with filtering and pagination."""
    from sqlalchemy import select, func
    from app.models.team import Team
    
    query = select(Team)
    
    if active_only:
        query = query.where(Team.is_active == True)
    
    # Filter by organization if user is not admin
    # (would add organization filtering logic here)
    
    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(Team.created_at.desc())
    
    result = await session.execute(query)
    teams = result.scalars().all()
    
    # Count total
    count_query = select(func.count()).select_from(Team)
    total = await session.scalar(count_query)
    
    return TeamListResponse(
        items=[TeamResponse.model_validate(t) for t in teams],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{team_id}", response_model=TeamDetailResponse)
async def get_team(
    team_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get team details with full roster and statistics."""
    from sqlalchemy.orm import selectinload
    from app.models.team import Team
    from app.models.personnel import Player
    
    query = select(Team).where(Team.id == team_id).options(
        selectinload(Team.players),
        selectinload(Team.coaches),
    )
    
    result = await session.execute(query)
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get players with stats
    players = []
    for player in team.players:
        player_dict = {
            "id": str(player.id),
            "jersey_number": player.jersey_number,
            "first_name": player.first_name,
            "last_name": player.last_name,
            "position": player.position,
            "height_cm": player.height_cm,
            "weight_kg": player.weight_kg,
            "is_libero": player.is_libero,
            "is_captain": player.is_captain,
            "is_active": player.is_active,
        }
        players.append(player_dict)
    
    # Get team statistics
    # (would calculate wins, losses, etc.)
    
    return TeamDetailResponse(
        **TeamResponse.model_validate(team).model_dump(),
        players=players,
        statistics={}  # Would add statistics here
    )


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    team_data: TeamUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Update team information."""
    from app.models.team import Team
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check permissions
    # (would add authorization logic here)
    
    update_data = team_data.model_dump(exclude_unset=True)
    for field, value in team_data.items():
        setattr(team, field, value)
    
    team.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(team)
    
    return TeamResponse.model_validate(team)


@router.delete("/{team_id}", status_code=204)
async def delete_team(
    team_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
):
    """Delete (deactivate) a team."""
    from app.models.team import Team
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team.is_active = False
    await session.commit()
    
    return None


@router.get("/{team_id}/roster", response_model=list)
async def get_team_roster(
    team_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get team roster with player details."""
    from app.models.personnel import Player
    from sqlalchemy import select
    from app.models.personnel import Player
    from app.models.team import Team
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get players with their statistics
    from sqlalchemy import select
    from app.models.personnel import Player
    
    query = select(Player).where(
        Player.team_id == team_id,
        Player.is_active == True
    ).order_by(Player.jersey_number)
    
    result = await session.execute(query)
    players = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "jersey_number": p.jersey_number,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "position": p.position.value if p.position else None,
            "height_cm": p.height_cm,
            "weight_kg": p.weight_kg,
            "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
            "is_libero": p.is_libero,
            "is_captain": p.is_captain,
            "is_active": p.is_active,
        }
        for p in team.players
    ]


@router.post("/{team_id}/players", status_code=201)
async def add_player_to_team(
    team_id: UUID,
    player_data: dict,  # Would use a Pydantic model
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Add a player to a team."""
    from app.models.personnel import Player
    from app.models.team import Team
    from uuid import UUID
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if jersey number already taken
    # (would add validation here)
    
    # Create player
    player = Player(
        team_id=team.id,
        jersey_number=player_data.get("jersey_number"),
        first_name=player_data["first_name"],
        last_name=player_data["last_name"],
        position=player_data["position"],
        height_cm=player_data.get("height_cm"),
        weight_kg=player_data.get("weight_kg"),
        date_of_birth=player_data.get("date_of_birth"),
        nationality=player_data.get("nationality"),
        dominant_hand=player_data.get("dominant_hand"),
        photo_url=player_data.get("photo_url"),
        is_libero=player_data.get("is_libero", False),
        is_captain=player_data.get("is_captain", False),
    )
    
    session.add(player)
    await session.commit()
    await session.refresh(player)
    
    return {"id": str(player.id), "message": "Player added to team"}


@router.delete("/{team_id}/players/{player_id}", status_code=204)
async def remove_player_from_team(
    team_id: UUID,
    player_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
):
    """Remove a player from a team (soft delete - deactivate)."""
    from app.models.personnel import Player
    
    player = await session.get(Player, player_id)
    if not player or str(player.team_id) != str(team_id):
        raise HTTPException(status_code=404, detail="Player not found in this team")
    
    player.is_active = False
    await session.commit()
    return None