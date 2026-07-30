/**
 * Season Repository - Chapter 12 Part 2
 * 
 * Repository for Season collection with all required persistence operations.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Season, SeasonDocument, SeasonStatus } from '../schemas/season.schema';

export interface SeasonSearchFilters {
  query?: string;
  status?: SeasonStatus;
  year?: number;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class SeasonRepository {
  constructor(
    @InjectModel(Season.name) private readonly seasonModel: Model<SeasonDocument>,
  ) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async create(season: Partial<SeasonDocument>): Promise<SeasonDocument> {
    const created = new this.seasonModel({
      ...season,
      _id: new Types.ObjectId(),
      seasonId: season.seasonId || `season_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: season.status || SeasonStatus.UPCOMING,
      competitionIds: [],
      statistics: {
        totalCompetitions: 0,
        totalMatches: 0,
        totalTeams: 0,
        totalPlayers: 0,
        totalGoals: 0,
        averageAttendance: 0,
      },
      metadata: {
        sponsors: [],
        broadcastPartners: [],
        customFields: {},
      },
      audit: { version: 0 },
      archive: { isArchived: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findById(id: string): Promise<SeasonDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.seasonModel.findById(id).exec();
  }

  async findBySeasonId(seasonId: string): Promise<SeasonDocument | null> {
    return this.seasonModel.findOne({ seasonId }).exec();
  }

  async findByCode(code: string): Promise<SeasonDocument | null> {
    return this.seasonModel.findOne({ code }).exec();
  }

  async findByYear(year: number): Promise<SeasonDocument | null> {
    return this.seasonModel.findOne({ year }).exec();
  }

  async update(id: string, update: UpdateQuery<SeasonDocument>): Promise<SeasonDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    // Check if archived
    const season = await this.seasonModel.findById(id).exec();
    if (season?.archive?.isArchived && !this.isArchival(update)) {
      throw new Error('Archived seasons cannot be modified');
    }
    return this.seasonModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  private isArchival(update: any): boolean {
    return update && update.$set && update.$set['archive.isArchived'] === true;
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.seasonModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: SeasonStatus.ARCHIVED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<SeasonDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.seasonModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: SeasonStatus.UPCOMING,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: SeasonSearchFilters): Promise<PaginatedResult<SeasonDocument>> {
    const query: FilterQuery<SeasonDocument> = {};

    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    if (filters.status) query.status = filters.status;
    if (filters.year) query.year = filters.year;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'year';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.seasonModel
        .find(query)
        .sort({ [filters.sortBy || 'year']: filters.sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.seasonModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findAll(): Promise<SeasonDocument[]> {
    return this.seasonModel.find().sort({ year: -1 }).exec();
  }

  async findActive(): Promise<SeasonDocument[]> {
    return this.seasonModel
      .find({ status: { $in: [SeasonStatus.ACTIVE, SeasonStatus.IN_PROGRESS] } })
      .sort({ year: -1 })
      .exec();
  }

  async findUpcoming(): Promise<SeasonDocument[]> {
    return this.seasonModel
      .find({ status: { $in: [SeasonStatus.UPCOMING, SeasonStatus.REGISTRATION_OPEN, SeasonStatus.REGISTRATION_CLOSED] } })
      .sort({ year: 1 })
      .exec();
  }

  async findCompleted(): Promise<SeasonDocument[]> {
    return this.seasonModel
      .find({ status: { $in: [SeasonStatus.COMPLETED, SeasonStatus.ARCHIVED] } })
      .sort({ year: -1 })
      .exec();
  }

  async addCompetition(id: string, competitionId: string): Promise<SeasonDocument | null> {
    return this.seasonModel.findByIdAndUpdate(
      id,
      { $addToSet: { competitionIds: new Types.ObjectId(competitionId) }, $inc: { 'statistics.totalCompetitions': 1, version: 1 } },
      { new: true },
    ).exec();
  }

  async removeCompetition(id: string, competitionId: string): Promise<SeasonDocument | null> {
    return this.seasonModel.findByIdAndUpdate(
      id,
      { $pull: { competitionIds: new Types.ObjectId(competitionId) }, $inc: { 'statistics.totalCompetitions': -1, version: 1 } },
      { new: true },
    ).exec();
  }

  async updateStatistics(id: string, stats: Partial<any>): Promise<SeasonDocument | null> {
    return this.seasonModel.findByIdAndUpdate(
      id,
      { $set: { statistics: stats, updatedAt: new Date() }, $inc: { version: 1 } },
      { new: true },
    ).exec();
  }

  async getStatistics(id: string): Promise<any> {
    const season = await this.seasonModel.findById(id).exec();
    if (!season) return null;

    return {
      season: {
        seasonId: season.seasonId,
        name: season.name,
        code: season.code,
        year: season.year,
        status: season.status,
      },
      statistics: season.statistics,
      competitions: season.competitionIds?.length || 0,
      durationDays: season.durationDays,
    };
  }
}