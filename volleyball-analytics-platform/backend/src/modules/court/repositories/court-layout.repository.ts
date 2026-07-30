import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CourtLayout, CourtLayoutDocument } from '../schemas/court-layout.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface LayoutSearchFilters {
  query?: string;
  venueId?: string;
  phaseId?: string;
  type?: string;
  status?: string;
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
export class CourtLayoutRepository {
  constructor(
    @InjectModel('CourtLayout') private readonly layoutModel: Model<any>,
  ) {}

  async create(layout: Partial<any>): Promise<any> {
    const doc = new this.layoutModel({
      ...layout,
      _id: new Types.ObjectId(),
      layoutId: `lyt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: layout.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.layoutModel.findById(id).exec();
  }

  async findByLayoutId(layoutId: string) {
    return this.layoutModel.findOne({ layoutId }).exec();
  }

  async findByVenue(venueId: string) {
    return this.layoutModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByPhase(phaseId: string) {
    return this.layoutModel.find({ phaseId: new Types.ObjectId(phaseId) }).exec();
  }

  async update(id: string, update: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.layoutModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.layoutModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: 'archived',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.layoutModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      status: 'draft',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async search(filters: any): Promise<any> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.phaseId) filter.phaseId = new Types.ObjectId(filters.phaseId);
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.layoutModel
        .find(filters)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.layoutModel.countDocuments(filters).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByPhase(phaseId: string) {
    return this.layoutModel.find({ phaseId: new Types.ObjectId(phaseId) }).exec();
  }

  async findByGroup(groupId: string) {
    return this.layoutModel.find({ groupId: new Types.ObjectId(groupId) }).exec();
  }

  async updateStandings(layoutId: string, standings: any[]): Promise<any> {
    return this.layoutModel.findByIdAndUpdate(
      layoutId,
      { standings, updatedAt: new Date() },
      { new: true },
    ).exec();
  }

  async addTeam(layoutId: string, teamData: any): Promise<any> {
    const layout = await this.layoutModel.findById(layoutId);
    if (!layout) return null;

    layout.teams.push({ ...teamData, _id: new Types.ObjectId() });
    layout.updatedAt = new Date();
    return layout.save();
  }

  async removeTeam(layoutId: string, teamId: string): Promise<boolean> {
    const result = await this.layoutModel.updateOne(
      { _id: new Types.ObjectId(layoutId) },
      { $pull: { teams: { _id: new Types.ObjectId(teamId) } }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async addMatch(layoutId: string, matchData: any): Promise<any> {
    const layout = await this.layoutModel.findById(layoutId);
    if (!layout) return null;

    layout.matches.push({ ...matchData, _id: new Types.ObjectId() });
    layout.updatedAt = new Date();
    return layout.save();
  }

  async updateMatch(layoutId: string, matchId: string, update: any): Promise<boolean> {
    const result = await this.layoutModel.updateOne(
      { _id: new Types.ObjectId(layoutId), 'matches._id': new Types.ObjectId(matchId) },
      { $set: { 'matches.$': { ...update, _id: new Types.ObjectId(matchId) }, updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async updateStanding(layoutId: string, teamId: string, standing: any): Promise<boolean> {
    const layout = await this.layoutModel.findById(layoutId);
    if (!layout) return false;

    const standingIndex = layout.standings.findIndex(s => s.teamId.toString() === teamId);
    if (standingIndex === -1) return false;

    layout.standings[standingIndex] = { ...layout.standings[standingIndex], ...standing };
    layout.updatedAt = new Date();
    await layout.save();
    return true;
  }

  async getStandings(layoutId: string): Promise<any[]> {
    const layout = await this.layoutModel.findById(layoutId);
    return layout?.standings || [];
  }

  async getMatches(layoutId: string): Promise<any[]> {
    const layout = await this.layoutModel.findById(layoutId);
    return layout?.matches || [];
  }

  async getTeams(layoutId: string): Promise<any[]> {
    const layout = await this.layoutModel.findById(layoutId);
    return layout?.teams || [];
  }

  async validateHierarchy(layoutId: string, parentId?: string): Promise<boolean> {
    if (!parentId) return true;
    const parent = await this.layoutModel.findById(parentId);
    return !!parent;
  }

  async getHierarchyTree(layoutId: string): Promise<any> {
    const layout = await this.layoutModel.findById(layoutId);
    if (!layout) return null;

    return {
      layout,
      phases: await this.layoutModel.find({ parentId: layout._id }).exec(),
    };
  }
}