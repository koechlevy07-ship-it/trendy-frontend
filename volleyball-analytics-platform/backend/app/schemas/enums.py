"""Shared types and utilities."""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, ConfigDict


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    total_pages: int

    @classmethod
    def create(cls, items: List[T], total: int, page: int, per_page: int) -> "PaginatedResponse[T]":
        total_pages = (total + per_page - 1) // per_page
        return cls(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    services: dict


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    COACH = "coach"
    ASSISTANT_COACH = "assistant_coach"
    ANALYST = "analyst"
    PLAYER = "player"
    STATISTICIAN = "statistician"
    VIEWER = "viewer"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MatchFormat(str, Enum):
    BEST_OF_3 = "best_of_3"
    BEST_OF_5 = "best_of_5"


class SetStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class PointType(str, Enum):
    KILL = "kill"
    ACE = "ace"
    SERVICE_ERROR = "service_error"
    RECEPTION = "reception"
    SET = "set"
    SPIKE = "spike"
    BLOCK = "block"
    DIG = "dig"
    FREE_BALL = "free_ball"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
    OTHER = "other"


class EventOutcome(str, Enum):
    POINT = "point"
    SIDE_OUT = "side_out"
    ERROR = "error"
    NEUTRAL = "neutral"


class EventType(str, Enum):
    SERVE = "serve"
    ACE = "ace"
    SERVICE_ERROR = "service_error"
    RECEPTION = "reception"
    SET = "set"
    SPIKE = "spike"
    KILL = "kill"
    BLOCK = "block"
    DIG = "dig"
    FREE_BALL = "free_ball"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
    NET_TOUCH = "net_touch"
    ROTATION_FAULT = "rotation_fault"
    SUBSTITUTION = "substitution"
    TIMEOUT = "timeout"
    TECHNICAL_TIMEOUT = "technical_timeout"
    SET_END = "set_end"
    MATCH_END = "match_end"


# =============================================================================
# Chapter 10: Player & Staff Management Enums
# =============================================================================

# Player classification categories (Chapter 10.1)
class PlayerCategory(str, Enum):
    SENIOR_MEN = "senior_men"
    SENIOR_WOMEN = "senior_women"
    UNDER_21 = "under_21"
    UNDER_19 = "under_19"
    UNDER_17 = "under_17"
    UNDER_15 = "under_15"
    ACADEMY = "academy"
    RECREATIONAL = "recreational"
    MASTER = "master"


# Player status (Chapter 10.2)
class PlayerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    INJURED = "injured"
    ON_LOAN = "on_loan"
    RETIRED = "retired"
    TRANSFERRED = "transferred"
    LOANED = "loaned"
    RELEASED = "released"


# Club/Team classification (Chapter 10.3)
class ClubStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DISSOLVED = "dissolved"


# Staff employment types (Chapter 10.4)
class StaffEmploymentType(str, Enum):
    """Staff employment type."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, Enum):
    """Staff employment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


# Staff roles (Chapter 10.5)
class StaffRole(str, Enum):
    """Staff roles in the organization."""
    # Coaching staff
    HEAD_COACH = "head_coach"
    ASSISTANT_COACH = "assistant_coach"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUT = "scout"

    # Medical staff
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"

    # Technical staff
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"

    # Referee
    FIRST_REFEREE = "first_referee"
    SECOND_REFEREE = "second_referee"
    SCORER = "scorer"
    ASSISTANT_SCORER = "assistant_scorer"
    LINE_JUDGE = "line_judge"
    RESERVE_REFEREE = "reserve_referee"

    # Administration
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    CLUB_ADMIN = "club_admin"
    LEAGUE_ADMIN = "league_admin"
    FEDERATION_ADMIN = "federation_admin"

    # Player
    PLAYER = "player"
    CAPTAIN = "captain"
    LIBERO = "libero"

    # Support
    ANALYST = "analyst"
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"


# Medical staff roles (Chapter 10.6)
class MedicalRole(str, Enum):
    """Medical staff role types."""
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"
    PSYCHOLOGIST = "psychologist"
    MASSAGE_THERAPIST = "massage_therapist"
    ATHLETIC_TRAINER = "athletic_trainer"


# Technical staff roles (Chapter 10.7)
class TechnicalRole(str, Enum):
    """Technical staff role types."""
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUTING_COACH = "scouting_coach"


# Referee certification levels (Chapter 10.8)
class RefereeLevel(str, Enum):
    """Referee certification levels."""
    INTERNATIONAL = "international"
    NATIONAL = "national"
    REGIONAL = "regional"
    LOCAL = "local"
    TRAINEE = "trainee"


# New role types defined in Chapter 10 (Chapter 10.9-10.10)
class CoachRole(str, Enum):
    """Coaching staff roles with expanded coverage."""
    HEAD_COACH = "head_coach"
    ASSISTANT_COACH = "assistant_coach"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUT = "scout"
    PHYSICAL_PREPARATION_COACH = "physical_preparation_coach"
    FITNESS_COACH = "fitness_coach"
    REHAB_COACH = "rehab_coach"
    SPORT_SCIENCE_COACH = "sport_science_coach"


class OfficialRole(str, Enum):
    """Official staff roles with expanded coverage."""
    FIRST_REFEREE = "first_referee"
    SECOND_REFEREE = "second_referee"
    SCORES_OFFICIAL = "scores_official"
    ASSISTANT_SCORES_OFFICIAL = "assistant_scores_official"
    LINE_JUDGE = "line_judge"
    RESERVE_REFEREE = "reserve_referee"
    FOURTH_OFFICIAL = "fourth_official"
    MATCH_ORIENTATION_SPECIALIST = "match_orientation_specialist"


class PlayerRole(str, Enum):
    """Player roles within team structures."""
    PLAYER = "player"
    CAPTAIN = "captain"
    LIBERO = "libero"
    SETTER = "setter"
    OPPOSITE_HITTER = "opposite_hitter"
    OUTSIDE_HITTER = "outside_hitter"
    MIDDLE_BLOCKER = "middle_blocker"
    BACK_ROW_DEFENDER = "back_row_defender"
    SUBSCRIBER = "subscriber"
    SPIRIT_LEADER = "spirit_leader"


class StaffEmploymentType(str, Enum):
    """Staff employment type."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, Enum):
    """Staff employment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


class MedicalRole(str, Enum):
    """Medical staff role types."""
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"
    PSYCHOLOGIST = "psychologist"
    MASSAGE_THERAPIST = "massage_therapist"
    ATHLETIC_TRAINER = "athletic_trainer"


class TechnicalRole(str, Enum):
    """Technical staff role types."""
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUTING_COACH = "scouting_coach"


class RefereeLevel(str, Enum):
    """Referee certification levels."""
    INTERNATIONAL = "international"
    NATIONAL = "national"
    REGIONAL = "regional"
    LOCAL = "local"
    TRAINEE = "trainee"


# Player enums
class PlayerStatus(str, Enum):
    """Player status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    INJURED = "injured"
    SUSPENDED = "suspended"
    RETIRED = "retired"
    TRANSFERRED = "transferred"
    LOANED = "loaned"
    RELEASED = "released"


class ClubStatus(str, Enum):
    """Club status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DISSOLVED = "dissolved"


class StaffEmploymentType(str, Enum):
    """Staff employment type."""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    VOLUNTEER = "volunteer"
    INTERN = "intern"


class StaffEmploymentStatus(str, Enum):
    """Staff employment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"
    RETIRED = "retired"
    SUSPENDED = "suspended"


class MedicalRole(str, Enum):
    """Medical staff role types."""
    DOCTOR = "doctor"
    PHYSIOTHERAPIST = "physiotherapist"
    NUTRITIONIST = "nutritionist"
    SPORTS_SCIENTIST = "sports_scientist"
    PSYCHOLOGIST = "psychologist"
    MASSAGE_THERAPIST = "massage_therapist"
    ATHLETIC_TRAINER = "athletic_trainer"


class TechnicalRole(str, Enum):
    """Technical staff role types."""
    STATISTICIAN = "statistician"
    VIDEO_ANALYST = "video_analyst"
    SCOUT = "scout"
    EQUIPMENT_MANAGER = "equipment_manager"
    TECHNICAL_COACH = "technical_coach"
    CONDITIONING_COACH = "conditioning_coach"
    MENTAL_COACH = "mental_coach"
    SCOUTING_COACH = "scouting_coach"


class RefereeLevel(str, Enum):
    """Referee certification levels."""
    INTERNATIONAL = "international"
    NATIONAL = "national"
    REGIONAL = "regional"
    LOCAL = "local"
    TRAINEE = "trainee"


# Player enums
class PlayerStatus(str, Enum):
    """Player status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    INJURED = "injured"
    SUSPENDED = "suspended"
    RETIRED = "retired"
    TRANSFERRED = "transferred"
    LOANED = "loaned"
    RELEASED = "released"


class ClubStatus(str, Enum):
    """Club status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"
    DISSOLVED = "dissolved"


# Role enums for assignments
class CoachRole(str, Enum):
    """Coaching staff roles."""
    HEAD_COACH = "head_coach"
    ASSISTANT_COACH = "assistant_coach"
    CONDITIONING_COACH = "conditioning_coach"
    TECHNICAL_COACH = "technical_coach"
    MENTAL_COACH = "mental_coach"
    SCOUT = "scout"
    PHYSICAL_PREPARATION_COACH = "physical_preparation_coach"
    FITNESS_COACH = "fitness_coach"
    REHAB_COACH = "rehab_coach"
    SPORT_SCIENCE_COACH = "sport_science_coach"


class OfficialRole(str, Enum):
    """Official staff roles."""
    FIRST_REFEREE = "first_referee"
    SECOND_REFEREE = "second_referee"
    SCORES_OFFICIAL = "scores_official"
    ASSISTANT_SCORES_OFFICIAL = "assistant_scores_official"
    LINE_JUDGE = "line_judge"
    RESERVE_REFEREE = "reserve_referee"
    FOURTH_OFFICIAL = "fourth_official"
    MATCH_ORIENTATION_SPECIALIST = "match_orientation_specialist"


class PlayerRole(str, Enum):
    """Player roles."""
    PLAYER = "player"
    CAPTAIN = "captain"
    LIBERO = "libero"
    SETTER = "setter"
    OPPOSITE_HITTER = "opposite_hitter"
    OUTSIDE_HITTER = "outside_hitter"
    MIDDLE_BLOCKER = "middle_blocker"
    BACK_ROW_DEFENDER = "back_row_defender"
    SUBSCRIBER = "subscriber"
    SPIRIT_LEADER = "spirit_leader"


# Configuration constants
class Constants:
    # Volleyball court dimensions (meters)
    COURT_LENGTH = 18.0
    COURT_WIDTH = 9.0
    NET_HEIGHT_MEN = 2.43
    NET_HEIGHT_WOMEN = 2.24
    ATTACK_LINE_DISTANCE = 3.0
    SERVICE_ZONE_WIDTH = 9.0
    SERVICE_ZONE_DEPTH = 3.0

    # Ball
    BALL_CIRCUMFERENCE_MIN = 65.0  # cm
    BALL_CIRCUMFERENCE_MAX = 67.0  # cm
    BALL_WEIGHT_MIN = 260.0  # grams
    BALL_WEIGHT_MAX = 280.0  # grams

    # Scoring
    SET_WIN_POINTS = 25
    FINAL_SET_POINTS = 15
    MIN_POINTS_DIFF = 2

    # Player limits
    MAX_PLAYERS_PER_TEAM = 14
    PLAYERS_ON_COURT = 6
    MAX_SUBSTITUTIONS = 6
    MAX_TIMEOUTS = 2
    TIMEOUT_DURATION_SECONDS = 30
    TECHNICAL_TIMEOUT_POINTS = [8, 16]

    # Video processing
    SUPPORTED_VIDEO_FORMATS = [".mp4", ".mov", ".avi", ".mkv", ".webm"]
    MAX_VIDEO_SIZE_GB = 10
    MAX_VIDEO_DURATION_SECONDS = 7200  # 2 hours

    # AI Inference
    DEFAULT_CONFIDENCE_THRESHOLD = 0.5
    DEFAULT_IOU_THRESHOLD = 0.45
    MAX_BATCH_SIZE = 4
    INFERENCE_TIMEOUT_SECONDS = 30

    # Court zones (1-6)
    ZONE_COUNT = 6

    # Jersey numbers
    MIN_JERSEY_NUMBER = 1
    MAX_JERSEY_NUMBER = 99


class ErrorCodes:
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    RATE_LIMITED = "RATE_LIMITED"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND"
    MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    VIDEO_PROCESSING_FAILED = "VIDEO_PROCESSING_FAILED"
    MODEL_VERSION_MISMATCH = "MODEL_VERSION_MISMATCH"