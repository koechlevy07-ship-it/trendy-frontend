# Volleyball Analytics Platform - AI Engine

This module contains all AI/ML components for the Volleyball Analytics Platform.

## Structure

```
ai-engine/
├── detection/          # Player and ball detection models
├── tracking/           # Multi-object tracking (ByteTrack/BoT-SORT)
├── pose/               # Pose estimation (RTMPose/MediaPipe)
├── ocr/                # Jersey number recognition
├── action/             # Action recognition models
├── inference/          # Unified inference service
├── training/           # Training pipelines
├── evaluation/         # Model evaluation and metrics
├── datasets/           # Dataset management and processing
├── models/             # Model registry and versioning
├── configs/            # Model configurations
├── utils/              # Shared utilities
├── training/           # Training pipelines
├── evaluation/         # Model evaluation
├── configs/            # Model configurations
├── models/             # Model weights and artifacts
├── pyproject.toml      # Python dependencies
├── Dockerfile          # Container configuration
└── configs/            # Configuration files
```

## Module Descriptions

### Detection
- Player detection using YOLOv8
- Ball detection with specialized small-object model
- Court and net detection

### Tracking
- ByteTrack/BoT-SORT for multi-object tracking
- Identity preservation across occlusions
- Team assignment via jersey color

### Pose Estimation
- RTMPose / MediaPipe for 33-keypoint skeleton
- Temporal smoothing for temporal consistency

### OCR
- Jersey number recognition (PaddleOCR/EasyOCR)
- Temporal smoothing for consistent reads

### Action Recognition
- Transformer-based action classification
- 16+ volleyball action classes
- Temporal sequence modeling

### Inference
- Unified inference service
- Batch processing for throughput
- TensorRT/ONNX optimization

### Training
- Distributed training with PyTorch DDP
- Hyperparameter optimization
- Experiment tracking (MLflow)

### Evaluation
- mAP, MOTA, IDF1 metrics
- Per-class and aggregate metrics
- Visualization tools

## Development

```bash
# Install dependencies
poetry install

# Run tests
poetry run pytest -v

# Type checking
poetry run mypy .

# Linting
poetry run ruff check . --fix
```

## Configuration

Configuration files are in `configs/`:
- `detection.yaml` - Detection model settings
- `tracking.yaml` - Tracking parameters
- `pose.yaml` - Pose estimation config
- `ocr.yaml` - OCR settings
- `action.yaml` - Action recognition config