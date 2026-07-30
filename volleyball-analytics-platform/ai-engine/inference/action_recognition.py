"""Action recognition using Transformer/LSTM for volleyball action classification."""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
import torch.nn.functional as F

logger = logging.getLogger(__name__)


class VolleyballAction(str, Enum):
    """Volleyball action classes."""
    SERVE = "serve"
    JUMP_SERVE = "jump_serve"
    FLOAT_SERVE = "float_serve"
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


# Action categories for grouping
ACTION_CATEGORIES = {
    "serving": [VolleyballAction.SERVE, VolleyballAction.JUMP_SERVE, 
                VolleyballAction.FLOAT_SERVE, VolleyballAction.JUMP_FLOAT_SERVE,
                VolleyballAction.ACE, VolleyballAction.SERVICE_ERROR],
    "receiving": [VolleyballAction.RECEPTION, VolleyballAction.PERFECT_RECEPTION,
                  VolleyballAction.POSITIVE_RECEPTION, VolleyballAction.POOR_RECEPTION,
                  VolleyballAction.RECEPTION_ERROR],
    "setting": [VolleyballAction.SET, VolleyballAction.JUMP_SET,
                VolleyballAction.BACK_SET, VolleyballAction.SETTING_ERROR,
                VolleyballAction.OVERPASS],
    "attacking": [VolleyballAction.SPIKE, VolleyballAction.TIP, 
                  VolleyballAction.ROLL_SHOT, VolleyballAction.KILL,
                  VolleyballAction.ATTACK_ERROR, VolleyballAction.BLOCKED_ATTACK],
    "blocking": [VolleyballAction.BLOCK, VolleyballAction.SOLO_BLOCK,
                 VolleyballAction.BLOCK_ASSIST, VolleyballAction.BLOCK_TOUCH,
                 VolleyballAction.BLOCK_ERROR],
    "defense": [VolleyballAction.DIG, VolleyballAction.SAVE,
                VolleyballAction.EMERGENCY_SAVE, VolleyballAction.PANCAKE_SAVE],
    "other": [VolleyballAction.FREE_BALL, VolleyballAction.OVERPASS,
              VolleyballAction.DOUBLE_CONTACT, VolleyballAction.LIFT,
              VolleyballAction.NET_TOUCH, VolleyballAction.ROTATION_FAULT,
              VolleyballAction.SUBSTITUTION, VolleyballAction.TIMEOUT,
              VolleyballAction.SET_END, VolleyballAction.MATCH_END]
}


# Map all actions to indices
ACTION_LIST = list(VolleyballAction)
ACTION_TO_IDX = {action: idx for idx, action in enumerate(ACTION_LIST)}
IDX_TO_ACTION = {idx: action for idx, action in enumerate(ACTION_LIST)}
NUM_CLASSES = len(ACTION_LIST)  # 34 classes


@dataclass
class ActionPrediction:
    """Action recognition result."""
    action: str
    confidence: float
    player_id: Optional[int] = None
    track_id: Optional[int] = None
    frame_start: int = 0
    frame_end: int = 0
    metadata: Dict = None


class ActionTransformer(nn.Module):
    """Transformer-based action recognition model."""
    
    def __init__(
        self,
        num_classes: int = 34,
        input_dim: int = 256,
        hidden_dim: int = 512,
        num_layers: int = 4,
        num_heads: int = 8,
        dropout: float = 0.1,
        seq_len: int = 30,
        input_features: int = 128  # pose + ball + player features per frame
    ):
        super().__init__()
        self.seq_len = seq_len
        self.num_classes = num_classes
        self.input_dim = input_dim
        
        # Feature projection
        self.input_projection = nn.Linear(input_features, hidden_dim)
        self.pos_encoding = PositionalEncoding(hidden_dim, max_len=seq_len)
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.LayerNorm(hidden_dim),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, num_classes)
        )
        
        # Temporal pooling
        self.temporal_pool = nn.AdaptiveAvgPool1d(1)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: [batch, seq_len, input_dim] - sequence of pose+ball features per frame
        Returns:
            logits: [batch, num_classes]
        """
        batch_size, seq_len, _ = x.shape
        
        # Project input features
        x = self.input_projection(x)  # [B, T, hidden_dim]
        
        # Add positional encoding
        x = x + self.pos_encoding[:, :x.size(1), :]
        
        # Transformer encoding
        x = self.transformer(x)  # [B, T, hidden_dim]
        
        # Temporal pooling (average over time)
        x = x.transpose(1, 2)  # [B, hidden, T]
        x = self.temporal_pool(x).squeeze(-1)  # [B, hidden]
        
        # Classification
        logits = self.classifier(x)
        return logits


class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding."""
    
    def __init__(self, d_model: int, max_len: int = 100):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        return x + self.pe[:, :x.size(1), :]


class ActionLSTM(nn.Module):
    """LSTM-based action recognition (lighter alternative)."""
    
    def __init__(self, num_classes=34, input_dim=128, hidden_dim=256, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x):
        # x: [B, T, D]
        output, (hn, cn) = self.lstm(x)
        # Use last hidden state
        last_hidden = torch.cat([hn[-2], hn[-1]], dim=1)  # Bidirectional
        return self.classifier(last_hidden)


class ActionRecognizer:
    """High-level action recognition interface."""
    
    def __init__(
        self,
        model_path: str = "models/action/transformer_v1.0.0.pt",
        device: str = "cuda:0",
        sequence_length: int = 30,
        confidence_threshold: float = 0.7,
        model_type: str = "transformer"  # "transformer" or "lstm"
    ):
        self.device = device
        self.sequence_length = sequence_length
        self.confidence_threshold = confidence_threshold
        
        self.model = self._load_model(model_path, model_type)
        self.model.to(device)
        self.model.eval()
        
        # Feature extractors for action recognition
        self.sequence_buffer = {}  # track_id -> feature buffer
        self.max_seq_len = sequence_length
        
        logger.info(f"Action recognition model loaded: {model_path}")
    
    def _load_model(self, model_path: str, model_type: str):
        if model_type == "transformer":
            model = ActionTransformer(num_classes=NUM_CLASSES)
        else:
            model = ActionLSTM(num_classes=NUM_CLASSES)
        
        # Load weights
        checkpoint = torch.load(model_path, map_location=self.device)
        model.load_state_dict(checkpoint.get('model_state_dict', checkpoint))
        return model
    
    def extract_features(
        self, 
        pose_keypoints: List[Dict], 
        ball_position: Optional[np.ndarray],
        player_bbox: np.ndarray,
        track_id: int
    ) -> np.ndarray:
        """
        Extract action-relevant features from pose + ball + player state.
        
        Returns 128-dim feature vector per frame.
        """
        features = []
        
        # Pose features (key joint angles, velocities)
        pose_features = self._extract_pose_features(pose_keypoints)
        features.extend(pose_features)
        
        # Ball features (position relative to player, velocity)
        if ball_pos is not None:
            ball_features = self._extract_ball_features(ball_pos, player_bbox)
            features.extend(ball_features)
        
        # Player state features (position, velocity, zone)
        player_features = self._extract_player_features(player_bbox, track_id)
        features.extend(player_features)
        
        # Pad or truncate to 128 dims
        features = np.array(features)
        if len(features) > 128:
            features = features[:128]
        elif len(features) < 128:
            features = np.pad(features, (0, 128 - len(features)))
        
        return features.astype(np.float32)
    
    def _extract_pose_features(self, keypoints: List[Dict]) -> List[float]:
        """Extract joint angles and velocities from pose."""
        features = []
        
        # Key joint indices (MediaPipe 33 or COCO 17)
        # Calculate key angles
        key_pairs = [
            (11, 13, 15),  # Left shoulder-elbow-wrist
            (12, 14, 16),  # Right shoulder-elbow-wrist
            (23, 25, 27),  # Left hip-knee-ankle
            (24, 26, 28),  # Right hip-knee-ankle
            (11, 23, 25),  # Left shoulder-hip-knee
            (12, 24, 26),  # Right shoulder-hip-knee
        ]
        
        kp_dict = {kp["index"]: (kp["x"], kp["y"], kp.get("z", 0), kp["confidence"]) 
                   for kp in keypoints if kp["confidence"] > 0.5}
        
        for a, b, c in key_pairs:
            if a in kp_dict and b in kp_dict and c in kp_dict:
                # Calculate angle
                p1, p2, p3 = np.array(kp_dict[a][:2]), np.array(kp_dict[b][:2]), np.array(kp_dict[c][:2])
                v1 = p1 - p2
                v2 = p3 - p2
                cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
                angle = np.arccos(np.clip(cos_angle, -1, 1))
                features.append(angle)
            else:
                features.append(0.0)
        
        # Limb lengths
        for a, b in [(11, 13), (12, 14), (13, 15), (14, 16), (11, 12), (23, 24)]:
            if a in kp_dict and b in kp_dict:
                p1, p2 = np.array(kp_dict[a][:2]), np.array(kp_dict[b][:2])
                features.append(np.linalg.norm(p1 - p2))
            else:
                features.append(0.0)
        
        return features
    
    def _extract_ball_features(self, ball_pos: np.ndarray, player_bbox: np.ndarray) -> List[float]:
        """Extract ball-player interaction features."""
        features = []
        
        # Ball position relative to player
        px = (player_bbox[0] + player_bbox[2]) / 2
        py = (player_bbox[1] + player_bbox[3]) / 2
        
        dx = ball_pos[0] - px
        dy = ball_pos[1] - py
        dist = np.sqrt(dx**2 + dy**2)
        
        features.extend([dx, dy, dist])
        
        # Ball velocity (if available in history)
        features.append(0.0)  # placeholder for velocity
        features.append(0.0)  # ball height
        
        return features
    
    def _extract_player_features(self, bbox: np.ndarray, track_id: int) -> List[float]:
        """Extract player state features."""
        features = []
        
        # Court position (normalized)
        cx = (bbox[0] + bbox[2]) / 2
        cy = (bbox[1] + bbox[3]) / 2
        features.extend([cx / 1920.0, cy / 1080.0])  # Normalized court position
        
        # Bbox size
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        features.extend([w / 1920.0, h / 1080.0])  # Normalized size
        
        # Aspect ratio
        features.append((bbox[3] - bbox[1]) / (bbox[2] - bbox[0] + 1e-6))
        
        return features
    
    def update_buffer(self, track_id: int, features: np.ndarray):
        """Update feature buffer for a track."""
        if track_id not in self.sequence_buffer:
            self.sequence_buffer[track_id] = deque(maxlen=self.max_seq_len)
        self.sequence_buffer[track_id].append(features)
    
    def get_sequence(self, track_id: int) -> Optional[np.ndarray]:
        """Get feature sequence for a track."""
        if track_id not in self.sequence_buffer:
            return None
        seq = list(self.sequence_buffer[track_id])
        if len(seq) < self.max_seq_len:
            return None
        return np.array(list(seq)[-self.max_seq_len:])  # [T, D]
    
    def predict(self, track_id: int) -> Optional[ActionPrediction]:
        """Predict action for a track."""
        sequence = self.get_sequence(track_id)
        if sequence is None:
            return None
        
        # Prepare input
        x = torch.from_numpy(sequence).unsqueeze(0).float().to(self.device)  # [1, T, D]
        
        with torch.no_grad():
            logits = self.model(sequence)
            probs = F.softmax(logits, dim=-1)
            confidence, pred_idx = torch.max(probs, dim=-1)
            
            confidence = confidence.item()
            action_idx = pred_idx.item()
            action = IDX_TO_ACTION[action_idx]
            
            if confidence < self.confidence_threshold:
                return None
            
            return ActionPrediction(
                action=action,
                confidence=confidence,
                track_id=track_id
            )
    
    def update(self, track_id: int, features: np.ndarray):
        """Add features to track buffer."""
        if track_id not in self.sequence_buffer:
            self.sequence_buffer[track_id] = deque(maxlen=self.max_seq_len)
        self.sequence_buffer[track_id].append(features)
    
    def cleanup_track(self, track_id: int):
        """Clean up buffer for removed track."""
        if track_id in self.sequence_buffer:
            del self.sequence_buffer[track_id]