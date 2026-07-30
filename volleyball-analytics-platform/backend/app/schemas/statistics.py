"""Statistics schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.base import BaseSchema


class PlayerStatisticsBase(BaseModel):
    """Base player statistics."""
    total_serves: int = 0
    service_aces: int = 0
    service_errors: int = 0
    attack_attempts: int = 0
    kills: int = 0
    attack_errors: int = 0
    blocked_attacks: int = 0
    solo_blocks: int = 0
    block_assists: int = 0
    block_errors: int = 0
    digs: int = 0
    saves: int = 0
    reception_attempts: int = 0
    perfect_receptions: int = 0
    positive_receptions: int = 0
    poor_receptions: int = 0
    reception_errors: int = 0
    set_attempts: int = 0
    assists: int = 0
    setting_errors: int = 0
    solo_blocks: int = 0
    block_assists: int = 0
    block_errors: int = 0
    digs: int = 0
    saves: int = 0
    reception_attempts: int = 0
    perfect_receptions: int = 0
    positive_receptions: int = 0
    poor_receptions: int = 0
    reception_errors: int = 0
    set_attempts: int = 0
    assists: int = 0
    setting_errors: int = 0
    distance_covered_m: float = 0.0
    avg_speed_kmh: float = 0.0
    max_speed_kmh: float = 0.0
    jump_count: int = 0
    avg_jump_height_cm: float = 0.0
    max_jump_height_cm: float = 0.0
    playing_time_seconds: float = 0.0
    sets_played: int = 0


class PlayerMatchStatisticsResponse(BaseModel):
    id: str
    player_id: str
    match_id: str
    set_id: Optional[str] = None
    
    # Serving
    total_serves: int
    service_aces: int
    service_errors: int
    
    # Attacking
    attack_attempts: int
    kills: int
    attack_errors: int
    blocked_attacks: int
    
    # Blocking
    solo_blocks: int
    block_assists: int
    block_errors: int
    
    # Defense
    digs: int
    saves: int
    
    # Receiving
    reception_attempts: int
    perfect_receptions: int
    positive_receptions: int
    poor_receptions: int
    reception_errors: int
    
    # Setting
    set_attempts: int
    assists: int
    setting_errors: int
    
    # Movement
    distance_covered_m: float
    avg_speed_kmh: float
    max_speed_kmh: float
    
    # Jumps
    jump_count: int
    avg_jump_height_cm: float
    max_jump_height_cm: float
    
    # Playing time
    playing_time_seconds: float
    sets_played: int
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PlayerStatisticsResponse(BaseModel):
    """Player statistics response."""
    id: str
    player_id: str
    match_id: str
    set_id: Optional[str] = None
    
    # Serving
    total_serves: int
    service_aces: int
    service_errors: int
    
    # Attacking
    attack_attempts: int
    kills: int
    attack_errors: int
    blocked_attacks: int
    
    # Blocking
    solo_blocks: int
    block_assists: int
    block_errors: int
    
    # Defense
    digs: int
    saves: int
    
    # Receiving
    reception_attempts: int
    perfect_receptions: int
    positive_receptions: int
    poor_receptions: int
    reception_errors: int
    
    # Setting
    set_attempts: int
    assists: int
    setting_errors: int
    
    # Movement
    distance_covered_m: float
    avg_speed_kmh: float
    max_speed_kmh: float
    
    # Jumps
    jump_count: int
    avg_jump_height_cm: float
    max_jump_height_cm: float
    
    # Playing time
    playing_time_seconds: float
    sets_played: int
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PlayerSeasonStatisticsResponse(BaseModel):
    player_id: str
    club_id: str
    season_id: Optional[str] = None
    matches_played: int
    sets_played: int
    total_points: int
    kill_points: int
    attack_attempts: int
    attack_errors: int
    blocked_attacks: int
    serve_attempts: int
    service_aces: int
    service_errors: int
    reception_attempts: int
    perfect_receptions: int
    reception_errors: int
    set_attempts: int
    set_assists: int
    setting_errors: int
    solo_blocks: int
    block_assists: int
    block_errors: int
    digs: int
    saves: int
    totals_json: dict
    averages_json: dict
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TeamStatisticsResponse(BaseModel):
    id: str
    team_id: str
    match_id: str
    set_id: Optional[str] = None
    
    total_kills: int
    total_aces: int
    total_blocks: int
    total_digs: int
    total_errors: int
    
    # Derived
    attack_efficiency: float
    serve_efficiency: float
    reception_efficiency: float
    
    model_config = ConfigDict(from_attributes=True)


class MatchStatisticsResponse(BaseModel):
    """Match statistics response."""
    match_id: str
    home_team_id: str
    away_team_id: str
    home_team_name: str
    away_team_name: str
    match_date: datetime
    status: str
    
    # Team statistics
    home_team_stats: dict
    away_team_stats: dict
    
    # Player statistics
    home_players: list = []
    away_players: list = []
    
    model_config = ConfigDict(from_attributes=True)


class TeamSeasonStatisticsResponse(BaseModel):
    team_id: str
    season_id: Optional[str] = None
    matches_played: int
    wins: int
    losses: int
    sets_won: int
    sets_lost: int
    total_points: int
    total_aces: int
    total_blocks: int
    total_digs: int
    total_errors: int
    attack_efficiency: float
    serve_efficiency: float
    reception_efficiency: float
    blocking_efficiency: float
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class LeaderboardResponse(BaseModel):
    """Leaderboard entry response."""
    rank: int
    player_id: str
    player_name: str
    team_name: str
    value: float
    category: str

    model_config = ConfigDict(from_attributes=True)


class PlayerComparisonResponse(BaseModel):
    """Player comparison response."""
    player_id: str
    player_name: str
    team_name: str
    statistics: dict
    rank: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)