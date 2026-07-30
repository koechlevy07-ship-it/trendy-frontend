"""Initial schema: core domain models

Revision ID: 001
Revises: 
Create Date: 2026-07-15 22:51:06.619379

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'matches',
        sa.Column('competition_id', UUID, nullable=True, sa.ForeignKey('competitions.id')),
        sa.Column('season_id', UUID, nullable=True, sa.ForeignKey('seasons.id')),
        sa.Column('home_team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('away_team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('venue_id', UUID, nullable=True, sa.ForeignKey('venues.id')),
        sa.Column('court_id', UUID, nullable=True, sa.ForeignKey('courts.id')),
        sa.Column('match_date', DATETIME, nullable=False),
        sa.Column('start_time', DATETIME, nullable=True),
        sa.Column('end_time', DATETIME, nullable=True),
        sa.Column('duration_minutes', INTEGER, nullable=True),
        sa.Column('format', VARCHAR(9), nullable=False, default=ScalarElementColumnDefault(<MatchFormat.BEST_OF_5: 'best_of_5'>)),
        sa.Column('status', VARCHAR(9), nullable=False, default=ScalarElementColumnDefault(<MatchStatus.SCHEDULED: 'scheduled'>)),
        sa.Column('round_name', VARCHAR(50), nullable=True),
        sa.Column('round_number', INTEGER, nullable=True),
        sa.Column('home_score', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('away_score', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('winner_team_id', UUID, nullable=True, sa.ForeignKey('teams.id')),
        sa.Column('processing_status', VARCHAR(10), nullable=False, default=ScalarElementColumnDefault('pending')),
        sa.Column('processing_progress', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('video_recording_id', UUID, nullable=True, sa.ForeignKey('video_recordings.id')),
        sa.Column('live_stream_url', VARCHAR(500), nullable=True),
        sa.Column('notes', TEXT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B690C0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_matches_away_team_id', 'matches', ['away_team_id'], unique=False)
    op.create_index('ix_matches_competition_id', 'matches', ['competition_id'], unique=False)
    op.create_index('ix_matches_home_team_id', 'matches', ['home_team_id'], unique=False)
    op.create_index('ix_matches_match_date', 'matches', ['match_date'], unique=False)
    op.create_index('ix_matches_processing_status', 'matches', ['processing_status'], unique=False)
    op.create_index('ix_matches_season_id', 'matches', ['season_id'], unique=False)
    op.create_index('ix_matches_status', 'matches', ['status'], unique=False)
    op.create_index('ix_matches_venue_id', 'matches', ['venue_id'], unique=False)
    op.create_table(
        'organizations',
        sa.Column('name', VARCHAR(200), nullable=False),
        sa.Column('type', VARCHAR(10), nullable=False),
        sa.Column('country', VARCHAR(2), nullable=False),
        sa.Column('region', VARCHAR(100), nullable=True),
        sa.Column('logo_url', VARCHAR(500), nullable=True),
        sa.Column('contact_email', VARCHAR(200), nullable=True),
        sa.Column('contact_phone', VARCHAR(50), nullable=True),
        sa.Column('website', VARCHAR(500), nullable=True),
        sa.Column('address', TEXT, nullable=True),
        sa.Column('status', VARCHAR(9), nullable=False, default=ScalarElementColumnDefault(<OrganizationStatus.ACTIVE: 'active'>)),
        sa.Column('settings', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689D94E0>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689D92D0>)),
        sa.Column('owner_id', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_organizations_country', 'organizations', ['country'], unique=False)
    op.create_index('ix_organizations_name', 'organizations', ['name'], unique=False)
    op.create_index('ix_organizations_status', 'organizations', ['status'], unique=False)
    op.create_index('ix_organizations_type', 'organizations', ['type'], unique=False)
    op.create_table(
        'permissions',
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219689DB530>), primary_key=True),
        sa.Column('name', VARCHAR(100), nullable=False),
        sa.Column('resource', VARCHAR(50), nullable=False),
        sa.Column('action', VARCHAR(50), nullable=False),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219689c23f0; now>, for_update=False)),
        sa.UniqueConstraint(['resource', 'action'], name='uq_permission_resource_action')
    )
    op.create_index('ix_permissions_resource', 'permissions', ['resource'], unique=False)
    op.create_table(
        'teams',
        sa.Column('organization_id', UUID, nullable=False, sa.ForeignKey('organizations.id')),
        sa.Column('name', VARCHAR(100), nullable=False),
        sa.Column('short_name', VARCHAR(20), nullable=False),
        sa.Column('gender', VARCHAR(5), nullable=False),
        sa.Column('age_category', VARCHAR(6), nullable=False),
        sa.Column('competition_level', VARCHAR(12), nullable=False),
        sa.Column('logo_url', VARCHAR(500), nullable=True),
        sa.Column('primary_color', VARCHAR(7), nullable=False, default=ScalarElementColumnDefault('#3B82F6')),
        sa.Column('secondary_color', VARCHAR(7), nullable=False, default=ScalarElementColumnDefault('#1E40AF')),
        sa.Column('founded_year', INTEGER, nullable=True),
        sa.Column('home_venue_id', UUID, nullable=True, sa.ForeignKey('venues.id')),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689D9A60>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['organization_id', 'name'], name='uq_org_team_name')
    )
    op.create_index('ix_teams_gender_age', 'teams', ['gender', 'age_category'], unique=False)
    op.create_index('ix_teams_name', 'teams', ['name'], unique=False)
    op.create_index('ix_teams_organization_id', 'teams', ['organization_id'], unique=False)
    op.create_table(
        'users',
        sa.Column('email', VARCHAR(255), nullable=False),
        sa.Column('username', VARCHAR(50), nullable=False),
        sa.Column('full_name', VARCHAR(100), nullable=False),
        sa.Column('password_hash', VARCHAR(255), nullable=False),
        sa.Column('default_role', VARCHAR(15), nullable=False, default=ScalarElementColumnDefault(<UserRole.VIEWER: 'viewer'>)),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('team_id', UUID, nullable=True, sa.ForeignKey('teams.id')),
        sa.Column('phone', VARCHAR(50), nullable=True),
        sa.Column('avatar_url', VARCHAR(500), nullable=True),
        sa.Column('status', VARCHAR(20), nullable=False, default=ScalarElementColumnDefault(<UserStatus.PENDING_VERIFICATION: 'pending_verification'>)),
        sa.Column('is_superuser', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('last_login', DATETIME, nullable=True),
        sa.Column('email_verified', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('failed_login_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('locked_until', DATETIME, nullable=True),
        sa.Column('preferences', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A94670>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A943B0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_organization_id', 'users', ['organization_id'], unique=False)
    op.create_index('ix_users_status', 'users', ['status'], unique=False)
    op.create_index('ix_users_team_id', 'users', ['team_id'], unique=False)
    op.create_index('ix_users_username', 'users', ['username'], unique=False)
    op.create_table(
        'venues',
        sa.Column('organization_id', UUID, nullable=False, sa.ForeignKey('organizations.id')),
        sa.Column('name', VARCHAR(200), nullable=False),
        sa.Column('type', VARCHAR(7), nullable=False),
        sa.Column('address', VARCHAR(500), nullable=False),
        sa.Column('city', VARCHAR(100), nullable=False),
        sa.Column('region', VARCHAR(100), nullable=True),
        sa.Column('country', VARCHAR(2), nullable=False),
        sa.Column('postal_code', VARCHAR(20), nullable=True),
        sa.Column('latitude', FLOAT, nullable=True),
        sa.Column('longitude', FLOAT, nullable=True),
        sa.Column('capacity', INTEGER, nullable=True),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('amenities', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689DA400>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689DA610>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_venues_city_country', 'venues', ['city', 'country'], unique=False)
    op.create_index('ix_venues_name', 'venues', ['name'], unique=False)
    op.create_index('ix_venues_organization_id', 'venues', ['organization_id'], unique=False)
    op.create_table(
        'video_recordings',
        sa.Column('match_id', UUID, nullable=True, sa.ForeignKey('matches.id')),
        sa.Column('camera_id', UUID, nullable=True, sa.ForeignKey('cameras.id')),
        sa.Column('filename', VARCHAR(255), nullable=False),
        sa.Column('file_path', VARCHAR(500), nullable=False),
        sa.Column('file_size_bytes', BIGINT, nullable=False),
        sa.Column('source_type', VARCHAR(6), nullable=False),
        sa.Column('original_url', VARCHAR(500), nullable=True),
        sa.Column('duration_seconds', FLOAT, nullable=True),
        sa.Column('frame_count', INTEGER, nullable=True),
        sa.Column('fps', FLOAT, nullable=True),
        sa.Column('resolution_width', INTEGER, nullable=True),
        sa.Column('resolution_height', INTEGER, nullable=True),
        sa.Column('codec', VARCHAR(50), nullable=True),
        sa.Column('bitrate', INTEGER, nullable=True),
        sa.Column('start_time', DATETIME, nullable=True),
        sa.Column('end_time', DATETIME, nullable=True),
        sa.Column('uploaded_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('processing_status', VARCHAR(10), nullable=False, default=ScalarElementColumnDefault(<ProcessingStatus.PENDING: 'pending'>)),
        sa.Column('processing_progress', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('processing_started_at', DATETIME, nullable=True),
        sa.Column('processing_completed_at', DATETIME, nullable=True),
        sa.Column('error_message', TEXT, nullable=True),
        sa.Column('storage_bucket', VARCHAR(100), nullable=True),
        sa.Column('storage_region', VARCHAR(100), nullable=True),
        sa.Column('thumbnail_path', VARCHAR(500), nullable=True),
        sa.Column('preview_clips', JSONB, nullable=False, default=CallableColumnDefault(<function list at 0x0000021968CA61F0>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA62A0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_videos_camera_id', 'video_recordings', ['camera_id'], unique=False)
    op.create_index('ix_videos_match_id', 'video_recordings', ['match_id'], unique=False)
    op.create_index('ix_videos_start_time', 'video_recordings', ['start_time'], unique=False)
    op.create_index('ix_videos_status', 'video_recordings', ['processing_status'], unique=False)
    op.create_index('ix_videos_uploaded_by', 'video_recordings', ['uploaded_by'], unique=False)
    op.create_table(
        'ai_inferences',
        sa.Column('video_recording_id', UUID, nullable=False, sa.ForeignKey('video_recordings.id')),
        sa.Column('model_type', VARCHAR(18), nullable=False),
        sa.Column('model_version', VARCHAR(50), nullable=False),
        sa.Column('frame_number', INTEGER, nullable=False),
        sa.Column('timestamp_ms', BIGINT, nullable=False),
        sa.Column('confidence_threshold', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.5)),
        sa.Column('detections', JSONB, nullable=False, default=CallableColumnDefault(<function list at 0x0000021968CA6A30>)),
        sa.Column('keypoints', JSONB, nullable=True),
        sa.Column('tracking_ids', JSONB, nullable=True),
        sa.Column('processing_time_ms', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('gpu_memory_mb', FLOAT, nullable=True),
        sa.Column('is_verified', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('verified_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('verified_at', DATETIME, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA6770>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_ai_frame', 'ai_inferences', ['video_recording_id', 'frame_number'], unique=False)
    op.create_index('ix_ai_model_type', 'ai_inferences', ['model_type'], unique=False)
    op.create_index('ix_ai_timestamp', 'ai_inferences', ['video_recording_id', 'timestamp_ms'], unique=False)
    op.create_index('ix_ai_verified', 'ai_inferences', ['is_verified'], unique=False)
    op.create_index('ix_ai_video_id', 'ai_inferences', ['video_recording_id'], unique=False)
    op.create_table(
        'audit_logs',
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x0000021968DC10C0>), primary_key=True),
        sa.Column('timestamp', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968dd4aa0; now>, for_update=False)),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('user_id', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('action', VARCHAR(7), nullable=False),
        sa.Column('resource_type', VARCHAR(50), nullable=False),
        sa.Column('resource_id', UUID, nullable=True),
        sa.Column('old_values', JSONB, nullable=True),
        sa.Column('new_values', JSONB, nullable=True),
        sa.Column('ip_address', VARCHAR(45), nullable=True),
        sa.Column('user_agent', TEXT, nullable=True),
        sa.Column('session_id', VARCHAR(100), nullable=True),
        sa.Column('request_id', VARCHAR(100), nullable=True),
        sa.Column('status', VARCHAR(20), nullable=False, default=ScalarElementColumnDefault('success')),
        sa.Column('error_message', TEXT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968DC0F60>))
    )
    op.create_index('ix_audit_action_timestamp', 'audit_logs', ['action', 'timestamp'], unique=False)
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'], unique=False)
    op.create_index('ix_audit_logs_organization_id', 'audit_logs', ['organization_id'], unique=False)
    op.create_index('ix_audit_logs_resource_id', 'audit_logs', ['resource_id'], unique=False)
    op.create_index('ix_audit_logs_resource_type', 'audit_logs', ['resource_type'], unique=False)
    op.create_index('ix_audit_logs_timestamp', 'audit_logs', ['timestamp'], unique=False)
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'], unique=False)
    op.create_index('ix_audit_org_timestamp', 'audit_logs', ['organization_id', 'timestamp'], unique=False)
    op.create_index('ix_audit_resource', 'audit_logs', ['resource_type', 'resource_id'], unique=False)
    op.create_index('ix_audit_timestamp', 'audit_logs', ['timestamp'], unique=False)
    op.create_index('ix_audit_user_timestamp', 'audit_logs', ['user_id', 'timestamp'], unique=False)
    op.create_table(
        'coaches',
        sa.Column('user_id', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('first_name', VARCHAR(50), nullable=False),
        sa.Column('last_name', VARCHAR(50), nullable=False),
        sa.Column('role', VARCHAR(18), nullable=False),
        sa.Column('license_number', VARCHAR(50), nullable=True),
        sa.Column('license_level', VARCHAR(50), nullable=True),
        sa.Column('license_expiry', DATETIME, nullable=True),
        sa.Column('phone', VARCHAR(50), nullable=True),
        sa.Column('email', VARCHAR(255), nullable=True),
        sa.Column('photo_url', VARCHAR(500), nullable=True),
        sa.Column('bio', TEXT, nullable=True),
        sa.Column('specializations', JSONB, nullable=False, default=CallableColumnDefault(<function list at 0x0000021968A95A60>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A95850>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_coaches_role', 'coaches', ['role'], unique=False)
    op.create_index('ix_coaches_team_id', 'coaches', ['team_id'], unique=False)
    op.create_index('ix_coaches_user_id', 'coaches', ['user_id'], unique=False)
    op.create_table(
        'courts',
        sa.Column('venue_id', UUID, nullable=False, sa.ForeignKey('venues.id')),
        sa.Column('name', VARCHAR(100), nullable=False),
        sa.Column('number', INTEGER, nullable=False),
        sa.Column('type', VARCHAR(7), nullable=False),
        sa.Column('surface', VARCHAR(100), nullable=True),
        sa.Column('dimensions', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689DACF0>)),
        sa.Column('has_streaming', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('has_scoreboard', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('camera_positions', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689DAC40>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x00000219689DAE50>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['venue_id', 'number'], name='uq_venue_court_number')
    )
    op.create_index('ix_courts_venue_id', 'courts', ['venue_id'], unique=False)
    op.create_table(
        'notifications',
        sa.Column('user_id', UUID, nullable=False, sa.ForeignKey('users.id')),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('type', VARCHAR(15), nullable=False),
        sa.Column('channel', VARCHAR(7), nullable=False, default=ScalarElementColumnDefault(<NotificationChannel.IN_APP: 'in_app'>)),
        sa.Column('title', VARCHAR(200), nullable=False),
        sa.Column('message', TEXT, nullable=False),
        sa.Column('reference_type', VARCHAR(50), nullable=True),
        sa.Column('reference_id', UUID, nullable=True),
        sa.Column('action_url', VARCHAR(500), nullable=True),
        sa.Column('is_read', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('read_at', DATETIME, nullable=True),
        sa.Column('priority', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('expires_at', DATETIME, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968DC07D0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'], unique=False)
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'], unique=False)
    op.create_index('ix_notifications_org_id', 'notifications', ['organization_id'], unique=False)
    op.create_index('ix_notifications_reference', 'notifications', ['reference_type', 'reference_id'], unique=False)
    op.create_index('ix_notifications_type', 'notifications', ['type'], unique=False)
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'], unique=False)
    op.create_table(
        'officials',
        sa.Column('user_id', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('first_name', VARCHAR(50), nullable=False),
        sa.Column('last_name', VARCHAR(50), nullable=False),
        sa.Column('role', VARCHAR(16), nullable=False),
        sa.Column('license_number', VARCHAR(50), nullable=True),
        sa.Column('license_level', VARCHAR(50), nullable=True),
        sa.Column('license_expiry', DATETIME, nullable=True),
        sa.Column('phone', VARCHAR(50), nullable=True),
        sa.Column('email', VARCHAR(255), nullable=True),
        sa.Column('photo_url', VARCHAR(500), nullable=True),
        sa.Column('certifications', JSONB, nullable=False, default=CallableColumnDefault(<function list at 0x0000021968A96400>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A96350>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_officials_organization_id', 'officials', ['organization_id'], unique=False)
    op.create_index('ix_officials_role', 'officials', ['role'], unique=False)
    op.create_index('ix_officials_user_id', 'officials', ['user_id'], unique=False)
    op.create_table(
        'players',
        sa.Column('user_id', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('jersey_number', INTEGER, nullable=False),
        sa.Column('first_name', VARCHAR(50), nullable=False),
        sa.Column('last_name', VARCHAR(50), nullable=False),
        sa.Column('position', VARCHAR(3), nullable=False),
        sa.Column('height_cm', INTEGER, nullable=True),
        sa.Column('weight_kg', INTEGER, nullable=True),
        sa.Column('date_of_birth', DATETIME, nullable=True),
        sa.Column('nationality', VARCHAR(3), nullable=True),
        sa.Column('dominant_hand', VARCHAR(5), nullable=True),
        sa.Column('photo_url', VARCHAR(500), nullable=True),
        sa.Column('is_libero', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('is_captain', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('medical_info', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A94EB0>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A950C0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['team_id', 'jersey_number'], name='uq_team_jersey')
    )
    op.create_index('ix_players_active', 'players', ['is_active'], unique=False)
    op.create_index('ix_players_position', 'players', ['position'], unique=False)
    op.create_index('ix_players_team_id', 'players', ['team_id'], unique=False)
    op.create_index('ix_players_user_id', 'players', ['user_id'], unique=False)
    op.create_table(
        'roles',
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219689DBCC0>), primary_key=True),
        sa.Column('name', VARCHAR(50), nullable=False),
        sa.Column('display_name', VARCHAR(100), nullable=False),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('is_system', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219689c9d90; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968993bd0; now>, for_update=False))
    )
    op.create_index('ix_roles_name', 'roles', ['name'], unique=False)
    op.create_index('ix_roles_organization_id', 'roles', ['organization_id'], unique=False)
    op.create_table(
        'seasons',
        sa.Column('organization_id', UUID, nullable=False, sa.ForeignKey('organizations.id')),
        sa.Column('name', VARCHAR(200), nullable=False),
        sa.Column('short_name', VARCHAR(50), nullable=False),
        sa.Column('start_date', DATE, nullable=False),
        sa.Column('end_date', DATE, nullable=False),
        sa.Column('registration_start', DATE, nullable=True),
        sa.Column('registration_end', DATE, nullable=True),
        sa.Column('status', VARCHAR(9), nullable=False, default=ScalarElementColumnDefault(<SeasonStatus.UPCOMING: 'upcoming'>)),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A975E0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['organization_id', 'short_name'], name='uq_org_season_short')
    )
    op.create_index('ix_seasons_dates', 'seasons', ['start_date', 'end_date'], unique=False)
    op.create_index('ix_seasons_organization_id', 'seasons', ['organization_id'], unique=False)
    op.create_index('ix_seasons_status', 'seasons', ['status'], unique=False)
    op.create_table(
        'sets',
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('number', INTEGER, nullable=False),
        sa.Column('home_points', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('away_points', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('duration_seconds', INTEGER, nullable=True),
        sa.Column('status', VARCHAR(11), nullable=False, default=ScalarElementColumnDefault(<SetStatus.PENDING: 'pending'>)),
        sa.Column('winner_team_id', UUID, nullable=True, sa.ForeignKey('teams.id')),
        sa.Column('start_time', DATETIME, nullable=True),
        sa.Column('end_time', DATETIME, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B69850>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['match_id', 'number'], name='uq_match_set_number')
    )
    op.create_index('ix_sets_match_id', 'sets', ['match_id'], unique=False)
    op.create_index('ix_sets_number', 'sets', ['match_id', 'number'], unique=False)
    op.create_table(
        'cameras',
        sa.Column('organization_id', UUID, nullable=False, sa.ForeignKey('organizations.id')),
        sa.Column('venue_id', UUID, nullable=True, sa.ForeignKey('venues.id')),
        sa.Column('court_id', UUID, nullable=True, sa.ForeignKey('courts.id')),
        sa.Column('name', VARCHAR(100), nullable=False),
        sa.Column('type', VARCHAR(4), nullable=False),
        sa.Column('connection_url', VARCHAR(500), nullable=False),
        sa.Column('username', VARCHAR(100), nullable=True),
        sa.Column('password', VARCHAR(100), nullable=True),
        sa.Column('resolution_width', INTEGER, nullable=False, default=ScalarElementColumnDefault(1920)),
        sa.Column('resolution_height', INTEGER, nullable=False, default=ScalarElementColumnDefault(1080)),
        sa.Column('fps', INTEGER, nullable=False, default=ScalarElementColumnDefault(30)),
        sa.Column('codec', VARCHAR(20), nullable=True),
        sa.Column('position_x', FLOAT, nullable=True),
        sa.Column('position_y', FLOAT, nullable=True),
        sa.Column('position_z', FLOAT, nullable=True),
        sa.Column('orientation_yaw', FLOAT, nullable=True),
        sa.Column('orientation_pitch', FLOAT, nullable=True),
        sa.Column('orientation_roll', FLOAT, nullable=True),
        sa.Column('intrinsic_matrix', JSONB, nullable=True),
        sa.Column('distortion_coefficients', JSONB, nullable=True),
        sa.Column('calibration_data', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA59B0>)),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_streaming', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA5BC0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_cameras_active', 'cameras', ['is_active'], unique=False)
    op.create_index('ix_cameras_court_id', 'cameras', ['court_id'], unique=False)
    op.create_index('ix_cameras_organization_id', 'cameras', ['organization_id'], unique=False)
    op.create_index('ix_cameras_venue_id', 'cameras', ['venue_id'], unique=False)
    op.create_table(
        'competitions',
        sa.Column('organization_id', UUID, nullable=False, sa.ForeignKey('organizations.id')),
        sa.Column('season_id', UUID, nullable=False, sa.ForeignKey('seasons.id')),
        sa.Column('name', VARCHAR(200), nullable=False),
        sa.Column('short_name', VARCHAR(50), nullable=False),
        sa.Column('competition_type', VARCHAR(10), nullable=False),
        sa.Column('status', VARCHAR(19), nullable=False, default=ScalarElementColumnDefault(<CompetitionStatus.PLANNING: 'planning'>)),
        sa.Column('gender', VARCHAR(10), nullable=True),
        sa.Column('age_category', VARCHAR(20), nullable=True),
        sa.Column('competition_level', VARCHAR(20), nullable=True),
        sa.Column('max_teams', INTEGER, nullable=True),
        sa.Column('start_date', DATE, nullable=True),
        sa.Column('end_date', DATE, nullable=True),
        sa.Column('format_config', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A97AB0>)),
        sa.Column('rules', TEXT, nullable=True),
        sa.Column('prize_info', TEXT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968A97B60>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['season_id', 'short_name'], name='uq_season_comp_short')
    )
    op.create_index('ix_competitions_organization_id', 'competitions', ['organization_id'], unique=False)
    op.create_index('ix_competitions_season_id', 'competitions', ['season_id'], unique=False)
    op.create_index('ix_competitions_status', 'competitions', ['status'], unique=False)
    op.create_index('ix_competitions_type', 'competitions', ['competition_type'], unique=False)
    op.create_table(
        'lineups',
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('set_id', UUID, nullable=True, sa.ForeignKey('sets.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('player_id', UUID, nullable=False, sa.ForeignKey('players.id')),
        sa.Column('position', INTEGER, nullable=False),
        sa.Column('rotation', INTEGER, nullable=False),
        sa.Column('is_libero', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('is_captain', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('is_starter', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('substitution_order', INTEGER, nullable=True),
        sa.Column('time_in', DATETIME, nullable=True),
        sa.Column('time_out', DATETIME, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B6AE50>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['match_id', 'set_id', 'team_id', 'player_id'], name='uq_lineup_player_set'),
        sa.UniqueConstraint(['match_id', 'set_id', 'team_id', 'position', 'rotation'], name='uq_lineup_position')
    )
    op.create_index('ix_lineups_match_id', 'lineups', ['match_id'], unique=False)
    op.create_index('ix_lineups_player_id', 'lineups', ['player_id'], unique=False)
    op.create_index('ix_lineups_set_id', 'lineups', ['set_id'], unique=False)
    op.create_index('ix_lineups_team_id', 'lineups', ['team_id'], unique=False)
    op.create_table(
        'match_officials',
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x0000021968A96CF0>), primary_key=True),
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('official_id', UUID, nullable=False, sa.ForeignKey('officials.id')),
        sa.Column('role', VARCHAR(16), nullable=False),
        sa.Column('assigned_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968b12450; now>, for_update=False)),
        sa.Column('assigned_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.UniqueConstraint(['match_id', 'official_id', 'role'], name='uq_match_official_role')
    )
    op.create_index('ix_match_officials_match_id', 'match_officials', ['match_id'], unique=False)
    op.create_index('ix_match_officials_official_id', 'match_officials', ['official_id'], unique=False)
    op.create_table(
        'player_match_statistics',
        sa.Column('player_id', UUID, nullable=False, sa.ForeignKey('players.id')),
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('set_id', UUID, nullable=True, sa.ForeignKey('sets.id')),
        sa.Column('total_serves', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('service_aces', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('service_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('kills', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('blocked_attacks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('solo_blocks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('block_assists', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('block_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('digs', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('saves', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('reception_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('perfect_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('positive_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('poor_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('reception_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('set_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('assists', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('setting_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('distance_covered_m', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('avg_speed_kmh', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('max_speed_kmh', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('jump_count', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('avg_jump_height_cm', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('max_jump_height_cm', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('playing_time_seconds', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('sets_played', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('serve_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('reception_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('setting_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B6B530>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['player_id', 'match_id', 'set_id'], name='uq_player_match_set')
    )
    op.create_index('ix_pms_match', 'player_match_statistics', ['match_id'], unique=False)
    op.create_index('ix_pms_player_match', 'player_match_statistics', ['player_id', 'match_id'], unique=False)
    op.create_index('ix_pms_set', 'player_match_statistics', ['set_id'], unique=False)
    op.create_table(
        'player_season_statistics',
        sa.Column('player_id', UUID, nullable=False, sa.ForeignKey('players.id')),
        sa.Column('season_id', UUID, nullable=False, sa.ForeignKey('seasons.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('matches_played', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('sets_played', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_serves', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('service_aces', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('service_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('serve_percentage', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('ace_percentage', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('attack_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('kills', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('blocked_attacks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('kill_percentage', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('hitting_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('solo_blocks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('block_assists', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('block_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('blocks_per_set', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('digs', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('saves', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('digs_per_set', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('reception_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('perfect_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('positive_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('poor_receptions', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('reception_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('reception_percentage', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('set_attempts', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('assists', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('setting_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('assist_percentage', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('distance_covered_m', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('avg_speed_kmh', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('max_speed_kmh', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('jump_count', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('avg_jump_height_cm', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('max_jump_height_cm', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('playing_time_seconds', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('rating', FLOAT, nullable=True),
        sa.Column('mvp_points', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA49E0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['player_id', 'season_id'], name='uq_player_season')
    )
    op.create_index('ix_pss_player_season', 'player_season_statistics', ['player_id', 'season_id'], unique=False)
    op.create_index('ix_pss_rating', 'player_season_statistics', ['rating'], unique=False)
    op.create_index('ix_pss_team_season', 'player_season_statistics', ['team_id', 'season_id'], unique=False)
    op.create_table(
        'pose_records',
        sa.Column('player_id', UUID, nullable=False, sa.ForeignKey('players.id')),
        sa.Column('video_recording_id', UUID, nullable=False, sa.ForeignKey('video_recordings.id')),
        sa.Column('track_id', VARCHAR(50), nullable=False),
        sa.Column('frame_number', INTEGER, nullable=False),
        sa.Column('timestamp_ms', BIGINT, nullable=False),
        sa.Column('keypoints', JSONB, nullable=False),
        sa.Column('confidence_scores', JSONB, nullable=False),
        sa.Column('model_version', VARCHAR(50), nullable=False),
        sa.Column('overall_confidence', FLOAT, nullable=False),
        sa.Column('court_position_x', FLOAT, nullable=True),
        sa.Column('court_position_y', FLOAT, nullable=True),
        sa.Column('action_label', VARCHAR(50), nullable=True),
        sa.Column('action_confidence', FLOAT, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA78A0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_poses_action', 'pose_records', ['action_label'], unique=False)
    op.create_index('ix_poses_player_frame', 'pose_records', ['player_id', 'frame_number'], unique=False)
    op.create_index('ix_poses_video_frame', 'pose_records', ['video_recording_id', 'frame_number'], unique=False)
    op.create_table(
        'rallies',
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('set_id', UUID, nullable=False, sa.ForeignKey('sets.id')),
        sa.Column('rally_number', INTEGER, nullable=False),
        sa.Column('serving_team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('receiving_team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('start_time', DATETIME, nullable=False),
        sa.Column('end_time', DATETIME, nullable=True),
        sa.Column('duration_seconds', FLOAT, nullable=True),
        sa.Column('winner_team_id', UUID, nullable=True, sa.ForeignKey('teams.id')),
        sa.Column('point_type', VARCHAR(14), nullable=False),
        sa.Column('point_by_player_id', UUID, nullable=True, sa.ForeignKey('players.id')),
        sa.Column('rotation_home', INTEGER, nullable=True),
        sa.Column('rotation_away', INTEGER, nullable=True),
        sa.Column('score_before_home', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('score_before_away', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('score_after_home', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('score_after_away', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B69DD0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['match_id', 'rally_number'], name='uq_match_rally_number')
    )
    op.create_index('ix_rallies_match_id', 'rallies', ['match_id'], unique=False)
    op.create_index('ix_rallies_rally_number', 'rallies', ['match_id', 'rally_number'], unique=False)
    op.create_index('ix_rallies_set_id', 'rallies', ['set_id'], unique=False)
    op.create_table(
        'role_permissions',
        sa.Column('role_id', UUID, nullable=False, primary_key=True, sa.ForeignKey('roles.id')),
        sa.Column('permission_id', UUID, nullable=False, primary_key=True, sa.ForeignKey('permissions.id')),
        sa.PrimaryKeyConstraint(['role_id', 'permission_id'])
    )
    op.create_table(
        'team_match_statistics',
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('set_id', UUID, nullable=True, sa.ForeignKey('sets.id')),
        sa.Column('total_kills', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_aces', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_blocks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_digs', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('serve_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('reception_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('block_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('serving_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B6BD70>)),
        sa.Column('attacking_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B6BE20>)),
        sa.Column('blocking_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA4040>)),
        sa.Column('defense_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA40F0>)),
        sa.Column('receiving_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA41A0>)),
        sa.Column('setting_stats', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA4250>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA4300>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['team_id', 'match_id', 'set_id'], name='uq_team_match_set')
    )
    op.create_index('ix_tms_match', 'team_match_statistics', ['match_id'], unique=False)
    op.create_index('ix_tms_team_match', 'team_match_statistics', ['team_id', 'match_id'], unique=False)
    op.create_table(
        'team_season_statistics',
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('season_id', UUID, nullable=False, sa.ForeignKey('seasons.id')),
        sa.Column('matches_played', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('wins', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('losses', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('sets_won', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('sets_lost', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('points_scored', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('points_conceded', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_kills', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_aces', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_blocks', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_digs', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('total_errors', INTEGER, nullable=False, default=ScalarElementColumnDefault(0)),
        sa.Column('attack_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('serve_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('reception_quality', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('block_efficiency', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('standing', INTEGER, nullable=True),
        sa.Column('playoff_seed', INTEGER, nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA52D0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True),
        sa.UniqueConstraint(['team_id', 'season_id'], name='uq_team_season')
    )
    op.create_index('ix_tss_standing', 'team_season_statistics', ['standing'], unique=False)
    op.create_index('ix_tss_team_season', 'team_season_statistics', ['team_id', 'season_id'], unique=False)
    op.create_table(
        'track_records',
        sa.Column('player_id', UUID, nullable=True, sa.ForeignKey('players.id')),
        sa.Column('track_id', VARCHAR(50), nullable=False),
        sa.Column('video_recording_id', UUID, nullable=False, sa.ForeignKey('video_recordings.id')),
        sa.Column('frame_number', INTEGER, nullable=False),
        sa.Column('timestamp_ms', BIGINT, nullable=False),
        sa.Column('bbox_x', FLOAT, nullable=False),
        sa.Column('bbox_y', FLOAT, nullable=False),
        sa.Column('bbox_w', FLOAT, nullable=False),
        sa.Column('bbox_h', FLOAT, nullable=False),
        sa.Column('confidence', FLOAT, nullable=False),
        sa.Column('court_x', FLOAT, nullable=False),
        sa.Column('court_y', FLOAT, nullable=False),
        sa.Column('velocity_x', FLOAT, nullable=True),
        sa.Column('velocity_y', FLOAT, nullable=True),
        sa.Column('speed_mps', FLOAT, nullable=True),
        sa.Column('team_assignment', VARCHAR(10), nullable=True),
        sa.Column('jersey_number', INTEGER, nullable=True),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968CA7110>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_tracks_player', 'track_records', ['player_id'], unique=False)
    op.create_index('ix_tracks_team', 'track_records', ['team_assignment'], unique=False)
    op.create_index('ix_tracks_track_id', 'track_records', ['track_id'], unique=False)
    op.create_index('ix_tracks_video_frame', 'track_records', ['video_recording_id', 'frame_number'], unique=False)
    op.create_table(
        'user_roles',
        sa.Column('user_id', UUID, nullable=False, primary_key=True, sa.ForeignKey('users.id')),
        sa.Column('role_id', UUID, nullable=False, primary_key=True, sa.ForeignKey('roles.id')),
        sa.Column('organization_id', UUID, nullable=True, sa.ForeignKey('organizations.id')),
        sa.Column('created_at', DATETIME, nullable=True, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219689c2060; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.PrimaryKeyConstraint(['user_id', 'role_id'])
    )
    op.create_table(
        'competition_teams',
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x0000021968B685C0>), primary_key=True),
        sa.Column('competition_id', UUID, nullable=False, sa.ForeignKey('competitions.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('group_name', VARCHAR(50), nullable=True),
        sa.Column('seed', INTEGER, nullable=True),
        sa.Column('status', VARCHAR(20), nullable=False, default=ScalarElementColumnDefault('active')),
        sa.Column('joined_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968b61d50; now>, for_update=False)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B68720>)),
        sa.UniqueConstraint(['competition_id', 'team_id'], name='uq_comp_team')
    )
    op.create_index('ix_competition_teams_competition_id', 'competition_teams', ['competition_id'], unique=False)
    op.create_index('ix_competition_teams_team_id', 'competition_teams', ['team_id'], unique=False)
    op.create_table(
        'events',
        sa.Column('match_id', UUID, nullable=False, sa.ForeignKey('matches.id')),
        sa.Column('set_id', UUID, nullable=True, sa.ForeignKey('sets.id')),
        sa.Column('rally_id', UUID, nullable=True, sa.ForeignKey('rallies.id')),
        sa.Column('player_id', UUID, nullable=True, sa.ForeignKey('players.id')),
        sa.Column('team_id', UUID, nullable=False, sa.ForeignKey('teams.id')),
        sa.Column('event_type', VARCHAR(17), nullable=False),
        sa.Column('outcome', VARCHAR(8), nullable=False),
        sa.Column('confidence', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('timestamp_seconds', FLOAT, nullable=False, default=ScalarElementColumnDefault(0.0)),
        sa.Column('frame_number', INTEGER, nullable=True),
        sa.Column('court_position_x', FLOAT, nullable=True),
        sa.Column('court_position_y', FLOAT, nullable=True),
        sa.Column('zone', INTEGER, nullable=True),
        sa.Column('sub_zone', VARCHAR(20), nullable=True),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968B6A4B0>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_events_confidence', 'events', ['confidence'], unique=False)
    op.create_index('ix_events_event_type', 'events', ['event_type'], unique=False)
    op.create_index('ix_events_match_id', 'events', ['match_id'], unique=False)
    op.create_index('ix_events_player_id', 'events', ['player_id'], unique=False)
    op.create_index('ix_events_rally_id', 'events', ['rally_id'], unique=False)
    op.create_index('ix_events_set_id', 'events', ['set_id'], unique=False)
    op.create_index('ix_events_team_id', 'events', ['team_id'], unique=False)
    op.create_index('ix_events_timestamp', 'events', ['match_id', 'timestamp_seconds'], unique=False)
    op.create_table(
        'reports',
        sa.Column('match_id', UUID, nullable=True, sa.ForeignKey('matches.id')),
        sa.Column('competition_id', UUID, nullable=True, sa.ForeignKey('competitions.id')),
        sa.Column('season_id', UUID, nullable=True, sa.ForeignKey('seasons.id')),
        sa.Column('team_id', UUID, nullable=True, sa.ForeignKey('teams.id')),
        sa.Column('player_id', UUID, nullable=True, sa.ForeignKey('players.id')),
        sa.Column('report_type', VARCHAR(18), nullable=False),
        sa.Column('title', VARCHAR(200), nullable=False),
        sa.Column('description', TEXT, nullable=True),
        sa.Column('template_id', VARCHAR(100), nullable=True),
        sa.Column('status', VARCHAR(10), nullable=False, default=ScalarElementColumnDefault(<ReportStatus.DRAFT: 'draft'>)),
        sa.Column('file_path', VARCHAR(500), nullable=True),
        sa.Column('file_format', VARCHAR(20), nullable=True),
        sa.Column('file_size_bytes', INTEGER, nullable=True),
        sa.Column('generated_at', DATETIME, nullable=True),
        sa.Column('generation_time_seconds', FLOAT, nullable=True),
        sa.Column('error_message', TEXT, nullable=True),
        sa.Column('parameters', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968DC01A0>)),
        sa.Column('metadata', JSONB, nullable=False, default=CallableColumnDefault(<function dict at 0x0000021968DC0040>)),
        sa.Column('id', UUID, nullable=False, default=CallableColumnDefault(<function uuid4 at 0x00000219685814E0>), primary_key=True),
        sa.Column('created_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x219674434d0; now>, for_update=False)),
        sa.Column('updated_at', DATETIME, nullable=False, server_default=DefaultClause(<sqlalchemy.sql.functions.now at 0x21968588cd0; now>, for_update=False)),
        sa.Column('created_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('updated_by', UUID, nullable=True, sa.ForeignKey('users.id')),
        sa.Column('is_active', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(True)),
        sa.Column('is_deleted', BOOLEAN, nullable=False, default=ScalarElementColumnDefault(False)),
        sa.Column('deleted_at', DATETIME, nullable=True)
    )
    op.create_index('ix_reports_competition_id', 'reports', ['competition_id'], unique=False)
    op.create_index('ix_reports_match_id', 'reports', ['match_id'], unique=False)
    op.create_index('ix_reports_player_id', 'reports', ['player_id'], unique=False)
    op.create_index('ix_reports_season_id', 'reports', ['season_id'], unique=False)
    op.create_index('ix_reports_status', 'reports', ['status'], unique=False)
    op.create_index('ix_reports_team_id', 'reports', ['team_id'], unique=False)
    op.create_index('ix_reports_type', 'reports', ['report_type'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_reports_type', table_name='reports')
    op.drop_index('ix_reports_team_id', table_name='reports')
    op.drop_index('ix_reports_status', table_name='reports')
    op.drop_index('ix_reports_season_id', table_name='reports')
    op.drop_index('ix_reports_player_id', table_name='reports')
    op.drop_index('ix_reports_match_id', table_name='reports')
    op.drop_index('ix_reports_competition_id', table_name='reports')
    op.drop_table('reports')
    op.drop_index('ix_events_timestamp', table_name='events')
    op.drop_index('ix_events_team_id', table_name='events')
    op.drop_index('ix_events_set_id', table_name='events')
    op.drop_index('ix_events_rally_id', table_name='events')
    op.drop_index('ix_events_player_id', table_name='events')
    op.drop_index('ix_events_match_id', table_name='events')
    op.drop_index('ix_events_event_type', table_name='events')
    op.drop_index('ix_events_confidence', table_name='events')
    op.drop_table('events')
    op.drop_index('ix_competition_teams_team_id', table_name='competition_teams')
    op.drop_index('ix_competition_teams_competition_id', table_name='competition_teams')
    op.drop_table('competition_teams')
    op.drop_table('user_roles')
    op.drop_index('ix_tracks_video_frame', table_name='track_records')
    op.drop_index('ix_tracks_track_id', table_name='track_records')
    op.drop_index('ix_tracks_team', table_name='track_records')
    op.drop_index('ix_tracks_player', table_name='track_records')
    op.drop_table('track_records')
    op.drop_index('ix_tss_team_season', table_name='team_season_statistics')
    op.drop_index('ix_tss_standing', table_name='team_season_statistics')
    op.drop_table('team_season_statistics')
    op.drop_index('ix_tms_team_match', table_name='team_match_statistics')
    op.drop_index('ix_tms_match', table_name='team_match_statistics')
    op.drop_table('team_match_statistics')
    op.drop_table('role_permissions')
    op.drop_index('ix_rallies_set_id', table_name='rallies')
    op.drop_index('ix_rallies_rally_number', table_name='rallies')
    op.drop_index('ix_rallies_match_id', table_name='rallies')
    op.drop_table('rallies')
    op.drop_index('ix_poses_video_frame', table_name='pose_records')
    op.drop_index('ix_poses_player_frame', table_name='pose_records')
    op.drop_index('ix_poses_action', table_name='pose_records')
    op.drop_table('pose_records')
    op.drop_index('ix_pss_team_season', table_name='player_season_statistics')
    op.drop_index('ix_pss_rating', table_name='player_season_statistics')
    op.drop_index('ix_pss_player_season', table_name='player_season_statistics')
    op.drop_table('player_season_statistics')
    op.drop_index('ix_pms_set', table_name='player_match_statistics')
    op.drop_index('ix_pms_player_match', table_name='player_match_statistics')
    op.drop_index('ix_pms_match', table_name='player_match_statistics')
    op.drop_table('player_match_statistics')
    op.drop_index('ix_match_officials_official_id', table_name='match_officials')
    op.drop_index('ix_match_officials_match_id', table_name='match_officials')
    op.drop_table('match_officials')
    op.drop_index('ix_lineups_team_id', table_name='lineups')
    op.drop_index('ix_lineups_set_id', table_name='lineups')
    op.drop_index('ix_lineups_player_id', table_name='lineups')
    op.drop_index('ix_lineups_match_id', table_name='lineups')
    op.drop_table('lineups')
    op.drop_index('ix_competitions_type', table_name='competitions')
    op.drop_index('ix_competitions_status', table_name='competitions')
    op.drop_index('ix_competitions_season_id', table_name='competitions')
    op.drop_index('ix_competitions_organization_id', table_name='competitions')
    op.drop_table('competitions')
    op.drop_index('ix_cameras_venue_id', table_name='cameras')
    op.drop_index('ix_cameras_organization_id', table_name='cameras')
    op.drop_index('ix_cameras_court_id', table_name='cameras')
    op.drop_index('ix_cameras_active', table_name='cameras')
    op.drop_table('cameras')
    op.drop_index('ix_sets_number', table_name='sets')
    op.drop_index('ix_sets_match_id', table_name='sets')
    op.drop_table('sets')
    op.drop_index('ix_seasons_status', table_name='seasons')
    op.drop_index('ix_seasons_organization_id', table_name='seasons')
    op.drop_index('ix_seasons_dates', table_name='seasons')
    op.drop_table('seasons')
    op.drop_index('ix_roles_organization_id', table_name='roles')
    op.drop_index('ix_roles_name', table_name='roles')
    op.drop_table('roles')
    op.drop_index('ix_players_user_id', table_name='players')
    op.drop_index('ix_players_team_id', table_name='players')
    op.drop_index('ix_players_position', table_name='players')
    op.drop_index('ix_players_active', table_name='players')
    op.drop_table('players')
    op.drop_index('ix_officials_user_id', table_name='officials')
    op.drop_index('ix_officials_role', table_name='officials')
    op.drop_index('ix_officials_organization_id', table_name='officials')
    op.drop_table('officials')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_index('ix_notifications_type', table_name='notifications')
    op.drop_index('ix_notifications_reference', table_name='notifications')
    op.drop_index('ix_notifications_org_id', table_name='notifications')
    op.drop_index('ix_notifications_is_read', table_name='notifications')
    op.drop_index('ix_notifications_created_at', table_name='notifications')
    op.drop_table('notifications')
    op.drop_index('ix_courts_venue_id', table_name='courts')
    op.drop_table('courts')
    op.drop_index('ix_coaches_user_id', table_name='coaches')
    op.drop_index('ix_coaches_team_id', table_name='coaches')
    op.drop_index('ix_coaches_role', table_name='coaches')
    op.drop_table('coaches')
    op.drop_index('ix_audit_user_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_resource', table_name='audit_logs')
    op.drop_index('ix_audit_org_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_logs_user_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_timestamp', table_name='audit_logs')
    op.drop_index('ix_audit_logs_resource_type', table_name='audit_logs')
    op.drop_index('ix_audit_logs_resource_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_organization_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_action', table_name='audit_logs')
    op.drop_index('ix_audit_action_timestamp', table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index('ix_ai_video_id', table_name='ai_inferences')
    op.drop_index('ix_ai_verified', table_name='ai_inferences')
    op.drop_index('ix_ai_timestamp', table_name='ai_inferences')
    op.drop_index('ix_ai_model_type', table_name='ai_inferences')
    op.drop_index('ix_ai_frame', table_name='ai_inferences')
    op.drop_table('ai_inferences')
    op.drop_index('ix_videos_uploaded_by', table_name='video_recordings')
    op.drop_index('ix_videos_status', table_name='video_recordings')
    op.drop_index('ix_videos_start_time', table_name='video_recordings')
    op.drop_index('ix_videos_match_id', table_name='video_recordings')
    op.drop_index('ix_videos_camera_id', table_name='video_recordings')
    op.drop_table('video_recordings')
    op.drop_index('ix_venues_organization_id', table_name='venues')
    op.drop_index('ix_venues_name', table_name='venues')
    op.drop_index('ix_venues_city_country', table_name='venues')
    op.drop_table('venues')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_team_id', table_name='users')
    op.drop_index('ix_users_status', table_name='users')
    op.drop_index('ix_users_organization_id', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
    op.drop_index('ix_teams_organization_id', table_name='teams')
    op.drop_index('ix_teams_name', table_name='teams')
    op.drop_index('ix_teams_gender_age', table_name='teams')
    op.drop_table('teams')
    op.drop_index('ix_permissions_resource', table_name='permissions')
    op.drop_table('permissions')
    op.drop_index('ix_organizations_type', table_name='organizations')
    op.drop_index('ix_organizations_status', table_name='organizations')
    op.drop_index('ix_organizations_name', table_name='organizations')
    op.drop_index('ix_organizations_country', table_name='organizations')
    op.drop_table('organizations')
    op.drop_index('ix_matches_venue_id', table_name='matches')
    op.drop_index('ix_matches_status', table_name='matches')
    op.drop_index('ix_matches_season_id', table_name='matches')
    op.drop_index('ix_matches_processing_status', table_name='matches')
    op.drop_index('ix_matches_match_date', table_name='matches')
    op.drop_index('ix_matches_home_team_id', table_name='matches')
    op.drop_index('ix_matches_competition_id', table_name='matches')
    op.drop_index('ix_matches_away_team_id', table_name='matches')
    op.drop_table('matches')
