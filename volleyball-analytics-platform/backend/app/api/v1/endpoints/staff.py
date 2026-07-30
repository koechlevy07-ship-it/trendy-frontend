"""Staff endpoints for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.staff import (
    StaffCreate,
    StaffUpdate,
    StaffResponse,
    StaffListResponse,
    StaffAssignmentCreate,
    StaffAssignmentUpdate,
    StaffAssignmentResponse,
    StaffAssignmentListResponse,
    StaffMedicalInfoCreate,
    StaffMedicalInfoResponse,
    StaffDocumentCreate,
    StaffDocumentResponse,
    StaffSearchParams,
    StaffAssignmentSearchParams,
)
from app.services.staff import StaffService
from app.services.assignment import AssignmentService
from app.core.events import event_publisher


router = APIRouter()


# Dependency providers
async def get_staff_service(
    session: AsyncSession = Depends(get_db),
) -> StaffService:
    """Get staff service instance."""
    return StaffService(session, event_publisher)


async def get_assignment_service(
    session: AsyncSession = Depends(get_db),
) -> AssignmentService:
    """Get assignment service instance."""
    return AssignmentService(session, event_publisher)


# Staff CRUD
@router.post("", response_model=StaffResponse, status_code=201)
async def create_staff(
    staff_data: StaffCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Register a new staff member."""
    try:
        staff = await staff_service.create_staff(staff_data, current_user.id)
        return staff
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=StaffListResponse)
async def list_staff(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    organization_id: Optional[str] = None,
    role: Optional[str] = None,
    employment_status: Optional[str] = None,
    is_active: Optional[bool] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """List staff with filtering and pagination."""
    filters = {}
    if organization_id:
        filters["organization_id"] = UUID(organization_id)
    if role:
        filters["role"] = role
    if employment_status:
        filters["employment_status"] = employment_status
    if is_active is not None:
        filters["is_active"] = is_active

    staff = await staff_service.list_staff(page=page, per_page=per_page, filters=filters)
    total = await staff_service.staff_repo.count(filters)

    return StaffListResponse(
        items=staff,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page,
    )


@router.get("/search", response_model=List[StaffResponse])
async def search_staff(
    q: str = Query(..., min_length=1, description="Search query"),
    organization_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Search staff by name or email."""
    org_id = UUID(organization_id) if organization_id else None
    return await staff_service.search_staff(q, org_id, skip=(page - 1) * per_page, limit=per_page)


@router.get("/{staff_id}", response_model=StaffResponse)
async def get_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get staff by ID."""
    return await staff_service.get_staff(staff_id)


@router.put("/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: UUID,
    staff_data: StaffUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Update staff profile."""
    try:
        return await staff_service.update_staff(staff_id, staff_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{staff_id}", status_code=204)
async def delete_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Soft delete a staff member."""
    await staff_service.soft_delete(staff_id, current_user.id)
    return None


@router.post("/{staff_id}/restore", response_model=StaffResponse)
async def restore_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Restore a soft-deleted staff member."""
    return await staff_service.restore(staff_id, current_user.id)


# Employment Status
@router.post("/{staff_id}/activate", response_model=StaffResponse)
async def activate_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Activate a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.ACTIVE, current_user.id
    )


@router.post("/{staff_id}/suspend", response_model=StaffResponse)
async def suspend_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Suspend a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.SUSPENDED, current_user.id
    )


@router.post("/{staff_id}/terminate", response_model=StaffResponse)
async def terminate_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Terminate a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.TERMINATED, current_user.id
    )


@router.post("/{staff_id}/restore", response_model=StaffResponse)
async def restore_staff_status(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Restore a soft-deleted staff member."""
    return await staff_service.restore(staff_id, current_user.id)


# Organization Assignment
@router.post("/{staff_id}/assign", response_model=StaffAssignmentResponse)
async def assign_staff(
    staff_id: UUID,
    assignment_data: StaffAssignmentCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Assign staff to organization/club/team."""
    try:
        return await staff_service.assign_organization(
            staff_id=staff_id,
            organization_id=assignment_data.organization_id,
            current_user_id=current_user.id,
            club_id=assignment_data.club_id,
            team_id=assignment_data.team_id,
            season_id=assignment_data.season_id,
            role=assignment_data.role,
            employment_type=assignment_data.employment_type,
            start_date=assignment_data.start_date,
            responsibilities=assignment_data.responsibilities,
            is_primary=assignment_data.is_primary,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{staff_id}/transfer", response_model=StaffAssignmentResponse)
async def transfer_staff(
    staff_id: UUID,
    assignment_data: StaffAssignmentCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Transfer staff to another organization/club/team."""
    try:
        return await staff_service.transfer_organization(
            staff_id=staff_id,
            new_organization_id=assignment_data.organization_id,
            current_user_id=current_user.id,
            new_club_id=assignment_data.club_id,
            new_team_id=assignment_data.team_id,
            new_season_id=assignment_data.season_id,
            new_role=assignment_data.role,
            new_employment_type=assignment_data.employment_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{staff_id}/assignments/current", response_model=Optional[StaffAssignmentResponse])
async def get_current_assignment(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get current active assignment for staff."""
    return await staff_service.get_current_assignment(staff_id)


@router.get("/{staff_id}/assignments/history", response_model=List[StaffAssignmentResponse])
async def get_assignment_history(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get assignment history for staff."""
    return await staff_service.get_assignment_history(staff_id)


@router.get("/assignments/season/{season_id}", response_model=List[StaffAssignmentResponse])
async def get_season_assignments(
    season_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get all assignments for a season."""
    return await staff_service.get_season_assignments(season_id)


@router.get("/assignments/organization/{organization_id}", response_model=List[StaffAssignmentResponse])
async def get_organization_assignments(
    organization_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get all assignments for an organization."""
    return await staff_service.get_organization_assignments(organization_id)


# Medical Info
@router.post("/{staff_id}/medical", response_model=StaffMedicalInfoResponse, status_code=201)
async def create_medical_info(
    staff_id: UUID,
    medical_data: StaffMedicalInfoCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "medical")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Create medical info for staff."""
    try:
        return await staff_service.create_medical_info(staff_id, medical_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{staff_id}/medical", response_model=Optional[StaffMedicalInfoResponse])
async def get_medical_info(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "medical")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get medical info for staff."""
    return await staff_service.get_medical_info(staff_id)


# Documents
@router.post("/{staff_id}/documents", response_model=StaffDocumentResponse, status_code=201)
async def create_document(
    staff_id: UUID,
    document_data: StaffDocumentCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Upload a document for staff."""
    try:
        return await staff_service.create_document(staff_id, document_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{staff_id}/documents", response_model=List[StaffDocumentResponse])
async def get_documents(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get all documents for staff."""
    return await staff_service.get_documents(staff_id)


@router.get("/documents/expiring", response_model=List[StaffDocumentResponse])
async def get_expiring_documents(
    days: int = Query(30, ge=1, le=365),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Get documents expiring within specified days."""
    return await staff_service.get_expiring_documents(days)


# Search endpoints
@router.get("/find-by-role", response_model=List[StaffResponse])
async def find_staff_by_role(
    role: str,
    organization_id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Find staff by role in organization."""
    return await staff_service.find_by_role(role, UUID(organization_id))


@router.get("/find-by-organization/{organization_id}", response_model=List[StaffResponse])
async def find_staff_by_organization(
    organization_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Find all staff in an organization."""
    return await staff_service.find_by_organization(organization_id)


# Status endpoints
@router.post("/{staff_id}/activate", response_model=StaffResponse)
async def activate_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Activate a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.ACTIVE, current_user.id
    )


@router.post("/{staff_id}/suspend", response_model=StaffResponse)
async def suspend_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Suspend a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.SUSPENDED, current_user.id
    )


@router.post("/{staff_id}/terminate", response_model=StaffResponse)
async def terminate_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Terminate a staff member."""
    from app.models.core import StaffEmploymentStatus
    return await staff_service.change_employment_status(
        staff_id, StaffEmploymentStatus.TERMINATED, current_user.id
    )


@router.post("/{staff_id}/restore", response_model=StaffResponse)
async def restore_staff(
    staff_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin")),
    staff_service: StaffService = Depends(get_staff_service),
):
    """Restore a soft-deleted staff member."""
    return await staff_service.restore(staff_id, current_user.id)