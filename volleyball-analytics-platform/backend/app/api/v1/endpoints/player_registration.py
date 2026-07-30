"""Player Registration endpoints for Chapter 10."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.player import (
    PlayerRegistrationCreate,
    PlayerRegistrationUpdate,
    PlayerRegistrationResponse,
)
from app.services.player import PlayerService

router = APIRouter()


def get_player_service(session=Depends(get_db)) -> PlayerService:
    """Get player service instance."""
    return PlayerService(session)


@router.post("/players/{player_id}/registration", response_model=PlayerRegistrationResponse, status_code=201)
async def create_registration(
    player_id: UUID,
    registration_data: PlayerRegistrationCreate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Create player registration."""
    try:
        registration = await player_service.create_registration(
            player_id, registration_data, current_user.id
        )
        return registration
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/players/{player_id}/registration", response_model=PlayerRegistrationResponse)
async def get_registration(
    player_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get player registration."""
    return await player_service.get_registration(player_id)


@router.put("/players/{player_id}/registration", response_model=PlayerRegistrationResponse)
async def update_registration(
    player_id: UUID,
    registration_data: PlayerRegistrationUpdate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Update player registration."""
    try:
        return await player_service.update_registration(player_id, registration_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/registrations/expiring", response_model=List[PlayerRegistrationResponse])
async def get_expiring_registrations(
    days: int = Query(30, ge=1, le=365),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get registrations expiring within specified days."""
    return await player_service.get_expiring_registrations(days)


@router.get("/registrations/by-license/{license_number}", response_model=PlayerRegistrationResponse)
async def get_registration_by_license(
    license_number: str,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Find registration by license number."""
    return await player_service.get_registration_by_license(license_number)