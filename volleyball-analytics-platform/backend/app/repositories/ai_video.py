"""AI and Video repositories for camera, video recording, and AI inference operations."""

from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.repositories.base import BaseRepository
from app.models.ai_video import Camera, VideoRecording, AIInference, TrackRecord, PoseRecord


class CameraRepository(BaseRepository):
    """Repository for Camera entity."""

    def __init__(self, session):
        super().__init__(Camera, session)

    async def get_by_organization(self, org_id: UUID) -> List[Camera]:
        """Get all cameras for an organization."""
        result = await self.session.execute(
            select(self.model).where(self.model.organization_id == org_id)
        )
        return result.scalars().all()

    async def get_by_venue(self, venue_id: UUID) -> List[Camera]:
        """Get all cameras in a venue."""
        result = await self.session.execute(
            select(self.model).where(self.model.venue_id == venue_id)
        )
        return result.scalars().all()

    async def get_by_court(self, court_id: UUID) -> List[Camera]:
        """Get all cameras for a court."""
        result = await self.session.execute(
            select(self.model).where(self.model.court_id == court_id)
        )
        return result.scalars().all()

    async def get_active_cameras(self) -> List[Camera]:
        """Get all active cameras."""
        result = await self.session.execute(
            select(self.model).where(self.model.is_active == True)
        )
        return result.scalars().all()


class VideoRecordingRepository(BaseRepository):
    """Repository for VideoRecording entity."""

    def __init__(self, session):
        super().__init__(VideoRecording, session)

    async def get_by_match(self, match_id: UUID) -> List[VideoRecording]:
        """Get all video recordings for a match."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.match_id == match_id)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()

    async def get_by_camera(self, camera_id: UUID) -> List[VideoRecording]:
        """Get all video recordings from a camera."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.camera_id == camera_id)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()

    async def get_pending_processing(self) -> List[VideoRecording]:
        """Get videos pending processing."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.processing_status == "pending")
            .order_by(self.model.created_at)
        )
        return result.scalars().all()

    async def get_processing(self) -> List[VideoRecording]:
        """Get videos currently being processed."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.processing_status == "processing")
        )
        return result.scalars().all()

    async def get_by_uploader(self, user_id: UUID) -> List[VideoRecording]:
        """Get videos uploaded by a user."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.uploaded_by == user_id)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()


class AIInferenceRepository(BaseRepository):
    """Repository for AIInference entity."""

    def __init__(self, session):
        super().__init__(AIInference, session)

    async def get_by_video(self, video_id: UUID) -> List[AIInference]:
        """Get all AI inferences for a video."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.video_recording_id == video_id)
            .order_by(self.model.frame_number)
        )
        return result.scalars().all()

    async def get_by_model_type(self, model_type: str) -> List[AIInference]:
        """Get inferences by model type."""
        result = await self.session.execute(
            select(self.model).where(self.model.model_type == model_type)
        )
        return result.scalars().all()

    async def get_by_frame(self, video_id: UUID, frame_number: int) -> List[AIInference]:
        """Get all inferences for a specific frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.video_recording_id == video_id)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalars().all()

    async def get_unverified(self, model_type: str = None) -> List[AIInference]:
        """Get unverified inferences."""
        query = select(self.model).where(self.model.is_verified == False)
        if model_type:
            query = query.where(self.model.model_type == model_type)
        result = await self.session.execute(query)
        return result.scalars().all()


class TrackRecordRepository(BaseRepository):
    """Repository for TrackRecord entity."""

    def __init__(self, session):
        super().__init__(TrackRecord, session)

    async def get_by_player(self, player_id: UUID) -> List[TrackRecord]:
        """Get all track records for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .order_by(self.model.frame_number)
        )
        return result.scalars().all()

    async def get_by_track_id(self, track_id: str) -> List[TrackRecord]:
        """Get all records for a track ID."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.track_id == track_id)
            .order_by(self.model.frame_number)
        )
        return result.scalars().all()

    async def get_by_frame(self, frame_number: int) -> List[TrackRecord]:
        """Get all track records for a frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalars().all()

    async def get_by_team_assignment(self, team_assignment: str) -> List[TrackRecord]:
        """Get track records by team assignment."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.team_assignment == team_assignment)
        )
        return result.scalars().all()


class PoseRecordRepository(BaseRepository):
    """Repository for PoseRecord entity."""

    def __init__(self, session):
        super().__init__(PoseRecord, session)

    async def get_by_player(self, player_id: UUID) -> List[PoseRecord]:
        """Get all pose records for a player."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.player_id == player_id)
            .order_by(self.model.frame_number)
        )
        return result.scalars().all()

    async def get_by_action(self, action_label: str) -> List[PoseRecord]:
        """Get pose records by action label."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.action_label == action_label)
            .order_by(desc(self.model.action_confidence))
        )
        return result.scalars().all()

    async def get_by_frame(self, frame_number: int) -> List[PoseRecord]:
        """Get all pose records for a frame."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.frame_number == frame_number)
        )
        return result.scalars().all()

    async def get_high_confidence(self, min_confidence: float = 0.8) -> List[PoseRecord]:
        """Get pose records with high confidence."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.overall_confidence >= min_confidence)
            .order_by(desc(self.model.overall_confidence))
        )
        return result.scalars().all()