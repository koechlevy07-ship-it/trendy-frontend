"""Monitoring and Health endpoints."""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.schemas.base import BaseSchema
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime
    version: str
    checks: Dict[str, Any]


class ReadinessResponse(BaseModel):
    """Readiness check response."""
    ready: bool
    checks: Dict[str, bool]


@router.get("/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    """Basic health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        checks={
            "api": "ok",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    )


@router.get("/health/live", response_model=HealthResponse, tags=["Monitoring"])
async def liveness_check():
    """Liveness probe - returns 200 if process is alive."""
    return HealthResponse(
        status="alive",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        checks={
            "process": "running",
        }
    )


@router.get("/health/ready", response_model=ReadinessResponse, tags=["Monitoring"])
async def readiness_check(session=Depends(get_db)):
    """Readiness probe - returns 200 if service is ready to accept traffic."""
    checks = {}
    
    # Check database connectivity
    try:
        await session.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        checks["database"] = False
    
    # Check Redis connectivity
    try:
        from app.core.redis import get_redis
        redis = get_redis()
        await redis.ping()
        checks["redis"] = True
    except Exception:
        checks["redis"] = False
    
    # All checks must pass
    ready = all(checks.values())
    
    return ReadinessResponse(
        ready=ready,
        checks=checks
    )


@router.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus-compatible metrics endpoint."""
    from app.core.metrics import get_metrics
    return get_metrics()