"""Match schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, EmailStr, field_validator
from pydantic.config import ConfigDict

from app.schemas.base import BaseSchema


class MatchFormat(str, Enum):
    BEST_OF_3 = "best_of_3"
    BEST_OF_5 = "best_of_5"


class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"


class SetStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class EventType(str, Enum):
    SERVE = "serve"
    ACE = "ace"
    SERVICE_ERROR = "service_error"
    RECEPTION = "reception"
    PERFECT_RECEPTION = "perfect_reception"
    POSITIVE_RECEPTION = "positive_reception"
    POOR_RECEPTION = "poor_reception"
    RECEPTION_ERROR = "reception_error"
    SET = "set"
    ASSIST = "assist"
    SETTING_ERROR = "setting_error"
    OVERPASS = "overpass"
    DOUBLE_CONTACT = "double_contact"
    KILL = "kill"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
    TIP = "tip"
    ROLL_SHOT = "roll_shot"
    BLOCK = "block"
    SOLO_BLOCK = "solo_block"
    BLOCK_ASSIST = "block_assist"
    BLOCK_TOUCH = "block_touch"
    BLOCK_ERROR = "block_error"
    DIG = "dig"
    SAVE = "save"
    EMERGENCY_SAVE = "emergency_save"
    PANCAKE_SAVE = "pancake_save"
    FREE_BALL = "free_ball"
    LIFT = "lift"
    NET_TOUCH = "net_touch"
    ROTATION_FAULT = "rotation_fault"
    SUBSTITUTION = "substitution"
    TIMEOUT = "timeout"
    TECHNICAL_TIMEOUT = "technical_timeout"
    SET_END = "set_end"
    MATCH_END = "match_end"


class EventOutcome(str, Enum):
    POINT = "point"
    SIDE_OUT = "side_out"
    ERROR = "error"
    NEUTRAL = "neutral"


class MatchBase(BaseModel):
    home_team_id: str
    away_team_id: str
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    tournament_id: Optional[str] = None
    court_id: Optional[str] = None
    sets_format: str = "best_of_5"
    status: str = "scheduled"


class MatchCreate(BaseModel):
    home_team_id: str
    away_team_id: str
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    tournament_id: Optional[str] = None
    court_id: Optional[str] = None
    sets_format: str = "best_of_5"
    status: str = "scheduled"


class MatchUpdate(BaseModel):
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    match_date: Optional[datetime] = None
    start_time: Optional[str] = None
    venue: Optional[str] = None
    tournament_id: Optional[str] = None
    court_id: Optional[str] = None
    sets_format: Optional[str] = None
    status: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None


class SetResponse(BaseModel):
    id: str
    match_id: str
    set_number: int
    home_points: int
    away_points: int
    status: str
    duration_seconds: Optional[int] = None
    winner_team_id: Optional[str] = None

    class Config:
        from_attributes = True


class SetResponse(BaseModel):
    id: str
    match_id: str
    set_number: int
    home_points: int
    away_points: int
    duration_seconds: Optional[int] = None
    status: str
    winner_team_id: Optional[str] = None


class MatchResponse(BaseModel):
    id: str
    tournament_id: Optional[str] = None
    home_team_id: str
    away_team_id: str
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    sets_format: str
    status: str
    winner_team_id: Optional[str] = None
    home_score: int
    away_score: int
    created_at: datetime
    updated_at: datetime
    home_team: Optional[dict] = None
    away_team: Optional[dict] = None
    sets: List[dict] = []

    class Config:
        from_attributes = True


class MatchCreate(BaseModel):
    home_team_id: str
    away_team_id: str
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    tournament_id: Optional[str] = None
    sets_format: str = "best_of_5"
    status: str = "scheduled"


class MatchUpdate(BaseModel):
    home_team_id: Optional[str] = None
    away_team_id: Optional[str] = None
    match_date: Optional[datetime] = None
    start_time: Optional[str] = None
    venue: Optional[str] = None
    tournament_id: Optional[str] = None
    status: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None


class MatchResponse(BaseModel):
    id: str
    tournament_id: Optional[str] = None
    home_team_id: str
    away_team_id: str
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    sets_format: str
    status: str
    winner_team_id: Optional[str] = None
    home_score: int
    away_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MatchDetailResponse(BaseModel):
    id: str
    tournament_id: Optional[str] = None
    home_team: dict
    away_team: dict
    match_date: datetime
    start_time: Optional[str] = None
    venue: Optional[str] = None
    sets_format: str
    status: str
    home_score: int
    away_score: int
    sets: List[dict] = []
    events: List[dict] = []
    statistics: dict = {}

    class Config:
        from_attributes = True


class MatchListResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int