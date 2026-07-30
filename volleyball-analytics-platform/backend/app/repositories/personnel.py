"""Personnel repositories for Player, Coach, Official, and MatchOfficial operations."""

from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.player import (
    Player,
    PlayerRegistration,
    CareerHistory,
    PlayerFaceEmbedding,
    PlayerMatchStatistics,
    TrackRecord,
    PoseRecord,
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


class PlayerRepository(BaseRepository):
    """Repository for Player entity."""

    def __init__(self, session):
        super().__init__(Player, session)

    async def get_by_team(self, team_id: UUID) -> List[Player]:
        """Get all players in a team."""
        result = await self.session.execute(
            select(self.model).where(self.model.team_id == team_id)
        )
        return result.scalars().all()

    async def get_by_jersey(self, team_id: UUID, jersey_number: int) -> Optional[Player]:
        """Get player by team and jersey number."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.jersey_number == jersey_number)
        )
        return result.scalar_one_or_none()

    async def get_with_user(self, player_id: UUID) -> Optional[Player]:
        """Get player with user profile."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == player_id)
            .options(selectinload(Player.user))
        )
        return result.scalar_one_or_none()

    async def get_by_position(self, team_id: UUID, position: str) -> List[Player]:
        """Get players by position."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.position == position)
        )
        return result.scalars().all()

    async def get_starters(self, team_id: UUID) -> List[Player]:
        """Get starting players (non-libero)."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.is_libero == False)
            .where(self.model.is_active == True)
        )
        return result.scalars().all()

    async def find_by_email(self, email: str) -> Optional[Player]:
        """Find player by email."""
        result = await self.session.execute(
            select(self.model).where(self.model.email == email)
        )
        return result.scalar_one_or_none()

    async def find_by_national_id(self, national_id: str) -> Optional[Player]:
        """Find player by national ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.national_id == national_id)
        )
        return result.scalar_one_or_none()

    async def find_by_passport(self, passport: str) -> Optional[Player]:
        """Find player by passport number."""
        result = await self.session.execute(
            select(self.model).where(self.model.passport_number == passport)
        )
        return result.scalar_one_or_none()

    async def search(
        self,
        query: str,
        team_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Player]:
        """Search players by name."""
        from sqlalchemy import or_
        stmt = select(self.model).where(
            or_(
                self.model.first_name.ilike(f"%{query}%"),
                self.model.last_name.ilike(f"%{query}%"),
            )
        )
        if team_id:
            stmt = stmt.where(self.model.team_id == team_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def paginate(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[dict] = None,
    ) -> List[Player]:
        """Paginate players with filters."""
        skip = (page - 1) * per_page
        return await self.get_all(skip=skip, limit=per_page, filters=filters)

    async def bulk_insert(self, data_list: List[dict]) -> List[Player]:
        """Bulk insert players."""
        return await self.bulk_create(data_list)

    async def bulk_update(self, updates: List[dict]) -> int:
        """Bulk update players."""
        from sqlalchemy import update
        count = 0
        for data in updates:
            if "id" not in data:
                continue
            stmt = (
                update(self.model)
                .where(self.model.id == data["id"])
                .values(**{k: v for k, v in data.items() if k != "id"})
            )
            await self.session.execute(stmt)
            count += 1
        await self.session.flush()
        return count


class PlayerRegistrationRepository(BaseRepository):
    """Repository for PlayerRegistration entity."""

    def __init__(self, session):
        super().__init__(PlayerRegistration, session)

    async def get_by_player(self, player_id: UUID) -> Optional[PlayerRegistration]:
        """Get registration by player ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.player_id == player_id)
        )
        return result.scalar_one_or_none()

    async def get_by_registration_id(self, registration_id: str) -> Optional[PlayerRegistration]:
        """Get registration by registration ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.registration_id == registration_id)
        )
        return result.scalar_one_or_none()

    async def get_expiring_registrations(self, days: int = 30) -> List[PlayerRegistration]:
        """Get registrations expiring within specified days."""
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() + timedelta(days=days)
        result = await self.session.execute(
            select(self.model)
            .where(self.model.expiry_date <= cutoff)
            .where(self.model.status == "active")
        )
        return result.scalars().all()

    async def find_by_license_number(self, license_number: str) -> Optional[PlayerRegistration]:
        """Find registration by license number."""
        result = await self.session.execute(
            select(self.model).where(self.model.license_number == license_number)
        )
        return result.scalar_one_or_none()


class CareerHistoryRepository(BaseRepository):
    """Repository for CareerHistory entity."""

    def __init__(self, session):
        super().__init__(CareerHistory, session)

    async def get_by_player(self, player_id: UUID) -> List[CareerHistory]:
        """Get career history for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .order_by(self.model.start_date.desc())
        )
        return result.scalars().all()

    async def find_by_season(self, player_id: UUID, season: str) -> Optional[CareerHistory]:
        """Find career history by season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.season == season)
        )
        return result.scalar_one_or_none()

    async def find_by_organization(self, player_id: UUID, organization: str) -> List[CareerHistory]:
        """Find career history by organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.organization == organization)
        )
        return result.scalars().all()

    async def get_awards(self, player_id: UUID) -> List[str]:
        """Get all awards for a player."""
        result = await self.session.execute(
            select(self.model.awards).where(self.model.player_id == player_id)
        )
        all_awards = []
        for row in result:
            if row[0]:
                all_awards.extend(row[0])
        return all_awards

    async def archive_record(self, career_id: UUID, user_id: UUID) -> Optional[CareerHistory]:
        """Archive a career history record."""
        obj = await self.get(career_id)
        if obj and not obj.is_archived:
            obj.is_archived = True
            obj.archived_at = datetime.utcnow()
            obj.updated_by = user_id
            await self.session.flush()
            await self.session.refresh(obj)
        return obj

    async def create_career_record(self, data: dict) -> CareerHistory:
        """Create a new career history record."""
        return await self.create(data)


class PlayerFaceEmbeddingRepository(BaseRepository):
    """Repository for PlayerFaceEmbedding entity."""

    def __init__(self, session):
        super().__init__(PlayerFaceEmbedding, session)

    async def get_by_player(self, player_id: UUID) -> List[PlayerFaceEmbedding]:
        """Get all face embeddings for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .order_by(self.model.capture_date.desc())
        )
        return result.scalars().all()

    async def get_active_by_player(self, player_id: UUID) -> Optional[PlayerFaceEmbedding]:
        """Get the most recent active face embedding for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.status == "active")
            .order_by(self.model.capture_date.desc())
        )
        return result.scalar_one_or_none()

    async def get_by_embedding_id(self, embedding_id: str) -> Optional[PlayerFaceEmbedding]:
        """Get face embedding by embedding ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.embedding_id == embedding_id)
        )
        return result.scalar_one_or_none()

    async def get_by_version(self, player_id: UUID, version: int) -> Optional[PlayerFaceEmbedding]:
        """Get face embedding by version."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.embedding_version == version)
        )
        return result.scalar_one_or_none()

    async def deactivate_old_embeddings(self, player_id: UUID, current_version: int) -> int:
        """Deactivate old embeddings for a player."""
        from sqlalchemy import update
        stmt = (
            update(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.embedding_version < current_version)
            .values(status="archived")
        )
        result = await self.session.execute(stmt)
        return result.rowcount


class PlayerMatchStatisticsRepository(BaseRepository):
    """Repository for PlayerMatchStatistics entity."""

    def __init__(self, session):
        super().__init__(PlayerMatchStatistics, session)

    async def get_by_player(self, player_id: UUID) -> List[PlayerMatchStatistics]:
        """Get all match statistics for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .order_by(self.model.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_match(self, match_id: UUID) -> List[PlayerMatchStatistics]:
        """Get all player statistics for a match."""
        result = await self.session.execute(
            select(self.model).where(self.model.match_id == match_id)
        )
        return result.scalars().all()

    async def get_by_player_match(self, player_id: UUID, match_id: UUID) -> Optional[PlayerMatchStatistics]:
        """Get statistics for a player in a specific match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.match_id == match_id)
        )
        return result.scalar_one_or_none()

    async def get_by_set(self, set_id: UUID) -> List[PlayerMatchStatistics]:
        """Get statistics for a specific set."""
        result = await self.session.execute(
            select(self.model).where(self.model.set_id == set_id)
        )
        return result.scalars().all()

    async def get_season_aggregates(self, player_id: UUID, season_id: UUID) -> dict:
        """Get aggregated statistics for a player in a season."""
        from sqlalchemy import func, select
        from app.models.match import Match
        from app.models.competition import Season

        # Get matches in season
        match_subquery = select(Match.id).where(Match.season_id == season_id)
        
        result = await self.session.execute(
            select(
                func.sum(self.model.total_serves).label("total_serves"),
                func.sum(self.model.service_aces).label("service_aces"),
                func.sum(self.model.service_errors).label("service_errors"),
                func.sum(self.model.attack_attempts).label("attack_attempts"),
                func.sum(self.model.kills).label("kills"),
                func.sum(self.model.attack_errors).label("attack_errors"),
                func.sum(self.model.blocked_attacks).label("blocked_attacks"),
                func.sum(self.model.solo_blocks).label("solo_blocks"),
                func.sum(self.model.block_assists).label("block_assists"),
                func.sum(self.model.digs).label("digs"),
                func.sum(self.model.reception_attempts).label("reception_attempts"),
                func.sum(self.model.perfect_receptions).label("perfect_receptions"),
                func.sum(self.model.assists).label("assists"),
                func.sum(self.model.distance_covered_m).label("distance_covered"),
                func.avg(self.model.avg_speed_kmh).label("avg_speed"),
                func.max(self.model.max_speed_kmh).label("max_speed"),
            )
            .where(self.model.player_id == player_id)
            .where(self.model.match_id.in_(match_subquery))
        )
        return result.first()._asdict() if result.first() else {}


class TrackRecordRepository(BaseRepository):
    """Repository for TrackRecord entity."""

    def __init__(self, session):
        super().__init__(TrackRecord, session)

    async def get_by_track_id(self, track_id: str) -> List[TrackRecord]:
        """Get all track records for a track ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.track_id == track_id)
        )
        return result.scalars().all()

    async def get_by_player_frame(self, player_id: UUID, frame_number: int) -> Optional[TrackRecord]:
        """Get track record by player and frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalar_one_or_none()

    async def get_by_frame_range(self, player_id: UUID, start_frame: int, end_frame: int) -> List[TrackRecord]:
        """Get track records within frame range."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.frame_number >= start_frame)
            .where(self.model.frame_number <= end_frame)
        )
        return result.scalars().all()


class PoseRecordRepository(BaseRepository):
    """Repository for PoseRecord entity."""

    def __init__(self, session):
        super().__init__(PoseRecord, session)

    async def get_by_player_frame(self, player_id: UUID, frame_number: int) -> Optional[PoseRecord]:
        """Get pose record by player and frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalar_one_or_none()

    async def get_by_track_frame(self, track_id: str, frame_number: int) -> Optional[PoseRecord]:
        """Get pose record by track and frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.track_id == track_id)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalar_one_or_none()


class StaffRepository(BaseRepository):
    """Repository for Staff entity."""

    def __init__(self, session):
        super().__init__(Staff, session)

    async def get_by_organization(self, org_id: UUID) -> List[Staff]:
        """Get all staff for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_role(self, role: str, org_id: Optional[UUID] = None) -> List[Staff]:
        """Get staff by role."""
        stmt = select(self.model).where(self.model.role == role)
        if org_id:
            stmt = stmt.where(self.model.organization_id == org_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_employment_status(self, status: str, org_id: Optional[UUID] = None) -> List[Staff]:
        """Get staff by employment status."""
        stmt = select(self.model).where(self.model.employment_status == status)
        if org_id:
            stmt = stmt.where(self.model.organization_id == org_id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def search(self, query: str, org_id: Optional[UUID] = None, skip: int = 0, limit: int = 100) -> List[Staff]:
        """Search staff by name."""
        from sqlalchemy import or_
        stmt = select(self.model).where(
            or_(
                self.model.first_name.ilike(f"%{query}%"),
                self.model.last_name.ilike(f"%{query}%"),
                self.model.email.ilike(f"%{query}%"),
            )
        )
        if org_id:
            stmt = stmt.where(self.model.organization_id == org_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def find_by_role(self, role: str, org_id: UUID) -> List[Staff]:
        """Find staff by role in organization."""
        return await self.get_by_role(role, org_id)

    async def find_by_organization(self, org_id: UUID) -> List[Staff]:
        """Find staff by organization."""
        return await self.get_by_organization(org_id)


class StaffAssignmentRepository(BaseRepository):
    """Repository for StaffAssignment entity."""

    def __init__(self, session):
        super().__init__(StaffAssignment, session)

    async def assign(self, data: dict) -> StaffAssignment:
        """Create a new staff assignment."""
        return await self.create(data)

    async def terminate(self, assignment_id: UUID, end_date, user_id: UUID) -> Optional[StaffAssignment]:
        """Terminate a staff assignment."""
        obj = await self.get(assignment_id)
        if obj:
            obj.end_date = end_date
            obj.employment_status = "terminated"
            obj.updated_by = user_id
            await self.session.flush()
            await self.session.refresh(obj)
        return obj

    async def transfer(self, assignment_id: UUID, new_org_id: UUID, new_club_id: UUID, user_id: UUID) -> Optional[StaffAssignment]:
        """Transfer a staff assignment."""
        obj = await self.get(assignment_id)
        if obj:
            obj.organization_id = new_org_id
            obj.club_id = new_club_id
            obj.updated_by = user_id
            await self.session.flush()
            await self.session.refresh(obj)
        return obj

    async def find_current(self, staff_id: UUID) -> Optional[StaffAssignment]:
        """Find current active assignment for staff."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.staff_id == staff_id)
            .where(self.model.is_active == True)
            .where(self.model.end_date.is_(None))
        )
        return result.scalar_one_or_none()

    async def find_history(self, staff_id: UUID) -> List[StaffAssignment]:
        """Find assignment history for staff."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.staff_id == staff_id)
            .order_by(self.model.start_date.desc())
        )
        return result.scalars().all()

    async def find_season_assignments(self, season_id: UUID) -> List[StaffAssignment]:
        """Find all assignments for a season."""
        result = await self.session.execute(
            select(self.model).where(self.model.season_id == season_id)
        )
        return result.scalars().all()

    async def find_organization_assignments(self, org_id: UUID) -> List[StaffAssignment]:
        """Find all assignments for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_role(self, org_id: UUID, role: str) -> List[StaffAssignment]:
        """Get assignments by role in organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.role == role)
        )
        return result.scalars().all()


class StaffMedicalInfoRepository(BaseRepository):
    """Repository for StaffMedicalInfo entity."""

    def __init__(self, session):
        super().__init__(StaffMedicalInfo, session)

    async def get_by_staff(self, staff_id: UUID) -> Optional[StaffMedicalInfo]:
        """Get medical info by staff ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalar_one_or_none()


class StaffDocumentRepository(BaseRepository):
    """Repository for StaffDocument entity."""

    def __init__(self, session):
        super().__init__(StaffDocument, session)

    async def get_by_staff(self, staff_id: UUID) -> List[StaffDocument]:
        """Get all documents for a staff member."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalars().all()

    async def get_expiring_documents(self, days: int = 30) -> List[StaffDocument]:
        """Get documents expiring within specified days."""
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() + timedelta(days=days)
        result = await self.session.execute(
            select(self.model)
            .where(self.model.expires_at <= cutoff)
            .where(self.model.expires_at.is_not(None))
        )
        return result.scalars().all()

    async def get_by_type(self, staff_id: UUID, document_type: str) -> List[StaffDocument]:
        """Get documents by type."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.staff_id == staff_id)
            .where(self.model.document_type == document_type)
        )
        return result.scalars().all()


class MedicalAssignmentRepository(BaseRepository):
    """Repository for MedicalAssignment entity."""

    def __init__(self, session):
        super().__init__(MedicalAssignment, session)

    async def get_by_staff(self, staff_id: UUID) -> List[MedicalAssignment]:
        """Get medical assignments for staff."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[MedicalAssignment]:
        """Get medical assignments for a team."""
        result = await self.session.execute(
            select(self.model).where(self.model.team_id == team_id)
        )
        return result.scalars().all()

    async def get_by_player(self, player_id: UUID) -> List[MedicalAssignment]:
        """Get medical assignments for a player."""
        result = await self.session.execute(
            select(self.model).where(self.model.player_id == player_id)
        )
        return result.scalars().all()

    async def get_by_organization(self, org_id: UUID) -> List[MedicalAssignment]:
        """Get medical assignments for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()


class TechnicalAssignmentRepository(BaseRepository):
    """Repository for TechnicalAssignment entity."""

    def __init__(self, session):
        super().__init__(TechnicalAssignment, session)

    async def get_by_staff(self, staff_id: UUID) -> List[TechnicalAssignment]:
        """Get technical assignments for staff."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[TechnicalAssignment]:
        """Get technical assignments for a team."""
        result = await self.session.execute(
            select(self.model).where(self.model.team_id == team_id)
        )
        return result.scalars().all()

    async def get_by_competition(self, competition_id: UUID) -> List[TechnicalAssignment]:
        """Get technical assignments for a competition."""
        result = await self.session.execute(
            select(self.model).where(self.model.competition_id == competition_id)
        )
        return result.scalars().all()

    async def get_by_organization(self, org_id: UUID) -> List[TechnicalAssignment]:
        """Get technical assignments for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()


class RefereeAssignmentRepository(BaseRepository):
    """Repository for RefereeAssignment entity."""

    def __init__(self, session):
        super().__init__(RefereeAssignment, session)

    async def get_by_match(self, match_id: UUID) -> List[RefereeAssignment]:
        """Get referee assignments for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .options(selectinload(RefereeAssignment.staff))
        )
        return result.scalars().all()

    async def get_by_staff(self, staff_id: UUID) -> List[RefereeAssignment]:
        """Get referee assignments for staff."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalars().all()

    async def get_by_organization(self, org_id: UUID) -> List[RefereeAssignment]:
        """Get referee assignments for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def confirm_assignment(self, assignment_id: UUID, user_id: UUID) -> Optional[RefereeAssignment]:
        """Confirm a referee assignment."""
        obj = await self.get(assignment_id)
        if obj:
            obj.is_confirmed = True
            obj.confirmed_at = datetime.utcnow()
            obj.confirmed_by = user_id
            await self.session.flush()
            await self.session.refresh(obj)
        return obj


class CoachAssignmentRepository(BaseRepository):
    """Repository for CoachAssignment entity."""

    def __init__(self, session):
        super().__init__(CoachAssignment, session)

    async def get_by_staff(self, staff_id: UUID) -> List[CoachAssignment]:
        """Get coach assignments for staff."""
        result = await self.session.execute(
            select(self.model).where(self.model.staff_id == staff_id)
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[CoachAssignment]:
        """Get coach assignments for a team."""
        result = await self.session.execute(
            select(self.model).where(self.model.team_id == team_id)
        )
        return result.scalars().all()

    async def get_head_coach(self, team_id: UUID) -> Optional[CoachAssignment]:
        """Get head coach for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.is_head_coach == True)
            .where(self.model.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_by_role(self, team_id: UUID, role: str) -> List[CoachAssignment]:
        """Get coach assignments by role."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .where(self.model.role == role)
        )
        return result.scalars().all()

    async def get_by_season(self, season_id: UUID) -> List[CoachAssignment]:
        """Get coach assignments for a season."""
        result = await self.session.execute(
            select(self.model).where(self.model.season_id == season_id)
        )
        return result.scalars().all()

    async def get_by_organization(self, org_id: UUID) -> List[CoachAssignment]:
        """Get coach assignments for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def find_current(self, staff_id: UUID) -> Optional[CoachAssignment]:
        """Find current active coaching assignment."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.staff_id == staff_id)
            .where(self.model.is_active == True)
            .where(self.model.end_date.is_(None))
        )
        return result.scalar_one_or_none()

    async def find_history(self, staff_id: UUID) -> List[CoachAssignment]:
        """Find coaching assignment history."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.staff_id == staff_id)
            .order_by(self.model.start_date.desc())
        )
        return result.scalars().all()