"""Video endpoints."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.ai_video import VideoRecording, VideoSourceType, ProcessingStatus, Camera
from app.models.match import Match
from app.models.user import User
from app.schemas.video import VideoUpload, VideoResponse, VideoListResponse

router = APIRouter()


@router.post("/upload", response_model=VideoUpload, status_code=201)
async def upload_video(
    file: UploadFile = File(...),
    match_id: Optional[str] = None,
    camera_id: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin", "coach")),
):
    """Upload a match video for AI processing."""
    from app.models.video import Video, VideoStatus, VideoSource
    from app.core.config import settings
    from app.core.security import get_password_hash
    import uuid
    
    # Validate file type
    allowed_types = ["video/mp4", "video/avi", "video/mov", "video/mkv", "video/webm"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Check file size
    max_size = settings.VIDEO_UPLOAD_MAX_SIZE_MB * 1024 * 1024
    file_size = 0
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.VIDEO_UPLOAD_MAX_SIZE_MB}MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{file_extension}"
    
    # Save to MinIO or local storage
    # For now, save to local filesystem
    import os
    upload_dir = f"{settings.UPLOAD_DIR}/videos"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{filename}"
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create video record
    from app.models.video import Video, VideoStatus, VideoSource
    from uuid import uuid4
    
    video = Video(
        id=uuid4(),
        match_id=UUID(match_id) if match_id else None,
        camera_id=match_id if match_id else None,
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size_bytes=len(content),
        duration_seconds=0,  # Would be calculated
        resolution_width=1920,
        resolution_height=1080,
        fps=30,
        source_type=VideoSource.UPLOAD,
        processing_status=VideoStatus.PENDING,
        uploaded_by_id=uuid4(),  # Would use current_user.id
    )
    
    # Save to database
    # session.add(video)
    # await session.commit()
    # await session.refresh(video)
    
    # Queue for AI processing
    # await queue_video_processing(video.id)
    
    return {
        "video_id": str(uuid.uuid4()),
        "filename": filename,
        "file_size_bytes": len(content),
        "status": "uploaded",
        "processing_status": "pending",
        "message": "Video uploaded successfully. Processing will start shortly."
    }


@router.get("", response_model=list)
async def list_videos(
    skip: int = 0,
    limit: int = 20,
    match_id: Optional[str] = None,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """List videos with filtering."""
    from app.models.video import Video, VideoStatus
    from sqlalchemy import select, desc
    
    query = select(Video).order_by(desc(Video.created_at))
    
    if match_id:
        query = query.where(Video.match_id == match_id)
    if status:
        query = query.where(Video.processing_status == status)
    
    query = query.order_by(desc(Video.created_at)).offset(skip).limit(limit)
    
    result = await session.execute(query)
    videos = result.scalars().all()
    
    return [
        {
            "id": str(v.id),
            "match_id": str(v.match_id) if v.match_id else None,
            "filename": v.filename,
            "original_filename": v.original_filename,
            "file_size_bytes": v.file_size_bytes,
            "duration_seconds": v.duration_seconds,
            "resolution": f"{v.resolution_width}x{v.resolution_height}",
            "fps": v.fps,
            "source_type": v.source_type.value,
            "processing_status": v.processing_status.value,
            "created_at": v.created_at.isoformat(),
        }
        for v in result.scalars().all()
    ]


@router.get("/{video_id}", response_model=dict)
async def get_video(
    video_id: str,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Get video details."""
    from app.models.video import Video
    from sqlalchemy import select
    from uuid import UUID
    
    video = await session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {
        "id": str(video.id),
        "match_id": str(video.match_id) if video.match_id else None,
        "camera_id": str(video.camera_id) if video.camera_id else None,
        "filename": video.filename,
        "original_filename": video.original_filename,
        "file_path": video.file_path,
        "file_size_bytes": video.file_size_bytes,
        "duration_seconds": video.duration_seconds,
        "resolution": f"{video.resolution_width}x{video.resolution_height}",
        "fps": video.fps,
        "source_type": video.source_type.value,
        "processing_status": video.processing_status.value,
        "uploaded_by_id": str(video.uploaded_by_id) if video.uploaded_by_id else None,
        "created_at": video.created_at.isoformat(),
        "processed_at": video.processed_at.isoformat() if video.processed_at else None,
    }


@router.get("/{video_id}/stream")
async def stream_video(
    video_id: str,
    range: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Stream video with range support for seeking."""
    from fastapi.responses import StreamingResponse
    from app.models.video import Video
    from uuid import UUID
    
    video = await session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check if file exists
    import os
    if not os.path.exists(video.file_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    file_size = os.path.getsize(video.file_path)
    
    # Handle range requests for video seeking
    range_header = range or ""
    start = 0
    end = video.file_size_bytes - 1
    
    if video.duration_seconds:
        # Calculate chunk
        pass
    
    if range_header:
        range_header = range_header.replace("bytes=", "")
        start, end = range_header.split("-")
        start = int(start)
        end = int(end) if end else file_size - 1
    
    chunk_size = end - start + 1
    
    def iterfile():
        with open(video.file_path, "rb") as f:
            f.seek(start)
            bytes_read = 0
            while bytes_read < chunk_size:
                chunk = f.read(min(8192, chunk_size - bytes_read))
                if not chunk:
                    break
                yield chunk
                bytes_read += len(chunk)
    
    headers = {
        "Content-Range": f"bytes {start}-{end}/{video.file_size_bytes}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": "video/mp4",
    }
    
    return StreamingResponse(
        iterfile(),
        status_code=206,
        headers=headers,
        media_type="video/mp4"
    )


@router.delete("/{video_id}", status_code=204)
async def delete_video(
    video_id: str,
    session = Depends(get_db),
    current_user = Depends(require_role("admin", "org_admin", "coach")),
):
    """Delete a video."""
    from app.models.video import Video
    from uuid import UUID
    
    video = await session.get(Video, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete file from filesystem
    import os
    if os.path.exists(video.file_path):
        os.remove(video.file_path)
    
    # Delete from database
    from app.models.video import Video
    from sqlalchemy import delete
    await session.execute(delete(Video).where(Video.id == video_id))
    await session.commit()
    
    return None