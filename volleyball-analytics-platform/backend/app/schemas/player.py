"""Player schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
import enum

from pydantic import BaseModel, Field, ConfigDict
from pydantic.networks import EmailStr

from app.schemas.base import BaseSchema


class Position(str, enum.Enum):
    OH = "OH"  # Outside Hitter
    MB = "MB"  # Middle Blocker
    OPP = "OPP"  # Opposite
    S = "S"  # Setter
    L = "L"  # Libero
    DS = "DS"  # Defensive Specialist


class PlayerBase(BaseModel):
    """Base player schema."""
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    position: str
    jersey_number: int = Field(..., ge=0, le=99)
    height_cm: Optional[int] = Field(None, ge=100, le=250)
    weight_kg: Optional[int] = Field(None, ge=30, le=200)
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = Field(None, pattern="^[A-Z]{3}$")
    dominant_hand: Optional[str] = Field(None, pattern="^(left|right)$")
    photo_url: Optional[str] = Field(None, max_length=500)
    is_libero: bool = False
    is_captain: bool = False


class PlayerCreate(PlayerBase):
    """Schema for creating a player."""
    team_id: str
    jersey_number: int = Field(..., ge=0, le=99)
    position: str = Field(..., pattern="^(OH|MB|OPP|S|L|DS)$")
    is_libero: bool = False
    is_captain: bool = False


class PlayerUpdate(BaseModel):
    """Schema for updating a player."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position: Optional[str] = None
    jersey_number: Optional[int] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    dominant_hand: Optional[str] = None
    photo_url: Optional[str] = None
    is_libero: Optional[bool] = None
    is_captain: Optional[bool] = None
    is_active: Optional[bool] = None


class PlayerResponse(BaseModel):
    """Player response schema."""
    id: str
    team_id: str
    jersey_number: int
    first_name: str
    last_name: str
    position: str
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    dominant_hand: Optional[str] = None
    photo_url: Optional[str] = None
    is_libero: bool
    is_captain: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PlayerWithStatsResponse(BaseModel):
    """Player with match statistics."""
    id: str
    jersey_number: int
    first_name: str
    last_name: str
    position: str
    team_name: str
    team_short_name: str
    match_id: str
    match_date: datetime
    # Serving
    total_serves: int = 0
    aces: int = 0
    service_errors: int = 0
    # Attacking
    attack_attempts: int = 0
    kills: int = 0
    attack_errors: int = 0
    blocked_attacks: int = 0
    # Blocking
    solo_blocks: int = 0
    block_assists: int = 0
    # Defense
    digs: int = 0
    saves: int = 0
    # Receiving
    reception_attempts: int = 0
    perfect_receptions: int = 0
    reception_errors: int = 0
    # Setting
    set_attempts: int = 0
    assists: int = 0
    setting_errors: int = 0
    # Movement
    distance_covered_m: float = 0.0
    avg_speed_kmh: float = 0.0
    max_speed_kmh: float = 0.0
    # Jumps
    jump_count: int = 0
    avg_jump_height_cm: float = 0.0
    max_jump_height_cm: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class PlayerDetailResponse(PlayerResponse):
    """Detailed player response with statistics."""
    statistics: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# CHAPTER 10 PART 2 - ADDITIONAL SCHEMAS
# =============================================================================

class PlayerRegistrationBase(BaseModel):
    """Base player registration schema."""
    registration_id: str = Field(..., min_length=1, max_length=50)
    registration_date: datetime
    registration_authority: str = Field(..., min_length=1, max_length=255)
    license_number: Optional[str] = Field(None, max_length=100)
    expiry_date: Optional[datetime] = None
    status: str = Field(default="active", max_length=50)
    verification_documents: List[str] = Field(default_factory=list)


class PlayerRegistrationCreate(PlayerRegistrationBase):
    """Schema for creating a player registration."""
    player_id: str


class PlayerRegistrationUpdate(BaseModel):
    """Schema for updating a player registration."""
    registration_id: Optional[str] = None
    registration_date: Optional[datetime] = None
    registration_authority: Optional[str] = None
    license_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: Optional[str] = None
    verification_documents: Optional[List[str]] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None


class PlayerRegistrationResponse(BaseModel):
    """Player registration response schema."""
    id: str
    player_id: str
    registration_id: str
    registration_date: datetime
    registration_authority: str
    license_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: str
    verification_documents: List[str]
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CareerHistoryBase(BaseModel):
    """Base career history schema."""
    career_id: str = Field(..., min_length=1, max_length=50)
    organization: str = Field(..., min_length=1, max_length=255)
    league: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, pattern="^[A-Z]{3}$")
    season: Optional[str] = Field(None, max_length=50)
    position: Optional[str] = Field(None, max_length=10)
    matches_played: int = Field(default=0, ge=0)
    start_date: datetime
    end_date: Optional[datetime] = None
    coach: Optional[str] = Field(None, max_length=255)
    awards: List[str] = Field(default_factory=list)
    remarks: Optional[str] = None


class CareerHistoryCreate(CareerHistoryBase):
    """Schema for creating a career history record."""
    player_id: str


class CareerHistoryUpdate(BaseModel):
    """Schema for updating a career history record."""
    organization: Optional[str] = None
    league: Optional[str] = None
    country: Optional[str] = None
    season: Optional[str] = None
    position: Optional[str] = None
    matches_played: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    coach: Optional[str] = None
    awards: Optional[List[str]] = None
    remarks: Optional[str] = None
    is_archived: Optional[bool] = None


class CareerHistoryResponse(BaseModel):
    """Career history response schema."""
    id: str
    career_id: str
    player_id: str
    organization: str
    league: Optional[str] = None
    country: Optional[str] = None
    season: Optional[str] = None
    position: Optional[str] = None
    matches_played: int
    start_date: datetime
    end_date: Optional[datetime] = None
    coach: Optional[str] = None
    awards: List[str]
    remarks: Optional[str] = None
    is_archived: bool
    archived_at: Optional[datetime] = None
    created_at: datetime
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CareerHistoryListResponse(BaseSchema):
    """Paginated career history list."""
    items: List[CareerHistoryResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class PlayerFaceEmbeddingBase(BaseModel):
    """Base player face embedding schema."""
    embedding_id: str = Field(..., min_length=1, max_length=50)
    embedding_version: int = Field(default=1, ge=1)
    feature_vector_reference: str = Field(..., min_length=1, max_length=500)
    capture_date: datetime
    camera_source: Optional[str] = Field(None, max_length=100)
    quality_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    algorithm_version: Optional[str] = Field(None, max_length=50)
    status: str = Field(default="active", max_length=50)


class PlayerFaceEmbeddingCreate(PlayerFaceEmbeddingBase):
    """Schema for creating a player face embedding."""
    player_id: str


class PlayerFaceEmbeddingUpdate(BaseModel):
    """Schema for updating a player face embedding."""
    embedding_version: Optional[int] = None
    feature_vector_reference: Optional[str] = None
    capture_date: Optional[datetime] = None
    camera_source: Optional[str] = None
    quality_score: Optional[float] = None
    algorithm_version: Optional[str] = None
    status: Optional[str] = None


class PlayerFaceEmbeddingResponse(BaseModel):
    """Player face embedding response schema."""
    id: str
    embedding_id: str
    player_id: str
    embedding_version: int
    feature_vector_reference: str
    capture_date: datetime
    camera_source: Optional[str] = None
    quality_score: Optional[float] = None
    algorithm_version: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PlayerFaceEmbeddingListResponse(BaseSchema):
    """Paginated player face embedding list."""
    items: List[PlayerFaceEmbeddingResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class PlayerListResponse(BaseSchema):
    """Paginated player list."""
    items: list[PlayerResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)