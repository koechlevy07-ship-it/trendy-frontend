"""Tournament endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
import random

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db as get_db
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models.team import Team
from app.models.match import Match, MatchStatus, MatchFormat
from app.models.team import Team

router = APIRouter()


@router.post("", status_code=201)
async def create_tournament(
    name: str,
    format: str,
    start_date: datetime,
    end_date: datetime,
    organization_id: str,
    team_ids: List[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Create a new tournament."""
    from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
    from app.models.team import Team
    from uuid import UUID
    
    tournament = Tournament(
        name=name,
        format=TournamentFormat(format),
        start_date=start_date,
        end_date=end_date,
        organization_id=UUID(organization_id),
        status=TournamentStatus.UPCOMING,
    )
    
    if team_ids:
        teams = await session.execute(
            select(Team).where(Team.id.in_([UUID(tid) for tid in team_ids]))
        )
        teams = list(teams.scalars().all())
        if len(teams) != len(team_ids):
            raise HTTPException(status_code=400, detail="One or more teams not found")
        
    session.add(tournament)
    await session.commit()
    await session.refresh(tournament)
    
    return {
        "id": str(tournament.id),
        "name": tournament.name,
        "format": tournament.format.value,
        "start_date": tournament.start_date.isoformat(),
        "end_date": tournament.end_date.isoformat(),
        "status": tournament.status.value,
    }


@router.get("", response_model=list)
async def list_tournaments(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    organization_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    from app.models.tournament import Tournament, TournamentStatus
    from sqlalchemy import select, func
    from sqlalchemy.orm import selectinload
    
    query = select(Tournament)
    
    if status:
        query = query.where(Tournament.status == status)
    if organization_id:
        query = query.where(Tournament.organization_id == UUID(organization_id))
    
    query = query.order_by(Tournament.start_date.desc()).offset(skip).limit(limit)
    result = await session.execute(query)
    tournaments = result.scalars().all()
    
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "format": t.format.value,
            "start_date": t.start_date.isoformat(),
            "end_date": t.end_date.isoformat(),
            "status": t.status.value,
            "organization_id": str(t.organization_id),
            "team_count": len(t.team_ids) if t.team_ids else 0,
        }
        for t in tournaments
    ]


@router.get("/{tournament_id}")
async def get_tournament(
    tournament_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    from app.models.tournament import Tournament
    from uuid import UUID
    
    tournament = await session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Get teams in tournament
    from app.models.team import Team
    from sqlalchemy import select
    from uuid import UUID
    
    teams_result = await session.execute(
        select(Team).where(Team.id.in_(tournament.team_ids))
    )
    teams = list(teams.scalars().all())
    
    return {
        "id": str(tournament.id),
        "name": tournament.name,
        "format": tournament.format.value,
        "start_date": tournament.start_date.isoformat(),
        "end_date": tournament.end_date.isoformat(),
        "organization_id": str(tournament.organization_id),
        "status": tournament.status.value,
        "team_count": len(tournament.team_ids),
        "teams": [
            {
                "id": str(t.id),
                "name": t.name,
                "short_name": t.short_name,
                "logo_url": t.logo_url,
            }
            for t in teams
        ],
        "created_at": tournament.created_at.isoformat(),
        "updated_at": tournament.updated_at.isoformat(),
    }


@router.post("/{tournament_id}/teams", status_code=201)
async def add_team_to_tournament(
    tournament_id: str,
    team_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    from app.models.tournament import Tournament
    from app.models.team import Team
    from uuid import UUID
    
    tournament = await session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if team.id in tournament.team_ids:
        raise HTTPException(status_code=400, detail="Team already in tournament")
    
    tournament.team_ids.append(team.id)
    session.add(tournament)
    await session.commit()
    
    return {"message": "Team added to tournament"}


@router.delete("/{tournament_id}/teams/{team_id}", status_code=204)
async def remove_team_from_tournament(
    tournament_id: str,
    team_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    from app.models.tournament import Tournament
    from uuid import UUID
    
    tournament = await session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if UUID(team_id) not in tournament.team_ids:
        raise HTTPException(status_code=404, detail="Team not in tournament")
    
    tournament.team_ids.remove(UUID(team_id))
    await session.commit()
    return None


@router.post("/{tournament_id}/generate-fixtures", status_code=201)
async def generate_fixtures(
    tournament_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Generate match fixtures for tournament."""
    from app.models.tournament import Tournament, TournamentFormat
    from app.models.match import Match, MatchFormat, MatchStatus
    from app.models.team import Team
    from uuid import UUID
    import random
    from datetime import timedelta
    
    tournament = await session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.status != "upcoming":
        raise HTTPException(status_code=400, detail="Can only generate fixtures for upcoming tournaments")
    
    # Get teams
    from app.models.team import Team
    from sqlalchemy import select
    teams_result = await session.execute(
        select(Team).where(Team.id.in_(tournament.team_ids))
    )
    teams = list(teams.scalars().all())
    
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 teams")
    
    matches = []
    
    if tournament.format.value == "round_robin":
        # Round robin: each team plays each other once
        for i in range(len(teams)):
            for j in range(i+1, len(teams)):
                match = Match(
                    tournament_id=UUID(tournament.id),
                    home_team_id=teams[i].id,
                    away_team_id=teams[j].id,
                    match_date=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
                    sets_format="best_of_5",
                    status="scheduled",
                )
                session.add(match)
                matches.append(match)
    
    elif tournament.format.value == "knockout":
        # Single elimination bracket
        teams_copy = teams.copy()
        random.shuffle(teams_copy)
        
        while len(teams_copy) > 1:
            next_round = []
            for i in range(0, len(teams_copy), 2):
                if i + 1 < len(teams_copy):
                    match = Match(
                        tournament_id=UUID(tournament.id),
                        home_team_id=teams_copy[i].id,
                        away_team_id=teams_copy[i+1].id,
                        match_date=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
                        sets_format="best_of_5",
                        status="scheduled",
                    )
                    session.add(match)
                    matches.append(match)
                    next_round.append(teams_copy[i])  # winner placeholder
            teams = next_round
    
    await session.commit()
    
    return {"message": f"Generated {len(matches)} matches for tournament"}


@router.put("/{tournament_id}/status", response_model=dict)
async def update_tournament_status(
    tournament_id: str,
    status: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    from app.models.tournament import Tournament, TournamentStatus
    from uuid import UUID
    
    tournament = await session.get(Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if status not in [s.value for s in TournamentStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    tournament.status = status
    tournament.updated_at = datetime.utcnow()
    await session.commit()
    
    return {"message": "Tournament status updated", "status": status}