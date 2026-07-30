import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { EnvironmentSensor, EnvironmentSensorDocument } from '../schemas/sensor.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface SensorSearchFilters {
  query?: string;
  type?: string;
  status?: string;
  venueId?: string;
  courtId?: string;
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
export class SensorRepository {
  constructor(
    @InjectModel('EnvironmentSensor') private readonly sensorModel: Model<any>,
  ) {}

  async create(sensor: Partial<any>): Promise<any> {
    const doc = new this.sensorModel({
      ...sensor,
      _id: new Types.ObjectId(),
      sensorId: `sen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: sensor.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.sensorModel.findById(id).exec();
  }

  async findBySensorId(sensorId: string) {
    return this.sensorModel.findOne({ sensorId }).exec();
  }

  async findByCode(code: string) {
    return this.sensorModel.findOne({ sensorCode: code }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.sensorModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.sensorModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: 'decommissioned',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.sensorModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      status: 'active',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async search(filters: any): Promise<any> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.sensorModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.sensorModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByVenue(venueId: string) {
    return this.sensorModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByCourt(courtId: string) {
    return this.sensorModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findByType(type: string, venueId?: string): Promise<any[]> {
    const filter: any = { type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.sensorModel.find(filter).exec();
  }

  async findByStatus(status: string, venueId?: string): Promise<any[]> {
    const filter: any = { status };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.sensorModel.find(filter).exec();
  }

  async findByCalibrationDue(days: number = 30): Promise<any[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.sensorModel.find({
      'calibration.nextCalibration': { $lte: cutoff },
      status: { $in: ['active', 'maintenance', 'calibration'] },
    }).exec();
  }

  async updateCalibration(sensorId: string, calibration: any): Promise<any> {
    return this.sensorModel.findByIdAndUpdate(
      sensorId,
      { $set: { calibration, updatedAt: new Date() }, $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();
  }

  async findByVenueAndType(venueId: string, type: string): Promise<any[]> {
    return this.sensorModel.find({
      venueId: new Types.ObjectId(venueId),
      type,
    }).exec();
  }
}