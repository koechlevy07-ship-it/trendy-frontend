"""Camera endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.ai_video import Camera, CameraType
from app.models.organization import Organization
from app.models.user import User
from app.schemas.camera import CameraCreate, CameraUpdate, CameraResponse

router = APIRouter()


@router.post("", response_model=dict, status_code=201)
async def register_camera(
    camera_data: dict,  # Would use CameraCreate schema
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Register a new camera."""
    from uuid import UUID
    
    # Validate organization
    org = await session.get(Organization, UUID(camera_data.get("organization_id")))
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    camera = Camera(
        organization_id=UUID(camera_data["organization_id"]),
        name=camera_data["name"],
        camera_type=CameraType(camera_data["camera_type"]),
        connection_url=camera_data["connection_url"],
        resolution_width=camera_data.get("resolution_width", 1920),
        resolution_height=camera_data.get("resolution_height", 1080),
        fps=camera_data.get("fps", 30),
        location=camera_data.get("location"),
        is_active=True,
    )
    
    session.add(camera)
    await session.commit()
    await session.refresh(camera)
    
    return {
        "id": str(camera.id),
        "name": camera.name,
        "camera_type": camera.camera_type.value,
        "connection_url": camera.connection_url,
        "resolution": f"{camera.resolution_width}x{camera.resolution_height}",
        "fps": camera.fps,
        "is_active": camera.is_active,
        "created_at": camera.created_at.isoformat(),
    }


@router.get("", response_model=list)
async def list_cameras(
    skip: int = 0,
    limit: int = 20,
    organization_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin", "coach")),
):
    """List cameras with optional filtering."""
    query = select(Camera)
    
    if organization_id:
        query = query.where(Camera.organization_id == UUID(organization_id))
    if is_active is not None:
        query = query.where(Camera.is_active == is_active)
    
    query = query.offset(skip).limit(limit)
    result = await session.execute(query)
    cameras = result.scalars().all()
    
    return [
        {
            "id": str(camera.id),
            "name": camera.name,
            "camera_type": camera.camera_type.value,
            "connection_url": camera.connection_url,
            "resolution": f"{camera.resolution_width}x{camera.resolution_height}",
            "fps": camera.fps,
            "is_active": camera.is_active,
            "organization_id": str(camera.organization_id),
            "created_at": camera.created_at.isoformat(),
        }
        for camera in cameras
    ]


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Get camera by ID."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: str,
    data: CameraUpdate,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Update camera information."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(camera, key):
            setattr(camera, key, value)
    
    await session.commit()
    await session.refresh(camera)
    return camera


@router.delete("/{camera_id}", status_code=204)
async def delete_camera(
    camera_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin")),
):
    """Delete a camera."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    await session.delete(camera)
    await session.commit()
    return None


@router.put("/{camera_id}/activate", response_model=dict)
async def activate_camera(
    camera_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Activate a camera."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera.is_active = True
    await session.commit()
    await session.refresh(camera)
    
    return {"id": str(camera.id), "is_active": camera.is_active}


@router.put("/{camera_id}/deactivate", response_model=dict)
async def deactivate_camera(
    camera_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin")),
):
    """Deactivate a camera."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera.is_active = False
    await session.commit()
    await session.refresh(camera)
    
    return {"id": str(camera.id), "is_active": camera.is_active}


@router.get("/{camera_id}/health", response_model=dict)
async def check_camera_health(
    camera_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Check camera health status."""
    camera = await session.get(Camera, UUID(camera_id))
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Check last heartbeat
    from datetime import datetime, timedelta
    if camera.last_heartbeat:
        is_healthy = (datetime.utcnow() - camera.last_heartbeat) < timedelta(minutes=5)
    else:
        is_healthy = False
    
    return {
        "camera_id": str(camera.id),
        "name": camera.name,
        "is_healthy": is_healthy,
        "last_heartbeat": camera.last_heartbeat.isoformat() if camera.last_heartbeat else None,
        "status": camera.status.value if camera.status else "unknown",
    }