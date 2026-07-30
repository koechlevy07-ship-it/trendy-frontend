"""
Match endpoints.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.match import Match, MatchStatus, MatchFormat
from app.models.team import Team
from app.models.user import User, UserRole
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse, MatchDetailResponse, MatchListResponse

router = APIRouter()


@router.post("", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    match_data: MatchCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """Create a new match."""
    # Validate teams exist and belong to user's organization
    home_team = await session.get(Team, match_data.home_team_id)
    away_team = await session.get(Team, match_data.away_team_id)
    
    if not home_team or not away_team:
        raise HTTPException(status_code=404, detail="One or both teams not found")
    
    if home_team.id == away_team_id:
        raise HTTPException(status_code=400, detail="Home and away teams must be different")
    
    # Check permissions
    if current_user.role not in ["admin", "org_admin"]:
        if home_team.organization_id != current_user.organization_id or away_team.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to create matches for these teams")
    
    match = Match(
        tournament_id=match_data.tournament_id,
        court_id=match_data.court_id,
        home_team_id=match_data.home_team_id,
        away_team_id=match_data.away_team_id,
        match_date=match_data.match_date,
        start_time=match_data.start_time,
        sets_format=match_data.sets_format,
        venue=match_data.venue,
        status=MatchStatus.SCHEDULED,
    )
    
    session.add(match)
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.get("", response_model=MatchListResponse)
async def list_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[MatchStatus] = None,
    tournament_id: Optional[str] = None,
    team_id: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach", "analyst")),
) -> MatchListResponse:
    """List matches with filtering and pagination."""
    query = select(Match).options(
        selectinload(Match.home_team),
        selectinload(Match.away_team),
        selectinload(Match.tournament),
        selectinload(Match.winner_team),
    )
    
    # Apply filters
    if current_user.role not in ["admin", "org_admin"]:
        # Filter by user's organization teams
        user_team_ids = select(Team.id).where(Team.organization_id == current_user.organization_id)
        query = query.where(
            or_(
                Match.home_team_id.in_(user_team_ids),
                Match.away_team_id.in_(user_team_ids),
            )
        )
    
    if status:
        query = query.where(Match.status == status)
    if tournament_id:
        query = query.where(Match.tournament_id == UUID(tournament_id))
    if team_id:
        query = query.where(
            or_(Match.home_team_id == UUID(team_id), Match.away_team_id == UUID(team_id))
        )
    if date_from:
        query = query.where(Match.match_date >= date_from)
    if date_to:
        query = query.where(Match.match_date <= date_to)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)
    
    query = query.order_by(Match.match_date.desc()).offset(skip).limit(limit)
    
    result = await session.execute(query)
    matches = result.scalars().all()
    
    return MatchListResponse(
        items=[MatchResponse.model_validate(m) for m in matches],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/live", response_model=list[MatchResponse])
async def list_live_matches(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[MatchResponse]:
    """Get currently live matches."""
    query = select(Match).where(
        Match.status.in_([MatchStatus.LIVE, MatchStatus.PAUSED])
    ).options(
        selectinload(Match.home_team),
        selectinload(Match.away_team),
    ).order_by(Match.match_date.desc())
    
    result = await session.execute(query)
    matches = result.scalars().all()
    
    return [MatchResponse.model_validate(m) for m in matches]


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> MatchDetailResponse:
    """Get match details with all related data."""
    query = select(Match).where(Match.id == match_id).options(
        selectinload(Match.home_team),
        selectinload(Match.away_team),
        selectinload(Match.sets),
        selectinload(Match.lineups),
        selectinload(Match.events),
    )
    
    result = await session.execute(select(Match).where(Match.id == match_id).options(
        selectinload(Match.home_team),
        selectinload(Match.away_team),
        selectinload(Match.tournament),
        selectinload(Match.sets),
        selectinload(Match.lineups),
        selectinload(Match.events),
    ))
    match = result.scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Check permissions
    if current_user.role not in ["admin", "org_admin"]:
        if match.home_team.organization_id != current_user.organization_id and match.away_team.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this match")
    
    return MatchDetailResponse.model_validate(match)


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: UUID,
    match_data: MatchUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """Update match details."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Check permissions
    if current_user.role not in ["admin", "org_admin"] and match.home_team.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = match_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(match, field, value)
    
    match.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.post("/{match_id}/start", response_model=MatchResponse)
async def start_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """Start a match (change status to live)."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status != "scheduled":
        raise HTTPException(status_code=400, detail=f"Cannot start match with status {match.status}")
    
    match.status = MatchStatus.LIVE
    match.start_time = datetime.utcnow()
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.post("/{match_id}/pause", response_model=MatchResponse)
async def pause_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """Pause a live match."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status != "live":
        raise HTTPException(status_code=400, detail="Can only pause live matches")
    
    match.status = "paused"
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.post("/{match_id}/resume", response_model=MatchResponse)
async def resume_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """Resume a paused match."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status != "paused":
        raise HTTPException(status_code=400, detail="Can only resume paused matches")
    
    match.status = "live"
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.post("/{match_id}/end", response_model=MatchResponse)
async def end_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
) -> MatchResponse:
    """End a match."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status not in ["live", "paused"]:
        raise HTTPException(status_code=400, detail="Can only end live or paused matches")
    
    match.status = "completed"
    match.end_time = datetime.utcnow()
    await session.commit()
    await session.refresh(match)
    
    return MatchResponse.model_validate(match)


@router.delete("/{match_id}", status_code=204)
async def delete_match(
    match_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
) -> None:
    """Delete a match (only if not started)."""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.status not in ["scheduled", "cancelled"]:
        raise HTTPException(status_code=400, detail="Can only delete scheduled or cancelled matches")
    
    await session.delete(match)
    await session.commit()