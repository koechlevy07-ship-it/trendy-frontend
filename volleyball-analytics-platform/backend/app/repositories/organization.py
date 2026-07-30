"""Organization repository for organization-related database operations."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.organization import Organization, Team, Venue, Court
from app.models.competition import Season, Competition, CompetitionTeam


class OrganizationRepository(BaseRepository):
    """Repository for Organization entity."""

    def __init__(self, session):
        super().__init__(Organization, session)

    async def get_with_teams(self, org_id: UUID) -> Optional[Organization]:
        """Get organization with teams."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == org_id)
            .options(selectinload(Organization.teams))
        )
        return result.scalar_one_or_none()

    async def get_with_venues(self, org_id: UUID) -> Optional[Organization]:
        """Get organization with venues and courts."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == org_id)
            .options(selectinload(Organization.venues).selectinload(Venue.courts))
        )
        return result.scalar_one_or_none()

    async def get_with_children(self, org_id: UUID) -> Optional[Organization]:
        """Get organization with child organizations."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == org_id)
            .options(selectinload(Organization.children))
        )
        return result.scalar_one_or_none()

    async def get_by_country(self, country: str) -> List[Organization]:
        """Get organizations by country code."""
        result = await self.session.execute(
            select(self.model).where(self.model.country == country)
        )
        return result.scalars().all()

    async def get_root_organizations(self) -> List[Organization]:
        """Get top-level organizations (no parent)."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.parent_organization_id.is_(None))
            .where(self.model.is_deleted == False)
            .order_by(self.model.name)
        )
        return result.scalars().all()

    async def get_descendants(self, parent_id: UUID) -> List[Organization]:
        """Get direct children of an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.parent_organization_id == parent_id)
            .where(self.model.is_deleted == False)
            .order_by(self.model.name)
        )
        return result.scalars().all()

    async def search_by_name(self, name: str, limit: int = 20) -> List[Organization]:
        """Search organizations by name."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.name.ilike(f"%{name}%"))
            .where(self.model.is_deleted == False)
            .limit(limit)
            .order_by(self.model.name)
        )
        return result.scalars().all()


class TeamRepository(BaseRepository):
    """Repository for Team entity."""

    def __init__(self, session):
        super().__init__(Team, session)

    async def get_with_players(self, team_id: UUID) -> Optional[Team]:
        """Get team with players."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == team_id)
            .options(selectinload(Team.players))
        )
        return result.scalar_one_or_none()

    async def get_with_coaches(self, team_id: UUID) -> Optional[Team]:
        """Get team with coaches."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == team_id)
            .options(selectinload(Team.coaches))
        )
        return result.scalar_one_or_none()

    async def get_by_organization(self, org_id: UUID) -> List[Team]:
        """Get all teams in an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_gender_age(self, gender: str, age_category: str) -> List[Team]:
        """Get teams by gender and age category."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.gender == gender)
            .where(self.model.age_category == age_category)
        )
        return result.scalars().all()


class VenueRepository(BaseRepository):
    """Repository for Venue entity."""

    def __init__(self, session):
        super().__init__(Venue, session)

    async def get_with_courts(self, venue_id: UUID) -> Optional[Venue]:
        """Get venue with courts."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == venue_id)
            .options(selectinload(Venue.courts))
        )
        return result.scalar_one_or_none()

    async def get_by_organization(self, org_id: UUID) -> List[Venue]:
        """Get all venues for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_city_country(self, city: str, country: str) -> List[Venue]:
        """Get venues by city and country."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.city == city)
            .where(self.model.country == country)
        )
        return result.scalars().all()

    async def search_by_name(self, org_id: UUID, name: str, limit: int = 20) -> List[Venue]:
        """Search venues by name within an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.name.ilike(f"%{name}%"))
            .where(self.model.is_deleted == False)
            .limit(limit)
            .order_by(self.model.name)
        )
        return result.scalars().all()


class CourtRepository(BaseRepository):
    """Repository for Court entity."""

    def __init__(self, session):
        super().__init__(Court, session)

    async def get_by_venue(self, venue_id: UUID) -> List[Court]:
        """Get all courts in a venue."""
        result = await self.session.execute(
            select(self.model).where(self.model.venue_id == venue_id)
        )
        return result.scalars().all()

    async def get_by_number(self, venue_id: UUID, number: int) -> Optional[Court]:
        """Get court by venue and number."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.venue_id == venue_id)
            .where(self.model.number == number)
        )
        return result.scalar_one_or_none()


class CompetitionRepository(BaseRepository):
    """Repository for Competition entity."""

    def __init__(self, session):
        super().__init__(Competition, session)

    async def get_with_teams(self, comp_id: UUID) -> Optional[Competition]:
        """Get competition with teams."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == comp_id)
            .options(selectinload(Competition.teams).selectinload(CompetitionTeam.team))
        )
        return result.scalar_one_or_none()

    async def get_by_organization(self, org_id: UUID) -> List[Competition]:
        """Get all competitions for an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.is_deleted == False)
            .order_by(self.model.name)
        )
        return result.scalars().all()

    async def get_by_season(self, season_id: UUID) -> List[Competition]:
        """Get all competitions in a season."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.season_id == season_id)
            .where(self.model.is_deleted == False)
            .order_by(self.model.name)
        )
        return result.scalars().all()

    async def search_by_name(self, org_id: UUID, name: str, limit: int = 20) -> List[Competition]:
        """Search competitions by name."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.name.ilike(f"%{name}%"))
            .where(self.model.is_deleted == False)
            .limit(limit)
            .order_by(self.model.name)
        )
        return result.scalars().all()


class SeasonRepository(BaseRepository):
    """Repository for Season entity."""

    def __init__(self, session):
        super().__init__(Season, session)

    async def get_with_competitions(self, season_id: UUID) -> Optional[Season]:
        """Get season with competitions."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == season_id)
            .options(selectinload(Season.competitions))
        )
        return result.scalar_one_or_none()

    async def get_by_organization(self, org_id: UUID) -> List[Season]:
        """Get all seasons for an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.is_deleted == False)
            .order_by(Season.start_date.desc())
        )
        return result.scalars().all()

    async def get_active_by_organization(self, org_id: UUID) -> Optional[Season]:
        """Get the active season for an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.status == "active")
            .where(self.model.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_upcoming_seasons(self, org_id: UUID) -> List[Season]:
        """Get upcoming seasons for an organization."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.organization_id == org_id)
            .where(self.model.status == "upcoming")
            .where(self.model.is_deleted == False)
            .order_by(Season.start_date.asc())
        )
        return result.scalars().all()


class CompetitionTeamRepository(BaseRepository):
    """Repository for CompetitionTeam entity."""

    def __init__(self, session):
        super().__init__(CompetitionTeam, session)

    async def get_by_competition(self, competition_id: UUID) -> List[CompetitionTeam]:
        """Get all teams in a competition."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.competition_id == competition_id)
            .options(selectinload(CompetitionTeam.team))
        )
        return result.scalars().all()

    async def get_by_team(self, team_id: UUID) -> List[CompetitionTeam]:
        """Get all competitions for a team."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_id == team_id)
            .options(selectinload(CompetitionTeam.competition))
        )
        return result.scalars().all()

    async def get_by_competition_and_team(self, competition_id: UUID, team_id: UUID) -> Optional[CompetitionTeam]:
        """Get specific competition-team relationship."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.competition_id == competition_id)
            .where(self.model.team_id == team_id)
        )
        return result.scalar_one_or_none()