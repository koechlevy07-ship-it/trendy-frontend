"""Inference schemas for API contracts."""

from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class DetectionClass(str, Enum):
    PLAYER = "player"
    BALL = "ball"
    REFEREE = "referee"
    COACH = "coach"


@dataclass
class DetectionBox:
    """Bounding box with metadata."""
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str
    track_id: Optional[int] = None


@dataclass
class DetectionResult:
    frame_id: int
    timestamp: float
    player_detections: List[Dict]
    ball_detections: List[Dict]
    court_info: Optional[Dict] = None
    processing_time_ms: float = 0.0


@dataclass
class TrackedObject:
    track_id: int
    bbox: List[float]  # x1, y1, x2, y2
    confidence: float
    class_id: int
    class_name: str
    team: Optional[str] = None
    jersey_number: Optional[int] = None
    court_position: Optional[List[float]] = None  # [x, y] in meters


@dataclass
class TrackingResult:
    frame_id: int
    timestamp: float
    tracks: List[Dict]
    ball_track: Optional[Dict] = None


@dataclass
class Keypoint:
    index: int
    name: str
    x: float
    y: float
    z: float = 0.0
    confidence: float
    visibility: float = 1.0


@dataclass
class PoseResult:
    track_id: int
    keypoints: List[Dict]  # Keypoint dicts
    bbox: List[float]
    confidence: float
    court_position: Optional[List[float]] = None


@dataclass
class OCRResult:
    track_id: int
    jersey_number: Optional[int]
    confidence: float
    bbox: List[float]
    frame_id: int


@dataclass
class ActionPrediction:
    track_id: int
    action: str
    confidence: float
    frame_start: int
    frame_end: int
    court_zone: Optional[int] = None


@dataclass
class EventResult:
    event_id: str
    match_id: str
    rally_id: str
    timestamp: float
    event_type: str
    player_id: Optional[str]
    team_id: str
    confidence: float
    metadata: dict = field(default_factory=dict)


@dataclass
class EventResult:
    event_id: str
    match_id: str
    rally_id: str
    timestamp: float
    event_type: str
    player_id: Optional[str]
    team_id: str
    confidence: float
    metadata: dict = field(default_factory=dict)


@dataclass
class InferenceResult:
    frame_id: int
    timestamp: float
    detections: Dict
    tracking: List[Dict]
    poses: List[Dict]
    ocr_results: List[Dict]
    actions: List[Dict]
    events: List[Dict]
    processing_time_ms: float


# Pydantic models for API
class FrameRequest(BaseModel):
    frame_id: int
    timestamp: float
    match_id: str
    camera_id: str = "main"
    frame_data: str  # Base64 encoded


class FrameResponse(BaseModel):
    frame_id: int
    timestamp: float
    inference_time_ms: float
    detections: List[Dict]
    tracking: List[Dict]
    poses: List[Dict]
    ocr_results: List[Dict]
    actions: List[Dict]
    events: List[Dict]


class InferenceRequest(BaseModel):
    frame_id: int
    timestamp: float
    match_id: str
    camera_id: str = "main"
    frame_data: str  # Base64 encoded JPEG


class InferenceResponse(BaseModel):
    frame_id: int
    timestamp: float
    inference_time_ms: float
    detections: List[Dict]
    tracking: List[Dict]
    poses: List[Dict]
    ocr_results: List[Dict]
    actions: List[Dict]
    events: List[Dict]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: float
    gpu_available: bool
    models_loaded: int


class StatsResponse(BaseModel):
    frames_processed: int
    total_inference_time: float
    avg_inference_time_ms: float
    fps: float
    errors: int
    gpu_memory_used_mb: float
    gpu_memory_total_mb: float