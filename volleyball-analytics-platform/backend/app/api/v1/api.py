"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    teams,
    players,
    matches,
    statistics,
    analytics,
    reports,
    videos,
    cameras,
    organizations,
    staff,
    assignments,
    health,
)

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(videos.router, prefix="/videos", tags=["Videos"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
# Chapter 10 endpoints
api_router.include_router(staff.router, prefix="/staff", tags=["Staff"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
# Monitoring endpoints
api_router.include_router(health.router, prefix="/health", tags=["Monitoring"])

# Include AI endpoints if available
try:
    from app.api.v1.endpoints import ai
    api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
except ImportError:
    pass