"""Application configuration settings."""

from functools import lru_cache
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    PROJECT_NAME: str = "Volleyball Analytics Platform"
    PROJECT_DESCRIPTION: str = "AI-powered volleyball match analysis platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
# Security
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Password Security
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_MAX_LENGTH: int = 128
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGITS: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    PASSWORD_HISTORY_COUNT: int = 5
    PASSWORD_EXPIRY_DAYS: int = 90
    
    # Account Security
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_DURATION_MINUTES: int = 30
    LOGIN_RATE_LIMIT: int = 10  # requests per minute
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    
    # Session
    SESSION_MAX_AGE_DAYS: int = 30
    SESSION_REVOCATION_ENABLED: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 3600
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 50
    
    # MinIO / Object Storage
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "volley-videos"
    MINIO_SECURE: bool = False
    
    # AI Inference Service
    AI_INFERENCE_URL: str = "http://localhost:8001"
    AI_INFERENCE_TIMEOUT: int = 30
    
    # AI Models
    DETECTION_MODEL_PATH: str = "models/detection/yolov8s_v2.1.0.pt"
    BALL_MODEL_PATH: str = "models/detection/ball_yolov8s_v1.3.0.pt"
    POSE_MODEL_PATH: str = "models/pose/rtmpose_s_v1.2.0.onnx"
    OCR_MODEL_PATH: str = "models/ocr/ppocr_v3_mobile.pt"
    ACTION_MODEL_PATH: str = "models/action/transformer_v1.0.0.pt"
    
    # Video Processing
    VIDEO_UPLOAD_MAX_SIZE: int = 2 * 1024 * 1024 * 1024  # 2GB
    VIDEO_ALLOWED_EXTENSIONS: List[str] = ["mp4", "avi", "mov", "mkv"]
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_VIDEO_FRAMES: str = "video.frames"
    KAFKA_TOPIC_EVENTS: str = "match.events"
    KAFKA_CONSUMER_GROUP: str = "ai-inference"
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    @field_validator("VIDEO_ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_video_extensions(cls, v):
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()