"""Datasets schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class DatasetType(str, Enum):
    IMAGES = "images"
    VIDEOS = "videos"
    ANNOTATIONS = "annotations"
    POSE = "pose"
    ACTION = "action"


class DatasetStatus(str, Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    READY = "ready"
    ARCHIVED = "archived"


class DatasetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dataset_type: str
    source: Optional[str] = None
    version: str = "1.0"
    tags: List[str] = []


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dataset_type: str
    source: Optional[str] = None
    version: str = "1.0"
    tags: List[str] = []
    metadata: dict = {}


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[dict] = None


class DatasetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    dataset_type: str
    status: str
    version: str
    source: Optional[str] = None
    tags: List[str] = []
    metadata: dict = {}
    image_count: int = 0
    annotation_count: int = 0
    size_bytes: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True


class DatasetItemBase(BaseModel):
    dataset_id: str
    file_path: str
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[float] = None
    metadata: dict = {}


class DatasetItemResponse(BaseModel):
    id: str
    dataset_id: str
    file_path: str
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[float] = None
    metadata: dict
    annotations_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnotationBase(BaseModel):
    dataset_item_id: str
    label: str
    bounding_box: Optional[List[float]] = None  # [x, y, w, h] normalized
    polygon: Optional[List[List[float]]] = None
    keypoints: Optional[List[List[float]]] = None
    attributes: dict = {}
    confidence: float = 1.0


class AnnotationCreate(BaseModel):
    dataset_item_id: str
    label: str
    bounding_box: Optional[List[float]] = None  # [x, y, w, h] normalized
    polygon: Optional[List[List[float]]] = None
    keypoints: Optional[List[List[float]]] = None
    attributes: dict = {}
    confidence: float = 1.0


class AnnotationResponse(BaseModel):
    id: str
    dataset_item_id: str
    label: str
    bounding_box: Optional[List[float]] = None
    polygon: Optional[List[List[float]]] = None
    keypoints: Optional[List[List[float]]] = None
    attributes: dict
    confidence: float
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DatasetStatsResponse(BaseModel):
    dataset_id: str
    total_items: int
    annotated_items: int
    pending_items: int
    total_annotations: int
    labels_distribution: dict
    annotators: List[dict]
    created_at: datetime
    updated_at: datetime


class DatasetExportRequest(BaseModel):
    dataset_id: str
    format: str = Field(default="yolo", pattern="^(yolo|coco|pascal_voc|tfrecord)$")
    split: Optional[dict] = None  # {"train": 0.7, "val": 0.2, "test": 0.1}
    include_unannotated: bool = False