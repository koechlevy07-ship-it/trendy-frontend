"""Staff Service for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.personnel import (
    StaffRepository,
    StaffAssignmentRepository,
    StaffMedicalInfoRepository,
    StaffDocumentRepository,
    MedicalAssignmentRepository,
    TechnicalAssignmentRepository,
    RefereeAssignmentRepository,
    CoachAssignmentRepository,
)
from app.models.staff import (
    Staff,
    StaffAssignment,
    StaffMedicalInfo,
    StaffDocument,
    MedicalAssignment,
    TechnicalAssignment,
    RefereeAssignment,
    CoachAssignment,
)
from app.models.organization import Organization, Club, Team
from app.models.competition import Competition, Season
from app.core.exceptions import (
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
)
from app.core.events import EventPublisher
from app.schemas.staff import (
    StaffCreate,
    StaffUpdate,
    StaffAssignmentCreate,
    StaffAssignmentUpdate,
    StaffMedicalInfoCreate,
    StaffDocumentCreate,
)
from app.models.core import StaffRole, StaffEmploymentStatus


class StaffService:
    """Service for managing staff operations."""

    def __init__(
        self,
        session: AsyncSession,
        event_publisher: Optional[EventPublisher] = None,
    ):
        self.session = session
        self.staff_repo = StaffRepository(session)
        self.assignment_repo = StaffAssignmentRepository(session)
        self.medical_info_repo = StaffMedicalInfoRepository(session)
        self.document_repo = StaffDocumentRepository(session)
        self.medical_assignment_repo = MedicalAssignmentRepository(session)
        self.technical_assignment_repo = TechnicalAssignmentRepository(session)
        self.referee_assignment_repo = RefereeAssignmentRepository(session)
        self.coach_assignment_repo = CoachAssignmentRepository(session)
        self.event_publisher = event_publisher

    async def create_staff(self, data: StaffCreate, current_user_id: UUID) -> Staff:
        """Create a new staff member with validation."""
        # Check email uniqueness if provided
        if data.email:
            existing = await self.staff_repo.find_by_email(data.email)
            if existing:
                raise DuplicateError(f"Email {data.email} already registered")

        # Validate organization exists
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise NotFoundError(f"Organization {data.organization_id} not found")

        # Validate club if provided
        if data.club_id:
            club = await self.session.get(Club, data.club_id)
            if not club:
                raise NotFoundError(f"Club {data.club_id} not found")

        # Validate user if provided
        if data.user_id:
            from app.models.user import User
            user = await self.session.get(User, data.user_id)
            if not user:
                raise NotFoundError(f"User {data.user_id} not found")

        # Validate role
        valid_roles = [r.value for r in StaffRole]
        if data.role not in valid_roles:
            raise ValidationError(f"Invalid role: {data.role}")

        staff_data = data.model_dump(exclude={"organization_id", "club_id", "user_id"})
        staff_data["organization_id"] = data.organization_id
        staff_data["club_id"] = data.club_id
        staff_data["user_id"] = data.user_id
        staff_data["created_by"] = current_user_id

        staff = await self.staff_repo.create(staff_data)

        await self.session.flush()
        await self.session.refresh(staff)

        if self.event_publisher:
            await self.event_publisher.publish("StaffCreated", {
                "staff_id": str(staff.id),
                "organization_id": str(data.organization_id),
                "role": data.role,
                "created_by": str(current_user_id),
            })

        return staff

    async def get_staff(self, staff_id: UUID) -> Staff:
        """Get staff by ID."""
        staff = await self.staff_repo.get(staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")
        return staff

    async def list_staff(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        organization_id: Optional[UUID] = None,
    ) -> List[Staff]:
        """List staff with pagination and filters."""
        if organization_id:
            filters = filters or {}
            filters["organization_id"] = organization_id
        return await self.staff_repo.paginate(page=page, per_page=per_page, filters=filters)

    async def search_staff(
        self,
        query: str,
        organization_id: Optional[UUID] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> List[Staff]:
        """Search staff by name or email."""
        return await self.staff_repo.search(query, organization_id, skip=(page - 1) * per_page, limit=per_page)

    async def update_staff(
        self,
        staff_id: UUID,
        data: StaffUpdate,
        current_user_id: UUID,
    ) -> Staff:
        """Update staff profile."""
        staff = await self.get_staff(staff_id)

        # Check email uniqueness if changed
        if data.email and data.email != staff.email:
            existing = await self.staff_repo.find_by_email(data.email)
            if existing:
                raise DuplicateError(f"Email {data.email} already registered")

        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_by"] = current_user_id

        staff = await self.staff_repo.update(staff_id, update_data)
        await self.session.flush()
        await self.session.refresh(staff)

        if self.event_publisher:
            await self.event_publisher.publish("StaffUpdated", {
                "staff_id": str(staff.id),
                "updated_by": str(current_user_id),
                "fields": list(data.model_dump(exclude_unset=True).keys()),
            })

        return staff

    async def change_employment_status(
        self,
        staff_id: UUID,
        new_status: StaffEmploymentStatus,
        current_user_id: UUID,
        reason: Optional[str] = None,
    ) -> Staff:
        """Change staff employment status with business rule validation."""
        valid_statuses = [s.value for s in StaffEmploymentStatus]
        if new_status not in valid_statuses:
            raise ValidationError(f"Invalid status: {new_status}")

        staff = await self.get_staff(staff_id)

        # Business rule: cannot activate terminated staff without review
        if staff.employment_status == StaffEmploymentStatus.TERMINATED.value and new_status == StaffEmploymentStatus.ACTIVE.value:
            raise BusinessRuleError("Terminated staff cannot be reactivated without admin review")

        # Business rule: suspended staff cannot be activated without review
        if staff.employment_status == StaffEmploymentStatus.SUSPENDED.value and new_status == StaffEmploymentStatus.ACTIVE.value:
            raise BusinessRuleError("Suspended staff cannot be activated without admin review")

        staff.employment_status = new_status.value
        staff.updated_by = current_user_id

        if new_status == StaffEmploymentStatus.TERMINATED.value:
            staff.termination_date = datetime.utcnow()

        await self.session.flush()
        await self.session.refresh(staff)

        if self.event_publisher:
            await self.event_publisher.publish("StaffEmploymentStatusChanged", {
                "staff_id": str(staff.id),
                "old_status": staff.employment_status,
                "new_status": new_status.value,
                "changed_by": str(current_user_id),
                "reason": reason,
            })

        return staff

    async def assign_organization(
        self,
        staff_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        club_id: Optional[UUID] = None,
        team_id: Optional[UUID] = None,
        season_id: Optional[UUID] = None,
        role: Optional[str] = None,
        employment_type: str = "full_time",
        start_date: Optional[datetime] = None,
        responsibilities: Optional[List[str]] = None,
        is_primary: bool = False,
    ) -> StaffAssignment:
        """Assign staff to an organization/club/team with historical tracking."""
        staff = await self.get_staff(staff_id)

        # Validate organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise NotFoundError(f"Organization {organization_id} not found")

        # Validate club if provided
        if club_id:
            club = await self.session.get(Club, club_id)
            if not club:
                raise NotFoundError(f"Club {club_id} not found")

        # Validate team if provided
        if team_id:
            team = await self.session.get(Team, team_id)
            if not team:
                raise NotFoundError(f"Team {team_id} not found")

        # Validate season if provided
        if season_id:
            season = await self.session.get(Season, season_id)
            if not season:
                raise NotFoundError(f"Season {season_id} not found")

        # Validate role
        if role:
            valid_roles = [r.value for r in StaffRole]
            if role not in valid_roles:
                raise ValidationError(f"Invalid role: {role}")

        # Close current assignment if exists
        current_assignment = await self.assignment_repo.find_current(staff_id)
        if current_assignment:
            current_assignment.end_date = datetime.utcnow()
            current_assignment.employment_status = StaffEmploymentStatus.TRANSFERRED.value
            current_assignment.updated_by = current_user_id

        # Create new assignment
        assignment_data = {
            "staff_id": staff_id,
            "organization_id": organization_id,
            "club_id": club_id,
            "team_id": team_id,
            "season_id": season_id,
            "role": role or staff.role,
            "employment_type": employment_type,
            "employment_status": StaffEmploymentStatus.ACTIVE.value,
            "start_date": start_date or datetime.utcnow(),
            "contract_type": employment_type,
            "responsibilities": responsibilities or [],
            "is_active": True,
            "is_primary": is_primary,
            "created_by": current_user_id,
        }

        assignment = await self.assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        # Update staff's current organization if this is primary
        if is_primary:
            staff.organization_id = organization_id
            staff.club_id = club_id
            staff.updated_by = current_user_id

        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("StaffAssigned", {
                "assignment_id": str(assignment.id),
                "staff_id": str(staff_id),
                "organization_id": str(organization_id),
                "club_id": str(club_id) if club_id else None,
                "team_id": str(team_id) if team_id else None,
                "role": role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def transfer_organization(
        self,
        staff_id: UUID,
        new_organization_id: UUID,
        current_user_id: UUID,
        new_club_id: Optional[UUID] = None,
        new_team_id: Optional[UUID] = None,
        new_season_id: Optional[UUID] = None,
        new_role: Optional[str] = None,
        new_employment_type: Optional[str] = None,
    ) -> StaffAssignment:
        """Transfer staff to another organization (closes old, creates new)."""
        return await self.assign_organization(
            staff_id=staff_id,
            organization_id=new_organization_id,
            current_user_id=current_user_id,
            club_id=new_club_id,
            team_id=new_team_id,
            season_id=new_season_id,
            role=new_role,
            employment_type=new_employment_type or "full_time",
        )

    async def terminate_assignment(
        self,
        assignment_id: UUID,
        current_user_id: UUID,
        end_date: Optional[datetime] = None,
    ) -> bool:
        """Terminate a staff assignment."""
        return await self.assignment_repo.terminate(
            staff_id=assignment_id,  # This needs to be fixed - assignment_id vs staff_id
            end_date=end_date or datetime.utcnow(),
            user_id=current_user_id,
        )

    async def get_assignment_history(self, staff_id: UUID) -> List[StaffAssignment]:
        """Get complete assignment history for staff."""
        return await self.assignment_repo.find_history(staff_id)

    async def get_current_assignment(self, staff_id: UUID) -> Optional[StaffAssignment]:
        """Get current active assignment for staff."""
        return await self.assignment_repo.find_current(staff_id)

    # Medical Info
    async def create_medical_info(
        self,
        staff_id: UUID,
        data: StaffMedicalInfoCreate,
        current_user_id: UUID,
    ) -> StaffMedicalInfo:
        """Create medical info for staff."""
        staff = await self.get_staff(staff_id)

        medical_data = data.model_dump(exclude={"staff_id"})
        medical_data["staff_id"] = staff_id
        medical_data["created_by"] = current_user_id

        medical = await self.medical_info_repo.create(medical_data)
        await self.session.flush()
        await self.session.refresh(medical)

        return medical

    async def get_medical_info(self, staff_id: UUID) -> Optional[StaffMedicalInfo]:
        """Get medical info for staff."""
        return await self.medical_info_repo.get_by_staff(staff_id)

    # Documents
    async def create_document(
        self,
        staff_id: UUID,
        data: StaffDocumentCreate,
        current_user_id: UUID,
    ) -> StaffDocument:
        """Create a document for staff."""
        staff = await self.get_staff(staff_id)

        # Validate organization
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise NotFoundError(f"Organization {data.organization_id} not found")

        doc_data = data.model_dump(exclude={"staff_id", "organization_id"})
        doc_data["staff_id"] = staff_id
        doc_data["organization_id"] = data.organization_id
        doc_data["created_by"] = current_user_id

        document = await self.document_repo.create(doc_data)
        await self.session.flush()
        await self.session.refresh(document)

        return document

    async def get_documents(self, staff_id: UUID) -> List[StaffDocument]:
        """Get all documents for staff."""
        return await self.document_repo.get_by_staff(staff_id)

    async def get_expiring_documents(self, days: int = 30) -> List[StaffDocument]:
        """Get documents expiring within specified days."""
        return await self.document_repo.get_expiring_documents(days)

    # Medical Assignments
    async def assign_medical(
        self,
        staff_id: UUID,
        organization_id: UUID,
        medical_role: str,
        start_date: datetime,
        end_date: Optional[datetime] = None,
        team_id: Optional[UUID] = None,
        player_id: Optional[UUID] = None,
        responsibilities: Optional[List[str]] = None,
        current_user_id: UUID = None,
    ) -> MedicalAssignment:
        """Assign medical staff to team/player."""
        from app.models.core import MedicalRole
        valid_roles = [r.value for r in MedicalRole]
        if medical_role not in valid_roles:
            raise ValidationError(f"Invalid medical role: {medical_role}")

        assignment_data = {
            "staff_id": staff_id,
            "organization_id": organization_id,
            "team_id": team_id,
            "player_id": player_id,
            "medical_role": medical_role,
            "is_primary": False,
            "start_date": start_date,
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": current_user_id,
        }

        assignment = await self.medical_assignment_repo.create(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("MedicalAssignmentCreated", {
                "assignment_id": str(assignment.id),
                "staff_id": str(staff_id),
                "medical_role": medical_role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    # Technical Assignments
    async def assign_technical(
        self,
        staff_id: UUID,
        organization_id: UUID,
        technical_role: str,
        start_date: datetime,
        end_date: Optional[datetime] = None,
        team_id: Optional[UUID] = None,
        competition_id: Optional[UUID] = None,
        responsibilities: Optional[List[str]] = None,
        current_user_id: UUID = None,
    ) -> TechnicalAssignment:
        """Assign technical staff to team/competition."""
        from app.models.core import TechnicalRole
        valid_roles = [r.value for r in TechnicalRole]
        if technical_role not in valid_roles:
            raise ValidationError(f"Invalid technical role: {technical_role}")

        assignment_data = {
            "staff_id": staff_id,
            "organization_id": organization_id,
            "team_id": team_id,
            "competition_id": competition_id,
            "technical_role": technical_role,
            "is_primary": False,
            "start_date": start_date,
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": current_user_id,
        }

        assignment = await self.technical_assignment_repo.create(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        return assignment

    # Referee Assignments
    async def assign_referee(
        self,
        staff_id: UUID,
        match_id: UUID,
        organization_id: UUID,
        role: str,
        referee_level: Optional[str] = None,
        assigned_by: UUID = None,
    ) -> RefereeAssignment:
        """Assign referee to a match."""
        from app.models.core import OfficialRole, RefereeLevel
        valid_roles = [r.value for r in OfficialRole]
        if role not in valid_roles:
            raise ValidationError(f"Invalid referee role: {role}")

        if referee_level:
            valid_levels = [r.value for r in RefereeLevel]
            if referee_level not in valid_levels:
                raise ValidationError(f"Invalid referee level: {referee_level}")

        assignment_data = {
            "staff_id": staff_id,
            "match_id": match_id,
            "organization_id": organization_id,
            "role": role,
            "referee_level": referee_level,
            "assigned_at": datetime.utcnow(),
            "assigned_by": assigned_by,
            "created_by": assigned_by,
        }

        assignment = await self.referee_assignment_repo.create(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("RefereeAssigned", {
                "assignment_id": str(assignment.id),
                "staff_id": str(staff_id),
                "match_id": str(match_id),
                "role": role,
                "assigned_by": str(assigned_by),
            })

        return assignment

    async def confirm_referee_assignment(
        self,
        assignment_id: UUID,
        confirmed_by: UUID,
    ) -> Optional[RefereeAssignment]:
        """Confirm a referee assignment."""
        return await self.referee_assignment_repo.confirm_assignment(assignment_id, confirmed_by)

    # Coach Assignments
    async def assign_coach(
        self,
        staff_id: UUID,
        team_id: UUID,
        organization_id: UUID,
        role: str,
        is_head_coach: bool = False,
        season_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        responsibilities: Optional[List[str]] = None,
        current_user_id: UUID = None,
    ) -> CoachAssignment:
        """Assign coach to a team."""
        from app.models.core import CoachRole
        valid_roles = [r.value for r in CoachRole]
        if role not in valid_roles:
            raise ValidationError(f"Invalid coach role: {role}")

        assignment_data = {
            "staff_id": staff_id,
            "team_id": team_id,
            "organization_id": organization_id,
            "season_id": season_id,
            "role": role,
            "is_head_coach": is_head_coach,
            "start_date": start_date or datetime.utcnow(),
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": current_user_id,
        }

        assignment = await self.coach_assignment_repo.create(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        return assignment

    async def get_head_coach(self, team_id: UUID) -> Optional[CoachAssignment]:
        """Get head coach for a team."""
        return await self.coach_assignment_repo.get_head_coach(team_id)

    # Search
    async def find_by_role(self, role: str, organization_id: UUID) -> List[Staff]:
        """Find staff by role in organization."""
        return await self.staff_repo.find_by_role(role, organization_id)

    async def find_by_organization(self, organization_id: UUID) -> List[Staff]:
        """Find all staff in an organization."""
        return await self.staff_repo.find_by_organization(organization_id)

    # Soft Delete
    async def soft_delete(self, staff_id: UUID, current_user_id: UUID) -> bool:
        """Soft delete a staff member."""
        staff = await self.get_staff(staff_id)
        staff.is_active = False
        staff.is_deleted = True
        staff.deleted_at = datetime.utcnow()
        staff.deleted_by = current_user_id
        staff.employment_status = StaffEmploymentStatus.TERMINATED.value
        staff.termination_date = datetime.utcnow()
        await self.session.flush()

        if self.event_publisher:
            await self.event_publisher.publish("StaffArchived", {
                "staff_id": str(staff_id),
                "archived_by": str(current_user_id),
            })

        return True

    async def restore(self, staff_id: UUID, current_user_id: UUID) -> Staff:
        """Restore a soft-deleted staff member."""
        staff = await self.staff_repo.get(staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        if not staff.is_deleted:
            raise BusinessRuleError("Staff is not deleted")

        staff.is_deleted = False
        staff.deleted_at = None
        staff.deleted_by = None
        staff.is_active = True
        staff.employment_status = StaffEmploymentStatus.ACTIVE.value
        staff.updated_by = current_user_id
        await self.session.flush()
        await self.session.refresh(staff)

        if self.event_publisher:
            await self.event_publisher.publish("StaffRestored", {
                "staff_id": str(staff_id),
                "restored_by": str(current_user_id),
            })

        return staff