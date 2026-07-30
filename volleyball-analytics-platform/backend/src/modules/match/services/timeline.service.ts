import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchTimeline, MatchTimelineDocument, TimelinePeriod } from '../schemas/match-event.schema';
import { MatchEvent, MatchEventDocument, MatchEventType } from '../schemas/match-event.schema';

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel('MatchTimeline') private readonly timelineModel: Model<MatchTimelineDocument>,
    @InjectModel('MatchEvent') private readonly eventModel: Model<any>,
  ) {}

  async initializeSetTimeline(matchId: string, setNumber: number): Promise<MatchTimelineDocument> {
    let timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    
    if (!timeline) {
      timeline = new this.timelineModel({
        _id: new Types.ObjectId(),
        timelineId: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchId: new Types.ObjectId(matchId),
        entries: [],
        audit: { createdBy: null, version: 0 },
        archive: { isArchived: false },
        metadata: {},
      });
      await timeline.save();
    }

    // Add set start entry
    await this.addEntry(matchId, {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      period: `set_${setNumber}` as TimelinePeriod,
      eventType: 'set_start',
      description: `Set ${setNumber} started`,
    });

    return timeline;
  }

  async addEntry(matchId: string, entry: any): Promise<MatchTimelineDocument> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) {
      throw new NotFoundException(`Timeline for match ${matchId} not found`);
    }

    if (timeline.archive?.isArchived) {
      throw new BadRequestException('Cannot append events to archived timeline');
    }

    const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    timeline.entries.push({
      id: entryId,
      ...entry,
      recordedAt: new Date(),
    });

    await timeline.save();
    return timeline;
  }

  async addBulkEntries(matchId: string, entries: any[]): Promise<MatchTimelineDocument> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) {
      throw new NotFoundException(`Timeline for match ${matchId} not found`);
    }

    if (timeline.archive?.isArchived) {
      throw new BadRequestException('Cannot append events to archived timeline');
    }

    for (const entry of entries) {
      timeline.entries.push({
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...entry,
        recordedAt: new Date(),
      });
    }

    await timeline.save();
    return timeline;
  }

  async finalizeTimeline(matchId: string): Promise<MatchTimelineDocument> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) {
      throw new NotFoundException(`Timeline for match ${matchId} not found`);
    }

    // Add match end entry
    timeline.entries.push({
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      period: TimelinePeriod.POST_MATCH,
      eventType: 'match_end',
      description: 'Match completed',
      recordedAt: new Date(),
    });

    timeline.archive = {
      isArchived: true,
      archivedAt: new Date(),
    };

    await timeline.save();
    return timeline;
  }

  async getTimeline(matchId: string): Promise<MatchTimelineDocument | null> {
    return this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
  }

  async getEntriesByPeriod(matchId: string, period: TimelinePeriod): Promise<any[]> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return [];
    
    return timeline.entries.filter(e => e.period === period);
  }

  async getEventsByType(matchId: string, eventType: string): Promise<any[]> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return [];
    
    return timeline.entries.filter(e => e.eventType === eventType);
  }

  async getEventsByTeam(matchId: string, teamId: string): Promise<any[]> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return [];
    
    return timeline.entries.filter(e => e.teamId?.toString() === teamId);
  }

  async getEventsByPlayer(matchId: string, playerId: string): Promise<any[]> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return [];
    
    return timeline.entries.filter(e => e.playerId?.toString() === playerId);
  }

  async getEventsByTimeRange(matchId: string, startTime: number, endTime: number): Promise<any[]> {
    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return [];
    
    return timeline.entries.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  async syncWithEvents(matchId: string): Promise<MatchTimelineDocument> {
    // Rebuild timeline from match events
    const matchEvents = await this.eventModel.find({ matchId: new Types.ObjectId(matchId) })
      .sort({ timestamp: 1 })
      .exec();

    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) return null;

    // Clear existing entries and rebuild from events
    timeline.entries = [];

    for (const event of matchEvents) {
      timeline.entries.push({
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: event.timestamp,
        period: this.getPeriodFromSetNumber(event.setNumber),
        eventType: event.type,
        description: this.generateEventDescription(event),
        teamId: event.teamId,
        playerId: event.playerId,
        data: event.metadata,
        recordedAt: event.audit.recordedAt,
      });
    }

    await timeline.save();
    return timeline;
  }

  private getPeriodFromSetNumber(setNumber: number): TimelinePeriod {
    switch (setNumber) {
      case 1: return TimelinePeriod.SET_1;
      case 2: return TimelinePeriod.SET_2;
      case 3: return TimelinePeriod.SET_3;
      case 4: return TimelinePeriod.SET_4;
      case 5: return TimelinePeriod.SET_5;
      default: return TimelinePeriod.POST_MATCH;
    }
  }

  private generateEventDescription(event: any): string {
    const actionMap: Record<string, string> = {
      'point': 'scored a point',
      'serve': 'served',
      'attack': 'attacked',
      'kill': 'scored a kill',
      'attack_error': 'made an attack error',
      'attack_blocked': 'had attack blocked',
      'block': 'made a block',
      'block_point': 'scored a block point',
      'block_error': 'made a block error',
      'dig': 'made a dig',
      'excellent_dig': 'made an excellent dig',
      'reception': 'received',
      'perfect_reception': 'made a perfect reception',
      'reception_error': 'made a reception error',
      'set': 'set',
      'perfect_set': 'made a perfect set',
      'set_error': 'made a set error',
      'ace': 'scored an ace',
      'service_error': 'made a service error',
      'substitution': 'substituted',
      'timeout': 'called timeout',
      'technical_timeout': 'technical timeout',
      'challenge': 'challenged',
      'yellow_card': 'received yellow card',
      'red_card': 'received red card',
      'injury': 'sustained injury',
      'set_start': 'set started',
      'set_end': 'set ended',
      'match_start': 'match started',
      'match_end': 'match ended',
      'rotation': 'rotated',
      'lineup_change': 'lineup changed',
      'libero_replacement': 'libero replaced',
    };

    return actionMap[event.type] || event.type;
  }

  async rebuildTimeline(matchId: string): Promise<MatchTimelineDocument> {
    // Get all events for the match
    const events = await this.eventModel.find({ matchId: new Types.ObjectId(matchId) })
      .sort({ timestamp: 1 })
      .exec();

    const timeline = await this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    if (!timeline) {
      throw new NotFoundException(`Timeline for match ${matchId} not found`);
    }

    // Clear and rebuild
    timeline.entries = [];

    for (const event of events) {
      timeline.entries.push({
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: event.timestamp,
        period: this.getPeriodFromSetNumber(event.setNumber),
        eventType: event.type,
        description: this.generateEventDescription(event),
        teamId: event.teamId,
        playerId: event.playerId,
        data: event.metadata,
        recordedAt: event.audit.recordedAt,
      });
    }

    await timeline.save();
    return timeline;
  }
}