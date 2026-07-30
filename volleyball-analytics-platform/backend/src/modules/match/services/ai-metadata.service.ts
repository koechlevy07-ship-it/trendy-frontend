import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from '../schemas/match.schema';
import { AIMetadata, AIMetadataDocument, VideoSyncStatus } from '../schemas/match.schema';
import { MatchEvent, MatchEventDocument } from '../schemas/match-event.schema';

@Injectable()
export class AIMetadataService {
  constructor(
    @InjectModel('Match') private readonly matchModel: Model<MatchDocument>,
    @InjectModel('MatchEvent') private readonly eventModel: Model<any>,
  ) {}

  async initializeMatchProcessing(matchId: string, config: {
    enabledModules?: string[];
    confidenceThreshold?: number;
    realTimeProcessing?: boolean;
    customConfig?: Record<string, any>;
  }): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    match.aiMetadata = {
      ...match.aiMetadata,
      config: {
        enabledModules: config.enabledModules || [
          'pose_estimation',
          'ball_tracking',
          'event_detection',
          'player_identification',
          'statistics_generation',
        ],
        confidenceThreshold: config.confidenceThreshold || 0.8,
        realTimeProcessing: config.realTimeProcessing !== false,
        customConfig: config.customConfig || {},
      },
      videoSync: match.aiMetadata?.videoSync || {
        status: 'not_synced',
      },
      streams: match.aiMetadata?.streams || [],
      analytics: match.aiMetadata?.analytics || {
        generateHeatmaps: true,
        generateShotCharts: true,
        generatePerformanceMetrics: true,
        trackMomentum: true,
        detectPatterns: true,
      },
    };

    return match.save();
  }

  async syncVideo(matchId: string, videoSyncData: {
    status: 'not_synced' | 'syncing' | 'synced' | 'failed';
    offsetMs?: number;
    syncedAt?: Date;
    syncMethod?: string;
  }): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    match.aiMetadata = {
      ...match.aiMetadata,
      videoSync: {
        status: videoSyncData.status,
        offsetMs: videoSyncData.offsetMs,
        syncedAt: videoSyncData.syncedAt || new Date(),
        syncMethod: videoSyncData.syncMethod,
      },
    };

    return match.save();
  }

  async addStream(matchId: string, stream: {
    streamId: string;
    name: string;
    url: string;
    protocol: string;
    resolution: string;
    fps: number;
    bitrate: number;
    isPrimary: boolean;
  }): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (!match.aiMetadata.streams) {
      match.aiMetadata.streams = [];
    }

    match.aiMetadata.streams.push({
      streamId: stream.streamId,
      name: stream.name,
      url: stream.url,
      protocol: stream.protocol,
      resolution: stream.resolution,
      fps: stream.fps,
      bitrate: stream.bitrate,
      isPrimary: stream.isPrimary,
    });

    return match.save();
  }

  async updateAIConfig(matchId: string, config: {
    enabledModules?: string[];
    confidenceThreshold?: number;
    realTimeProcessing?: boolean;
    customConfig?: Record<string, any>;
  }): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (!match.aiMetadata) match.aiMetadata = { config: {} };

    match.aiMetadata.config = {
      ...match.aiMetadata.config,
      enabledModules: config.enabledModules || match.aiMetadata.config.enabledModules,
      confidenceThreshold: config.confidenceThreshold ?? match.aiMetadata.config.confidenceThreshold,
      realTimeProcessing: config.realTimeProcessing ?? match.aiMetadata.config.realTimeProcessing,
      customConfig: config.customConfig || match.aiMetadata.config.customConfig,
    };

    return match.save();
  }

  async updateAnalyticsConfig(matchId: string, analytics: {
    generateHeatmaps?: boolean;
    generateShotCharts?: boolean;
    generatePerformanceMetrics?: boolean;
    trackMomentum?: boolean;
    detectPatterns?: boolean;
  }): Promise<MatchDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (!match.aiMetadata) match.aiMetadata = { analytics: {} };

    match.aiMetadata.analytics = {
      ...match.aiMetadata.analytics,
      ...analytics,
    };

    return match.save();
  }

  async getAIProcessingStatus(matchId: string): Promise<any> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    return {
      matchId: match.identity.matchId,
      videoSync: match.aiMetadata?.videoSync,
      processing: match.aiMetadata?.config?.realTimeProcessing ? 'active' : 'inactive',
      enabledModules: match.aiMetadata?.config?.enabledModules || [],
      lastProcessed: match.aiMetadata?.videoSync?.syncedAt,
      config: match.aiMetadata?.config,
    };
  }

  async generatePostMatchAnalytics(matchId: string): Promise<any> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // This would typically call external AI services
    // For now, return a structured response that the AI engine would generate
    return {
      matchId: match.identity.matchId,
      heatmaps: {
        attack: {},
        reception: {},
        serve: {},
        block: {},
      },
      shotCharts: {},
      performanceMetrics: {
        homeTeam: {},
        awayTeam: {},
      },
      momentumTracking: {},
      patternDetection: {},
      generatedAt: new Date(),
    };
  }

  async processLiveEvent(matchId: string, eventData: any): Promise<any> {
    // This would process real-time events through AI modules
    // For now, return the processed event
    return {
      processed: true,
      eventId: eventData.eventId,
      processedAt: new Date(),
      aiAnalysis: {
        eventType: eventData.type,
        confidence: 0.95,
        metadata: eventData.metadata,
      },
    };
  }
}