import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchVideoReference, MatchVideoReferenceDocument, VideoSyncStatus } from '../schemas/match-event.schema';

@Injectable()
export class VideoReferenceService {
  constructor(
    @InjectModel('MatchVideoReference') private readonly videoModel: Model<MatchVideoReferenceDocument>,
  ) {}

  async registerVideoReference(matchId: string, videoData: {
    type: 'match' | 'highlight' | 'challenge' | 'analysis';
    streamId: string;
    url: string;
    startTime?: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<MatchVideoReferenceDocument> {
    const videoRef = new this.videoModel({
      _id: new Types.ObjectId(),
      videoReferenceId: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId: new Types.ObjectId(matchId),
      type: videoData.type,
      streamId: videoData.streamId,
      url: videoData.url,
      startTime: videoData.startTime,
      endTime: videoData.endTime,
      duration: videoData.duration,
      metadata: videoData.metadata || {},
      syncStatus: VideoSyncStatus.NOT_SYNCED,
    });

    return videoRef.save();
  }

  async findByMatchId(matchId: string): Promise<MatchVideoReferenceDocument[]> {
    return this.videoModel.find({ matchId: new Types.ObjectId(matchId) }).exec();
  }

  async findById(id: string): Promise<MatchVideoReferenceDocument | null> {
    return this.videoModel.findById(id).exec();
  }

  async updateSyncStatus(id: string, status: VideoSyncStatus, offsetMs?: number): Promise<MatchVideoReferenceDocument | null> {
    const update: any = { syncStatus: status };
    if (offsetMs !== undefined) update.syncOffsetMs = offsetMs;

    return this.videoModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async deleteVideoReference(id: string): Promise<boolean> {
    const result = await this.videoModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getVideoReferencesByType(matchId: string, type: string): Promise<MatchVideoReferenceDocument[]> {
    return this.videoModel.find({
      matchId: new Types.ObjectId(matchId),
      type,
    }).exec();
  }
}