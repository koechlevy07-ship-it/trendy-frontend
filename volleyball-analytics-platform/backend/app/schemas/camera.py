"""Camera schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl
from pydantic.config import ConfigDict

from app.schemas.base import BaseSchema


class CameraType(str, Enum):
    RTSP = "rtsp"
    USB = "usb"
    IP = "ip"
    ONVIF = "onvif"
    WEBCAM = "webcam"
    MOBILE = "mobile"


class CameraStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
    CALIBRATING = "calibrating"
    MAINTENANCE = "maintenance"


class CameraBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    camera_type: str
    connection_url: str
    location: Optional[str] = None
    resolution_width: int = Field(default=1920, ge=640, le=7680)
    resolution_height: int = Field(default=1080, ge=480, le=4320)
    fps: int = Field(default=30, ge=1, le=120)
    is_active: bool = True
    organization_id: Optional[str] = None
    location: Optional[str] = None
    calibration_data: Optional[dict] = None


class CameraCreate(BaseModel):
    name: str
    camera_type: str
    connection_url: str
    resolution_width: int = Field(default=1920, ge=640, le=7680)
    resolution_height: int = Field(default=1080, ge=480, le=4320)
    fps: int = Field(default=30, ge=1, le=120)
    location: Optional[str] = None
    organization_id: Optional[str] = None
    calibration_data: Optional[dict] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    connection_url: Optional[str] = None
    resolution_width: Optional[int] = None
    resolution_height: Optional[int] = None
    fps: Optional[int] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    calibration_data: Optional[dict] = None


class CameraResponse(BaseModel):
    id: str
    name: str
    camera_type: str
    connection_url: str
    resolution_width: int
    resolution_height: int
    fps: int
    location: Optional[str] = None
    is_active: bool
    organization_id: Optional[str] = None
    calibration_data: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    status: str = "unknown"

    model_config = ConfigDict(from_attributes=True)


class CameraDetailResponse(BaseModel):
    id: str
    name: str
    camera_type: str
    connection_url: str
    resolution_width: int
    resolution_height: int
    fps: int
    location: Optional[str] = None
    is_active: bool
    organization_id: Optional[str] = None
    calibration_data: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    status: str
    last_heartbeat: Optional[str] = None

    class Config:
        from_attributes = True


class CameraCalibration(BaseModel):
    camera_id: str
    court_corners: list[list[float]]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
    net_height: Optional[float] = None
    court_dimensions: Optional[dict] = None
    homography_matrix: Optional[list[list[float]]] = None
    calibration_points: Optional[list[dict]] = None


class CameraCalibrationResponse(BaseModel):
    camera_id: str
    success: bool
    homography_matrix: Optional[list] = None
    reprojection_error: Optional[float] = None
    calibrated_at: Optional[str] = None
    message: str


class CameraHealth(BaseModel):
    camera_id: str
    status: str
    last_frame_timestamp: Optional[float] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
    last_heartbeat: Optional[datetime] = None