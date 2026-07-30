/**
 * Team Repository - Chapter 11 Part 2
 * 
 * Repository for Team collection with all required persistence operations.
 */

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Document } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginationParams, PaginatedResult } from './base.repository';
import {
  Team,
  TeamDocument,
  TeamCategory,
  TeamGender,
  TeamStatus,
  TeamRosterEntry,
  TeamCoachingStaffEntry,
  TeamSeasonRecord,
  TeamBranding,
  TeamAIMetadata,
} from '../schemas/organization.model';

export interface TeamSearchFilters {
  query?: string;
  category?: TeamCategory;
  gender?: TeamGender;
  status?: TeamStatus;
  organizationId?: string;
  leagueId?: string;
  seasonId?: string;
  tenantId: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TeamRegistrationDTO {
  teamId: string;
  organizationId: string;
  teamCode: string;
  teamName: string;
  shortName: string;
  displayName: string;
  category: TeamCategory;
  gender: TeamGender;
  division?: string;
  competitionLevel?: string;
  playingCategory?: string;
  league?: string;
  season?: string;
  headCoach?: string;
  assistantCoaches?: string[];
  teamManager?: string;
  captain?: string;
  viceCaptain?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tenantId: string;
}

@Injectable()
export class TeamRepository extends BaseRepository<TeamDocument> {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
  ) {
    super(teamModel);
  }

  async createIndex(): Promise<void> {
    await this.teamModel.createIndexes();
  }

  async getByTeamId(teamId: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ teamId }).exec();
  }

  async getByOrganization(organizationId: string): Promise<TeamDocument[]> {
    return this.teamModel.find({ organizationId: new Types.ObjectId(organizationId) }).exec();
  }

  async getByLeague(leagueId: string, season: string): Promise<TeamDocument[]> {
    return this.teamModel
      .find({ leagueIds: new Types.ObjectId(leagueId), season })
      .exec();
  }

  async getBySeason(seasonId: string): Promise<TeamDocument[]> {
    return this.teamModel.find({ currentSeasonId: new Types.ObjectId(seasonId) }).exec();
  }

  async findRoster(teamId: string): Promise<TeamRosterEntry[]> {
    const team = await this.teamModel.findOne({ teamId }).exec();
    return team?.activeRoster || [];
  }

  async search(filters: TeamSearchFilters): Promise<TeamDocument[]> {
    const filter: FilterQuery<TeamDocument> = { tenantId: filters.tenantId };

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.category) {
      filter.category = filters.category;
    }
    if (filters.gender) {
      filter.gender = filters.gender;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.organizationId) {
      filter.organizationId = new Types.ObjectId(filters.organizationId);
    }
    if (filters.leagueId) {
      filter.leagueIds = new Types.ObjectId(filters.leagueId);
    }
    if (filters.seasonId) {
      filter.currentSeasonId = new Types.ObjectId(filters.seasonId);
    }

    const { page = 1, perPage = 20 } = filters;
    const skip = (page - 1) * perPage;

    return this.teamModel
      .find(filter)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec();
  }

  async paginate(
    filters: TeamSearchFilters,
  ): Promise<PaginatedResult<TeamDocument>> {
    const filter: FilterQuery<TeamDocument> = { tenantId: filters.tenantId };

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.category) {
      filter.category = filters.category;
    }
    if (filters.gender) {
      filter.gender = filters.gender;
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.organizationId) {
      filter.organizationId = new Types.ObjectId(filters.organizationId);
    }
    if (filters.leagueId) {
      filter.leagueIds = new Types.ObjectId(filters.leagueId);
    }
    if (filters.seasonId) {
      filter.currentSeasonId = new Types.ObjectId(filters.seasonId);
    }

    const { page = 1, perPage = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.teamModel
        .find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .exec(),
      this.teamModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async getById(teamId: string): Promise<TeamDocument | null> {
    return this.teamModel.findOne({ teamId }).exec();
  }

  async archive(id: string, archivedBy: string): Promise<boolean> {
    const result = await this.teamModel
      .findByIdAndUpdate(id, {
        $set: {
          status: TeamStatus.ARCHIVED,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(archivedBy),
          updatedAt: new Date(),
        },
      })
      .exec();
    return !!result;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.teamModel
      .findByIdAndUpdate(id, {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          status: TeamStatus.ACTIVE,
          updatedAt: new Date(),
        },
        $unset: { deletedBy: 1 },
      })
      .exec();
    return !!result;
  }

  async addPlayerToRoster(
    teamId: string,
    player: TeamRosterEntry,
  ): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $addToSet: { activeRoster: player },
          $inc: { version: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async removePlayerFromRoster(
    teamId: string,
    playerId: string,
  ): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $pull: { activeRoster: { playerId: new Types.ObjectId(playerId) } },
          $inc: { version: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async addCoachingStaff(
    teamId: string,
    staff: TeamCoachingStaffEntry,
  ): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $addToSet: { coachingStaff: staff },
          $inc: { version: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async addSeasonRecord(
    teamId: string,
    seasonRecord: TeamSeasonRecord,
  ): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $push: { seasonHistory: seasonRecord },
          $inc: { version: 1 },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async updateBranding(teamId: string, branding: Partial<TeamBranding>): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $set: { branding, updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async updateAIMetadata(
    teamId: string,
    aiMetadata: Partial<TeamAIMetadata>,
  ): Promise<TeamDocument | null> {
    return this.teamModel
      .findOneAndUpdate(
        { teamId },
        {
          $set: { aiMetadata: { ...aiMetadata }, updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async findByJerseyNumber(teamId: string, jerseyNumber: number): Promise<TeamRosterEntry | null> {
    const team = await this.teamModel.findOne({ teamId }).exec();
    if (!team) return null;
    return team.activeRoster.find((p) => p.jerseyNumber === jerseyNumber) || null;
  }

  async findByPosition(teamId: string, position: string): Promise<TeamRosterEntry[]> {
    const team = await this.teamModel.findOne({ teamId }).exec();
    if (!team) return [];
    return team.activeRoster.filter((p) => p.position === position);
  }

  async getStarters(teamId: string): Promise<TeamRosterEntry[]> {
    const team = await this.teamModel.findOne({ teamId }).exec();
    if (!team) return [];
    return team.activeRoster.filter((p) => !p.isLibero && p.isActive);
  }
}