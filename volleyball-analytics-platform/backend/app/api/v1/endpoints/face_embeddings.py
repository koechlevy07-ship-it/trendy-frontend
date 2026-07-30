"""Face Embedding endpoints for Chapter 10."""

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.player import (
    PlayerFaceEmbeddingCreate,
    PlayerFaceEmbeddingUpdate,
    PlayerFaceEmbeddingResponse,
    PlayerFaceEmbeddingListResponse,
)
from app.services.player import PlayerService

router = APIRouter()


def get_player_service(session=Depends(get_db)) -> PlayerService:
    """Get player service instance."""
    return PlayerService(session)


@router.post("/players/{player_id}/face-embeddings", response_model=PlayerFaceEmbeddingResponse, status_code=201)
async def create_face_embedding(
    player_id: UUID,
    embedding_data: PlayerFaceEmbeddingCreate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "coach", "ai")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Register AI face embedding for player."""
    try:
        embedding = await player_service.create_face_embedding(
            player_id=player_id,
            embedding_id=embedding_data.embedding_id,
            embedding_version=embedding_data.embedding_version,
            feature_vector_reference=embedding_data.feature_vector_reference,
            capture_date=embedding_data.capture_date,
            camera_source=embedding_data.camera_source,
            quality_score=embedding_data.quality_score,
            algorithm_version=embedding_data.algorithm_version,
            current_user_id=current_user.id,
        )
        return embedding
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/players/{player_id}/face-embeddings", response_model=PlayerFaceEmbeddingListResponse)
async def list_face_embeddings(
    player_id: UUID,
    page: int = 1,
    per_page: int = 20,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """List face embeddings for a player."""
    embeddings = await player_service.get_face_embeddings(player_id)
    total = len(embeddings)
    items = embeddings[(page - 1) * per_page:page * per_page]
    return PlayerFaceEmbeddingListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + 19) // 20,
    )


@router.get("/players/{player_id}/face-embeddings/active", response_model=Optional[PlayerFaceEmbeddingResponse])
async def get_active_face_embedding(
    player_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get the active (most recent) face embedding for a player."""
    return await player_service.get_active_face_embedding(player_id)


@router.get("/players/{player_id}/face-embeddings/version/{version}", response_model=Optional[PlayerFaceEmbeddingResponse])
async def get_face_embedding_by_version(
    player_id: UUID,
    version: int,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get face embedding by version."""
    return await player_service.get_face_embedding_by_version(player_id, version)


@router.get("/face-embeddings/{embedding_id}", response_model=Optional[PlayerFaceEmbeddingResponse])
async def get_face_embedding_by_id(
    embedding_id: str,
    session=Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    player_service: PlayerService = Depends(get_player_service),
):
    """Get face embedding by embedding ID."""
    return await player_service.get_face_embedding_by_id(embedding_id)


@router.put("/face-embeddings/{embedding_id}", response_model=PlayerFaceEmbeddingResponse)
async def update_face_embedding(
    embedding_id: UUID,
    embedding_data: PlayerFaceEmbeddingUpdate,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "ai")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Update face embedding metadata."""
    try:
        return await player_service.update_face_embedding(embedding_id, embedding_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/face-embeddings/{embedding_id}/deactivate", response_model=PlayerFaceEmbeddingResponse)
async def deactivate_face_embedding(
    embedding_id: UUID,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "ai")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Deactivate a face embedding (archive it)."""
    embedding = await player_service.get_face_embedding_by_id(str(embedding_id))
    if not embedding:
        raise HTTPException(status_code=404, detail="Face embedding not found")

    embedding.status = "archived"
    embedding.updated_by = current_user.id
    embedding.updated_at = datetime.utcnow()
    await session.flush()
    await session.refresh(embedding)
    return embedding


@router.post("/players/{player_id}/face-embeddings/deactivate-old", response_model=dict)
async def deactivate_old_embeddings(
    player_id: UUID,
    current_version: int,
    session=Depends(get_db),
    current_user: User = Depends(require_role("admin", "org_admin", "ai")),
    player_service: PlayerService = Depends(get_player_service),
):
    """Deactivate all face embeddings older than current version."""
    count = await player_service.deactivate_old_embeddings(player_id, current_version)
    return {"deactivated": count}