"""Organization services for business logic."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import Depends

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.api.deps import get_async_session
from app.models.organization import Organization, Team, Venue, Court
from app.models.competition import Season, Competition, CompetitionTeam
from app.models.reports import AuditLog
from app.models.core import AuditAction
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


class OrganizationService:
    """Organization service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_organization(
        self,
        data: OrganizationCreate,
        user_id: Optional[str] = None,
    ) -> Organization:
        """Create a new organization."""
        # Validate parent organization exists if provided
        if data.parent_organization_id:
            parent = await self.session.get(Organization, data.parent_organization_id)
            if not parent:
                raise ValueError("Parent organization not found")
            if parent.is_deleted:
                raise ValueError("Cannot assign to deleted parent organization")

        org = Organization(
            name=data.name,
            type=data.type,
            country=data.country,
            region=data.region,
            logo_url=str(data.logo_url) if data.logo_url else None,
            contact_email=str(data.contact_email) if data.contact_email else None,
            contact_phone=data.contact_phone,
            website=str(data.website) if data.website else None,
            address=data.address,
            time_zone=data.time_zone,
            settings=data.settings,
            parent_organization_id=data.parent_organization_id,
            owner_id=data.owner_id,
        )

        self.session.add(org)
        await self.session.commit()
        await self.session.refresh(org)

        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="organization",
            resource_id=org.id,
            new_values={"name": data.name, "type": data.type, "country": data.country},
            user_id=user_id,
        )

        return org

    async def get_organization(self, org_id: UUID) -> Optional[Organization]:
        """Get organization by ID."""
        result = await self.session.execute(
            select(Organization).where(Organization.id == org_id, Organization.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_organization_with_relations(self, org_id: UUID) -> Optional[Organization]:
        """Get organization with all relations loaded."""
        result = await self.session.execute(
            select(Organization)
            .where(Organization.id == org_id)
            .options(
                selectinload(Organization.teams),
                selectinload(Organization.venues).selectinload(Venue.courts),
                selectinload(Organization.seasons),
                selectinload(Organization.competitions),
                selectinload(Organization.users),
            )
        )
        return result.scalar_one_or_none()

    async def list_organizations(
        self,
        skip: int = 0,
        limit: int = 100,
        country: Optional[str] = None,
        org_type: Optional[str] = None,
        status: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> List[Organization]:
        """List organizations with filters."""
        query = select(Organization).where(Organization.is_deleted == False)

        if country:
            query = query.where(Organization.country == country)
        if org_type:
            query = query.where(Organization.type == org_type)
        if status:
            query = query.where(Organization.status == status)
        if parent_id:
            query = query.where(Organization.parent_organization_id == parent_id)
        else:
            query = query.where(Organization.parent_organization_id.is_(None))

        query = query.offset(skip).limit(limit).order_by(Organization.name)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_organization_tree(self) -> List[Organization]:
        """Get organization hierarchy tree (root organizations only)."""
        result = await self.session.execute(
            select(Organization)
            .where(Organization.is_deleted == False)
            .where(Organization.parent_organization_id.is_(None))
            .order_by(Organization.name)
            .options(selectinload(Organization.users))
        )
        return result.scalars().all()

    async def update_organization(
        self,
        org_id: UUID,
        data: OrganizationUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Organization]:
        """Update an organization."""
        org = await self.get_organization(org_id)
        if not org:
            return None

        # Track changes for audit
        old_values = {
            "name": org.name,
            "type": org.type,
            "country": org.country,
            "region": org.region,
            "status": org.status,
            "time_zone": org.time_zone,
        }

        # Validate parent organization if changing
        if data.parent_organization_id is not None:
            if data.parent_organization_id == org_id:
                raise ValueError("Organization cannot be its own parent")
            if data.parent_organization_id:
                parent = await self.session.get(Organization, data.parent_organization_id)
                if not parent:
                    raise ValueError("Parent organization not found")
                # Check for circular reference
                if await self._would_create_cycle(org_id, data.parent_organization_id):
                    raise ValueError("Cannot create circular hierarchy")

        # Update fields
        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            if key == "logo_url" and value:
                setattr(org, key, str(value))
            elif key == "website" and value:
                setattr(org, key, str(value))
            elif key == "contact_email" and value:
                setattr(org, key, str(value))
            else:
                setattr(org, key, value)

        org.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(org)

        # Log audit
        new_values = {
            "name": org.name,
            "type": org.type,
            "country": org.country,
            "region": org.region,
            "status": org.status,
            "time_zone": org.time_zone,
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="organization",
            resource_id=org.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return org

    async def delete_organization(self, org_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete an organization."""
        org = await self.get_organization(org_id)
        if not org:
            return False

        org.soft_delete(user_id)
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="organization",
            resource_id=org.id,
            user_id=user_id,
        )
        return True

    async def get_sub_organizations(self, parent_id: UUID) -> List[Organization]:
        """Get direct child organizations."""
        result = await self.session.execute(
            select(Organization)
            .where(Organization.parent_organization_id == parent_id)
            .where(Organization.is_deleted == False)
            .order_by(Organization.name)
        )
        return result.scalars().all()

    async def search_organizations(self, query: str, limit: int = 20) -> List[Organization]:
        """Search organizations by name."""
        result = await self.session.execute(
            select(Organization)
            .where(Organization.name.ilike(f"%{query}%"))
            .where(Organization.is_deleted == False)
            .limit(limit)
            .order_by(Organization.name)
        )
        return result.scalars().all()

    async def archive_organization(self, org_id: UUID, user_id: Optional[str] = None) -> Optional[Organization]:
        """Archive an organization by setting status to inactive."""
        org = await self.get_organization(org_id)
        if not org:
            return None
        org.status = OrganizationStatus.INACTIVE
        org.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(org)
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="organization",
            resource_id=org.id,
            new_values={"status": "inactive"},
            user_id=user_id,
        )
        return org

    async def get_all_descendants(self, org_id: UUID) -> List[Organization]:
        """Get all descendant organizations recursively."""
        descendants = []
        direct_children = await self.get_sub_organizations(org_id)
        descendants.extend(direct_children)
        for child in direct_children:
            descendants.extend(await self.get_all_descendants(child.id))
        return descendants

    async def _would_create_cycle(self, org_id: UUID, new_parent_id: UUID) -> bool:
        """Check if adding parent would create a cycle."""
        current = new_parent_id
        while current:
            if current == org_id:
                return True
            parent = await self.session.get(Organization, current)
            if not parent:
                break
            current = parent.parent_organization_id
        return False

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


class VenueService:
    """Venue service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_venue(
        self,
        data: VenueCreate,
        user_id: Optional[str] = None,
    ) -> Venue:
        """Create a new venue."""
        venue = Venue(
            organization_id=data.organization_id,
            name=data.name,
            type=data.type,
            address=data.address,
            city=data.city,
            region=data.region,
            country=data.country,
            postal_code=data.postal_code,
            latitude=data.latitude,
            longitude=data.longitude,
            capacity=data.capacity,
            description=data.description,
            amenities=data.amenities,
            metadata_=data.metadata_,
        )

        self.session.add(venue)
        await self.session.commit()
        await self.session.refresh(venue)

        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="venue",
            resource_id=venue.id,
            new_values={"name": data.name, "city": data.city, "country": data.country},
            user_id=user_id,
        )

        return venue

    async def get_venue(self, venue_id: UUID) -> Optional[Venue]:
        """Get venue by ID."""
        result = await self.session.execute(
            select(Venue).where(Venue.id == venue_id, Venue.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_venue_with_courts(self, venue_id: UUID) -> Optional[Venue]:
        """Get venue with courts."""
        result = await self.session.execute(
            select(Venue).where(Venue.id == venue_id, Venue.is_deleted == False)
        )
        venue = result.scalar_one_or_none()
        if venue:
            result = await self.session.execute(
                select(Court).where(Court.venue_id == venue_id, Court.is_deleted == False).order_by(Court.number)
            )
            venue.courts = result.scalars().all()
        return venue

    async def search_venues(
        self, organization_id: UUID, query: str, limit: int = 20
    ) -> List[Venue]:
        """Search venues by name."""
        result = await self.session.execute(
            select(Venue)
            .where(Venue.organization_id == organization_id)
            .where(Venue.name.ilike(f"%{query}%"))
            .where(Venue.is_deleted == False)
            .limit(limit)
            .order_by(Venue.name)
        )
        return result.scalars().all()

    async def list_venues(
        self,
        organization_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Venue]:
        """List venues for an organization."""
        result = await self.session.execute(
            select(Venue)
            .where(Venue.organization_id == organization_id)
            .where(Venue.is_deleted == False)
            .offset(skip)
            .limit(limit)
            .order_by(Venue.name)
        )
        return result.scalars().all()

    async def update_venue(
        self,
        venue_id: UUID,
        data: VenueUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Venue]:
        """Update a venue."""
        venue = await self.get_venue(venue_id)
        if not venue:
            return None

        old_values = {
            "name": venue.name,
            "type": venue.type,
            "city": venue.city,
            "country": venue.country,
            "capacity": venue.capacity,
        }

        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            setattr(venue, key, value)

        venue.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(venue)

        new_values = {
            "name": venue.name,
            "type": venue.type,
            "city": venue.city,
            "country": venue.country,
            "capacity": venue.capacity,
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="venue",
            resource_id=venue.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return venue

    async def delete_venue(self, venue_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a venue."""
        venue = await self.get_venue(venue_id)
        if not venue:
            return False

        venue.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="venue",
            resource_id=venue.id,
            user_id=user_id,
        )
        return True

    async def create_court(
        self,
        data: CourtCreate,
        user_id: Optional[str] = None,
    ) -> Court:
        """Create a court."""
        court = Court(
            venue_id=data.venue_id,
            name=data.name,
            number=data.number,
            type=data.type,
            surface=data.surface,
            dimensions=data.dimensions,
            has_streaming=data.has_streaming,
            has_scoreboard=data.has_scoreboard,
            camera_positions=data.camera_positions,
            metadata_=data.metadata_,
        )

        self.session.add(court)
        await self.session.commit()
        await self.session.refresh(court)

        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="court",
            resource_id=court.id,
            new_values={"name": data.name, "number": data.number, "venue_id": str(data.venue_id)},
            user_id=user_id,
        )

        return court

    async def get_court(self, court_id: UUID) -> Optional[Court]:
        """Get court by ID."""
        result = await self.session.execute(
            select(Court).where(Court.id == court_id, Court.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def list_courts(self, venue_id: UUID) -> List[Court]:
        """List courts for a venue."""
        result = await self.session.execute(
            select(Court)
            .where(Court.venue_id == venue_id)
            .where(Court.is_deleted == False)
            .order_by(Court.number)
        )
        return result.scalars().all()

    async def update_court(
        self,
        court_id: UUID,
        data: CourtUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Court]:
        """Update a court."""
        court = await self.get_court(court_id)
        if not court:
            return None

        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            setattr(court, key, value)

        court.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(court)
        return court

    async def delete_court(self, court_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a court."""
        court = await self.get_court(court_id)
        if not court:
            return False

        court.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="court",
            resource_id=court.id,
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


class CompetitionService:
    """Competition service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_competition(
        self,
        data: CompetitionCreate,
        user_id: Optional[str] = None,
    ) -> Competition:
        """Create a new competition."""
        # Validate season exists
        season = await self.session.get(Season, data.season_id)
        if not season:
            raise ValueError("Season not found")

        # Validate organization
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise ValueError("Organization not found")

        comp = Competition(
            organization_id=data.organization_id,
            season_id=data.season_id,
            name=data.name,
            short_name=data.short_name,
            competition_type=data.competition_type,
            gender=data.gender,
            age_category=data.age_category,
            competition_level=data.competition_level,
            max_teams=data.max_teams,
            start_date=data.start_date,
            end_date=data.end_date,
            format_config=data.format_config,
            rules=data.rules,
            prize_info=data.prize_info,
            metadata_=data.metadata_,
        )

        self.session.add(comp)
        await self.session.commit()
        await self.session.refresh(comp)

        # Log audit
        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="competition",
            resource_id=comp.id,
            new_values={
                "name": data.name,
                "type": data.competition_type,
                "season_id": str(data.season_id),
            },
            user_id=user_id,
        )

        return comp

    async def get_competition(self, comp_id: UUID) -> Optional[Competition]:
        """Get competition by ID."""
        result = await self.session.execute(
            select(Competition).where(Competition.id == comp_id, Competition.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_competition_with_teams(self, comp_id: UUID) -> Optional[Competition]:
        """Get competition with teams."""
        result = await self.session.execute(
            select(Competition)
            .where(Competition.id == comp_id)
            .options(selectinload(Competition.teams).selectinload("team"))
        )
        return result.scalar_one_or_none()

    async def search_competitions(
        self, organization_id: UUID, query: str, limit: int = 20
    ) -> List[Competition]:
        """Search competitions by name within an organization."""
        result = await self.session.execute(
            select(Competition)
            .where(Competition.organization_id == organization_id)
            .where(Competition.name.ilike(f"%{query}%"))
            .where(Competition.is_deleted == False)
            .limit(limit)
            .order_by(Competition.name)
        )
        return result.scalars().all()

    async def list_competitions(
        self,
        organization_id: Optional[UUID] = None,
        season_id: Optional[UUID] = None,
        competition_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Competition]:
        """List competitions with filters."""
        query = select(Competition).where(Competition.is_deleted == False)

        if organization_id:
            query = query.where(Competition.organization_id == organization_id)
        if season_id:
            query = query.where(Competition.season_id == season_id)
        if competition_type:
            query = query.where(Competition.competition_type == competition_type)
        if status:
            query = query.where(Competition.status == status)

        query = query.offset(skip).limit(limit).order_by(Competition.name)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_competition(
        self,
        comp_id: UUID,
        data: CompetitionUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Competition]:
        """Update a competition."""
        comp = await self.get_competition(comp_id)
        if not comp:
            return None

        old_values = {
            "name": comp.name,
            "status": comp.status,
            "type": comp.competition_type,
            "max_teams": comp.max_teams,
        }

        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            setattr(comp, key, value)

        comp.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(comp)

        new_values = {
            "name": comp.name,
            "status": comp.status,
            "type": comp.competition_type,
            "max_teams": comp.max_teams,
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="competition",
            resource_id=comp.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return comp

    async def delete_competition(self, comp_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a competition."""
        comp = await self.get_competition(comp_id)
        if not comp:
            return False

        comp.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="competition",
            resource_id=comp.id,
            user_id=user_id,
        )
        return True

    async def add_team(
        self,
        comp_id: UUID,
        team_id: UUID,
        group_name: Optional[str] = None,
        seed: Optional[int] = None,
    ) -> Optional["CompetitionTeam"]:
        """Add a team to competition."""
        from app.models.competition import CompetitionTeam

        comp = await self.get_competition(comp_id)
        if not comp:
            return None

        team = await self.session.get(Team, team_id)
        if not team:
            return None

        ct = CompetitionTeam(
            competition_id=comp_id,
            team_id=team_id,
            group_name=group_name,
            seed=seed,
        )
        self.session.add(ct)
        await self.session.commit()
        await self.session.refresh(ct)
        return ct

    async def remove_team(self, comp_id: UUID, team_id: UUID) -> bool:
        """Remove a team from competition."""
        from app.models.competition import CompetitionTeam

        result = await self.session.execute(
            select(CompetitionTeam)
            .where(CompetitionTeam.competition_id == comp_id)
            .where(CompetitionTeam.team_id == team_id)
        )
        ct = result.scalar_one_or_none()
        if ct:
            await self.session.delete(ct)
            await self.session.commit()
            return True
        return False

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


class SeasonService:
    """Season service for business logic."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_season(
        self,
        data: SeasonCreate,
        user_id: Optional[str] = None,
    ) -> Season:
        """Create a new season."""
        org = await self.session.get(Organization, data.organization_id)
        if not org:
            raise ValueError("Organization not found")

        # Check if only one active season allowed
        if data.status == "active":
            active = await self.session.execute(
                select(Season)
                .where(Season.organization_id == data.organization_id)
                .where(Season.status == "active")
                .where(Season.is_deleted == False)
            )
            if active.scalar_one_or_none():
                raise ValueError("Organization already has an active season")

        season = Season(
            organization_id=data.organization_id,
            name=data.name,
            short_name=data.short_name,
            start_date=data.start_date,
            end_date=data.end_date,
            registration_start=data.registration_start,
            registration_end=data.registration_end,
            status=data.status,
            description=data.description,
            metadata_=data.metadata_,
        )

        self.session.add(season)
        await self.session.commit()
        await self.session.refresh(season)

        await self._log_audit(
            action=AuditAction.CREATE,
            resource_type="season",
            resource_id=season.id,
            new_values={"name": data.name, "status": data.status},
            user_id=user_id,
        )

        return season

    async def get_season(self, season_id: UUID) -> Optional[Season]:
        """Get season by ID."""
        result = await self.session.execute(
            select(Season).where(Season.id == season_id, Season.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_season_with_competitions(self, season_id: UUID) -> Optional[Season]:
        """Get season with competitions."""
        result = await self.session.execute(
            select(Season)
            .where(Season.id == season_id)
            .options(selectinload(Season.competitions))
        )
        return result.scalar_one_or_none()

    async def list_seasons(
        self,
        organization_id: UUID,
        status: Optional[str] = None,
    ) -> List[Season]:
        """List seasons for an organization."""
        query = select(Season).where(
            Season.organization_id == organization_id,
            Season.is_deleted == False,
        )
        if status:
            query = query.where(Season.status == status)
        query = query.order_by(Season.start_date.desc())
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_season(
        self,
        season_id: UUID,
        data: SeasonUpdate,
        user_id: Optional[str] = None,
    ) -> Optional[Season]:
        """Update a season."""
        season = await self.get_season(season_id)
        if not season:
            return None

        old_values = {
            "name": season.name,
            "status": season.status,
            "start_date": str(season.start_date),
            "end_date": str(season.end_date),
        }

        # Check active season constraint
        if data.status == "active":
            active = await self.session.execute(
                select(Season)
                .where(Season.organization_id == season.organization_id)
                .where(Season.status == "active")
                .where(Season.is_deleted == False)
                .where(Season.id != season_id)
            )
            if active.scalar_one_or_none():
                raise ValueError("Organization already has an active season")

        update_data = data.model_dump(exclude_unset=True, exclude={"metadata_"})
        for key, value in update_data.items():
            setattr(season, key, value)

        season.updated_at = datetime.utcnow()

        await self.session.commit()
        await self.session.refresh(season)

        new_values = {
            "name": season.name,
            "status": season.status,
            "start_date": str(season.start_date),
            "end_date": str(season.end_date),
        }
        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="season",
            resource_id=season.id,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
        )

        return season

    async def activate_season(self, season_id: UUID, user_id: Optional[str] = None) -> Optional[Season]:
        """Activate a season (deactivate others)."""
        season = await self.get_season(season_id)
        if not season:
            return None

        # Deactivate other seasons using ORM
        result = await self.session.execute(
            select(Season)
            .where(Season.organization_id == season.organization_id)
            .where(Season.id != season_id)
            .where(Season.status == "active")
        )
        for other in result.scalars().all():
            other.status = "archived"

        season.status = "active"
        season.updated_at = datetime.utcnow()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.UPDATE,
            resource_type="season",
            resource_id=season.id,
            new_values={"status": "active"},
            user_id=user_id,
        )

        return season

    async def delete_season(self, season_id: UUID, user_id: Optional[str] = None) -> bool:
        """Soft delete a season."""
        season = await self.get_season(season_id)
        if not season:
            return False

        season.soft_delete()
        await self.session.commit()

        await self._log_audit(
            action=AuditAction.DELETE,
            resource_type="season",
            resource_id=season.id,
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


# Dependency functions
async def get_organization_service(session: AsyncSession = Depends(get_async_session)) -> OrganizationService:
    return OrganizationService(session)


async def get_venue_service(session: AsyncSession = Depends(get_async_session)) -> VenueService:
    return VenueService(session)


async def get_competition_service(session: AsyncSession = Depends(get_async_session)) -> CompetitionService:
    return CompetitionService(session)


async def get_season_service(session: AsyncSession = Depends(get_async_session)) -> SeasonService:
    return SeasonService(session)