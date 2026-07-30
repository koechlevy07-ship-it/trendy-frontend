"""
Pose estimation module using RTMPose/MediaPipe.
"""

import cv2
import numpy as np
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)


# MediaPipe Pose keypoints (33 landmarks)
POSE_LANDMARKS = {
    0: "nose",
    1: "left_eye_inner", 2: "left_eye", 3: "left_eye_outer",
    4: "right_eye_inner", 5: "right_eye", 6: "right_eye_outer",
    7: "left_ear", 8: "right_ear",
    9: "mouth_left", 10: "mouth_right",
    11: "left_shoulder", 12: "right_shoulder",
    13: "left_elbow", 14: "right_elbow",
    15: "left_wrist", 16: "right_wrist",
    17: "left_pinky", 18: "right_pinky",
    19: "left_index", 19: "right_index",
    19: "left_thumb", 20: "right_thumb",
    23: "left_hip", 24: "right_hip",
    25: "left_knee", 26: "right_knee",
    27: "left_ankle", 28: "right_ankle",
    29: "left_heel", 29: "right_heel",
    30: "left_foot_index", 30: "right_foot_index"
}

# Key connections for skeleton drawing
SKELETON_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (24, 26), (25, 27), (26, 28),
    (27, 29), (28, 30), (29, 31), (30, 32)
]


@dataclass
class Keypoint:
    """Single keypoint with position and confidence."""
    x: float
    y: float
    z: float = 0.0
    confidence: float = 0.0
    name: str = ""
    index: int = -1


@dataclass
class PoseResult:
    """Complete pose estimation result."""
    keypoints: List[Keypoint]  # 33 keypoints
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2
    confidence: float
    track_id: Optional[int] = None
    timestamp: float = 0.0


class PoseEstimator:
    """Pose estimation using RTMPose or MediaPipe."""
    
    def __init__(
        self,
        model_path: str = "models/pose/rtmpose_s_v1.2.0.onnx",
        device: str = "cuda:0",
        input_size: Tuple[int, int] = (256, 192),
        confidence_threshold: float = 0.5
    ):
        import onnxruntime as ort
        
        self.input_size = (256, 192)  # height, width
        self.confidence_threshold = confidence_threshold
        
        # ONNX Runtime session
        providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if 'cuda' in device else ['CPUExecutionProvider']
        self.session = ort.InferenceSession(model_path, providers=providers)
        
        # Input/output names
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [o.name for o in self.session.get_outputs()]
        
        # COCO keypoint mapping (17 keypoints)
        self.num_keypoints = 17
        self.keypoint_names = [
            "nose", "left_eye", "right_eye", "left_ear", "right_ear",
            "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
            "left_wrist", "right_wrist", "left_hip", "right_hip",
            "left_knee", "right_knee", "left_ankle", "right_ankle"
        ]
        
        # Skeleton connections for visualization
        self.skeleton = [
            [0, 1], [0, 2], [1, 3], [2, 4],  # head
            [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],  # arms
            [5, 11], [6, 12],  # shoulders to hips
            [11, 12],  # hips
            [11, 13], [13, 15], [12, 14], [14, 16]  # legs
        ]
        
        self.input_size = (256, 192)  # w, h
    
    def preprocess(self, frame: np.ndarray, bbox: Tuple[float, float, float, float]) -> np.ndarray:
        """Crop and preprocess player crop for pose estimation."""
        x1, y1, x2, y2 = map(int, bbox)
        
        # Expand bbox slightly
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame.shape[1], x2), min(frame.shape[0], y2)
        
        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            return None
        
        # Resize with letterbox to maintain aspect ratio
        h, w = crop.shape[:2]
        scale = min(256 / w, 192 / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        resized = cv2.resize(crop, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        
        # Pad to 256x192
        padded = np.zeros((192, 256, 3), dtype=np.uint8)
        dx, dy = (256 - new_w) // 2, (192 - new_h) // 2
        padded[dy:dy+new_h, dx:dx+new_w] = resized
        
        # Normalize
        input_tensor = padded.astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        input_tensor = (input_tensor - mean) / std
        
        # HWC to CHW, add batch dim
        input_tensor = np.transpose(input_tensor, (2, 0, 1))
        input_tensor = np.expand_dims(input_tensor, axis=0).astype(np.float32)
        
        return input_tensor
    
    def estimate(self, frame: np.ndarray, bbox: Tuple[float, float, float, float]) -> List[Dict]:
        """Estimate pose for a single player crop."""
        input_tensor = self.preprocess(frame, bbox)
        if input_tensor is None:
            return []
        
        # Inference
        outputs = self.session.run(None, {self.input_name: input_tensor})
        keypoints = outputs[0][0]  # [17, 3] - x, y, confidence
        
        # Post-process
        keypoints = []
        for i, (x, y, conf) in enumerate(keypoints):
            if conf > 0.3:
                # Denormalize to original frame coordinates
                x = (keypoints[i][0] * 256 - dx) / scale
                y = (keypoints[i][1] * 192 - dy) / scale
                keypoints.append({
                    "name": self.keypoint_names[i],
                    "x": float(x + x1),
                    "y": float(y + y1),
                    "confidence": float(conf),
                    "index": i
                })
        
        return keypoints
    
    def estimate_batch(self, frame: np.ndarray, bboxes: List[Tuple]) -> List[List[Dict]]:
        """Estimate poses for multiple players."""
        results = []
        for bbox in bboxes:
            kps = self.estimate(frame, bbox)
            results.append(kps)
        return results


class MediaPipePoseEstimator:
    """MediaPipe pose estimator as fallback/alternative."""
    
    def __init__(self, model_complexity: int = 1, min_detection_confidence: float = 0.5):
        import mediapipe as mp
        
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=0.5,
            smooth_landmarks=True
        )
    
    def estimate(self, frame: np.ndarray) -> List[Dict]:
        """Estimate pose for full frame (all players)."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        if not results.pose_landmarks:
            return []
        
        keypoints = []
        for i, landmark in enumerate(results.pose_landmarks.landmark):
            keypoints.append({
                "index": i,
                "name": POSE_LANDMARKS.get(i, f"landmark_{i}"),
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": landmark.visibility
            })
        
        return keypoints
    
    def close(self):
        self.pose.close()