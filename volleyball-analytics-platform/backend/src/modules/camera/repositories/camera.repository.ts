import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Camera, CameraDocument, CameraType, CameraStatus, CameraResolution, StreamProtocol } from '../schemas/camera.schema';
import { CameraCalibration, CameraCalibrationDocument } from '../schemas/camera.schema';

export interface CameraSearchFilters {
  query?: string;
  venueId?: string;
  courtId?: string;
  status?: string;
  type?: string;
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
export class CameraRepository {
  constructor(
    @InjectModel('Camera') private readonly cameraModel: Model<CameraDocument>,
    @InjectModel('CameraCalibration') private readonly calibrationModel: Model<any>,
  ) {}

  async create(camera: Partial<CameraDocument>): Promise<CameraDocument> {
    const doc = new this.cameraModel({
      ...camera,
      _id: new Types.ObjectId(),
      cameraId: `cam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: camera.status || CameraStatus.INACTIVE,
      calibrations: [],
      maintenanceHistory: [],
      audit: { version: 0 },
      archive: { isArchived: false },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<CameraDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.cameraModel.findById(id).exec();
  }

  async findByCameraId(cameraId: string): Promise<CameraDocument | null> {
    return this.cameraModel.findOne({ cameraId }).exec();
  }

  async findBySerialNumber(serialNumber: string): Promise<CameraDocument | null> {
    return this.cameraModel.findOne({ serialNumber }).exec();
  }

  async update(id: string, update: Partial<CameraDocument>): Promise<CameraDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.cameraModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.cameraModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: CameraStatus.DECOMMISSIONED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<CameraDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.cameraModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: CameraStatus.INACTIVE,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: CameraSearchFilters): Promise<any> {
    const filter: FilterQuery<CameraDocument> = {};

    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.cameraModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.cameraModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findByVenue(venueId: string): Promise<CameraDocument[]> {
    return this.cameraModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByCourt(courtId: string): Promise<CameraDocument[]> {
    return this.cameraModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findByType(type: CameraType, venueId?: string): Promise<CameraDocument[]> {
    const filter: FilterQuery<CameraDocument> = { type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.cameraModel.find(filter).exec();
  }

  async findOperational(venueId?: string): Promise<CameraDocument[]> {
    const filter: FilterQuery<CameraDocument> = { status: CameraStatus.ACTIVE };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.cameraModel.find(filter).exec();
  }

  async getCameraStatistics(cameraId: string): Promise<any> {
    const camera = await this.cameraModel.findById(cameraId).exec();
    if (!camera) return null;

    return {
      cameraId: camera.cameraId,
      name: camera.name,
      type: camera.type,
      status: camera.status,
      totalStreams: camera.streams.length,
      activeStreams: camera.streams.filter(s => s.isActive).length,
      totalCalibrations: camera.calibrations.length,
      validCalibrations: camera.calibrations.filter(c => c.expiresAt && c.expiresAt > new Date()).length,
      totalMaintenance: camera.maintenanceHistory.length,
      lastMaintenance: camera.maintenanceHistory.length > 0 
        ? camera.maintenanceHistory[camera.maintenanceHistory.length - 1].scheduledDate 
        : null,
      nextMaintenance: camera.maintenanceHistory.length > 0 
        ? camera.maintenanceHistory[camera.maintenanceHistory.length - 1].scheduledDate 
        : null,
    };
  }

  // Calibration methods
  async createCalibration(calibration: any): Promise<any> {
    const doc = new this.calibrationModel({
      ...calibration,
      _id: new Types.ObjectId(),
      calibrationId: `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findCalibrationById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.calibrationModel.findById(id).exec();
  }

  async findCalibrationsByCourt(courtId: string): Promise<any[]> {
    return this.calibrationModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findCalibrationsByCamera(cameraId: string): Promise<any[]> {
    return this.calibrationModel.find({ cameraId: new Types.ObjectId(cameraId) }).exec();
  }

  async updateCalibration(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.calibrationModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async archiveCalibration(id: string, archivedBy: string, reason?: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.calibrationModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(archivedBy),
      'archive.archiveReason': reason,
      status: 'archived',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async getCalibrationStats(courtId?: string): Promise<any> {
    const filter: any = {};
    if (courtId) filter.courtId = new Types.ObjectId(courtId);

    const [total, byStatus, byMethod, avgDuration] = await Promise.all([
      this.calibrationModel.countDocuments({}).exec(),
      this.calibrationModel.aggregate([
        { $match: {} },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.calibrationModel.aggregate([
        { $match: {} },
        { $group: { _id: '$method', count: { $sum: 1 } } },
      ]),
      this.calibrationModel.aggregate([
        { $match: {} },
        { $group: { _id: null, avgDuration: { $avg: '$durationMinutes' } } },
      ]),
    ];

    return {
      totalCalibrations: total,
      byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byMethod: byMethod.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      averageDurationMinutes: avgDuration[0]?.avgDuration || 0,
    };
  }
}