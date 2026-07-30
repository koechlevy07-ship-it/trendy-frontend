"""Video schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict
from pydantic.networks import HttpUrl

from app.schemas.base import BaseSchema


class VideoSourceType(str, Enum):
    UPLOAD = "upload"
    RTSP = "rtsp"
    WEBCAM = "webcam"
    FILE = "file"


class VideoProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VideoBase(BaseModel):
    match_id: Optional[str] = None
    camera_id: Optional[str] = None
    filename: str
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    fps: Optional[float] = None
    duration_seconds: Optional[float] = None
    file_size: Optional[int] = None
    codec: Optional[str] = None
    source_type: VideoSourceType = VideoSourceType.UPLOAD
    source_url: Optional[str] = None


class VideoCreate(VideoBase):
    match_id: str
    camera_id: Optional[str] = None
    filename: str
    file_size: int
    duration_seconds: Optional[float] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    fps: Optional[float] = None
    codec: Optional[str] = None
    source_type: str = "upload"
    source_url: Optional[str] = None


class VideoUpdate(BaseModel):
    processing_status: Optional[str] = None
    processing_progress: Optional[float] = None
    duration_seconds: Optional[float] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    fps: Optional[float] = None
    codec: Optional[str] = None
    error_message: Optional[str] = None


class VideoResponse(BaseModel):
    id: str
    match_id: Optional[str] = None
    camera_id: Optional[str] = None
    filename: str
    file_path: str
    file_size: int
    duration_seconds: Optional[float] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    fps: Optional[float] = None
    codec: Optional[str] = None
    processing_status: str
    processing_progress: float = 0.0
    error_message: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VideoUploadRequest(BaseModel):
    """Schema for video upload request."""
    match_id: str
    camera_id: Optional[str] = None
    file: str  # base64 encoded or multipart
    title: Optional[str] = None
    description: Optional[str] = None
    is_live: bool = False


class VideoUpload(BaseModel):
    """Alias for VideoUploadRequest for backward compatibility."""
    match_id: str
    camera_id: Optional[str] = None
    file: str  # base64 encoded or multipart


class VideoUploadResponse(BaseModel):
    """Video upload response."""
    video_id: str
    filename: str
    file_size_bytes: int
    status: str
    processing_status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VideoListResponse(BaseModel):
    """Paginated video list response."""
    items: List["VideoResponse"]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# Update forward references
VideoListResponse.model_rebuild()


class VideoClip(BaseModel):
    clip_id: str
    video_id: str
    start_time: float
    end_time: float
    event_type: str
    player_id: Optional[str] = None
    team_id: Optional[str] = None
    confidence: float
    file_path: str
    thumbnail_url: Optional[str] = None


class VideoClipCreate(BaseModel):
    video_id: str
    start_time: float
    end_time: float
    event_type: str
    player_id: Optional[str] = None
    team_id: Optional[str] = None
    confidence: float


class VideoClipResponse(BaseModel):
    clip_id: str
    video_id: str
    start_time: float
    end_time: float
    event_type: str
    player_id: Optional[str] = None
    team_id: Optional[str] = None
    confidence: float
    file_path: str
    thumbnail_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VideoProcessingRequest(BaseModel):
    video_id: str
    match_id: Optional[str] = None
    camera_id: Optional[str] = None
    start_frame: Optional[int] = None
    end_frame: Optional[int] = None
    processing_options: dict = {}


class VideoProcessingResponse(BaseModel):
    job_id: str
    status: str
    progress: float = 0.0
    estimated_time_remaining: Optional[int] = None
    result_url: Optional[str] = None