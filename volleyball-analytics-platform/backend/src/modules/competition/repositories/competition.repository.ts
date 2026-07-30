/**
 * Competition Repository - Chapter 12 Part 2
 * 
 * Repository for Competition collection with all required persistence operations.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Competition, CompetitionDocument, CompetitionStatus, CompetitionType, CompetitionFormat } from '../schemas/competition.schema';
import { Fixture, FixtureDocument } from '../schemas/fixture.schema';
import { CompetitionPhase, CompetitionPhaseDocument } from '../schemas/competition-phase.schema';
import { CompetitionGroup, CompetitionGroupDocument } from '../schemas/competition-group.schema';

export interface CompetitionSearchFilters {
  query?: string;
  type?: CompetitionType;
  format?: CompetitionFormat;
  status?: CompetitionStatus;
  seasonId?: string;
  organizerId?: string;
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
export class CompetitionRepository {
  constructor(
    @InjectModel(Competition.name) private readonly competitionModel: Model<CompetitionDocument>,
    @InjectModel(Fixture.name) private readonly fixtureModel: Model<FixtureDocument>,
    @InjectModel(CompetitionPhase.name) private readonly phaseModel: Model<CompetitionPhaseDocument>,
    @InjectModel(CompetitionGroup.name) private readonly groupModel: Model<CompetitionGroupDocument>,
  ) {}

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  async create(competition: Partial<CompetitionDocument>): Promise<CompetitionDocument> {
    const created = new this.competitionModel({
      ...competition,
      _id: new Types.ObjectId(),
      competitionId: competition.competitionId || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: competition.status || 'draft',
      participantIds: [],
      ranking: [],
      prizes: [],
      phaseIds: [],
      groupIds: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findById(id: string): Promise<CompetitionDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.competitionModel.findById(id).exec();
  }

  async findByCompetitionId(competitionId: string): Promise<CompetitionDocument | null> {
    return this.competitionModel.findOne({ competitionId }).exec();
  }

  async findByNameAndSeason(name: string, seasonId: string): Promise<CompetitionDocument | null> {
    return this.competitionModel
      .findOne({ name, seasonId: new Types.ObjectId(seasonId) })
      .exec();
  }

  async findByCode(code: string): Promise<CompetitionDocument | null> {
    return this.competitionModel.findOne({ shortName: code }).exec();
  }

  async update(id: string, update: UpdateQuery<CompetitionDocument>): Promise<CompetitionDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.competitionModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.competitionModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: CompetitionStatus.ARCHIVED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<CompetitionDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.competitionModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: CompetitionStatus.DRAFT,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: CompetitionSearchFilters): Promise<PaginatedResult<CompetitionDocument>> {
    const query: FilterQuery<CompetitionDocument> = {};

    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    if (filters.type) query.type = filters.type;
    if (filters.format) query.format = filters.format;
    if (filters.status) query.status = filters.status;
    if (filters.seasonId) query.seasonId = new Types.ObjectId(filters.seasonId);
    if (filters.organizerId) query.organizerId = new Types.ObjectId(filters.organizerId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.competitionModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.competitionModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findBySeason(seasonId: string): Promise<CompetitionDocument[]> {
    return this.competitionModel
      .find({ seasonId: new Types.ObjectId(seasonId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByOrganizer(organizerId: string): Promise<CompetitionDocument[]> {
    return this.competitionModel
      .find({ organizerId: new Types.ObjectId(organizerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getHierarchy(id: string): Promise<any> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) return null;

    // Fetch phases, groups, and matches for the competition
    const [phases, groups, fixtures] = await Promise.all([
      this.phaseModel.find({ competitionId: new Types.ObjectId(id) }).sort({ order: 1 }).exec(),
      this.groupModel.find({ competitionId: new Types.ObjectId(id) }).sort({ order: 1 }).exec(),
      this.findFixturesByCompetition(competition.competitionId),
    ]);

    return {
      competition,
      phases,
      groups,
      fixtures,
    };
  }

  async getStatistics(id: string): Promise<any> {
    const competition = await this.findById(id);
    if (!competition) return null;

    const [fixtures, phases, groups] = await Promise.all([
      this.fixtureModel.find({ competitionId: competition._id }).exec(),
      this.phaseModel.find({ competitionId: competition._id }).exec(),
      this.groupModel.find({ competitionId: competition._id }).exec(),
    ]);

    const totalMatches = fixtures.length;
    const completedMatches = fixtures.filter(f => f.status === 'completed').length;
    const totalTeams = competition.participantIds?.length || 0;

    return {
      competition: {
        competitionId: competition.competitionId,
        name: competition.name,
        status: competition.status,
        participantCount: totalTeams,
      },
      matches: {
        total: totalMatches,
        completed: completedMatches,
        pending: totalMatches - completedMatches,
        progress: totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0,
      },
      structure: {
        phases: phases.length,
        groups: groups.length,
        rounds: Math.max(...fixtures.map(f => f.roundNumber || 1)),
      },
      schedule: {
        startDate: competition.schedule.startDate,
        endDate: competition.schedule.endDate,
      },
    };
  }

  async findFixturesByCompetition(competitionId: string): Promise<FixtureDocument[]> {
    return this.fixtureModel
      .find({ competitionId: new Types.ObjectId(competitionId) })
      .sort({ scheduledDate: 1, roundNumber: 1 })
      .exec();
  }

  async addParticipant(id: string, teamId: string): Promise<CompetitionDocument | null> {
    return this.competitionModel.findByIdAndUpdate(
      id,
      { $addToSet: { participantIds: new Types.ObjectId(teamId) }, $inc: { version: 1 } },
      { new: true },
    ).exec();
  }

  async removeParticipant(id: string, teamId: string): Promise<CompetitionDocument | null> {
    return this.competitionModel.findByIdAndUpdate(
      id,
      { $pull: { participantIds: new Types.ObjectId(teamId) }, $inc: { version: 1 } },
      { new: true },
    ).exec();
  }

  // ============================================================================
  // FIXTURE OPERATIONS
  // ============================================================================

  async createFixture(fixture: Partial<any>): Promise<any> {
    const created = new this.fixtureModel({
      ...fixture,
      _id: new Types.ObjectId(),
      fixtureId: `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: fixture.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findFixtureById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel.findById(id).exec();
  }

  async updateFixture(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.fixtureModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async bulkCreateFixtures(fixtures: Partial<any>[]): Promise<any[]> {
    const docs = fixtures.map(f => ({
      ...f,
      _id: new Types.ObjectId(),
      fixtureId: `fixture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: f.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return this.fixtureModel.insertMany(docs);
  }

  // ============================================================================
  // PHASE OPERATIONS
  // ============================================================================

  async createPhase(phase: Partial<any>): Promise<any> {
    const created = new this.phaseModel({
      ...phase,
      _id: new Types.ObjectId(),
      phaseId: `phase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: phase.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findPhaseById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.phaseModel.findById(id).exec();
  }

  async findPhasesByCompetition(competitionId: string): Promise<any[]> {
    return this.phaseModel
      .find({ competitionId: new Types.ObjectId(competitionId) })
      .sort({ order: 1 })
      .exec();
  }

  async updatePhase(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.phaseModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  // ============================================================================
  // GROUP OPERATIONS
  // ============================================================================

  async createGroup(group: Partial<any>): Promise<any> {
    const created = new this.groupModel({
      ...group,
      _id: new Types.ObjectId(),
      groupId: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: group.status || 'pending',
      standings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findGroupById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.groupModel.findById(id).exec();
  }

  async findGroupsByPhase(phaseId: string): Promise<any[]> {
    return this.groupModel
      .find({ phaseId: new Types.ObjectId(phaseId) })
      .sort({ order: 1 })
      .exec();
  }

  async updateGroup(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.groupModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async updateGroupStandings(groupId: string, standings: any[]): Promise<any | null> {
    return this.groupModel
      .findByIdAndUpdate(groupId, { standings, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async addTeamToGroup(groupId: string, teamId: string): Promise<any | null> {
    return this.groupModel
      .findByIdAndUpdate(
        groupId,
        { $addToSet: { teamIds: new Types.ObjectId(teamId) }, $inc: { version: 1 } },
        { new: true },
      )
      .exec();
  }
}