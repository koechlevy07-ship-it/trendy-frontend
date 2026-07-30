import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchTimeline, MatchTimelineDocument, TimelinePeriod } from '../schemas/match-event.schema';

@Injectable()
export class TimelineValidator {
  constructor(
    @InjectModel('MatchTimeline') private readonly timelineModel: Model<MatchTimelineDocument>,
    @InjectModel('MatchEvent') private readonly eventModel: Model<any>,
  ) {}

  async validateEventAppend(timelineId: string, entry: any): Promise<void> {
    const timeline = await this.timelineModel.findById(timelineId).exec();
    if (!timeline) {
      throw new NotFoundException(`Timeline with ID ${timelineId} not found`);
    }

    if (timeline.archive?.isArchived) {
      throw new BadRequestException('Cannot append events to archived timeline');
    }

    // Validate entry structure
    if (!entry.eventType || !entry.timestamp || !entry.period || !entry.description) {
      throw new BadRequestException('Entry must have eventType, timestamp, period, and description');
    }

    if (!Object.values(TimelinePeriod).includes(entry.period)) {
      throw new BadRequestException(`Invalid period: ${entry.period}`);
    }

    if (entry.timestamp < 0) {
      throw new BadRequestException('Timestamp cannot be negative');
    }

    // Validate chronological order
    if (timeline.entries.length > 0) {
      const lastEntry = timeline.entries[timeline.entries.length - 1];
      if (entry.timestamp <= lastEntry.timestamp) {
        throw new BadRequestException('Event timestamps must be strictly increasing');
      }
    }
  }

  async validateTimelineCreation(matchId: string): Promise<void> {
    const existing = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (existing) {
      throw new ConflictException('Timeline already exists for this match');
    }
  }
}