/**
 * Fixture Repository - Chapter 12 Part 2
 * 
 * Repository for Fixture collection with all required persistence operations.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Fixture, FixtureDocument, FixtureStatus, FixtureGenerationMethod } from '../schemas/fixture.schema';
import { Match, MatchDocument } from '../schemas/match.schema';

export interface FixtureSearchFilters {
  competitionId?: string;
  stageId?: string;
  groupId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: any[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class FixtureRepository {
  constructor(
    @InjectModel('Fixture') private readonly fixtureModel: Model<any>,
    @InjectModel('Match') private readonly matchModel: Model<any>,
  ) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async create(fixture: Partial<any>): Promise<any> {
    const created = new this.fixtureModel({
      ...fixture,
      _id: new Types.ObjectId(),
      fixtureId: fixture.fixtureId || `fx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: fixture.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel.findById(id).exec();
  }

  async findByFixtureId(fixtureId: string): Promise<any | null> {
    return this.fixtureModel.findOne({ fixtureId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.fixtureModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: 'archived',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: 'scheduled',
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: FixtureSearchFilters): Promise<any> {
    const query: any = {};

    if (filters.competitionId) query.competitionId = new Types.ObjectId(filters.competitionId);
    if (filters.stageId) query.stageId = new Types.ObjectId(filters.stageId);
    if (filters.groupId) query.groupId = new Types.ObjectId(filters.groupId);
    if (filters.homeTeamId) query.homeTeamId = new Types.ObjectId(filters.homeTeamId);
    if (filters.awayTeamId) query.awayTeamId = new Types.ObjectId(filters.awayTeamId);
    if (filters.status) query.status = filters.status;

    if (filters.dateFrom || filters.dateTo) {
      query.scheduledDate = {};
      if (filters.dateFrom) query.scheduledDate.$gte = filters.dateFrom;
      if (filters.dateTo) query.scheduledDate.$lte = filters.dateTo;
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'scheduledDate';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.fixtureModel
        .find(query)
        .sort({ [filters.sortBy || 'scheduledDate']: filters.sortOrder === 'asc' ? 1 : -1 })
        .skip((filters.page - 1) * filters.perPage)
        .limit(filters.perPage)
        .exec(),
      this.fixtureModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByCompetition(competitionId: string): Promise<any[]> {
    return this.fixtureModel
      .find({ competitionId: new Types.ObjectId(competitionId) })
      .sort({ scheduledDate: 1, roundNumber: 1 })
      .exec();
  }

  async findByStage(stageId: string): Promise<any[]> {
    return this.fixtureModel
      .find({ stageId: new Types.ObjectId(stageId) })
      .sort({ roundNumber: 1, matchNumber: 1 })
      .exec();
  }

  async findByGroup(groupId: string): Promise<any[]> {
    return this.fixtureModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .sort({ roundNumber: 1, matchNumber: 1 })
      .exec();
  }

  async findByTeam(teamId: string, competitionId?: string): Promise<any[]> {
    const query: any = {
      $or: [
        { homeTeamId: new Types.ObjectId(teamId) },
        { awayTeamId: new Types.ObjectId(teamId) },
      ],
    };
    if (competitionId) query.competitionId = new Types.ObjectId(competitionId);

    return this.fixtureModel
      .find(query)
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findUpcomingFixtures(days: number = 7): Promise<any[]> {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return this.fixtureModel
      .find({
        scheduledDate: { $gte: new Date(), $lte: end },
        status: { $in: ['scheduled', 'confirmed'] },
      })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findByDateRange(start: Date, end: Date, competitionId?: string): Promise<any[]> {
    const query: any = {
      scheduledDate: { $gte: start, $lte: end },
    };
    if (competitionId) query.competitionId = new Types.ObjectId(competitionId);

    return this.fixtureModel
      .find(query)
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findByVenueAndDate(venueId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.fixtureModel
      .find({
        'venue.facilityId': new Types.ObjectId(venueId),
        scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  async findByRound(competitionId: string, round: string): Promise<any[]> {
    return this.fixtureModel
      .find({ competitionId: new Types.ObjectId(competitionId), round })
      .sort({ matchNumber: 1 })
      .exec();
  }

  // ============================================================================
  // FIXTURE GENERATION & MANAGEMENT
  // ============================================================================

  async generateRoundRobinFixtures(
    competitionId: string,
    seasonId: string,
    teams: any[],
    stageId?: string,
    groupId?: string,
  ): Promise<any[]> {
    const fixtures = [];
    const teamIds = teams.map(t => t._id.toString());

    // Generate all pairings
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        // Home fixture
        fixtures.push({
          competitionId: new Types.ObjectId(competitionId),
          seasonId: new Types.ObjectId(seasonId),
          stageId: stageId ? new Types.ObjectId(stageId) : undefined,
          groupId: groupId ? new Types.ObjectId(groupId) : undefined,
          homeTeamId: new Types.ObjectId(teamIds[i]),
          awayTeamId: new Types.ObjectId(teamIds[j]),
          round: 'round_robin',
          matchNumber: fixtures.length + 1,
          status: 'draft',
          generationMethod: 'round_robin',
        });

        // Away fixture (double round robin)
        fixtures.push({
          competitionId: new Types.ObjectId(competitionId),
          seasonId: new Types.ObjectId(seasonId),
          stageId: stageId ? new Types.ObjectId(stageId) : undefined,
          groupId: groupId ? new Types.ObjectId(groupId) : undefined,
          homeTeamId: new Types.ObjectId(teamIds[j]),
          awayTeamId: new Types.ObjectId(teamIds[i]),
          round: 'round_robin',
          matchNumber: fixtures.length + 1,
          status: 'draft',
          generationMethod: 'round_robin',
        });
      }
    }

    return this.fixtureModel.insertMany(fixtures);
  }

  async generateKnockoutFixtures(
    competitionId: string,
    seasonId: string,
    teams: any[],
    stageId?: string,
    startRound: string = 'round_of_16',
  ): Promise<any[]> {
    const fixtures = [];
    const rounds = ['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final'];
    const startIndex = rounds.indexOf(startRound);

    if (startIndex === -1) throw new Error('Invalid start round');

    let currentTeams = teams;
    let roundNumber = startIndex + 1;

    for (let i = startIndex; i < rounds.length; i++) {
      const roundName = rounds[i];
      const numMatches = currentTeams.length / 2;

      for (let j = 0; j < numMatches; j++) {
        fixtures.push({
          competitionId: new Types.ObjectId(competitionId),
          seasonId: new Types.ObjectId(seasonId),
          stageId: stageId ? new Types.ObjectId(stageId) : undefined,
          homeTeamId: new Types.ObjectId(currentTeams[j * 2]._id.toString()),
          awayTeamId: new Types.ObjectId(currentTeams[j * 2 + 1]._id.toString()),
          round: roundName,
          matchNumber: j + 1,
          roundNumber,
          status: 'draft',
          generationMethod: 'single_elimination',
        });
      }

      // Winners advance (simulated)
      currentTeams = Array(numMatches).fill(null).map((_, i) => ({
        _id: `winner_${roundName}_${i}`,
        fromMatch: `match_${roundNumber}_${i + 1}`,
      }));
      roundNumber++;
    }

    return this.fixtureModel.insertMany(fixtures);
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkCreate(fixtures: Partial<any>[]): Promise<any[]> {
    const docs = fixtures.map(f => ({
      ...f,
      _id: new Types.ObjectId(),
      fixtureId: `fx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: f.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return this.fixtureModel.insertMany(docs);
  }

  async bulkUpdate(updates: { id: string; data: any }[]): Promise<number> {
    let count = 0;
    for (const update of updates) {
      if (!Types.ObjectId.isValid(update.id)) continue;
      const result = await this.fixtureModel
        .findByIdAndUpdate(update.id, { ...update.data, updatedAt: new Date() })
        .exec();
      if (result) count++;
    }
    return count;
  }

  async bulkUpdateStatus(fixtureIds: string[], status: string): Promise<number> {
    if (fixtureIds.length === 0) return 0;

    const objectIds = fixtureIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    if (objectIds.length === 0) return 0;

    const result = await this.fixtureModel
      .updateMany(
        { _id: { $in: objectIds } },
        { $set: { status, updatedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount;
  }

  // ============================================================================
  // STATISTICS & ANALYSIS
  // ============================================================================

  async getFixtureStatistics(competitionId: string): Promise<any> {
    const fixtures = await this.fixtureModel
      .find({ competitionId: new Types.ObjectId(competitionId) })
      .exec();

    const stats = {
      total: fixtures.length,
      byStatus: {} as Record<string, number>,
      byRound: {} as Record<string, number>,
      upcoming: 0,
      completed: 0,
      inProgress: 0,
      postponed: 0,
      cancelled: 0,
    };

    for (const fixture of fixtures) {
      stats.byStatus[fixture.status] = (stats.byStatus[fixture.status] || 0) + 1;
      stats.byRound[fixture.round] = (stats.byRound[fixture.round] || 0) + 1;

      switch (fixture.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'postponed':
          stats.postponed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        default:
          stats.upcoming++;
      }
    }

    return stats;
  }

  async checkVenueAvailability(venueId: string, date: Date, excludeFixtureId?: string): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      'venue.facilityId': new Types.ObjectId(venueId),
      scheduledDate: { $gte: startOfDay, $lte: new Date(endOfDay) },
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    };

    if (excludeFixtureId && Types.ObjectId.isValid(excludeFixtureId)) {
      query._id = { $ne: new Types.ObjectId(excludeFixtureId) };
    }

    const count = await this.fixtureModel.countDocuments(query).exec();
    return count === 0;
  }

  async getTeamSchedule(teamId: string, competitionId?: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const query: any = {
      $or: [
        { homeTeamId: new Types.ObjectId(teamId) },
        { awayTeamId: new Types.ObjectId(teamId) },
      ],
      scheduledDate: { $gte: new Date(), $lte: endDate },
      status: { $in: ['scheduled', 'confirmed'] },
    };

    if (competitionId) {
      query.competitionId = new Types.ObjectId(competitionId);
    }

    return this.fixtureModel
      .find(query)
      .sort({ scheduledDate: 1 })
      .exec();
  }
}