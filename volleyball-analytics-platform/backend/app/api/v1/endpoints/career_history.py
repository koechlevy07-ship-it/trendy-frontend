"""Career History endpoints for Chapter 10."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.player import (
    CareerHistoryCreate,
    CareerHistoryUpdate,
    CareerHistoryResponse,
    CareerHistoryListResponse,
)
from app.services.player import PlayerService

router = APIRouter()


def get_player_service(session=Depends(get_db)) -> PlayerService:
    """Get player service instance."""
    return PlayerService(session)


@router.post("/players/{player_id}/career", response_model=CareerHistoryResponse, status_code=201)
async def create_career_record(
    player_id: UUID,
    career_data: CareerHistoryCreate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Create a career history record for a player."""
    try:
        career = await player_service.create_career_record(player_id, career_data, current_user.id)
        return career
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/players/{player_id}/career", response_model=CareerHistoryListResponse)
async def get_career_history(
    player_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get player career history with pagination."""
    career = await player_service.get_career_history(player_id)
    total = len(career)
    items = career[(page - 1) * per_page:page * per_page]
    return CareerHistoryListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page,
    )


@router.get("/players/{player_id}/career/season/{season}", response_model=Optional[CareerHistoryResponse])
async def get_career_by_season(
    player_id: UUID,
    season: str,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get career history by season."""
    return await player_service.get_career_by_season(player_id, season)


@router.get("/players/{player_id}/career/organization/{organization}", response_model=List[CareerHistoryResponse])
async def get_career_by_organization(
    player_id: UUID,
    organization: str,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get career history by organization."""
    return await player_service.get_career_by_organization(player_id, organization)


@router.get("/players/{player_id}/awards", response_model=List[str])
async def get_player_awards(
    player_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get all awards for a player."""
    return await player_service.get_awards(player_id)


@router.put("/career/{career_id}", response_model=CareerHistoryResponse)
async def update_career_record(
    career_id: UUID,
    career_data: CareerHistoryUpdate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Update a career history record (only if not archived)."""
    try:
        return await player_service.update_career_record(career_id, career_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/career/{career_id}/archive", response_model=CareerHistoryResponse)
async def archive_career_record(
    career_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Archive a career history record (makes it immutable)."""
    try:
        return await player_service.archive_career_record(career_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))