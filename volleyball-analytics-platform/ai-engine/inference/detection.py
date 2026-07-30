# VOLUME 3: IMPLEMENTATION BLUEPRINT

**Version:** 1.0  
**Date:** July 15, 2026  
**Status:** Active Development

---

# CHAPTER 2: REAL-TIME INFERENCE ENGINE

---

## 2.1 Purpose

The Real-Time Inference Engine is the core AI processing component that powers live volleyball match analysis. It orchestrates multiple AI models (detection, tracking, pose estimation, OCR, action recognition) to process video frames in real-time, generating structured event data for the statistics engine and live dashboard.

---

## 2.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REAL-TIME INFERENCE ENGINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │  Video In    │───▶│  Frame       │───▶│  Detection   │───▶│ Tracking │  │
│  │  (RTSP/      │    │  Preprocess  │    │  (YOLOv8)    │    │ (ByteTrack)  │
│  │   File/RTMP) │    │              │    │              │    │            │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│         │                                        │                    │      │
│         │                                        │                    │      │
│         ▼                                        ▼                    ▼      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     POSE ESTIMATION (RTMPose/MediaPipe)              │   │
│  │                         ▼                                             │   │
│  │                  OCR (Jersey Numbers)                                 │   │
│  │                         ▼                                             │   │
│  │              ACTION RECOGNITION (Transformer/LSTM)                    │   │
│  │                         ▼                                             │   │
│  │              EVENT GENERATION & VALIDATION                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    STATISTICS ENGINE                                   │   │
│  │            (Stats Update → Redis → WebSocket → Dashboard)            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Inference Service Architecture

### 2.1 Core Components

| Component | Technology | Purpose | Performance Target |
|-----------|------------|---------|-------------------|
| **Frame Ingestion** | OpenCV/FFmpeg | RTSP/WebRTC/File input | 30 FPS sustained |
| **Preprocessing** | OpenCV/Albumentations | Resize, normalize, augment | < 5ms/frame |
| **Player Detection** | YOLOv8 (Ultralytics) | Player bounding boxes | < 10ms @ 640×640 |
| **Ball Detection** | YOLOv8 (specialized) | Small object detection | < 5ms @ 320×320 |
| **Tracking** | ByteTrack/BoT-SORT | Multi-object tracking | < 3ms/frame |
| **Pose Estimation** | RTMPose / MediaPipe | 33 keypoints/player | < 8ms/player |
| **OCR** | PaddleOCR / EasyOCR | Jersey numbers | < 15ms/detection |
| **Action Recognition** | Transformer/LSTM | 16 action classes | < 20ms/sequence |
| **Event Fusion** | Rules + ML | Event generation | < 10ms/event |

---

## 2.4 Inference Service Implementation

### 2.2.1 Main Inference Service

```python
# ai-engine/inference/main.py
"""
Real-time Inference Service for Volleyball Analytics.
Orchestrates multiple AI models for live match analysis.
"""

import asyncio
import cv2
import numpy as np
import logging
import time
import uuid
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from inference.detection import PlayerDetector, BallDetector
from inference.tracking import ByteTrackTracker
from inference.pose import PoseEstimator
from inference.ocr import JerseyOCR
from inference.action_recognition import ActionRecognizer
from inference.pipeline import InferencePipeline
from inference.schemas import (
    InferenceRequest, InferenceResponse,
    DetectionResult, TrackingResult,
    PoseResult, OCRResult, ActionResult,
    FrameData, EventResult
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class InferenceConfig:
    """Configuration for inference service."""
    # Model paths
    player_model_path: str = "models/detection/yolov8s_v2.1.0.pt"
    ball_model_path: str = "models/detection/ball_yolov8s_v1.3.0.pt"
    pose_model_path: str = "models/pose/rtmpose_s_v1.2.0.onnx"
    ocr_model_path: str = "models/ocr/ppocr_v3_mobile.pt"
    action_model_path: str = "models/action/transformer_v1.0.0.pt"
    
    # Inference settings
    device: str = "cuda:0"
    batch_size: int = 4
    confidence_threshold: float = 0.5
    iou_threshold: float = 0.45
    half_precision: bool = True
    
    # Tracking config
    track_buffer: int = 30
    match_thresh: float = 0.8
    track_thresh: float = 0.5
    
    # Performance
    max_batch_size: int = 4
    queue_size: int = 100
    target_fps: int = 30


class InferenceService:
    """Main inference service orchestrating all AI models."""
    
    def __init__(self, config: InferenceConfig):
        self.config = config
        self.pipeline: Optional[InferencePipeline] = None
        self._running = False
        self._stats = {
            "frames_processed": 0,
            "total_inference_time": 0.0,
            "errors": 0
        }
    
    async def initialize(self) -> None:
        """Initialize all model components."""
        logger.info("Initializing inference service...")
        
        # Initialize pipeline with all models
        self.pipeline = InferencePipeline(self.config)
        await self.pipeline.initialize()
        
        logger.info("Inference service initialized successfully")
    
    async def shutdown(self) -> None:
        """Graceful shutdown."""
        self._running = False
        if self.pipeline:
            await self.pipeline.cleanup()
        logger.info("Inference service shut down")
    
    async def process_frame(
        self, 
        frame: np.ndarray, 
        frame_id: int,
        timestamp: float,
        match_id: str
    ) -> Dict[str, Any]:
        """Process a single frame through the full pipeline."""
        start_time = time.perf_counter()
        
        try:
            # Run full inference pipeline
            result = await self.pipeline.process_frame(
                frame=frame,
                frame_id=frame_id,
                timestamp=timestamp,
                match_id=match_id
            )
            
            # Update stats
            inference_time = time.perf_counter() - start_time
            self._stats["frames_processed"] += 1
            self._stats["total_inference_time"] += inference_time
            
            return {
                "frame_id": frame_id,
                "timestamp": timestamp,
                "inference_time_ms": round(inference_time * 1000, 2),
                "detections": result.detections,
                "tracking": result.tracking,
                "poses": result.poses,
                "ocr_results": result.ocr_results,
                "actions": result.actions,
                "events": result.events
            }
            
        except Exception as e:
            self._stats["errors"] += 1
            logger.error(f"Inference error on frame {frame_id}: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """Get inference statistics."""
        avg_time = (
            self._stats["total_inference_time"] / self._stats["frames_processed"] 
            if self._stats["frames_processed"] > 0 else 0
        )
        return {
            **self._stats,
            "avg_inference_time_ms": round(self._stats["total_inference_time"] / 
                                           max(self._stats["frames_processed"], 1) * 1000, 2),
            "fps": round(1.0 / avg_time, 1) if avg_time > 0 else 0
        }


# FastAPI Application
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.inference_service = InferenceService(InferenceConfig())
    await app.state.inference_service.initialize()
    logger.info("Inference service started")
    yield
    # Shutdown
    await app.state.inference_service.shutdown()
    logger.info("Inference service stopped")


app = FastAPI(
    title="Volleyball Analytics - Inference Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class FrameRequest(BaseModel):
    frame_id: int
    timestamp: float
    match_id: str
    frame_data: str  # Base64 encoded JPEG


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


@app.post("/inference/frame", response_model=FrameResponse)
async def process_frame(request: FrameRequest, background_tasks: BackgroundTasks):
    """Process a single frame through the inference pipeline."""
    # Decode base64 frame
    frame_data = base64.b64decode(request.frame_data)
    frame_array = np.frombuffer(frame_data, dtype=np.uint8)
    frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid frame data")
    
    result = await app.state.inference_service.process_frame(
        frame=frame,
        frame_id=request.frame_id,
        timestamp=request.timestamp,
        match_id=request.match_id
    )
    
    return FrameResponse(**result)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "inference"}


@app.get("/stats")
async def get_stats():
    return app.state.inference_service.get_stats()


@app.post("/inference/batch")
async def process_batch(frames: List[FrameRequest]):
    """Process multiple frames in batch for higher throughput."""
    results = []
    for req in frames:
        frame_data = base64.b64decode(req.frame_data)
        frame_array = np.frombuffer(frame_data, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        
        result = await app.state.inference_service.process_frame(
            frame=frame,
            frame_id=req.frame_id,
            timestamp=req.timestamp,
            match_id=req.match_id
        )
        results.append(result)
    
    return results


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
```

---

## 2.3 Detection Module

### 2.3.1 Player & Ball Detection

```python
# ai-engine/inference/detection.py
"""
Object detection module using YOLOv8 for player and ball detection.
"""

import cv2
import numpy as np
import logging
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from ultralytics import YOLO

logger = logging.getLogger(__name__)


@dataclass
class DetectionResult:
    """Single detection result."""
    class_name: str
    class_id: int
    confidence: float
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2
    track_id: Optional[int] = None
    confidence: float = 0.0


@dataclass
class DetectionResultBatch:
    """Batch of detections for a frame."""
    frame_id: int
    timestamp: float
    detections: List[Dict]
    processing_time_ms: float


class BaseDetector:
    """Base class for object detectors."""
    
    def __init__(
        self, 
        model_path: str, 
        confidence_threshold: float = 0.5,
        iou_threshold: float = 0.45,
        device: str = "cuda:0",
        half_precision: bool = True,
        imgsz: int = 640
    ):
        self.model = YOLO(model_path)
        self.model.to(device)
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.device = device
        self.half_precision = half_precision
        self.imgsz = imgsz
        
        # Warm up
        dummy = np.zeros((imgsz, imgsz, 3), dtype=np.uint8)
        self.model(dummy, verbose=False)
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """Run detection on frame."""
        raise NotImplementedError


class PlayerDetector(BaseDetector):
    """Player detection using YOLOv8."""
    
    def __init__(self, config):
        super().__init__(
            model_path=config.player_model_path,
            confidence_threshold=config.confidence_threshold,
            iou_threshold=config.iou_threshold,
            device=config.device,
            half_precision=config.half_precision,
            imgsz=1280  # Higher resolution for players
        )
        self.class_names = {0: "player"}
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """Detect players in frame."""
        start = time.perf_counter()
        
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            imgsz=self.imgsz,
            half=self.half_precision,
            device=self.device,
            verbose=False,
            classes=[0]  # Only person class
        )
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().item()
                cls = int(box.cls[0].cpu().item())
                
                detections.append({
                    "class_name": "player",
                    "class_id": cls,
                    "confidence": float(conf),
                    "bbox": [float(x1), float(y1), float(x2), float(y2)],
                    "center": [(x1 + x2) / 2, (y1 + y2) / 2]
                })
        
        logger.debug(f"Player detection: {len(detections)} players in {(time.perf_counter() - start)*1000:.1f}ms")
        return detections


class BallDetector(BaseDetector):
    """Specialized ball detector with higher sensitivity."""
    
    def __init__(self, config):
        super().__init__(
            model_path=config.ball_model_path,
            confidence_threshold=0.3,  # Lower threshold for small ball
            iou_threshold=config.iou_threshold,
            device=config.device,
            half_precision=config.half_precision,
            imgsz=640
        )
        self.class_names = {0: "ball", 32: "sports ball"}
    
    def detect(self, frame: np.ndarray) -> List[Dict]:
        """Detect volleyball in frame."""
        start = time.perf_counter()
        
        # Use higher resolution for small ball
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            imgsz=640,
            half=self.half_precision,
            device=self.device,
            verbose=False
        )
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = box.conf[0].cpu().item()
                cls = int(box.cls[0].cpu().item())
                
                # Filter for ball class
                if cls in [0, 32]:  # ball or sports ball
                    detections.append({
                        "class_name": "ball",
                        "class_id": cls,
                        "confidence": float(conf),
                        "bbox": [float(x1), float(y1), float(x2), float(y2)],
                        "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                        "radius": max(x2 - x1, y2 - y1) / 2
                    })
        
        logger.debug(f"Ball detection: {len(detections)} balls in {(time.perf_counter() - start)*1000:.1f}ms")
        return detections


class CourtDetector:
    """Court line and keypoint detection for homography estimation."""
    
    def __init__(self, model_path: str = "models/court/court_keypoints.onnx"):
        import onnxruntime as ort
        self.session = ort.InferenceSession(model_path, providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
        self.input_size = (640, 640)
    
    def detect(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect court keypoints and compute homography."""
        # Resize and normalize
        input_tensor = cv2.resize(frame, self.input_size)
        input_tensor = input_tensor.astype(np.float32) / 255.0
        input_tensor = np.transpose(input_tensor, (2, 0, 1))
        input_tensor = np.expand_dims(input_tensor, axis=0)
        
        # Inference
        outputs = self.session.run(None, {"input": input_tensor})
        keypoints = outputs[0][0]  # [num_keypoints, 3] - x, y, confidence
        
        # Filter by confidence
        keypoints = keypoints[keypoints[:, 2] > 0.5]
        
        # Compute homography if enough points
        homography = None
        if len(keypoints) >= 4:
            src_pts = keypoints[:, :2].astype(np.float32)
            # Map to court coordinates (need reference points)
            dst_pts = self._map_to_court_coords(src_pts)
            homography, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 3.0)
        
        return {
            "keypoints": keypoints.tolist(),
            "homography": homography.tolist() if homography is not None else None,
            "court_detected": homography is not None
        }
    
    def _map_to_court_coords(self, keypoints: np.ndarray) -> np.ndarray:
        """Map detected keypoints to standard court coordinates."""
        # Implementation depends on court template
        # This is a simplified version
        court_width, court_height = 18.0, 9.0  # meters
        img_w, img_h = self.input_size
        
        # Normalize to court coordinates
        normalized = keypoints.copy()
        normalized[:, 0] = keypoints[:, 0] / img_w * court_width
        normalized[:, 1] = keypoints[:, 1] / img_h * court_height
        
        return normalized