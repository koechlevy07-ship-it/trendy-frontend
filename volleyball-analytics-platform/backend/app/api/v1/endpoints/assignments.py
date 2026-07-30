"""Assignment endpoints for Chapter 10."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.staff import (
    StaffAssignmentCreate,
    StaffAssignmentUpdate,
    StaffAssignmentResponse,
)
from app.services.assignment import AssignmentService

router = APIRouter()


def get_assignment_service(session=Depends(get_db)) -> AssignmentService:
    """Get assignment service instance."""
    return AssignmentService(session)


@router.post("/assignments", response_model=StaffAssignmentResponse, status_code=201)
async def create_assignment(
    assignment_data: StaffAssignmentCreate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Create a new staff assignment."""
    try:
        assignment = await assignment_service.assign_staff(assignment_data, current_user.id)
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/assignments/transfer", response_model=StaffAssignmentResponse)
async def transfer_staff(
    staff_id: UUID = Query(...),
    new_organization_id: UUID = Query(...),
    new_club_id: Optional[UUID] = Query(None),
    new_team_id: Optional[UUID] = Query(None),
    new_season_id: Optional[UUID] = Query(None),
    new_role: Optional[str] = Query(None),
    new_employment_type: Optional[str] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Transfer staff to another organization (closes old, creates new)."""
    try:
        return await assignment_service.transfer_staff(
            staff_id=staff_id,
            new_organization_id=new_organization_id,
            current_user_id=current_user.id,
            new_club_id=new_club_id,
            new_team_id=new_team_id,
            new_season_id=new_season_id,
            new_role=new_role,
            new_employment_type=new_employment_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/assignments/{assignment_id}/terminate", response_model=dict)
async def terminate_assignment(
    assignment_id: UUID,
    end_date: str = Query(...),
    reason: Optional[str] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Terminate a staff assignment."""
    try:
        end_dt = datetime.fromisoformat(end_date)
        success = await assignment_service.terminate_assignment(
            assignment_id, end_dt, current_user.id
        )
        return {"success": success, "message": "Assignment terminated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/assignments/current/{staff_id}", response_model=Optional[StaffAssignmentResponse])
async def get_current_assignment(
    staff_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get current active assignment for staff."""
    return await assignment_service.get_current_assignment(staff_id)


@router.get("/assignments/history/{staff_id}", response_model=List[StaffAssignmentResponse])
async def get_assignment_history(
    staff_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get assignment history for staff."""
    return await assignment_service.get_assignment_history(staff_id)


@router.get("/assignments/season/{season_id}", response_model=List[StaffAssignmentResponse])
async def get_season_assignments(
    season_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get all assignments for a season."""
    return await assignment_service.get_season_assignments(season_id)


@router.get("/assignments/organization/{organization_id}", response_model=List[StaffAssignmentResponse])
async def get_organization_assignments(
    organization_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get all assignments for an organization."""
    return await assignment_service.get_organization_assignments(organization_id)


# Coach Assignment Endpoints
@router.post("/coach-assignments", response_model=StaffAssignmentResponse, status_code=201)
async def assign_coach(
    staff_id: UUID = Query(...),
    team_id: UUID = Query(...),
    organization_id: UUID = Query(...),
    role: str = Query("head_coach"),
    is_head_coach: bool = Query(False),
    season_id: Optional[UUID] = Query(None),
    start_date: Optional[str] = Query(None),
    responsibilities: Optional[str] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Assign a coach to a team."""
    try:
        from app.models.core import CoachRole
        valid_roles = [r.value for r in CoachRole]
        if role not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid coach role: {role}")

        start_dt = datetime.fromisoformat(start_date) if start_date else datetime.utcnow()
        return await assignment_service.assign_coach(
            staff_id=staff_id,
            team_id=UUID(team_id),
            organization_id=UUID(organization_id),
            current_user_id=UUID("current_user_placeholder"),
            role=role,
            is_head_coach=is_head_coach,
            season_id=UUID(season_id) if season_id else None,
            start_date=start_dt,
            responsibilities=responsibilities.split(",") if responsibilities else [],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/coach-assignments/team/{team_id}", response_model=List[dict])
async def get_coach_assignments(
    team_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get all coach assignments for a team."""
    return await assignment_service.get_coach_assignments(team_id)


@router.get("/coach-assignments/head-coach/{team_id}", response_model=Optional[dict])
async def get_head_coach(
    team_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get head coach for a team."""
    assignment = await assignment_service.get_head_coach(team_id)
    return assignment


# Referee Assignment Endpoints
@router.post("/referee-assignments", response_model=dict, status_code=201)
async def assign_referee(
    staff_id: UUID = Query(...),
    match_id: UUID = Query(...),
    organization_id: UUID = Query(...),
    role: str = Query("first_referee"),
    referee_level: Optional[str] = Query(None),
    assigned_by: UUID = Query(...),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Assign a referee to a match."""
    try:
        from app.models.core import OfficialRole, RefereeLevel
        if role not in [r.value for r in OfficialRole]:
            raise HTTPException(status_code=400, detail=f"Invalid referee role: {role}")

        if referee_level and referee_level not in [r.value for r in RefereeLevel]:
            raise HTTPException(status_code=400, detail=f"Invalid referee level: {referee_level}")

        return await assignment_service.assign_referee(
            staff_id=staff_id,
            match_id=match_id,
            organization_id=organization_id,
            current_user_id=assigned_by,
            role=role,
            referee_level=referee_level,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/referee-assignments/{match_id}/{staff_id}/{role}/confirm", response_model=bool)
async def confirm_referee_assignment(
    match_id: UUID,
    staff_id: UUID,
    role: str,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Confirm a referee assignment."""
    confirmed = await assignment_service.confirm_referee_assignment(
        match_id, staff_id, role, current_user.id
    )
    return confirmed


@router.get("/referee-assignments/match/{match_id}", response_model=List[dict])
async def get_referee_assignments(
    match_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get all referee assignments for a match."""
    return await assignment_service.get_referee_assignments(match_id)


# Medical Staff Assignment
@router.post("/medical-assignments", response_model=dict, status_code=201)
async def assign_medical_staff(
    staff_id: UUID = Query(...),
    organization_id: UUID = Query(...),
    medical_role: str = Query(...),
    team_id: Optional[UUID] = Query(None),
    player_id: Optional[UUID] = Query(None),
    is_primary: bool = Query(False),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    responsibilities: Optional[str] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "medical")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Assign medical staff to team/player."""
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else datetime.utcnow()
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        return await assignment_service.assign_medical_staff(
            staff_id=staff_id,
            organization_id=organization_id,
            current_user_id=current_user.id,
            medical_role=medical_role,
            team_id=team_id,
            player_id=player_id,
            is_primary=is_primary,
            start_date=start_dt,
            end_date=end_dt,
            responsibilities=responsibilities.split(",") if responsibilities else [],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/medical-assignments/organization/{organization_id}", response_model=List[dict])
async def get_medical_assignments(
    organization_id: UUID,
    team_id: Optional[UUID] = Query(None),
    player_id: Optional[UUID] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get medical assignments."""
    if team_id:
        return await assignment_service.get_medical_assignments(team_id=team_id)
    elif player_id:
        return await assignment_service.get_medical_assignments(player_id=player_id)
    else:
        return await assignment_service.get_medical_assignments(organization_id=organization_id)


# Technical Staff Assignment
@router.post("/technical-assignments", response_model=dict, status_code=201)
async def assign_technical_staff(
    staff_id: UUID = Query(...),
    organization_id: UUID = Query(...),
    technical_role: str = Query(...),
    team_id: Optional[UUID] = Query(None),
    competition_id: Optional[UUID] = Query(None),
    is_primary: bool = Query(False),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    responsibilities: Optional[str] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Assign technical staff to team/competition."""
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else datetime.utcnow()
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        return await assignment_service.assign_technical_staff(
            staff_id=staff_id,
            organization_id=organization_id,
            current_user_id=current_user.id,
            technical_role=technical_role,
            team_id=team_id,
            competition_id=competition_id,
            is_primary=is_primary,
            start_date=start_dt,
            end_date=end_dt,
            responsibilities=responsibilities.split(",") if responsibilities else [],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/technical-assignments/organization/{organization_id}", response_model=List[dict])
async def get_technical_assignments(
    organization_id: UUID,
    team_id: Optional[UUID] = Query(None),
    competition_id: Optional[UUID] = Query(None),
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    assignment_service: AssignmentService = Depends(get_assignment_service),
):
    """Get technical assignments."""
    if team_id:
        return await assignment_service.get_technical_assignments(team_id=team_id)
    elif competition_id:
        return await assignment_service.get_technical_assignments(competition_id=competition_id)
    else:
        return await assignment_service.get_technical_assignments(organization_id=organization_id)