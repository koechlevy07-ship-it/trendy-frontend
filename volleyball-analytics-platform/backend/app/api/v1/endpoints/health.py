"""Health check and monitoring endpoints."""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.metrics import get_metrics
from app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint.
    Returns service status and basic information.
    """
    return {
        "status": "healthy",
        "service": "volleyball-analytics-api",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/live", tags=["Health"])
async def liveness_probe() -> Dict[str, Any]:
    """
    Kubernetes liveness probe endpoint.
    Returns 200 if the application is running.
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/health/ready", tags=["Health"])
async def readiness_probe(session: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Kubernetes readiness probe endpoint.
    Checks if the application is ready to serve requests.
    """
    try:
        # Check database connectivity
        await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        raise HTTPException(status_code=503, detail="Database not ready")

    # Check Redis connectivity (if configured)
    redis_status = "not_configured"
    try:
        from app.core.redis import get_redis
        redis = await get_redis()
        await redis.ping()
        redis_status = "connected"
    except Exception:
        redis_status = "disconnected"

    return {
        "status": "ready" if db_status == "connected" else "not_ready",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": {
            "database": db_status,
            "redis": redis_status,
        },
    }


@router.get("/health/detailed", tags=["Health"])
async def detailed_health_check(session: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with component statuses.
    """
    checks = {}
    overall_status = "healthy"

    # Database check
    try:
        start = datetime.utcnow()
        await session.execute(text("SELECT 1"))
        db_latency = (datetime.utcnow() - start).total_seconds() * 1000
        checks["database"] = {
            "status": "healthy",
            "latency_ms": round(db_latency, 2),
        }
    except Exception as e:
        checks["database"] = {
            "status": "unhealthy",
            "error": str(e),
        }
        overall_status = "unhealthy"

    # Redis check
    try:
        from app.core.redis import get_redis
        redis = await get_redis()
        start = datetime.utcnow()
        await redis.ping()
        redis_latency = (datetime.utcnow() - start).total_seconds() * 1000
        checks["redis"] = {
            "status": "healthy",
            "latency_ms": round(redis_latency, 2),
        }
    except Exception as e:
        checks["redis"] = {
            "status": "unhealthy",
            "error": str(e),
        }

    # Storage check (disk space)
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        disk_usage_percent = (used / total) * 100
        checks["disk"] = {
            "status": "healthy" if disk_usage_percent < 90 else "warning",
            "usage_percent": round(disk_usage_percent, 1),
            "free_gb": round((total - used) / (1024**3), 2),
        }
        if disk_usage_percent > 95:
            overall_status = "unhealthy"
    except Exception:
        pass

    # Memory check
    try:
        import psutil
        memory = psutil.virtual_memory()
        checks["memory"] = {
            "status": "healthy" if memory.percent < 90 else "warning",
            "usage_percent": memory.percent,
            "available_gb": round(memory.available / (1024**3), 2),
        }
        if memory.percent > 95:
            overall_status = "unhealthy"
    except Exception:
        pass

    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "checks": checks,
    }


@router.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint."""
    from app.core.metrics import get_metrics
    from fastapi.responses import Response
    return Response(content=get_metrics(), media_type="text/plain")


@router.get("/info", tags=["Monitoring"])
async def service_info() -> Dict[str, Any]:
    """Service information endpoint."""
    return {
        "service": "volleyball-analytics-api",
        "version": "1.0.0",
        "description": "AI-Powered Volleyball Analytics Platform API",
        "documentation": "/docs",
        "environment": "production",
    }