import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CameraCoverageZone, CameraCoverageZoneDocument } from '../schemas/camera-coverage-zone.schema';

export interface CoverageZoneSearchFilters {
  query?: string;
  venueId?: string;
  courtId?: string;
  type?: string;
  quality?: string;
  priority?: string;
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
export class CameraCoverageZoneRepository {
  constructor(
    @InjectModel('CameraCoverageZone') private readonly zoneModel: Model<any>,
  ) {}

  async create(zone: Partial<any>): Promise<any> {
    const doc = new this.zoneModel({
      ...zone,
      _id: new Types.ObjectId(),
      zoneId: `cz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quality: 'no_coverage',
      priority: 'medium',
      cameras: [],
      requirements: {},
      calibration: {},
      analytics: {},
      audit: { version: 0 },
      archive: { isArchived: false },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.zoneModel.findById(id).exec();
  }

  async findByZoneId(zoneId: string) {
    return this.zoneModel.findOne({ zoneId }).exec();
  }

  async findByVenue(venueId: string) {
    return this.zoneModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByCourt(courtId: string) {
    return this.zoneModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.zoneModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.zoneModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.zoneModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async search(filters: any): Promise<any> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);
    if (filters.type) filter.type = filters.type;
    if (filters.quality) filter.quality = filters.quality;
    if (filters.priority) filter.priority = filters.priority;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.zoneModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.zoneModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByVenue(venueId: string) {
    return this.zoneModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByCourt(courtId: string) {
    return this.zoneModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findByType(type: string, venueId?: string) {
    const filter: any = { type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.zoneModel.find(filter).exec();
  }

  async findByQuality(quality: string): Promise<any[]> {
    return this.zoneModel.find({ quality }).exec();
  }

  async findByPriority(priority: string): Promise<any[]> {
    return this.zoneModel.find({ priority }).exec();
  }

  async findWellCoveredZones(venueId: string): Promise<any[]> {
    return this.zoneModel.find({
      venueId: new Types.ObjectId(venueId),
      quality: { $in: ['excellent', 'good'] },
    }).exec();
  }

  async findCriticalZones(venueId: string): Promise<any[]> {
    return this.zoneModel.find({
      venueId: new Types.ObjectId(venueId),
      priority: 'critical',
    }).exec();
  }

  async addCamera(zoneId: string, camera: any): Promise<any> {
    const zone = await this.zoneModel.findById(zoneId);
    if (!zone) return null;

    zone.cameras.push({
      ...camera,
      _id: new Types.ObjectId(),
    });
    zone.updatedAt = new Date();
    return zone.save();
  }

  async removeCamera(zoneId: string, cameraId: string): Promise<boolean> {
    const zone = await this.zoneModel.findById(zoneId);
    if (!zone) return false;

    zone.cameras.pull(cameraId);
    zone.updatedAt = new Date();
    await zone.save();
    return true;
  }

  async updateCamera(zoneId: string, cameraId: string, update: any): Promise<boolean> {
    const zone = await this.zoneModel.findById(zoneId);
    if (!zone) return false;

    const camera = zone.cameras.id(cameraId);
    if (!camera) return false;

    Object.assign(camera, update);
    zone.updatedAt = new Date();
    await zone.save();
    return true;
  }

  async addRequirement(zoneId: string, requirement: any): Promise<any> {
    const zone = await this.zoneModel.findById(zoneId);
    if (!zone) return null;

    zone.requirements = { ...zone.requirements, ...requirement };
    zone.updatedAt = new Date();
    return zone.save();
  }

  async updateCalibration(zoneId: string, calibration: any): Promise<any> {
    const zone = await this.zoneModel.findById(zoneId);
    if (!zone) return null;

    zone.calibration = { ...zone.calibration, ...calibration };
    zone.updatedAt = new Date();
    return zone.save();
  }

  async updateQuality(zoneId: string, quality: string): Promise<boolean> {
    const result = await this.zoneModel.updateOne(
      { _id: new Types.ObjectId(zoneId) },
      { $set: { quality, updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async updatePriority(zoneId: string, priority: string): Promise<boolean> {
    const result = await this.zoneModel.updateOne(
      { _id: new Types.ObjectId(zoneId) },
      { $set: { priority, updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async getCoverageReport(venueId: string): Promise<any> {
    const zones = await this.zoneModel.find({ venueId: new Types.ObjectId(venueId) }).exec();

    const report = {
      totalZones: zones.length,
      byQuality: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        no_coverage: 0,
      },
      byType: {},
      byPriority: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      cameraCount: 0,
      wellCovered: 0,
      poorlyCovered: 0,
    };

    for (const zone of zones) {
      report.byQuality[zone.quality] = (report.byQuality[zone.quality] || 0) + 1;
      report.byType[zone.type] = (report.byType[zone.type] || 0) + 1;
      report.byPriority[zone.priority] = (report.byPriority[zone.priority] || 0) + 1;

      if (zone.quality === 'excellent' || zone.quality === 'good') {
        report.wellCovered++;
      } else if (zone.quality === 'poor' || zone.quality === 'no_coverage') {
        report.poorlyCovered++;
      }

      report.cameraCount += zone.cameras?.length || 0;
    }

    return report;
  }

  async findZonesByCamera(cameraId: string): Promise<any[]> {
    return this.zoneModel.find({ 'cameras.cameraId': cameraId }).exec();
  }

  async addTag(zoneId: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(zoneId)) return false;
    const result = await this.zoneModel.updateOne(
      { _id: new Types.ObjectId(zoneId) },
      { $addToSet: { tags: tag }, $set: { updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async removeTag(zoneId: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(zoneId)) return false;
    const result = await this.zoneModel.updateOne(
      { _id: new Types.ObjectId(zoneId) },
      { $pull: { tags: tag }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }
}