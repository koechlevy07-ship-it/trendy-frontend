/**
 * Match Repository - Chapter 12 Part 2
 * 
 * Repository for Match collection with all required persistence operations.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Match, MatchDocument, MatchStatus, MatchType } from '../schemas/match.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { MatchOfficials, MatchOfficialsDocument, OfficialRole } from '../schemas/match-officials.schema';
import { MatchStatistics, MatchStatisticsDocument, StatisticsStatus } from '../schemas/match-statistics.schema';
import { MatchEvent, MatchEventDocument, MatchEventType } from '../schemas/match-events.schema';
import { MatchTimeline, MatchTimelineDocument } from '../schemas/match-events.schema';
import { MatchSetResult, MatchSetResultDocument, SetStatus } from '../schemas/match-events.schema';
import { MatchLineup, MatchLineupDocument } from '../schemas/match-events.schema';
import { MatchSubstitution, MatchSubstitutionDocument } from '../schemas/match-events.schema';
import { MatchTimeout, MatchTimeoutDocument } from '../schemas/match-events.schema';
import { MatchChallenge, MatchChallengeDocument } from '../schemas/match-events.schema';
import { MatchSanction, MatchSanctionDocument } from '../schemas/match-events.schema';
import { MatchIncident, MatchIncidentDocument } from '../schemas/match-events.schema';

export interface MatchSearchFilters {
  query?: string;
  competitionId?: string;
  seasonId?: string;
  teamId?: string;
  venueId?: string;
  status?: MatchStatus;
  type?: MatchType;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FixtureSearchFilters {
  competitionId?: string;
  stageId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  status?: FixtureStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  perPage?: number;
}

export interface MatchPaginatedResult {
  data: MatchDocument[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class MatchRepository {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>,
    @InjectModel(Fixture.name) private readonly fixtureModel: Model<FixtureDocument>,
    @InjectModel(MatchOfficials.name) private readonly officialsModel: Model<MatchOfficialsDocument>,
    @InjectModel(MatchStatistics.name) private readonly statsModel: Model<MatchStatisticsDocument>,
    @InjectModel(MatchEvent.name) private readonly eventModel: Model<MatchEventDocument>,
    @InjectModel(MatchTimeline.name) private readonly timelineModel: Model<MatchTimelineDocument>,
    @InjectModel(MatchSetResult.name) private readonly setResultModel: Model<MatchSetResultDocument>,
    @InjectModel(MatchLineup.name) private readonly lineupModel: Model<MatchLineupDocument>,
    @InjectModel(MatchSubstitution.name) private readonly substitutionModel: Model<MatchSubstitutionDocument>,
    @InjectModel(MatchTimeout.name) private readonly timeoutModel: Model<MatchTimeoutDocument>,
    @InjectModel(MatchChallenge.name) private readonly challengeModel: Model<MatchChallengeDocument>,
    @InjectModel(MatchSanction.name) private readonly sanctionModel: Model<MatchSanctionDocument>,
  ) {}

  // ============================================================================
  // MATCH CRUD OPERATIONS
  // ============================================================================

  async create(match: Partial<MatchDocument>): Promise<MatchDocument> {
    const created = new this.matchModel({
      ...match,
      _id: new Types.ObjectId(),
      identity: {
        matchId: match.identity?.matchId || `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchCode: match.identity?.matchCode,
        type: match.identity?.type || 'regular',
        round: match.identity?.round || 1,
      },
      status: match.status || MatchStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findById(id: string): Promise<MatchDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.matchModel.findById(id).exec();
  }

  async findByMatchId(matchId: string): Promise<MatchDocument | null> {
    return this.matchModel.findOne({ 'identity.matchId': matchId }).exec();
  }

  async findByMatchCode(matchCode: string): Promise<MatchDocument | null> {
    return this.matchModel.findOne({ 'identity.matchCode': matchCode }).exec();
  }

  async update(id: string, update: UpdateQuery<MatchDocument>): Promise<MatchDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.matchModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.matchModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: MatchStatus.ARCHIVED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.matchModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      status: MatchStatus.SCHEDULED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async search(filters: MatchSearchFilters): Promise<MatchPaginatedResult> {
    const query: FilterQuery<MatchDocument> = {};

    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    if (filters.competitionId) {
      query['competition.competitionId'] = filters.competitionId;
    }

    if (filters.seasonId) {
      query['competition.seasonId'] = new Types.ObjectId(filters.seasonId);
    }

    if (filters.teamId) {
      query.$or = [
        { 'homeTeam.teamId': new Types.ObjectId(filters.teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(filters.teamId) },
      ];
    }

    if (filters.venueId) {
      query['venue.facilityId'] = new Types.ObjectId(filters.venueId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query['identity.type'] = filters.type;
    }

    if (filters.dateFrom || filters.dateTo) {
      query['schedule.scheduledStart'] = {};
      if (filters.dateFrom) query['schedule.scheduledStart'].$gte = filters.dateFrom;
      if (filters.dateTo) query['schedule.scheduledStart'].$lte = filters.dateTo;
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'schedule.scheduledStart';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.matchModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.matchModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async count(filters: MatchSearchFilters): Promise<number> {
    const query: FilterQuery<MatchDocument> = {};
    if (filters.competitionId) query['competition.competitionId'] = filters.competitionId;
    if (filters.seasonId) query['competition.seasonId'] = new Types.ObjectId(filters.seasonId);
    if (filters.teamId) {
      query.$or = [
        { 'homeTeam.teamId': new Types.ObjectId(filters.teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(filters.teamId) },
      ];
    }
    if (filters.status) query.status = filters.status;
    return this.matchModel.countDocuments(query).exec();
  }

  async findByCompetition(competitionId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ 'competition.competitionId': new Types.ObjectId(competitionId) }).exec();
  }

  async findBySeason(seasonId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ 'competition.seasonId': new Types.ObjectId(seasonId) }).exec();
  }

  async findByTeam(teamId: string): Promise<MatchDocument[]> {
    return this.matchModel
      .find({
        $or: [
          { 'homeTeam.teamId': new Types.ObjectId(teamId) },
          { 'awayTeam.teamId': new Types.ObjectId(teamId) },
        ],
      })
      .exec();
  }

  async findByVenue(venueId: string): Promise<MatchDocument[]> {
    return this.matchModel.find({ 'venue.facilityId': new Types.ObjectId(venueId) }).exec();
  }

  async findUpcoming(limit = 10): Promise<MatchDocument[]> {
    return this.matchModel
      .find({
        status: { $in: [MatchStatus.SCHEDULED, MatchStatus.CONFIRMED] },
        'schedule.scheduledStart': { $gte: new Date() },
      })
      .sort({ 'schedule.scheduledStart': 1 })
      .limit(limit)
      .exec();
  }

  async findLive(): Promise<MatchDocument[]> {
    return this.matchModel
      .find({ status: { $in: [MatchStatus.IN_PROGRESS, MatchStatus.WARMUP, MatchStatus.SET_BREAK] } })
      .exec();
  }

  async getStatistics(matchId: string): Promise<any> {
    const match = await this.findById(matchId);
    if (!match) return null;

    const [stats, events, timeline] = await Promise.all([
      this.statsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
      this.eventModel.find({ matchId: new Types.ObjectId(matchId) }).sort({ timestamp: 1 }).exec(),
      this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
    ]);

    return { match, stats, events, timeline };
  }

  // ============================================================================
  // FIXTURE OPERATIONS
  // ============================================================================

  async createFixture(fixture: Partial<FixtureDocument>): Promise<FixtureDocument> {
    const created = new this.fixtureModel({
      ...fixture,
      _id: new Types.ObjectId(),
      fixtureId: `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: fixture.status || FixtureStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findFixtureById(id: string): Promise<FixtureDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel.findById(id).exec();
  }

  async findFixtures(filters: FixtureSearchFilters): Promise<FixtureDocument[]> {
    const query: FilterQuery<FixtureDocument> = {};

    if (filters.competitionId) query.competitionId = new Types.ObjectId(filters.competitionId);
    if (filters.stageId) query.stageId = new Types.ObjectId(filters.stageId);
    if (filters.homeTeamId) query.homeTeamId = new Types.ObjectId(filters.homeTeamId);
    if (filters.awayTeamId) query.awayTeamId = new Types.ObjectId(filters.awayTeamId);
    if (filters.status) query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      query.scheduledDate = {};
      if (filters.dateFrom) query.scheduledDate.$gte = filters.dateFrom;
      if (filters.dateTo) query.scheduledDate.$lte = filters.dateTo;
    }

    return this.fixtureModel.find(query).sort({ scheduledDate: 1 }).exec();
  }

  async updateFixture(id: string, update: UpdateQuery<FixtureDocument>): Promise<FixtureDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async bulkCreateFixtures(fixtures: Partial<FixtureDocument>[]): Promise<FixtureDocument[]> {
    const docs = fixtures.map(f => ({
      ...f,
      _id: new Types.ObjectId(),
      fixtureId: `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: f.status || FixtureStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return this.fixtureModel.insertMany(docs);
  }

  // ============================================================================
  // MATCH OFFICIALS
  // ============================================================================

  async createOfficialsAssignment(assignment: Partial<MatchOfficialsDocument>): Promise<MatchOfficialsDocument> {
    const created = new this.officialsModel({
      ...assignment,
      _id: new Types.ObjectId(),
      assignmentId: `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findOfficialsByMatch(matchId: string): Promise<MatchOfficialsDocument | null> {
    return this.officialsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
  }

  async updateOfficialsAssignment(matchId: string, update: UpdateQuery<MatchOfficialsDocument>): Promise<MatchOfficialsDocument | null> {
    return this.officialsModel
      .findOneAndUpdate({ matchId: new Types.ObjectId(matchId) }, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async confirmOfficialAssignment(matchId: string, role: string, officialId: string, confirmedBy: string): Promise<MatchOfficialsDocument | null> {
    return this.officialsModel.findOneAndUpdate(
      { matchId: new Types.ObjectId(matchId), 'assignments.role': role },
      {
        $set: {
          'assignments.$.status': 'confirmed',
          'assignments.$.confirmedAt': new Date(),
          'assignments.$.confirmedBy': new Types.ObjectId(confirmedBy),
        },
      },
      { new: true },
    ).exec();
  }

  // ============================================================================
  // MATCH STATISTICS
  // ============================================================================

  async createStatistics(stats: Partial<MatchStatisticsDocument>): Promise<MatchStatisticsDocument> {
    const created = new this.statsModel({
      ...stats,
      _id: new Types.ObjectId(),
      statisticsId: `stats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: stats.status || StatisticsStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findStatisticsByMatch(matchId: string): Promise<MatchStatisticsDocument | null> {
    return this.statsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
  }

  async updateStatistics(matchId: string, update: UpdateQuery<MatchStatisticsDocument>): Promise<MatchStatisticsDocument | null> {
    return this.statsModel
      .findOneAndUpdate({ matchId: new Types.ObjectId(matchId) }, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async finalizeStatistics(matchId: string, finalizedBy: string): Promise<MatchStatisticsDocument | null> {
    return this.statsModel.findOneAndUpdate(
      { matchId: new Types.ObjectId(matchId) },
      { status: StatisticsStatus.FINALIZED, 'audit.finalizedBy': new Types.ObjectId(finalizedBy), 'audit.finalizedAt': new Date() },
      { new: true },
    ).exec();
  }

  // ============================================================================
  // MATCH EVENTS & TIMELINE
  // ============================================================================

  async createEvent(event: Partial<MatchEventDocument>): Promise<MatchEventDocument> {
    const created = new this.eventModel({
      ...event,
      _id: new Types.ObjectId(),
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    });
    return created.save();
  }

  async bulkCreateEvents(events: Partial<MatchEventDocument>[]): Promise<MatchEventDocument[]> {
    const docs = events.map(e => ({
      ...e,
      _id: new Types.ObjectId(),
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }));
    return this.eventModel.insertMany(docs);
  }

  async findEventsByMatch(matchId: string): Promise<MatchEventDocument[]> {
    return this.eventModel.find({ matchId: new Types.ObjectId(matchId) }).sort({ timestamp: 1 }).exec();
  }

  async findEventsByType(matchId: string, type: string): Promise<MatchEventDocument[]> {
    return this.eventModel
      .find({ matchId: new Types.ObjectId(matchId), type })
      .sort({ timestamp: 1 })
      .exec();
  }

  async findEventsByPlayer(matchId: string, playerId: string): Promise<MatchEventDocument[]> {
    return this.eventModel
      .find({ matchId: new Types.ObjectId(matchId), playerId: new Types.ObjectId(playerId) })
      .sort({ timestamp: 1 })
      .exec();
  }

  async findEventsByType(matchId: string, type: string): Promise<MatchEventDocument[]> {
    return this.eventModel
      .find({ matchId: new Types.ObjectId(matchId), type })
      .sort({ timestamp: 1 })
      .exec();
  }

  async getOrCreateTimeline(matchId: string): Promise<MatchTimelineDocument> {
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
    return timeline;
  }

  async addTimelineEntry(matchId: string, entry: any): Promise<MatchTimelineDocument> {
    const timeline = await this.getOrCreateTimeline(matchId);
    timeline.entries.push({
      ...entry,
      id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recordedAt: new Date(),
    });
    return timeline.save();
  }

  // ============================================================================
  // SET RESULTS
  // ============================================================================

  async createSetResult(setResult: Partial<MatchSetResultDocument>): Promise<MatchSetResultDocument> {
    const created = new this.setResultModel({
      ...setResult,
      _id: new Types.ObjectId(),
      setResultId: `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: setResult.status || SetStatus.NOT_STARTED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findSetResultsByMatch(matchId: string): Promise<MatchSetResultDocument[]> {
    return this.setResultModel
      .find({ matchId: new Types.ObjectId(matchId) })
      .sort({ setNumber: 1 })
      .exec();
  }

  async updateSetResult(matchId: string, setNumber: number, update: UpdateQuery<MatchSetResultDocument>): Promise<MatchSetResultDocument | null> {
    return this.setResultModel
      .findOneAndUpdate(
        { matchId: new Types.ObjectId(matchId), setNumber },
        { ...update, updatedAt: new Date() },
        { new: true },
      )
      .exec();
  }

  // ============================================================================
  // MATCH LINEUPS
  // ============================================================================

  async createLineup(lineup: Partial<MatchLineupDocument>): Promise<MatchLineupDocument> {
    const created = new this.lineupModel({
      ...lineup,
      _id: new Types.ObjectId(),
      lineupId: `lu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findLineupByMatchTeamSet(matchId: string, teamId: string, setNumber: number): Promise<MatchLineupDocument | null> {
    return this.lineupModel
      .findOne({
        matchId: new Types.ObjectId(matchId),
        teamId: new Types.ObjectId(teamId),
        setNumber,
      })
      .exec();
  }

  async findLineupsByMatch(matchId: string): Promise<MatchLineupDocument[]> {
    return this.lineupModel
      .find({ matchId: new Types.ObjectId(matchId) })
      .sort({ setNumber: 1, teamId: 1 })
      .exec();
  }

  // ============================================================================
  // MATCH SUBSTITUTIONS
  // ============================================================================

  async createSubstitution(sub: Partial<MatchSubstitutionDocument>): Promise<MatchSubstitutionDocument> {
    const created = new this.substitutionModel({
      ...sub,
      _id: new Types.ObjectId(),
      substitutionId: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findSubstitutionsByMatch(matchId: string): Promise<MatchSubstitutionDocument[]> {
    return this.substitutionModel
      .find({ matchId: new Types.ObjectId(matchId) })
      .sort({ setNumber: 1, timestamp: 1 })
      .exec();
  }

  // ============================================================================
  // MATCH TIMEOUTS
  // ============================================================================

  async createTimeout(timeout: Partial<MatchTimeoutDocument>): Promise<MatchTimeoutDocument> {
    const created = new this.timeoutModel({
      ...timeout,
      _id: new Types.ObjectId(),
      timeoutId: `to_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findTimeoutsByMatch(matchId: string): Promise<MatchTimeoutDocument[]> {
    return this.timeoutModel
      .find({ matchId: new Types.ObjectId(matchId) })
      .sort({ setNumber: 1, timestamp: 1 })
      .exec();
  }

  // ============================================================================
  // MATCH CHALLENGES
  // ============================================================================

  async createChallenge(challenge: Partial<any>): Promise<any> {
    const created = new this.challengeModel({
      ...challenge,
      _id: new Types.ObjectId(),
      challengeId: `chl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      result: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findChallengesByMatch(matchId: string): Promise<any[]> {
    return this.challengeModel.find({ matchId: new Types.ObjectId(matchId) }).sort({ timestamp: 1 }).exec();
  }

  async updateChallengeResult(challengeId: string, result: string, reviewedBy: string): Promise<any | null> {
    return this.challengeModel
      .findOneAndUpdate(
        { challengeId },
        { result, 'audit.reviewedBy': new Types.ObjectId(reviewedBy), 'audit.reviewedAt': new Date() },
        { new: true },
      )
      .exec();
  }

  // ============================================================================
  // MATCH SANCTIONS
  // ============================================================================

  async createSanction(sanction: Partial<any>): Promise<any> {
    const created = new this.sanctionModel({
      ...sanction,
      _id: new Types.ObjectId(),
      sanctionId: `san_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findSanctionsByMatch(matchId: string): Promise<any[]> {
    return this.sanctionModel.find({ matchId: new Types.ObjectId(matchId) }).sort({ timestamp: 1 }).exec();
  }
}