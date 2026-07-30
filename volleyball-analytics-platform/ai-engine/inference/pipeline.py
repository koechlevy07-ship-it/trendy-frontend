"""
Inference pipeline orchestrating all AI components.
"""

import asyncio
import time
import uuid
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
import numpy as np
import cv2

from inference.detection import PlayerDetector, BallDetector, CourtDetector
from inference.tracking import ByteTrackTracker
from inference.pose import PoseEstimator
from inference.ocr import JerseyOCR
from inference.action_recognition import ActionRecognizer, ActionPrediction
from inference.event_generation import EventGenerator, VolleyballEvent

logger = logging.getLogger(__name__)


@dataclass
class FrameData:
    """Input frame data."""
    frame_id: int
    timestamp: float
    frame: np.ndarray
    match_id: str
    camera_id: str = "main"


@dataclass
class DetectionResult:
    """Detection results for a frame."""
    frame_id: int
    timestamp: float
    player_detections: List[Dict]
    ball_detections: List[Dict]
    court_info: Optional[Dict] = None
    processing_time_ms: float = 0.0


@dataclass
class TrackingResult:
    """Tracking results for a frame."""
    frame_id: int
    tracks: List[Dict]  # PlayerTrack dicts
    ball_track: Optional[Dict] = None


@dataclass
class PoseResult:
    """Pose estimation results."""
    frame_id: int
    poses: List[Dict]  # Per-player pose keypoints


@dataclass
class OCRResult:
    """OCR results."""
    frame_id: int
    track_id: int
    jersey_number: Optional[int]
    confidence: float


@dataclass
class ActionResult:
    """Action recognition results."""
    track_id: int
    action: str
    confidence: float
    frame_range: Tuple[int, int]


@dataclass
class EventResult:
    """Generated volleyball event."""
    event_id: str
    match_id: str
    rally_id: str
    timestamp: float
    event_type: str
    player_id: Optional[str]
    team_id: str
    confidence: float
    court_zone: Optional[int]
    metadata: dict


@dataclass
class InferenceResult:
    """Complete inference results for a frame."""
    frame_id: int
    timestamp: float
    detections: DetectionResult
    tracking: TrackingResult
    poses: PoseResult
    ocr_results: List[OCRResult]
    actions: List[ActionResult]
    events: List[Dict]


class InferencePipeline:
    """Main inference pipeline orchestrating all AI components."""
    
    def __init__(self, config):
        self.config = config
        self.frame_id = 0
        self.match_id = None
        self.rally_id = None
        
        # Initialize all components
        self.court_detector = CourtDetector()
        self.player_detector = PlayerDetector(
            model_path=config.player_model_path,
            confidence=config.confidence_threshold,
            iou=config.iou_threshold,
            device=config.device,
            half_precision=config.half_precision
        )
        self.ball_detector = BallDetector(
            model_path=config.ball_model_path,
            confidence=0.3,  # Lower threshold for ball
            device=config.device,
            half_precision=config.half_precision
        )
        self.tracker = ByteTrackTracker(
            track_thresh=config.track_thresh,
            track_buffer=config.track_buffer,
            match_thresh=config.match_thresh
        )
        self.pose_estimator = PoseEstimator(
            model_path="models/pose/rtmpose_s_v1.2.0.onnx",
            device="cuda:0"
        )
        self.jersey_ocr = JerseyOCR(
            engine="paddleocr",
            use_gpu=True
        )
        self.action_recognizer = ActionRecognizer(
            model_path="models/action/transformer_v1.0.0.pt",
            device="cuda:0",
            sequence_length=30,
            confidence_threshold=0.7
        )
        self.event_generator = EventGenerator()
        
        # State
        self.current_match_id = None
        self.current_rally_id = None
        self.frame_id = 0
        self.rally_id = None
        
        # Buffers for temporal processing
        self.pose_buffers = {}  # track_id -> sequence of poses
        self.action_buffers = {}  # track_id -> feature sequences
        
        # Performance tracking
        self.stats = {
            "frames_processed": 0,
            "total_time": 0.0,
            "detection_time": 0.0,
            "tracking_time": 0.0,
            "pose_time": 0.0,
            "ocr_time": 0.0,
            "action_time": 0.0,
            "event_time": 0.0
        }
    
    async def initialize(self):
        """Initialize all models."""
        logger.info("Initializing inference pipeline...")
        
        # Initialize all components
        await asyncio.gather(
            self.player_detector.initialize(),
            self.ball_detector.initialize(),
            self.tracker.initialize(),
            self.pose_estimator.initialize(),
            self.jersey_ocr.initialize(),
            self.action_recognizer.initialize(),
            self.court_detector.initialize(),
        )
        
        # Initialize event generator
        self.event_generator = EventGenerator()
        
        logger.info("Inference pipeline initialized successfully")
    
    async def cleanup(self):
        """Cleanup resources."""
        logger.info("Cleaning up inference pipeline...")
        # Cleanup resources if needed
    
    async def process_frame(
        self, 
        frame: np.ndarray, 
        frame_id: int,
        timestamp: float,
        match_id: str
    ) -> InferenceResult:
        """Process a single frame through the full pipeline."""
        start_time = time.perf_counter()
        self.frame_id += 1
        
        # Set match context
        self.match_id = match_id
        
        # 1. Court detection (first frame or periodic)
        court_info = None
        if self.frame_id % 30 == 0:  # Every 30 frames
            court_start = time.perf_counter()
            court_info = self.court_detector.detect(frame)
            self.stats["detection_time"] += (time.perf_counter() - court_start) * 1000
        
        # 2. Player and ball detection
        det_start = time.perf_counter()
        player_dets = self.player_detector.detect(frame)
        ball_dets = self.ball_detector.detect(frame)
        self.stats["detection_time"] += (time.perf_counter() - det_start) * 1000
        
        # 3. Tracking
        track_start = time.perf_counter()
        player_tracks = self.tracker.update(player_dets, self.frame_id)
        ball_tracks = self.tracker.update_ball(ball_dets, self.frame_id)
        self.stats["tracking_time"] += (time.perf_counter() - track_start) * 1000
        
        # 3.5 Court detection
        court_info = self.court_detector.detect(frame) if self.frame_id % 30 == 0 else None
        
        # 4. Jersey OCR
        ocr_start = time.perf_counter()
        ocr_results = []
        for track in player_tracks:
            if track["confidence"] > 0.7:
                ocr_result = self.jersey_ocr.recognize_jersey_number(
                    frame, track["bbox"], track["track_id"]
                )
                if ocr_result:
                    ocr_results.append(OCRResult(
                        frame_id=self.frame_id,
                        track_id=track["track_id"],
                        jersey_number=ocr_result["jersey_number"],
                        confidence=ocr_result["confidence"]
                    ))
        self.stats["ocr_time"] += (time.perf_counter() - ocr_start) * 1000
        
        # 4. Pose estimation
        pose_start = time.perf_counter()
        pose_results = self.pose_estimator.estimate(frame, player_dets)
        self.stats["pose_time"] += (time.perf_counter() - pose_start) * 1000
        
        # 5. Action recognition
        action_start = time.perf_counter()
        action_results = []
        for track in player_tracks:
            action = await self._process_action(track)
            if action:
                action_results.append(ActionResult(
                    track_id=track["track_id"],
                    action=action.action,
                    confidence=action.confidence,
                    frame_range=action.frame_range
                ))
        self.stats["action_time"] += (time.perf_counter() - action_start) * 1000
        
        # 5. Event generation
        event_start = time.perf_counter()
        events = self.event_generator.process_frame(
            frame_id=self.frame_id,
            timestamp=time.time(),
            detections=player_dets,
            tracking=player_tracks,
            ball_track=ball_track,
            actions=action_results,
            court_homography=court_info.get("homography") if court_info else None
        )
        self.stats["event_time"] += (time.perf_counter() - event_start) * 1000
        
        # Update stats
        self.stats["frames_processed"] += 1
        total_time = (time.perf_counter() - start_time) * 1000
        self.stats["total_time"] += total_time
        
        return InferenceResult(
            frame_id=self.frame_id,
            timestamp=timestamp,
            detections=DetectionResult(
                frame_id=self.frame_id,
                timestamp=timestamp,
                player_detections=player_dets,
                ball_detections=ball_dets,
                court_info=court_info,
                processing_time_ms=total_time
            ),
            tracking=TrackingResult(
                frame_id=self.frame_id,
                tracks=player_tracks,
                ball_track=ball_tracks[0] if ball_tracks else None
            ),
            poses=PoseResult(frame_id=self.frame_id, poses=pose_results),
            ocr_results=ocr_results,
            actions=action_results,
            events=events
        )
    
    def _process_player_actions(self, track: Dict) -> Optional[ActionResult]:
        """Process action recognition for a player track."""
        track_id = track["track_id"]
        
        # Update feature buffer
        features = self._extract_action_features(track)
        if track["track_id"] not in self.action_buffers:
            self.action_buffers[track["track_id"]] = []
        self.action_buffers[track["track_id"]].append(features)
        
        # Keep buffer at max sequence length
        max_len = 30  # ~1 second at 30fps
        if len(self.action_buffers[track["track_id"]]) > 30:
            self.action_buffers[track["track_id"]] = self.action_buffers[track["track_id"]][-30:]
        
        # Run action recognition if we have enough frames
        if len(self.action_buffers[track["track_id"]]) >= 15:
            sequence = np.array(self.action_buffers[track["track_id"]][-30:])
            action_pred = self.action_recognizer.predict(track["track_id"], sequence)
            
            if action and action.confidence > 0.7:
                return ActionResult(
                    track_id=track["track_id"],
                    action=action.action,
                    confidence=action.confidence,
                    frame_range=(self.frame_id - 15, self.frame_id)
                )
        return None


# Export
__all__ = [
    "InferencePipeline",
    "InferenceResult",
    "DetectionResult",
    "TrackingResult",
    "PoseResult",
    "OCRResult",
    "ActionResult",
    "EventResult",
    "FrameData",
    "DetectionResult",
    "TrackingResult",
    "PoseResult",
    "OCRResult",
    "ActionResult",
    "EventResult"
]