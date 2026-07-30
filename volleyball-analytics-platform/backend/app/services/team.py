"""Team and Club services for business logic."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.api.deps import get_async_session
from app.models.organization import Organization, Club, Team, Venue, Court
from app.models.competition import Season, Competition, CompetitionTeam
from app.models.reports import AuditLog
from app.models.core import AuditAction
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamParticipationCreate,
    TeamParticipationUpdate,
)
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)
from app.schemas.venue import (
    VenueCreate,
    VenueUpdate,
    CourtCreate,
    CourtUpdate,
)
from app.schemas.competition import (
    CompetitionCreate,
    CompetitionUpdate,
    CompetitionTeamCreate,
)
from app.schemas.season import (
    SeasonCreate,
    SeasonUpdate,
)
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)
from app.schemas.venue import (
    VenueCreate,
    VenueUpdate,
    CourtCreate,
    CourtUpdate,
)


class ClubService:
    """Club service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_club(
        self,
        data: ClubCreate,
        user_id: Optional[str] = None,
    ) -> Club:
        """Create a new club."""
        # Validate organization exists
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise ValueError("Organization not found")

        # Validate home venue if provided
        if data.home_venue_id:
            venue = await self.session.get(Venue, data.home_venue_id)
            if not venue:
                raise ValueError("Home venue not found")
            if venue.organization_id != data.organization_id:
                raise ValueError("Venue does not belong to the organization")

        club = Club(
            organization_id=data.organization_id,
            name=data.name,
            short_name=data.short_name,
            code=data.code,
            category=data.category,
            description=data.description,
            founded_year=data.founded_year,
            logo_url=str(data.logo_url) if data.logo_url else None,
            banner_url=str(data.banner_url) if data.banner_url else None,
            primary_color=data.primary_color,
            secondary_color=data.secondary_color,
            accent_color=data.accent_color,
            display_name=data.display_name,
            website=str(data.website) if data.website else None,
            social_media=data.social_media,
            contact_email=str(data.contact_email) if data.contact_email else None,
            contact_phone=data.contact_phone,
            address=data.address,
            city=data.city,
            region=data.region,
            country=data.country,
            home_venue_id=data.home_venue_id,
        )

        self.session.add(club)
        await self.session.commit()
        await self.session.refresh(club)

        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="club",
            resource_id=club.id,
            new_values={
                "name": data.name,
                "category": data.category,
                "organization_id": str(data.organization_id),
            },
            user_id=user_id,
        )

        return club

    async def get_club(self, club_id: UUID) -> Optional[Club]:
        """Get club by ID."""
        result = await self.session.execute(
            select(Club).where(Club.id == club_id, Club.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_club_with_relations(self, club_id: UUID) -> Optional[Club]:
        """Get club with all relations loaded."""
        result = await self.session.execute(
            select(Club)
            .where(Club.id == club_id, Club.is_deleted == False)
            .options(
                selectinload(Club.organization),
                selectinload(Club.teams).selectinload(Team.players),
                selectinload(Club.teams).selectinload(Team.coaches),
                selectinload(Club.administrators),
                selectinload(Club.home_venue).selectinload(Venue.courts),
            )
        )
        return result.scalar_one_or_none()

    async def list_clubs(
        self,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Club]:
        """List clubs for an organization."""
        query = select(Club).where(
            Club.organization_id == organization_id,
            Club.is_deleted == False,
        )

        if category:
            query = query.where(Club.category == category)
        if status:
            query = query.where(Club.status == status)

        query = query.offset(skip).limit(limit).order_by(Club.name)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_club_with_relations(self, club_id: UUID) -> Optional[Club]:
        """Get club with teams, administrators, and venue loaded."""
        result = await self.session.execute(
            select(Club)
            .where(Club.id == club_id, Club.is_deleted == False)
            .options(
                selectinload(Club.teams).selectinload(Team.players),
                selectinload(Club.administrators),
                selectinload(Club.home_venue).selectinload(Venue.courts),
            )
        )
        return result.scalar_one_or_none()

    async def update_club(
        self,
        club_id: UUID,
        data: ClubUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Club]:
        """Update a club."""
        club = await self.get_club(club_id)
        if not club:
            return None

        old_values = {
            "name": club.name,
            "category": club.category,
            "status": club.status,
            "primary_color": club.primary_color,
            "secondary_color": club.secondary_color,
        }

        # Update fields
        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            if key == "logo_url" and value:
                setattr(club, key, str(value))
            elif key == "banner_url" and value:
                setattr(club, key, str(value))
            elif key == "website" and value:
                setattr(club, key, str(value))
            else:
                setattr(club, key, value)

        club.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(club)

        # Log audit
        new_values = {
            "name": club.name,
            "category": club.category,
            "status": club.status,
            "primary_color": club.primary_color,
            "secondary_color": club.secondary_color,
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="club",
            resource_id=club.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return club

    async def delete_club(self, club_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a club."""
        club = await self.get_club(club_id)
        if not club:
            return False

        club.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="club",
            resource_id=club.id,
            user_id=user_id,
        )
        return True

    async def search_clubs(
        self, organization_id: UUID, query: str, limit: int = 20
    ) -> List[Club]:
        """Search clubs by name."""
        result = await self.session.execute(
            select(Club)
            .where(Club.organization_id == organization_id)
            .where(Club.name.ilike(f"%{query}%"))
            .where(Club.is_deleted == False)
            .limit(limit)
            .order_by(Club.name)
        )
        return result.scalars().all()

    async def get_club_teams(self, club_id: UUID) -> List["Team"]:
        """Get all teams for a club."""
        result = await self.session.execute(
            select(Team)
            .where(Team.club_id == club_id, Team.is_deleted == False)
            .order_by(Team.name)
        )
        return result.scalars().all()

    async def _log_audit(
        self,
        action: AuditAction,
        resource_type: str,
        resource_id: UUID,
        old_values: dict = None,
        new_values: dict = None,
        user_id: Optional[str] = None,
    ) -> None:
        """Log audit entry."""
        audit = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            user_id=UUID(user_id) if isinstance(user_id, str) else user_id,
        )
        self.session.add(audit)
        await self.session.flush()


class TeamService:
    """Team service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_team(
        self,
        data: TeamCreate,
        user_id: Optional[str] = None,
    ) -> Team:
        """Create a new team."""
        # Validate club exists
        club = await self.session.get(Club, data.club_id)
        if not club:
            raise ValueError("Club not found")

        # Validate organization matches
        if club.organization_id != data.organization_id:
            raise ValueError("Club does not belong to the specified organization")

        team = Team(
            organization_id=data.organization_id,
            club_id=data.club_id,
            name=data.name,
            short_name=data.short_name,
            code=data.code,
            category=data.category,
            gender=data.gender,
            age_category=data.age_category,
            competition_level=data.competition_level,
            logo_url=data.logo_url,
            primary_color=data.primary_color,
            secondary_color=data.secondary_color,
            description=data.description,
            founded_year=data.founded_year,
            home_venue_id=data.home_venue_id,
            display_name=data.display_name,
            website=data.website,
            social_media=data.social_media,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            address=data.address,
            city=data.city,
            region=data.region,
            country=data.country,
            status="active",
        )

        self.session.add(team)
        await self.session.commit()
        await self.session.refresh(team)

        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="team",
            resource_id=team.id,
            new_values={"name": data.name, "club_id": str(data.club_id), "category": data.category},
            user_id=user_id,
        )

        return team

    async def get_team(self, team_id: UUID) -> Optional[Team]:
        """Get team by ID."""
        result = await self.session.execute(
            select(Team).where(Team.id == team_id, Team.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_team_with_relations(self, team_id: UUID) -> Optional[Team]:
        """Get team with all relations loaded."""
        result = await self.session.execute(
            select(Team)
            .where(Team.id == team_id, Team.is_deleted == False)
            .options(
                selectinload(Team.organization),
                selectinload(Team.club),
                selectinload(Team.players),
                selectinload(Team.coaches),
                selectinload(Team.home_venue),
                selectinload(Team.competition_teams).selectinload(CompetitionTeam.competition),
            )
        )
        return result.scalar_one_or_none()

    async def list_teams(
        self,
        organization_id: UUID,
        club_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        category: Optional[str] = None,
        gender: Optional[str] = None,
        age_category: Optional[str] = None,
    ) -> List[Team]:
        """List teams with filters."""
        query = select(Team).where(
            Team.organization_id == organization_id,
            Team.is_deleted == False,
        )

        if club_id:
            query = query.where(Team.club_id == club_id)
        if status:
            query = query.where(Team.status == status)
        if category:
            query = query.where(Team.category == category)
        if gender:
            query = query.where(Team.gender == gender)

        query = query.order_by(Team.name).offset(skip).limit(limit)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_team(
        self,
        team_id: UUID,
        data: TeamUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Team]:
        """Update a team."""
        team = await self.get_team(team_id)
        if not team:
            return None

        old_values = {
            "name": team.name,
            "category": team.category,
            "status": team.status,
            "primary_color": team.primary_color,
            "secondary_color": team.secondary_color,
        }

        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            setattr(team, key, value)

        team.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(team)

        new_values = {
            "name": team.name,
            "category": team.category,
            "status": team.status,
            "primary_color": team.primary_color,
            "secondary_color": team.secondary_color,
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="team",
            resource_id=team.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return team

    async def delete_team(self, team_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a team."""
        team = await self.get_team(team_id)
        if not team:
            return False

        team.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="team",
            resource_id=team.id,
            user_id=user_id,
        )
        return True

    async def search_teams(self, organization_id: UUID, query: str, limit: int = 20) -> List[Team]:
        """Search teams by name."""
        result = await self.session.execute(
            select(Team)
            .where(Team.organization_id == organization_id)
            .where(Team.name.ilike(f"%{query}%"))
            .where(Team.is_deleted == False)
            .limit(limit)
            .order_by(Team.name)
        )
        return result.scalars().all()

    async def _log_audit(
        self,
        action: AuditAction,
        resource_type: str,
        resource_id: UUID,
        old_values: dict = None,
        new_values: dict = None,
        user_id: Optional[str] = None,
    ) -> None:
        """Log audit entry."""
        audit = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            user_id=UUID(user_id) if isinstance(user_id, str) else user_id,
        )
        self.session.add(audit)
        await self.session.flush()


class TeamParticipationService:
    """Team Participation service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_team_for_competition(
        self,
        data: TeamParticipationCreate,
        user_id: Optional[str] = None,
    ) -> CompetitionTeam:
        """Register a team for a competition."""
        from app.models.competition import CompetitionTeam

        # Validate competition exists
        comp = await self.session.get(Competition, data.competition_id)
        if not comp:
            raise ValueError("Competition not found")

        # Validate team exists
        team = await self.session.get(Team, data.team_id)
        if not team:
            raise ValueError("Team not found")

        # Check if team is already registered
        existing = await self.session.execute(
            select(CompetitionTeam).where(
                CompetitionTeam.competition_id == data.competition_id,
                CompetitionTeam.team_id == data.team_id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Team is already registered for this competition")

        # Validate season
        if data.season_id:
            season = await self.session.get(Season, data.season_id)
            if not season:
                raise ValueError("Season not found")

        ct = CompetitionTeam(
            competition_id=data.competition_id,
            team_id=data.team_id,
            group_name=data.group_name,
            seed=data.seed,
        )

        self.session.add(ct)
        await self.session.commit()
        await self.session.refresh(ct)

        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="competition_team",
            resource_id=ct.id,
            new_values={
                "competition_id": str(data.competition_id),
                "team_id": str(data.team_id),
                "group_name": data.group_name,
                "seed": data.seed,
            },
            user_id=user_id,
        )

        return ct

    async def get_competition_team(self, comp_id: UUID, team_id: UUID) -> Optional[CompetitionTeam]:
        """Get competition team registration."""
        result = await self.session.execute(
            select(CompetitionTeam).where(
                CompetitionTeam.competition_id == comp_id,
                CompetitionTeam.team_id == team_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_competition_teams(
        self,
        comp_id: UUID,
        status: Optional[str] = None,
    ) -> List[CompetitionTeam]:
        """Get all teams for a competition."""
        query = select(CompetitionTeam).where(CompetitionTeam.competition_id == UUID(comp_id))
        if status:
            query = query.where(CompetitionTeam.status == status)
        query = query.options(selectinload(CompetitionTeam.team))
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_team_compets(
        self,
        team_id: UUID,
        season_id: Optional[UUID] = None,
    ) -> List[CompetitionTeam]:
        """Get all competitions for a team."""
        query = select(CompetitionTeam).where(CompetitionTeam.team_id == UUID(team_id))
        if season_id:
            query = query.where(CompetitionTeam.season_id == UUID(season_id))
        query = query.options(
            selectinload(CompetitionTeam.competition).selectinload(Competition.season)
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_team_participation(
        self,
        comp_id: UUID,
        team_id: UUID,
        data: TeamParticipationUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[CompetitionTeam]:
        """Update team participation in competition."""
        ct = await self.get_competition_team(comp_id, team_id)
        if not ct:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(ct, key, value)

        await self.session.commit()
        await self.session.refresh(ct)
        return ct

    async def remove_team_from_competition(
        self,
        comp_id: UUID,
        team_id: UUID,
        user_id: Optional[str] = None,
    ) -> bool:
        """Remove a team from a competition."""
        ct = await self.get_competition_team(comp_id, team_id)
        if not ct:
            return False

        await self.session.delete(ct)
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="competition_team",
            resource_id=ct.id,
            user_id=user_id,
        )
        return True

    async def _log_audit(
        self,
        action: AuditAction,
        resource_type: str,
        resource_id: UUID,
        old_values: dict = None,
        new_values: dict = None,
        user_id: Optional[str] = None,
    ) -> None:
        """Log audit entry."""
        audit = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            user_id=UUID(user_id) if isinstance(user_id, str) else user_id,
        )
        self.session.add(audit)
        await self.session.flush()


async def get_club_service(session: AsyncSession = Depends(get_async_session)) -> ClubService:
    return ClubService(session)


async def get_team_service(session: AsyncSession = Depends(get_async_session)) -> TeamService:
    return TeamService(session)


async def get_team_participation_service(session: AsyncSession = Depends(get_async_session)) -> TeamParticipationService:
    return TeamParticipationService(session)