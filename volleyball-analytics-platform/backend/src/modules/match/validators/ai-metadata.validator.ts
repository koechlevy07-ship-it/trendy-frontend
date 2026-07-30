import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchAIMetadata, MatchAIMetadataDocument, VideoSyncStatus } from '../schemas/match-event.schema';

@Injectable()
export class AIMetadataValidator {
  constructor(
    @InjectModel('MatchAIMetadata') private readonly aiMetadataModel: Model<MatchAIMetadataDocument>,
  ) {}

  async validateCreate(matchId: string, dto: any): Promise<void> {
    // Check if AI metadata already exists for this match
    const existing = await this.aiMetadataModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (existing) {
      throw new ConflictException('AI metadata already exists for this match');
    }

    // Validate stream configurations
    if (dto.streams && dto.streams.length > 0) {
      for (const stream of dto.streams) {
        if (!stream.streamId || !stream.name || !stream.url || !stream.protocol) {
          throw new BadRequestException('Stream must have streamId, name, url, and protocol');
        }
        if (!['RTMP', 'HLS', 'WebRTC', 'SRT'].includes(stream.protocol)) {
          throw new BadRequestException(`Invalid stream protocol: ${stream.protocol}`);
        }
        if (stream.fps < 1 || stream.fps > 120) {
          throw new BadRequestException('Stream FPS must be between 1 and 120');
        }
        if (stream.bitrate < 500 || stream.bitrate > 50000) {
          throw new BadRequestException('Stream bitrate must be between 500 and 50000 kbps');
        }
      }
    }

    // Validate AI config
    if (dto.config) {
      if (dto.config.confidenceThreshold < 0 || dto.config.confidenceThreshold > 1) {
        throw new BadRequestException('Confidence threshold must be between 0 and 1');
      }

      const validModules = [
        'pose_estimation',
        'ball_tracking',
        'event_detection',
        'player_identification',
        'statistics_generation',
        'heatmap_generation',
        'pattern_recognition',
        'momentum_tracking',
      ];

      for (const module of dto.config.enabledModules) {
        if (!validModules.includes(module)) {
          throw new BadRequestException(`Invalid AI module: ${module}`);
        }
      }
    }

    // Validate analytics config
    if (dto.analytics) {
      // Valid boolean fields
      if (typeof dto.analytics.generateHeatmaps !== 'boolean') {
        throw new BadRequestException('generateHeatmaps must be boolean');
      }
      if (typeof dto.analytics.generateShotCharts !== 'boolean') {
        throw new BadRequestException('generateShotCharts must be boolean');
      }
    }
  }

  async validateUpdate(matchId: string, dto: any): Promise<void> {
    const existing = await this.aiMetadataModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!existing) {
      throw new NotFoundException('AI metadata not found for this match');
    }

    // Validate video sync status if being updated
    if (dto.videoSync?.status && !Object.values(VideoSyncStatus).includes(dto.videoSync.status)) {
      throw new BadRequestException(`Invalid video sync status: ${dto.videoSync.status}`);
    }

    // Validate streams if being updated
    if (dto.streams) {
      for (const stream of dto.streams) {
        if (!stream.streamId || !stream.name || !stream.url || !stream.protocol) {
          throw new BadRequestException('Stream must have streamId, name, url, and protocol');
        }
        if (!['RTMP', 'HLS', 'WebRTC', 'SRT'].includes(stream.protocol)) {
          throw new BadRequestException(`Invalid stream protocol: ${stream.protocol}`);
        }
      }
    }

    // Validate AI config if being updated
    if (dto.config) {
      if (dto.config.confidenceThreshold < 0 || dto.config.confidenceThreshold > 1) {
        throw new BadRequestException('Confidence threshold must be between 0 and 1');
      }
    }
  }
}