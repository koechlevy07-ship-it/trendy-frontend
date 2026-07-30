"""Player Service for Player & Staff Management Module (Chapter 10)."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.personnel import (
    PlayerRepository,
    PlayerRegistrationRepository,
    CareerHistoryRepository,
    PlayerFaceEmbeddingRepository,
    PlayerMatchStatisticsRepository,
)
from app.models.player import (
    Player,
    PlayerRegistration,
    CareerHistory,
    PlayerFaceEmbedding,
    PlayerMatchStatistics,
)
from app.models.staff import Staff, StaffAssignment
from app.models.team import Team
from app.models.user import User
from app.core.exceptions import (
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
)
from app.core.events import EventPublisher
from app.schemas.player import (
    PlayerCreate,
    PlayerUpdate,
    PlayerRegistrationCreate,
    CareerHistoryCreate,
    PlayerFaceEmbeddingCreate,
)


class PlayerService:
    """Service for managing player operations."""

    def __init__(
        self,
        session: AsyncSession,
        event_publisher: Optional[EventPublisher] = None,
    ):
        self.session = session
        self.player_repo = PlayerRepository(session)
        self.registration_repo = PlayerRegistrationRepository(session)
        self.career_repo = CareerHistoryRepository(session)
        self.face_embedding_repo = PlayerFaceEmbeddingRepository(session)
        self.stats_repo = PlayerMatchStatisticsRepository(session)
        self.event_publisher = event_publisher

    async def create_player(self, data: PlayerCreate, current_user_id: UUID) -> Player:
        """Create a new player profile with validation."""
        # Check for duplicate jersey number in team
        existing = await self.player_repo.get_by_jersey(data.team_id, data.jersey_number)
        if existing:
            raise DuplicateError(f"Jersey number {data.jersey_number} already taken in this team")

        # Check email uniqueness if provided
        if data.email:
            existing = await self.player_repo.find_by_email(data.email)
            if existing:
                raise DuplicateError(f"Email {data.email} already registered")

        # Check national ID uniqueness if provided
        if data.national_id:
            existing = await self.player_repo.find_by_national_id(data.national_id)
            if existing:
                raise DuplicateError(f"National ID {data.national_id} already registered")

        # Check passport uniqueness if provided
        if data.passport_number:
            existing = await self.player_repo.find_by_passport(data.passport_number)
            if existing:
                raise DuplicateError(f"Passport {data.passport_number} already registered")

        # Validate team exists
        team = await self.session.get(Team, data.team_id)
        if not team:
            raise NotFoundError(f"Team {data.team_id} not found")

        # Create player
        player_data = data.model_dump(exclude={"team_id"})
        player_data["team_id"] = data.team_id
        player_data["created_by"] = current_user_id

        player = await self.player_repo.create(player_data)

        # Create initial registration if provided
        if data.registration_id and data.registration_authority:
            await self._create_initial_registration(player.id, data, current_user_id)

        await self.session.flush()
        await self.session.refresh(player)

        # Publish domain event
        if self.event_publisher:
            await self.event_publisher.publish("PlayerCreated", {
                "player_id": str(player.id),
                "team_id": str(data.team_id),
                "created_by": str(current_user_id),
            })

        return player

    async def _create_initial_registration(
        self,
        player_id: UUID,
        data: PlayerCreate,
        current_user_id: UUID,
    ) -> PlayerRegistration:
        """Create initial registration for new player."""
        reg_data = {
            "player_id": player_id,
            "registration_id": data.registration_id,
            "registration_date": data.registration_date or datetime.utcnow(),
            "registration_authority": data.registration_authority,
            "license_number": data.license_number,
            "expiry_date": data.expiry_date,
            "status": "active",
            "verification_documents": data.verification_documents or [],
            "verified_by": current_user_id if data.verification_documents else None,
            "verified_at": datetime.utcnow() if data.verification_documents else None,
            "created_by": current_user_id,
        }
        return await self.registration_repo.create(reg_data)

    async def get_player(self, player_id: UUID, include_relations: bool = False) -> Player:
        """Get player by ID."""
        if include_relations:
            player = await self.player_repo.get_with_user(player_id)
        else:
            player = await self.player_repo.get(player_id)

        if not player:
            raise NotFoundError(f"Player {player_id} not found")
        return player

    async def list_players(
        self,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        team_id: Optional[UUID] = None,
    ) -> List[Player]:
        """List players with pagination and filters."""
        if team_id:
            filters = filters or {}
            filters["team_id"] = team_id
        return await self.player_repo.paginate(page=page, per_page=per_page, filters=filters)

    async def search_players(
        self,
        query: str,
        team_id: Optional[UUID] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> List[Player]:
        """Search players by name."""
        return await self.player_repo.search(query, team_id, skip=(page - 1) * per_page, limit=per_page)

    async def update_player(
        self,
        player_id: UUID,
        data: PlayerUpdate,
        current_user_id: UUID,
    ) -> Player:
        """Update player profile."""
        player = await self.get_player(player_id)

        # Check jersey number uniqueness if changed
        if data.jersey_number is not None and data.jersey_number != player.jersey_number:
            existing = await self.player_repo.get_by_jersey(player.team_id, data.jersey_number)
            if existing:
                raise AlreadyExistsError(f"Jersey number {data.jersey_number} already taken in this team")

        # Check email uniqueness if changed
        if data.email and data.email != player.email:
            existing = await self.player_repo.find_by_email(data.email)
            if existing:
                raise AlreadyExistsError(f"Email {data.email} already registered")

        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_by"] = current_user_id

        player = await self.player_repo.update(player_id, update_data)
        await self.session.flush()
        await self.session.refresh(player)

        if self.event_publisher:
            await self.event_publisher.publish("PlayerUpdated", {
                "player_id": str(player.id),
                "updated_by": str(current_user_id),
                "fields": list(data.model_dump(exclude_unset=True).keys()),
            })

        return player

    async def change_status(
        self,
        player_id: UUID,
        new_status: str,
        current_user_id: UUID,
        reason: Optional[str] = None,
    ) -> Player:
        """Change player status with business rule validation."""
        valid_statuses = ["active", "inactive", "suspended", "injured", "on_loan", "retired", "transferred", "loaned", "released"]
        if new_status not in valid_statuses:
            raise ValidationError(f"Invalid status: {new_status}")

        player = await self.get_player(player_id)

        # Business rule: cannot activate suspended player without review
        if player.status == "suspended" and new_status == "active":
            raise ValidationError("Suspended player cannot be activated without admin review")

        # Business rule: retired players cannot be reactivated
        if player.status == "retired" and new_status == "active":
            raise ValidationError("Retired players cannot be reactivated")

        player.status = new_status
        player.updated_by = current_user_id
        await self.session.flush()
        await self.session.refresh(player)

        if self.event_publisher:
            await self.event_publisher.publish("PlayerStatusChanged", {
                "player_id": str(player.id),
                "old_status": player.status,
                "new_status": new_status,
                "changed_by": str(current_user_id),
                "reason": reason,
            })

        return player

    async def assign_team(
        self,
        player_id: UUID,
        new_team_id: UUID,
        current_user_id: UUID,
        season_id: Optional[UUID] = None,
        jersey_number: Optional[int] = None,
    ) -> StaffAssignment:
        """Assign player to a new team with historical tracking."""
        player = await self.get_player(player_id)

        # Validate new team exists
        new_team = await self.session.get(Team, new_team_id)
        if not new_team:
            raise NotFoundError(f"Team {new_team_id} not found")

        # Check jersey number availability
        if jersey_number is not None:
            existing = await self.player_repo.get_by_jersey(new_team_id, jersey_number)
            if existing:
                raise DuplicateError(f"Jersey number {jersey_number} already taken in new team")

        # Close current assignment if exists
        current_assignment = await self._get_current_assignment(player_id)
        if current_assignment:
            current_assignment.end_date = datetime.utcnow()
            current_assignment.employment_status = "transferred"
            current_assignment.updated_by = current_user_id

        # Create new assignment
        assignment_data = {
            "staff_id": player_id,
            "organization_id": new_team.organization_id,
            "club_id": new_team.club_id,
            "team_id": new_team_id,
            "season_id": season_id,
            "role": "player",
            "employment_type": "full_time",
            "employment_status": "active",
            "start_date": datetime.utcnow(),
            "jersey_number": jersey_number or player.jersey_number,
            "position": player.position,
            "is_active": True,
            "is_primary": True,
            "created_by": current_user_id,
        }
        assignment = await self.assignment_repo.create(assignment_data)

        # Update player's current team and jersey
        player.team_id = new_team_id
        if jersey_number:
            player.jersey_number = jersey_number
        player.updated_by = current_user_id
        await self.session.flush()

        if self.event_publisher:
            await self.event_publisher.publish("PlayerAssigned", {
                "player_id": str(player.id),
                "team_id": str(new_team_id),
                "season_id": str(season_id) if season_id else None,
                "assigned_by": str(current_user_id),
            })

        return assignment

    async def transfer_team(
        self,
        player_id: UUID,
        new_team_id: UUID,
        current_user_id: UUID,
        season_id: Optional[UUID] = None,
        jersey_number: Optional[int] = None,
    ) -> StaffAssignment:
        """Transfer player to another team (closes old, creates new)."""
        return await self.assign_team(player_id, new_team_id, current_user_id, season_id, jersey_number)

    async def register_ai_metadata(
        self,
        player_id: UUID,
        embedding_id: str,
        embedding_version: int,
        feature_vector_reference: str,
        capture_date: datetime,
        camera_source: Optional[str],
        quality_score: Optional[float],
        algorithm_version: Optional[str],
        current_user_id: UUID,
    ) -> PlayerFaceEmbedding:
        """Register AI face embedding metadata for player."""
        player = await self.get_player(player_id)

        # Deactivate old embeddings
        await self.face_embedding_repo.deactivate_old_embeddings(player_id, embedding_version)

        # Create new embedding record
        embedding_data = {
            "player_id": player_id,
            "embedding_id": embedding_id,
            "embedding_version": embedding_version,
            "feature_vector_reference": feature_vector_reference,
            "capture_date": capture_date,
            "camera_source": camera_source,
            "quality_score": quality_score,
            "algorithm_version": algorithm_version,
            "status": "active",
            "created_by": current_user_id,
        }
        embedding = await self.face_embedding_repo.create(embedding_data)

        if self.event_publisher:
            await self.event_publisher.publish("FaceEmbeddingRegistered", {
                "player_id": str(player_id),
                "embedding_id": embedding_id,
                "version": embedding_version,
                "registered_by": str(current_user_id),
            })

        return embedding

    async def create_career_record(
        self,
        player_id: UUID,
        data: CareerHistoryCreate,
        current_user_id: UUID,
    ) -> CareerHistory:
        """Create a career history record (immutable once archived)."""
        player = await self.get_player(player_id)

        career_data = data.model_dump()
        career_data["player_id"] = player_id
        career_data["created_by"] = current_user_id

        career = await self.career_repo.create(career_data)

        if self.event_publisher:
            await self.event_publisher.publish("CareerRecordCreated", {
                "player_id": str(player_id),
                "career_id": str(career.id),
                "organization": data.organization,
                "season": data.season,
                "created_by": str(current_user_id),
            })

        return career

    async def archive_career_record(
        self,
        career_id: UUID,
        current_user_id: UUID,
    ) -> CareerHistory:
        """Archive a career history record (makes it immutable)."""
        return await self.career_repo.archive_record(career_id, current_user_id)

    async def get_player_statistics(
        self,
        player_id: UUID,
        match_id: Optional[UUID] = None,
        season_id: Optional[UUID] = None,
    ) -> Dict[str, Any]:
        """Get player statistics with optional match/season filter."""
        if match_id:
            return await self.stats_repo.get_by_player_match(player_id, match_id)
        elif season_id:
            return await self.stats_repo.get_season_aggregates(player_id, season_id)
        else:
            return await self.stats_repo.get_by_player(player_id)

    async def soft_delete(self, player_id: UUID, current_user_id: UUID) -> bool:
        """Soft delete a player."""
        player = await self.get_player(player_id)
        player.is_active = False
        player.is_deleted = True
        player.deleted_at = datetime.utcnow()
        player.deleted_by = current_user_id
        await self.session.flush()

        if self.event_publisher:
            await self.event_publisher.publish("PlayerArchived", {
                "player_id": str(player_id),
                "archived_by": str(current_user_id),
            })

        return True

    async def restore(self, player_id: UUID, current_user_id: UUID) -> Player:
        """Restore a soft-deleted player."""
        player = await self.player_repo.get(player_id)
        if not player:
            raise NotFoundError(f"Player {player_id} not found")

        if not player.is_deleted:
            raise BusinessRuleError("Player is not deleted")

        player.is_deleted = False
        player.deleted_at = None
        player.deleted_by = None
        player.is_active = True
        player.updated_by = current_user_id
        await self.session.flush()
        await self.session.refresh(player)

        if self.event_publisher:
            await self.event_publisher.publish("PlayerRestored", {
                "player_id": str(player_id),
                "restored_by": str(current_user_id),
            })

        return player

    async def _get_current_assignment(self, staff_id: UUID) -> Optional[StaffAssignment]:
        """Get current active assignment for staff/player."""
        from app.repositories.personnel import StaffAssignmentRepository
        assignment_repo = StaffAssignmentRepository(self.session)
        return await assignment_repo.find_current(staff_id)