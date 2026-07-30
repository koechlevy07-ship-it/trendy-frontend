"""
Main entry point for AI Inference Service.
"""

import asyncio
import logging
import signal
import sys
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from inference.main import app, lifespan
from inference.config import InferenceConfig
from inference.pipeline import InferencePipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app):
    """Application lifespan handler."""
    # Startup
    logger.info("Starting AI Inference Service...")
    
    # Initialize inference pipeline
    config = InferenceConfig()
    pipeline = InferencePipeline(config)
    await pipeline.initialize()
    
    # Store in app state for access in routes
    app.state.inference_service = None  # Will be set by main.py
    
    logger.info("AI Inference Service started successfully")
    yield
    
    # Shutdown
    logger.info("Shutting down AI Inference Service...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Volleyball Analytics - AI Inference Service",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    from inference.main import router as inference_router
    app.include_router(router, prefix="/api/v1")
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "ai-inference", "version": "1.0.0"}
    
    @app.get("/stats")
    async def get_stats():
        return {"service": "ai-inference", "status": "running"}
    
    return app


def create_app_with_lifespan() -> FastAPI:
    """Create app with lifespan management."""
    from inference.main import app as inference_app
    return inference_app


def main():
    """Main entry point."""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Create and run app
    app = create_app_with_lifespan()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info",
        workers=1
    )


if __name__ == "__main__":
    main()