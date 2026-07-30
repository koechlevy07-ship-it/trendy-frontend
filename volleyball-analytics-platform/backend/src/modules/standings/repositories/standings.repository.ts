/**
 * Standings Repository - Chapter 12 Part 2
 * 
 * Repository for Standings collection with all required persistence operations.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Standings, StandingsDocument, StandingType, StandingEntry } from '../schemas/standings.schema';

export interface StandingsSearchFilters {
  competitionId?: string;
  seasonId?: string;
  phaseId?: string;
  groupId?: string;
  type?: StandingType;
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class StandingsRepository {
  constructor(
    @InjectModel('Standings') private readonly standingsModel: Model<any>,
  ) {}

  async create(standings: Partial<any>): Promise<any> {
    const created = new this.standingsModel({
      ...standings,
      _id: new Types.ObjectId(),
      standingsId: `std_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entries: [],
      tiebreakRules: [],
      isFinal: false,
      audit: { version: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async findById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.standingsModel.findById(id).exec();
  }

  async findByStandingsId(standingsId: string): Promise<any | null> {
    return this.standingsModel.findOne({ standingsId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.standingsModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async findByCompetition(competitionId: string, type?: string): Promise<any[]> {
    const query: any = { competitionId: new Types.ObjectId(competitionId) };
    if (type) query.type = type;
    return this.standingsModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByPhase(phaseId: string): Promise<any[]> {
    return this.standingsModel
      .find({ phaseId: new Types.ObjectId(phaseId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByGroup(groupId: string): Promise<any[]> {
    return this.standingsModel
      .find({ groupId: new Types.ObjectId(groupId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySeason(seasonId: string): Promise<any[]> {
    return this.standingsModel
      .find({ seasonId: new Types.ObjectId(seasonId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(filters: any): Promise<any> {
    const query: any = {};

    if (filters.competitionId) query.competitionId = new Types.ObjectId(filters.competitionId);
    if (filters.seasonId) query.seasonId = new Types.ObjectId(filters.seasonId);
    if (filters.phaseId) query.phaseId = new Types.ObjectId(filters.phaseId);
    if (filters.groupId) query.groupId = new Types.ObjectId(filters.groupId);
    if (filters.type) query.type = filters.type;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;

    const [data, total] = await Promise.all([
      this.standingsModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.perPage)
        .limit(filters.perPage)
        .exec(),
      this.standingsModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async updateEntries(
    standingsId: string,
    entries: any[],
    updatedBy: string,
  ): Promise<any | null> {
    return this.standingsModel.findByIdAndUpdate(
      standingsId,
      {
        entries,
        lastUpdated: new Date(),
        'audit.updatedBy': new Types.ObjectId(updatedBy),
        $inc: { 'audit.version': 1 },
      },
      { new: true },
    ).exec();
  }

  async addEntry(standingsId: string, entry: any): Promise<any | null> {
    return this.standingsModel.findByIdAndUpdate(
      standingsId,
      {
        $push: { entries: entry },
        $inc: { 'audit.version': 1 },
        $set: { lastUpdated: new Date() },
      },
      { new: true },
    ).exec();
  }

  async removeEntry(standingsId: string, entryIndex: number): Promise<any | null> {
    const standings = await this.standingsModel.findById(standingsId);
    if (!standings || entryIndex >= standings.entries.length) return null;

    standings.entries.splice(entryIndex, 1);
    standings.lastUpdated = new Date();
    standings.audit.version += 1;
    return standings.save();
  }

  async updateTiebreakRules(standingsId: string, rules: any[]): Promise<any | null> {
    return this.standingsModel.findByIdAndUpdate(
      standingsId,
      { tiebreakRules: rules, updatedAt: new Date(), $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();
  }

  async finalizeStandings(standingsId: string, finalizedBy: string): Promise<any | null> {
    return this.standingsModel.findByIdAndUpdate(
      standingsId,
      {
        isFinal: true,
        lastUpdated: new Date(),
        'audit.updatedBy': new Types.ObjectId(finalizedBy),
        $inc: { 'audit.version': 1 },
      },
      { new: true },
    ).exec();
  }

  async recalculateStandings(standingsId: string): Promise<any | null> {
    const standings = await this.standingsModel.findById(standingsId);
    if (!standings) return null;

    // Sort entries by position criteria
    standings.entries.sort((a, b) => {
      // Primary: points
      if (b.points !== a.points) return b.points - a.points;
      // Secondary: set ratio
      if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;
      // Tertiary: point ratio
      if (b.pointRatio !== a.pointRatio) return b.pointRatio - a.pointRatio;
      // Quaternary: head-to-head (simplified)
      return 0;
    });

    // Update positions
    standings.entries.forEach((entry, index) => {
      entry.position = index + 1;
    });

    standings.lastUpdated = new Date();
    standings.audit.version += 1;
    return standings.save();
  }

  async getQualifiedTeams(standingsId: string, count: number): Promise<any[]> {
    const standings = await this.standingsModel.findById(standingsId);
    if (!standings) return [];

    return standings.entries
      .filter((e: any) => e.qualification && e.qualification.startsWith('Q'))
      .sort((a: any, b: any) => a.position - b.position)
      .slice(0, count);
  }

  async getEliminatedTeams(standingsId: string): Promise<any[]> {
    const standings = await this.standingsModel.findById(standingsId);
    if (!standings) return [];

    return standings.entries
      .filter((e: any) => e.qualification === 'EL')
      .sort((a: any, b: any) => b.position - a.position);
  }
}