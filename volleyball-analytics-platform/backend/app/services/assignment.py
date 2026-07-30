"""Assignment Service for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.personnel import (
    StaffAssignmentRepository,
    CoachAssignmentRepository,
    RefereeAssignmentRepository,
    MedicalAssignmentRepository,
    TechnicalAssignmentRepository,
)
from app.repositories.personnel import PlayerRepository
from app.models.player import Player
from app.models.staff import (
    Staff,
    StaffAssignment,
    CoachAssignment,
    RefereeAssignment,
    MedicalAssignment,
    TechnicalAssignment,
)
from app.models.competition import Competition, Season
from app.models.organization import Organization, Club, Team, Venue
from app.core.exceptions import (
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
)
from app.core.events import EventPublisher
from app.schemas.staff import StaffAssignmentCreate, StaffAssignmentUpdate


class AssignmentService:
    """Service for managing staff and player assignments."""

    def __init__(
        self,
        session: AsyncSession,
        event_publisher: Optional[EventPublisher] = None,
    ):
        self.session = session
        self.staff_assignment_repo = StaffAssignmentRepository(session)
        self.coach_assignment_repo = CoachAssignmentRepository(session)
        self.referee_assignment_repo = RefereeAssignmentRepository(session)
        self.medical_assignment_repo = MedicalAssignmentRepository(session)
        self.technical_assignment_repo = TechnicalAssignmentRepository(session)
        self.player_repo = PlayerRepository(session)
        self.event_publisher = event_publisher

    async def assign_staff(
        self,
        data: StaffAssignmentCreate,
        current_user_id: UUID,
    ) -> StaffAssignment:
        """Create a new staff assignment."""
        # Validate staff exists
        staff = await self.session.get(Staff, data.staff_id)
        if not staff:
            raise NotFoundError(f"Staff {data.staff_id} not found")

        # Validate organization
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise NotFoundError(f"Organization {data.organization_id} not found")

        # Validate club if provided
        if data.club_id:
            club = await self.session.get(Club, data.club_id)
            if not club:
                raise NotFoundError(f"Club {data.club_id} not found")

        # Validate team if provided
        if data.team_id:
            team = await self.session.get(Team, data.team_id)
            if not team:
                raise NotFoundError(f"Team {data.team_id} not found")

        # Validate season if provided
        if data.season_id:
            season = await self.session.get(Season, data.season_id)
            if not season:
                raise NotFoundError(f"Season {data.season_id} not found")

        # Validate role
        from app.models.core import StaffRole
        valid_roles = [r.value for r in StaffRole]
        if data.role not in valid_roles:
            raise ValidationError(f"Invalid role: {data.role}")

        # Check for existing active assignment
        current = await self.staff_assignment_repo.find_current(data.staff_id)
        if current:
            raise DuplicateError(f"Staff {data.staff_id} already has an active assignment")

        assignment_data = data.model_dump()
        assignment_data["created_by"] = current_user_id
        assignment_data["employment_status"] = "active"

        assignment = await self.staff_assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("AssignmentCreated", {
                "assignment_id": str(assignment.id),
                "staff_id": str(data.staff_id),
                "organization_id": str(data.organization_id),
                "role": data.role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def transfer_staff(
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
        from datetime import datetime

        # End current assignment
        current = await self.staff_assignment_repo.find_current(staff_id)
        if current:
            current.end_date = datetime.utcnow()
            current.employment_status = "transferred"
            current.updated_by = current_user_id

        # Create new assignment
        staff = await self.session.get(Staff, staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        new_role = staff.role if new_role is None else new_role
        new_emp_type = current.employment_type if current else "full_time"

        assignment_data = {
            "staff_id": staff_id,
            "organization_id": new_organization_id,
            "club_id": None,
            "team_id": None,
            "season_id": None,
            "role": new_role,
            "employment_type": new_employment_type or "full_time",
            "employment_status": "active",
            "start_date": datetime.utcnow(),
            "contract_type": "full_time",
            "contract_end_date": None,
            "responsibilities": [],
            "is_active": True,
            "is_primary": True,
            "created_by": current_user_id,
        }

        assignment = await self.staff_assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("StaffTransferred", {
                "staff_id": str(staff_id),
                "from_organization_id": str(current.organization_id) if current else None,
                "to_organization_id": str(new_organization_id),
                "transferred_by": str(current_user_id),
            })

        return assignment

    async def terminate_assignment(
        self,
        staff_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        end_date: Optional[datetime] = None,
        reason: Optional[str] = None,
    ) -> bool:
        """Terminate a staff assignment."""
        from datetime import datetime

        ended = await self.staff_assignment_repo.terminate(
            staff_id=staff_id,
            organization_id=organization_id,
            end_date=end_date or datetime.utcnow(),
        )

        if ended and self.event_publisher:
            await self.event_publisher.publish("AssignmentTerminated", {
                "staff_id": str(staff_id),
                "organization_id": str(organization_id),
                "ended_by": str(current_user_id),
                "reason": reason,
            })

        return ended

    async def get_current_assignment(self, staff_id: UUID) -> Optional[StaffAssignment]:
        """Get current active assignment for staff."""
        return await self.staff_assignment_repo.find_current(staff_id)

    async def get_assignment_history(self, staff_id: UUID) -> List[StaffAssignment]:
        """Get complete assignment history for staff."""
        return await self.staff_assignment_repo.find_history(staff_id)

    async def get_season_assignments(self, season_id: UUID) -> List[StaffAssignment]:
        """Get all assignments for a season."""
        return await self.staff_assignment_repo.find_season_assignments(season_id)

    async def get_organization_assignments(self, organization_id: UUID) -> List[StaffAssignment]:
        """Get all assignments for an organization."""
        return await self.staff_assignment_repo.find_organization_assignments(organization_id)

    async def assign_coach(
        self,
        staff_id: UUID,
        team_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        role: str = "head_coach",
        is_head_coach: bool = False,
        season_id: Optional[UUID] = None,
        start_date: Optional[datetime] = None,
        responsibilities: Optional[List[str]] = None,
    ) -> CoachAssignment:
        """Assign a coach to a team."""
        # Validate coach exists and has coach role
        staff = await self.session.get(Staff, staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        if staff.role not in ["head_coach", "assistant_coach", "conditioning_coach", "technical_coach", "mental_coach", "scout"]:
            raise ValidationError(f"Staff {staff_id} is not a coach")

        # Validate team
        team = await self.session.get(Team, team_id)
        if not team:
            raise NotFoundError(f"Team {team_id} not found")

        # Validate organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise NotFoundError(f"Organization {organization_id} not found")

        # Validate season if provided
        if season_id:
            season = await self.session.get(Season, season_id)
            if not season:
                raise NotFoundError(f"Season {season_id} not found")

        # Validate role
        from app.models.core import CoachRole
        valid_coach_roles = [r.value for r in CoachRole]
        if role not in valid_coach_roles:
            raise ValidationError(f"Invalid coach role: {role}")

        # Check for existing head coach if setting as head
        if is_head_coach:
            existing_head = await self.coach_assignment_repo.get_head_coach(team_id)
            if existing_head:
                raise BusinessRuleError(f"Team {team_id} already has a head coach")

        assignment_data = {
            "staff_id": staff_id,
            "team_id": team_id,
            "organization_id": organization_id,
            "season_id": season_id,
            "role": role,
            "is_head_coach": is_head_coach,
            "start_date": datetime.utcnow(),
            "responsibilities": [],
            "is_active": True,
            "created_by": current_user_id,
        }

        assignment = await self.coach_assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("CoachAssigned", {
                "assignment_id": str(assignment.id),
                "coach_id": str(staff_id),
                "team_id": str(team_id),
                "role": role,
                "is_head_coach": is_head_coach,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def assign_referee(
        self,
        staff_id: UUID,
        match_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        role: str = "first_referee",
        referee_level: Optional[str] = None,
    ) -> RefereeAssignment:
        """Assign a referee to a match."""
        from app.models.match import Match

        # Validate staff
        staff = await self.session.get(Staff, staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        if staff.role not in ["first_referee", "second_referee", "scorer", "assistant_scorer", "line_judge", "reserve_referee"]:
            raise ValidationError(f"Staff {staff_id} is not a referee")

        # Validate match
        match = await self.session.get(Match, match_id)
        if not match:
            raise NotFoundError(f"Match {match_id} not found")

        # Validate organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise NotFoundError(f"Organization {organization_id} not found")

        # Validate role
        from app.models.core import OfficialRole
        valid_roles = [r.value for r in OfficialRole]
        if role not in valid_roles:
            raise ValidationError(f"Invalid referee role: {role}")

        # Check for duplicate assignment
        from app.repositories.personnel import RefereeAssignmentRepository
        ref_repo = RefereeAssignmentRepository(self.session)
        existing = await ref_repo.get_by_match(match_id)
        for existing_assignment in existing:
            if existing_assignment.staff_id == staff_id and existing_assignment.role == role:
                raise DuplicateError(f"Staff {staff_id} already assigned as {role} for this match")

        from app.models.staff import RefereeAssignment
        assignment = RefereeAssignment(
            staff_id=staff_id,
            match_id=match_id,
            organization_id=organization_id,
            role=role,
            referee_level=referee_level,
            assigned_by=current_user_id,
        )

        self.session.add(assignment)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("RefereeAssigned", {
                "assignment_id": str(assignment.id),
                "referee_id": str(staff_id),
                "match_id": str(match_id),
                "role": role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def confirm_referee_assignment(
        self,
        match_id: UUID,
        staff_id: UUID,
        role: str,
        current_user_id: UUID,
    ) -> bool:
        """Confirm a referee assignment."""
        confirmed = await self.referee_assignment_repo.confirm_assignment(
            match_id, staff_id, role, current_user_id
        )

        if confirmed and self.event_publisher:
            await self.event_publisher.publish("RefereeAssignmentConfirmed", {
                "match_id": str(match_id),
                "referee_id": str(staff_id),
                "role": role,
                "confirmed_by": str(current_user_id),
            })

        return confirmed

    async def assign_medical_staff(
        self,
        staff_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        medical_role: str,
        team_id: Optional[UUID] = None,
        player_id: Optional[UUID] = None,
        is_primary: bool = False,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        responsibilities: Optional[List[str]] = None,
    ) -> MedicalAssignment:
        """Assign medical staff to team/player."""
        # Validate staff
        staff = await self.session.get(Staff, staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        if staff.role not in ["doctor", "physiotherapist", "nutritionist", "sports_scientist"]:
            raise ValidationError(f"Staff {staff_id} is not medical staff")

        # Validate organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise NotFoundError(f"Organization {organization_id} not found")

        # Validate team if provided
        if team_id:
            team = await self.session.get(Team, team_id)
            if not team:
                raise NotFoundError(f"Team {team_id} not found")

        # Validate player if provided
        if player_id:
            from app.models.player import Player
            player = await self.session.get(Player, player_id)
            if not player:
                raise NotFoundError(f"Player {player_id} not found")

        # Validate medical role
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
            "is_primary": is_primary,
            "start_date": start_date or datetime.utcnow(),
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": current_user_id,
        }

        assignment = await self.medical_assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("MedicalStaffAssigned", {
                "assignment_id": str(assignment.id),
                "staff_id": str(staff_id),
                "organization_id": str(organization_id),
                "medical_role": medical_role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def assign_technical_staff(
        self,
        staff_id: UUID,
        organization_id: UUID,
        current_user_id: UUID,
        technical_role: str,
        team_id: Optional[UUID] = None,
        competition_id: Optional[UUID] = None,
        is_primary: bool = False,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        responsibilities: Optional[List[str]] = None,
    ) -> TechnicalAssignment:
        """Assign technical staff to team/competition."""
        # Validate staff
        staff = await self.session.get(Staff, staff_id)
        if not staff:
            raise NotFoundError(f"Staff {staff_id} not found")

        if staff.role not in ["statistician", "video_analyst", "scout", "equipment_manager"]:
            raise ValidationError(f"Staff {staff_id} is not technical staff")

        # Validate organization
        org = await self.session.get(Organization, organization_id)
        if not org:
            raise NotFoundError(f"Organization {organization_id} not found")

        # Validate team if provided
        if team_id:
            team = await self.session.get(Team, team_id)
            if not team:
                raise NotFoundError(f"Team {team_id} not found")

        # Validate competition if provided
        if competition_id:
            from app.models.competition import Competition
            comp = await self.session.get(Competition, competition_id)
            if not comp:
                raise NotFoundError(f"Competition {competition_id} not found")

        # Validate technical role
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
            "is_primary": is_primary,
            "start_date": start_date or datetime.utcnow(),
            "end_date": end_date,
            "responsibilities": responsibilities or [],
            "created_by": current_user_id,
        }

        assignment = await self.technical_assignment_repo.assign(assignment_data)
        await self.session.flush()
        await self.session.refresh(assignment)

        if self.event_publisher:
            await self.event_publisher.publish("TechnicalStaffAssigned", {
                "assignment_id": str(assignment.id),
                "staff_id": str(staff_id),
                "organization_id": str(organization_id),
                "technical_role": technical_role,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def get_current_coach(self, team_id: UUID) -> Optional[CoachAssignment]:
        """Get current head coach for a team."""
        return await self.coach_assignment_repo.get_head_coach(team_id)

    async def get_coach_assignments(self, team_id: UUID) -> List[CoachAssignment]:
        """Get all coach assignments for a team."""
        return await self.coach_assignment_repo.get_by_team(team_id)

    async def get_referee_assignments(self, match_id: UUID) -> List[RefereeAssignment]:
        """Get all referee assignments for a match."""
        return await self.referee_assignment_repo.get_by_match(match_id)

    async def get_medical_assignments(
        self,
        organization_id: UUID,
        team_id: Optional[UUID] = None,
        player_id: Optional[UUID] = None,
    ) -> List[MedicalAssignment]:
        """Get medical assignments."""
        if team_id:
            return await self.medical_assignment_repo.get_by_team(team_id)
        elif player_id:
            return await self.medical_assignment_repo.get_by_player(player_id)
        else:
            return await self.medical_assignment_repo.get_by_organization(organization_id)

    async def get_technical_assignments(
        self,
        organization_id: UUID,
        team_id: Optional[UUID] = None,
        competition_id: Optional[UUID] = None,
    ) -> List[TechnicalAssignment]:
        """Get technical assignments."""
        if team_id:
            return await self.technical_assignment_repo.get_by_team(team_id)
        elif competition_id:
            return await self.technical_assignment_repo.get_by_competition(competition_id)
        else:
            return await self.technical_assignment_repo.get_by_organization(organization_id)

    async def find_current_assignment(self, staff_id: UUID) -> Optional[StaffAssignment]:
        """Find current active assignment for staff."""
        return await self.staff_assignment_repo.find_current(staff_id)

    async def find_assignment_history(self, staff_id: UUID) -> List[StaffAssignment]:
        """Find assignment history for staff."""
        return await self.staff_assignment_repo.find_history(staff_id)

    async def find_season_assignments(self, season_id: UUID) -> List[StaffAssignment]:
        """Find all assignments for a season."""
        return await self.staff_assignment_repo.find_season_assignments(season_id)

    async def find_organization_assignments(self, organization_id: UUID) -> List[StaffAssignment]:
        """Find all assignments for an organization."""
        return await self.staff_assignment_repo.find_organization_assignments(organization_id)