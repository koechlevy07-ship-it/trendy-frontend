"""
Multi-object tracking module using ByteTrack/BoT-SORT.
"""

import numpy as np
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from collections import deque
import time

logger = logging.getLogger(__name__)


@dataclass
class Track:
    """Single track object."""
    track_id: int
    bbox: np.ndarray  # x1, y1, x2, y2
    confidence: float
    class_id: int
    age: int = 0
    hits: int = 0
    time_since_update: int = 0
    state: str = "new"  # new, tracked, lost
    # Kalman filter state
    kalman_state: np.ndarray = None
    kalman_cov: np.ndarray = None
    # Appearance features for re-ID
    appearance_feature: np.ndarray = None
    # Metadata
    class_id: int = 0
    class_name: str = ""
    last_position: np.ndarray = None
    velocity: np.ndarray = np.zeros(2)


class KalmanFilter:
    """Simple Kalman filter for 2D tracking (position + velocity)."""
    
    def __init__(self, dt: float = 1/30.0):
        # State: [x, y, vx, vy]
        self.dt = dt
        self.F = np.array([
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ], dtype=np.float32)
        
        self.H = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], dtype=np.float32)
        
        self.Q = np.eye(4, dtype=np.float32) * 0.01  # Process noise
        self.R = np.eye(2, dtype=np.float32) * 0.1   # Measurement noise
        self.P = np.eye(4, dtype=np.float32) * 10    # Initial covariance
        
        self.x = np.zeros(4, dtype=np.float32)
        self.P = np.eye(4, dtype=np.float32) * 10
    
    def predict(self):
        """Predict next state."""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x[:2]
    
    def update(self, measurement: np.ndarray):
        """Update with measurement."""
        y = measurement - self.H @ self.x
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + K @ y
        self.P = (np.eye(4) - K @ self.H) @ self.P
        return self.x[:2]
    
    def init_state(self, measurement: np.ndarray):
        """Initialize state from first measurement."""
        self.x = np.array([measurement[0], measurement[1], 0, 0], dtype=np.float32)
        self.P = np.eye(4) * 10


class ByteTrack:
    """ByteTrack multi-object tracker."""
    
    def __init__(
        self,
        track_thresh: float = 0.5,
        track_buffer: int = 30,
        match_thresh: float = 0.8,
        min_box_area: float = 100,
        frame_rate: int = 30
    ):
        self.track_thresh = track_thresh
        self.track_buffer = track_buffer
        self.match_thresh = match_thresh
        self.min_box_area = min_box_area
        self.frame_rate = frame_rate
        
        self.tracks = {}  # track_id -> Track
        self.next_track_id = 1
        self.frame_id = 0
        self.track_buffer = track_buffer
        self.match_thresh = match_thresh
        
        # Kalman filter params
        self.kalman_dt = 1/30.0
    
    def update(self, detections: List[Dict], frame_id: int) -> List[Dict]:
        """
        Update tracker with new detections.
        Returns list of active tracks with track_id.
        """
        self.frame_id += 1
        current_time = time.time()
        
        # Filter detections by confidence
        detections = [d for d in detections if d["confidence"] >= 0.5]
        
        # Convert detections to format: [x1, y1, x2, y2, conf, class_id]
        detections_array = np.array([
            [d["bbox"][0], d["bbox"][1], d["bbox"][2], d["bbox"][3], d["confidence"], d.get("class_id", 0)]
            for d in detections
        ]) if detections else np.empty((0, 6))
        
        # Get active and lost tracks
        active_tracks = [t for t in self.tracks.values() if t.state == "tracked"]
        lost_tracks = [t for t in self.tracks.values() if t.state == "lost"]
        
        # Predict all tracks
        for track in self.tracks.values():
            track.predict()
        
        # Associate detections with tracks
        matched, unmatched_dets, unmatched_tracks = self._associate(
            detections, active_tracks
        )
        
        # Update matched tracks
        for track_idx, det_idx in matched:
            track = list(self.tracks.values())[track_idx]
            detection = detections[det_idx]
            track.update(detections[det_idx])
        
        # Handle unmatched detections - create new tracks
        for det_idx in unmatched_dets:
            det = detections[det_idx]
            if det["confidence"] >= 0.5 and det["bbox"][2] * det["bbox"][3] > 100:
                self._create_track(detections[det_idx])
        
        # Handle unmatched tracks
        for track_idx in unmatched_tracks:
            track = list(self.tracks.values())[track_idx]
            track.mark_lost()
        
        # Remove dead tracks
        dead_tracks = [tid for tid, t in self.tracks.items() if t.state == "removed"]
        for tid in dead_tracks:
            del self.tracks[tid]
        
        # Return active tracks
        active = [t.to_dict() for t in self.tracks.values() if t.state == "tracked"]
        return active
    
    def _associate(self, detections: List[Dict], tracks: List) -> Tuple[List, List, List]:
        """Associate detections to tracks using IoU."""
        if not detections or not tracks:
            return [], list(range(len(detections))), list(range(len(tracks)))
        
        # Compute IoU matrix
        det_boxes = np.array([d["bbox"] for d in detections])
        track_boxes = np.array([t.bbox for t in tracks])
        
        iou_matrix = self._iou_matrix(
            np.array([d["bbox"] for d in detections]),
            np.array([t.bbox for t in tracks])
        )
        
        # Hungarian algorithm for assignment
        from scipy.optimize import linear_sum_assignment
        cost_matrix = 1 - iou_matrix
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        
        matched = []
        unmatched_dets = list(range(len(detections)))
        unmatched_tracks = list(range(len(tracks)))
        
        for r, c in zip(row_ind, col_ind):
            if iou_matrix[r, c] > 0.3:  # IoU threshold
                matched.append((r, c))
                unmatched_dets.remove(r)
                unmatched_tracks.remove(c)
        
        return matched, unmatched_dets, unmatched_tracks
    
    def _iou(self, box1: np.ndarray, box2: np.ndarray) -> float:
        """Calculate IoU between two boxes."""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        return intersection / (area1 + area2 - intersection)
    
    def _create_track(self, detection: Dict):
        """Create new track from detection."""
        track_id = self.next_track_id
        self.next_track_id += 1
        
        track = Track(
            track_id=track_id,
            bbox=np.array(detection["bbox"]),
            confidence=detection["confidence"],
            class_id=detection.get("class_id", 0)
        )
        track.class_name = detection.get("class_name", "unknown")
        track.hits = 1
        track.state = "tracked"
        
        self.tracks[track.track_id] = track
        return track


class Track:
    """Track object with Kalman filter."""
    
    def __init__(self, track_id: int, bbox: np.ndarray, confidence: float, class_id: int):
        self.track_id = track_id
        self.bbox = np.array(bbox, dtype=np.float32)
        self.confidence = confidence
        self.class_id = class_id
        self.class_name = ""
        self.age = 0
        self.hits = 1
        self.time_since_update = 0
        self.state = "new"
        
        # Kalman filter
        self.kf = KalmanFilter()
        self.kf.init_state([(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2])
        
        # State
        self.state = "new"  # new, tracked, lost, removed
        self.hits = 1
        self.age = 0
        self.time_since_update = 0
        
        # Appearance features for re-ID
        self.feature = None
    
    def predict(self):
        """Predict next position using Kalman filter."""
        self.kalman.predict()
        self.age += 1
        self.time_since_update += 1
    
    def update(self, detection: Dict):
        """Update track with new detection."""
        self.hits += 1
        self.time_since_update = 0
        self.state = "tracked"
        
        # Update Kalman filter
        cx = (detection["bbox"][0] + detection["bbox"][2]) / 2
        cy = (detection["bbox"][1] + detection["bbox"][3]) / 2
        self.kalman.update(np.array([detection["bbox"][0], detection["bbox"][1]]))
        
        self.bbox = np.array(detection["bbox"])
        self.confidence = detection["confidence"]
        self.hits += 1
        self.time_since_update = 0
    
    def mark_lost(self):
        """Mark track as lost."""
        self.state = "lost"
    
    def update(self, detection: Dict):
        """Update track with new detection."""
        self.hits += 1
        self.time_since_update = 0
        self.bbox = np.array(detection["bbox"])
        self.confidence = detection["confidence"]
        self.class_id = detection.get("class_id", self.class_id)
        
        # Update Kalman filter
        cx = (detection["bbox"][0] + detection["bbox"][2]) / 2
        cy = (detection["bbox"][1] + detection["bbox"][3]) / 2
        self.kalman.update(np.array([cx, cy]))
    
    def predict(self):
        """Predict next position."""
        # Kalman prediction handled internally
        self.age += 1
        self.time_since_update += 1
    
    def to_dict(self) -> Dict:
        """Convert track to dictionary."""
        return {
            "track_id": self.track_id,
            "bbox": self.bbox.tolist(),
            "confidence": self.confidence,
            "class_id": self.class_id,
            "class_name": self.class_name,
            "age": self.age,
            "hits": self.hits,
            "state": self.state
        }
    
    @property
    def bbox(self):
        return self._bbox
    
    @bbox.setter
    def bbox(self, value):
        self._bbox = np.array(value, dtype=np.float32)
        # Update Kalman filter measurement
        cx = (value[0] + value[2]) / 2
        cy = (value[1] + value[3]) / 2
        self.kalman.update(np.array([cx, cy]))