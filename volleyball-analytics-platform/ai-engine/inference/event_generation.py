"""
Event generation from tracked actions and detections.
"""

import uuid
import time
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from collections import deque

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Volleyball event types."""
    SERVE = "serve"
    ACE = "ace"
    SERVICE_ERROR = "service_error"
    RECEPTION = "reception"
    PERFECT_RECEPTION = "perfect_reception"
    POSITIVE_RECEPTION = "positive_reception"
    POOR_RECEPTION = "poor_reception"
    RECEPTION_ERROR = "reception_error"
    SET = "set"
    JUMP_SET = "jump_set"
    BACK_SET = "back_set"
    SPIKE = "spike"
    TIP = "tip"
    ROLL_SHOT = "roll_shot"
    KILL = "kill"
    ATTACK_ERROR = "attack_error"
    BLOCKED_ATTACK = "blocked_attack"
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
    OVERPASS = "overpass"
    DOUBLE_CONTACT = "double_contact"
    LIFT = "lift"
    NET_TOUCH = "net_touch"
    ROTATION_FAULT = "rotation_fault"
    SUBSTITUTION = "substitution"
    TIMEOUT = "timeout"
    SET_END = "set_end"
    MATCH_END = "match_end"


class RallyState:
    """State machine for a volleyball rally."""
    
    def __init__(self, rally_id: str, serving_team_id: str):
        self.rally_id = rally_id
        self.serving_team_id = serving_team_id
        self.receiving_team_id = None
        self.contact_count = {}  # team_id -> count
        self.last_action = None
        self.last_action_time = 0
        self.sequence = []  # List of action events
        self.start_time = time.time()
        self.status = "active"  # active, completed
        self.winning_team = None
        self.point_type = None
    
    def add_action(self, event_type: str, team_id: str, player_id: Optional[str] = None, 
                   confidence: float = 1.0, metadata: Dict = None):
        """Record an action in the rally."""
        action = {
            "type": event_type,
            "team_id": team_id,
            "player_id": player_id,
            "confidence": confidence,
            "metadata": metadata or {},
            "timestamp": time.time()
        }
        self.sequence.append(action)
        self.last_action = event_type
        self.last_action_time = time.time()
        
        # Update contact count
        if team_id not in self.contact_count:
            self.contact_count[team_id] = 0
        if event_type not in ["serve", "ace", "service_error"]:
            self.contact_count[team_id] += 1
        
        # Check for rally end conditions
        self._check_rally_end(event_type, team_id)
    
    def _check_rally_end(self, event_type: str, team_id: str):
        """Check if rally has ended."""
        if event_type in ["ace", "service_error"]:
            self.status = "completed"
            self.winning_team = "home" if team_id == self.serving_team_id else "away"
            self.point_type = event_type
        elif event_type in ["kill", "block", "attack_error", "blocked_attack"]:
            self.status = "completed"
            self.winning_team = "home" if team_id == self.serving_team_id else "away"
            self.point_type = event_type
        elif event_type in ["dig", "save", "free_ball"]:
            # Continue rally
            pass
        elif event_type in ["block", "block_touch"]:
            # Could lead to point or continue
            pass
    
    def get_rally_summary(self) -> Dict:
        """Get rally summary."""
        return {
            "rally_id": self.rally_id,
            "serving_team": self.serving_team_id,
            "duration": time.time() - self.start_time,
            "action_count": len(self.sequence),
            "contact_counts": self.contact_count,
            "status": self.status,
            "winner": self.winning_team,
            "point_type": self.point_type
        }


class EventGenerator:
    """Generate volleyball events from detections and tracking."""
    
    def __init__(self):
        self.rallies: Dict[str, RallyState] = {}
        self.current_rally: Optional[RallyState] = None
        self.rally_history: List[Dict] = []
        self.match_id = None
        self.team_map = {}  # track_id -> team_id
        self.player_team_map = {}  # track_id -> team_id
        
        # Thresholds for event classification
        self.confidence_thresholds = {
            "kill": 0.75,
            "dig": 0.7,
            "block": 0.75,
            "serve": 0.8,
            "reception": 0.7,
            "set": 0.7,
        }
    
    def set_match_context(self, match_id: str, home_team_id: str, away_team_id: str):
        """Set match context."""
        self.match_id = match_id
        self.home_team_id = home_team_id
        self.away_team_id = away_team_id
    
    def set_rally_context(self, rally_id: str, serving_team_id: str):
        """Start a new rally context."""
        self.current_rally = RallyState(rally_id, rally_id)
    
    def set_team_mapping(self, track_id: str, team_id: str):
        """Map track ID to team."""
        self.track_team_map[track_id] = team_id
    
    def process_frame(
        self, 
        frame_id: int,
        timestamp: float,
        detections: List[Dict],
        tracking: List[Dict],
        ball_track: Optional[Dict],
        actions: List[Dict],
        court_homography: Optional[np.ndarray]
    ) -> List[Dict]:
        """Process a frame's detections and generate events."""
        events = []
        
        # Update track-to-team mapping
        for track in tracking:
            if track.get("track_id") and track.get("team_id"):
                self.player_team_map[track["track_id"]] = track["team_id"]
        
        # Process actions for event generation
        for action in actions:
            event = self._process_action(action)
            if event:
                self._add_event(event)
        
        # Process ball events
        if ball_track:
            events.extend(self._process_ball_events(ball_track, timestamp))
        
        # Process tracking events (substitutions, rotations)
        events.extend(self._process_tracking_events(tracking, timestamp))
        
        # Process detection-only events
        events.extend(self._process_detection_events(detections, timestamp))
        
        return events
    
    def _process_action(self, action: Dict) -> Optional[Dict]:
        """Convert action recognition to event."""
        action_type = action.get("action")
        confidence = action.get("confidence", 0)
        track_id = action.get("track_id")
        team_id = self.player_team_map.get(track_id)
        
        if not team_id:
            return None
        
        # Check confidence threshold
        threshold = self.confidence_thresholds.get(action.get("action"), 0.7)
        if action.get("confidence", 0) < self.confidence_thresholds.get(action.get("action"), 0.7):
            return None
        
        # Map action to event type
        event_type = self._map_action_to_event(action.get("action"))
        if not event_type:
            return None
        
        # Build event
        event = {
            "event_id": str(uuid.uuid4()),
            "match_id": self.match_id,
            "rally_id": self.current_rally.rally_id if self.current_rally else None,
            "timestamp": time.time(),
            "event_type": event_type,
            "player_id": action.get("track_id"),
            "team_id": team_id,
            "confidence": confidence,
            "court_zone": action.get("court_zone"),
            "metadata": {
                "action": action.get("action"),
                "confidence": confidence,
                "frame_start": action.get("frame_start"),
                "frame_end": action.get("frame_end")
            }
        }
        
        return event
    
    def _map_action_to_event(self, action: str) -> Optional[str]:
        """Map action recognition to volleyball event type."""
        mapping = {
            "serve": "serve",
            "serve_ace": "ace",
            "service_error": "service_error",
            "reception": "reception",
            "perfect_reception": "perfect_reception",
            "positive_reception": "positive_reception",
            "reception_error": "reception_error",
            "set": "set",
            "jump_set": "set",
            "back_set": "set",
            "spike": "spike",
            "tip": "tip",
            "kill": "kill",
            "attack_error": "attack_error",
            "blocked_attack": "blocked_attack",
            "block": "block",
            "solo_block": "solo_block",
            "block_assist": "block_assist",
            "dig": "dig",
            "free_ball": "free_ball",
            "service_error": "service_error",
            "attack_error": "attack_error",
            "blocked_attack": "blocked_attack",
            "net_touch": "net_touch",
            "rotation_fault": "rotation_fault"
        }
        return mapping.get(action)
    
    def _process_ball_events(self, ball_track: Dict, timestamp: float) -> List[Dict]:
        """Process ball tracking for events."""
        events = []
        # Ball trajectory analysis for serve, out of bounds, etc.
        return events
    
    def _process_tracking_events(self, tracking: List[Dict], timestamp: float) -> List[Dict]:
        """Process tracking events (substitutions, rotations)."""
        events = []
        # Detect substitutions, rotations, etc.
        return events
    
    def _process_detection_events(self, detections: List[Dict], timestamp: float) -> List[Dict]:
        """Process raw detections for events."""
        events = []
        # Process serves, etc.
        return events
    
    def _add_event(self, event: Dict):
        """Add event to current rally and history."""
        if self.current_rally:
            self.current_rally.add_action(
                event["event_type"],
                event["team_id"],
                event.get("player_id"),
                event["confidence"],
                event.get("metadata")
            )
        
        # Add to global event history
        event["match_id"] = self.match_id
        event["rally_id"] = self.current_rally.rally_id if self.current_rally else None
        self.event_history.append(event)
    
    def start_rally(self, rally_id: str, serving_team_id: str):
        """Start a new rally."""
        self.current_rally = RallyState(rally_id, serving_team_id)
    
    def end_rally(self, winning_team: str, point_type: str):
        """End current rally."""
        if self.current_rally:
            self.current_rally.status = "completed"
            self.current_rally.winning_team = winning_team
            self.current_rally.point_type = point_type
            self.rally_history.append(self.current_rally.get_rally_summary())
            self.current_rally = None
    
    def get_rally_history(self) -> List[dict]:
        """Get all completed rallies."""
        return [r.get_rally_summary() for r in self.rally_history]
    
    def get_current_rally_state(self) -> Optional[dict]:
        """Get current rally state."""
        if self.current_rally:
            return self.current_rally.get_rally_summary()
        return None
    
    def get_match_events(self) -> List[dict]:
        """Get all events for current match."""
        events = []
        if self.current_rally:
            events.extend(self.current_rally.sequence)
        events.extend(self.event_history)
        return events


# Export
__all__ = [
    "EventGenerator",
    "RallyState",
    "EventType"
]