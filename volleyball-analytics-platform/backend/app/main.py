"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.logging import setup_logging
from app.api.v1.api import api_router
from app.websocket.handlers import router as ws_router
from app.middlewares.request_logging import RequestLoggingMiddleware
from app.middlewares.request_timing import RequestTimingMiddleware
from app.middlewares.rate_limiting import RateLimitingMiddleware
from app.middlewares.security_headers import SecurityHeadersMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    await init_db()
    setup_logging()
    
    yield
    
    # Shutdown
    await close_db()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Security middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom middleware
    from app.middlewares.request_logging import RequestLoggingMiddleware
    from app.middlewares.request_timing import RequestTimingMiddleware
    from app.middlewares.rate_limiting import RateLimitingMiddleware
    from app.middlewares.security_headers import SecurityHeadersMiddleware
    
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RequestTimingMiddleware)
    app.add_middleware(RateLimitingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    # Include routers
    from app.api.v1.api import api_router
    from app.websocket.handlers import router as ws_router
    
    app.include_router(api_router, prefix=settings.API_V1_STR)
    app.include_router(ws_router, prefix=settings.API_V1_STR)

    # Health check endpoint
    @app.get("/health", tags=["health"])
    async def health_check():
        return {
            "status": "healthy",
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
        }

    return app


app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )