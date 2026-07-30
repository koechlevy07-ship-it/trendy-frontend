import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CourtConfiguration, CourtConfigurationDocument } from '../schemas/court-configuration.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface ConfigSearchFilters {
  query?: string;
  type?: string;
  status?: string;
  competitionId?: string;
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
export class CourtConfigurationRepository {
  constructor(
    @InjectModel('CourtConfiguration') private readonly configModel: Model<any>,
  ) {}

  async create(config: Partial<any>): Promise<any> {
    const doc = new this.configModel({
      ...config,
      _id: new Types.ObjectId(),
      configurationId: `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: config.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.configModel.findById(id).exec();
  }

  async findByConfigId(configId: string) {
    return this.configModel.findOne({ configurationId: configId }).exec();
  }

  async findByCompetition(competitionId: string) {
    return this.configModel.find({ competitionId: new Types.ObjectId(competitionId) }).exec();
  }

  async findByType(type: string): Promise<any[]> {
    return this.configModel.find({ type }).exec();
  }

  async findByStatus(status: string): Promise<any[]> {
    return this.configModel.find({ status }).exec();
  }

  async search(filters: ConfigSearchFilters): Promise<PaginatedResult<any>> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.competitionId) filter.competitionId = new Types.ObjectId(filters.competitionId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.configModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.configModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.configModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.configModel.findByIdAndUpdate(id, {
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
    return this.configModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      status: 'draft',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async activate(id: string): Promise<any | null> {
    return this.configModel.findByIdAndUpdate(
      id,
      { status: 'active', updatedAt: new Date() },
      { new: true },
    ).exec();
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.configModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(archivedBy),
      'archive.archiveReason': reason,
      status: 'archived',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async findByCompetition(competitionId: string): Promise<any[]> {
    return this.configModel.find({ competitionId: new Types.ObjectId(competitionId) }).exec();
  }

  async getByType(type: string): Promise<any[]> {
    return this.configModel.find({ type }).exec();
  }

  async getStatistics(competitionId: string): Promise<any> {
    const configs = await this.configModel.find({ competitionId: new Types.ObjectId(competitionId) }).exec();

    const stats = {
      total: configs.length,
      byType: {},
      byStatus: {},
      activeCount: 0,
      archivedCount: 0,
    };

    for (const config of configs) {
      stats.byType[config.type] = (stats.byType[config.type] || 0) + 1;
      stats.byStatus[config.status] = (stats.byStatus[config.status] || 0) + 1;
      if (config.status === 'active') stats.activeCount++;
      if (config.status === 'archived') stats.archivedCount++;
    }

    return stats;
  }

  async validateConfiguration(competitionId: string): Promise<{ valid: boolean; errors: string[] }> {
    const configs = await this.configModel.find({ competitionId: new Types.ObjectId(competitionId) }).exec();
    const errors: string[] = [];

    if (configs.length === 0) {
      errors.push('No configuration defined for this competition');
      return { valid: false, errors };
    }

    for (const config of configs) {
      if (config.status !== 'active') {
        errors.push(`Configuration ${config.name} is not active`);
      }
      if (!config.dimensions || !config.dimensions.length || !config.dimensions.width) {
        errors.push(`Configuration ${config.name} missing dimensions`);
      }
      if (!config.surface || !config.surface.surfaceType) {
        errors.push(`Configuration ${config.name} missing surface type`);
      }
      if (!config.net || !config.net.height) {
        errors.push(`Configuration ${config.name} missing net configuration`);
      }
      if (!config.equipment || !config.equipment.hasScoreboard) {
        errors.push(`Configuration ${config.name} missing scoreboard`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async cloneConfiguration(configId: string, newName: string, newCompetitionId: string): Promise<any> {
    const original = await this.configModel.findById(configId);
    if (!original) throw new Error('Configuration not found');

    const clone = new this.configModel({
      ...original.toObject(),
      _id: new Types.ObjectId(),
      configurationId: `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      competitionId: new Types.ObjectId(newCompetitionId),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return clone.save();
  }
}