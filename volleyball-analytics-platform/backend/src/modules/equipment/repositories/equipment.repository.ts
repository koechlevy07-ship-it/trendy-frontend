import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Equipment, EquipmentDocument, EquipmentType, EquipmentStatus, EquipmentCondition, MaintenanceFrequency } from '../schemas/equipment.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface EquipmentSearchFilters {
  query?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
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
export class EquipmentRepository {
  constructor(
    @InjectModel('Equipment') private readonly equipmentModel: Model<EquipmentDocument>,
  ) {}

  async create(equipment: Partial<EquipmentDocument>): Promise<EquipmentDocument> {
    const doc = new this.equipmentModel({
      ...equipment,
      _id: new Types.ObjectId(),
      equipmentId: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: equipment.status || EquipmentStatus.OPERATIONAL,
      condition: equipment.condition || EquipmentCondition.GOOD,
      maintenanceHistory: [],
      specifications: equipment.specifications || {},
      warranty: equipment.warranty || { hasWarranty: false },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<EquipmentDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.equipmentModel.findById(id).exec();
  }

  async findByEquipmentId(equipmentId: string): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findOne({ equipmentId }).exec();
  }

  async findByCode(code: string): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findOne({ equipmentCode: code }).exec();
  }

  async update(id: string, update: Partial<EquipmentDocument>): Promise<EquipmentDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.equipmentModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.equipmentModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: EquipmentStatus.ARCHIVED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<EquipmentDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.equipmentModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: EquipmentStatus.OPERATIONAL,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async search(filters: EquipmentSearchFilters): Promise<PaginatedResult<EquipmentDocument>> {
    const filter: FilterQuery<EquipmentDocument> = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter.equipmentType = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.condition) filter.condition = filters.condition;
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.equipmentModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.equipmentModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findByVenue(venueId: string): Promise<EquipmentDocument[]> {
    return this.equipmentModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByCourt(courtId: string): Promise<EquipmentDocument[]> {
    return this.equipmentModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findByType(type: EquipmentType, venueId?: string): Promise<EquipmentDocument[]> {
    const filter: FilterQuery<EquipmentDocument> = { equipmentType: type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.equipmentModel.find(filter).exec();
  }

  async findByStatus(status: EquipmentStatus, venueId?: string): Promise<EquipmentDocument[]> {
    const filter: FilterQuery<EquipmentDocument> = { status };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.equipmentModel.find(filter).exec();
  }

  async findByMaintenanceStatus(status: MaintenanceFrequency, venueId?: string): Promise<EquipmentDocument[]> {
    const filter: FilterQuery<EquipmentDocument> = { maintenanceFrequency: status };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.equipmentModel.find(filter).exec();
  }

  async findNeedingMaintenance(venueId?: string): Promise<EquipmentDocument[]> {
    const filter: FilterQuery<EquipmentDocument> = {
      nextMaintenanceDate: { $lte: new Date() },
      status: { $ne: EquipmentStatus.ARCHIVED },
    };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.equipmentModel.find(filter).exec();
  }

  async findByWarrantyExpiry(days: number = 30): Promise<EquipmentDocument[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.equipmentModel.find({
      'warranty.hasWarranty': true,
      'warranty.warrantyEndDate': { $lte: cutoff, $gte: new Date() },
    }).exec();
  }

  async findBySerialNumber(serialNumber: string): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findOne({ serialNumber }).exec();
  }

  async findByAssetTag(assetTag: string): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findOne({ assetTag }).exec();
  }

  async addMaintenanceRecord(equipmentId: string, record: any): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findByIdAndUpdate(
      equipmentId,
      {
        $push: { maintenanceHistory: { ...record, _id: new Types.ObjectId() } },
        $set: { lastMaintenanceDate: new Date(), updatedAt: new Date() },
        $inc: { 'audit.version': 1 },
      },
      { new: true },
    ).exec();
  }

  async updateWarranty(equipmentId: string, warranty: any): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findByIdAndUpdate(
      equipmentId,
      { $set: { warranty, updatedAt: new Date() }, $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();
  }

  async scheduleNextMaintenance(equipmentId: string, date: Date, type: string): Promise<EquipmentDocument | null> {
    return this.equipmentModel.findByIdAndUpdate(
      equipmentId,
      { $set: { nextMaintenanceDate: date, updatedAt: new Date() }, $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();
  }

  async getStatistics(venueId?: string): Promise<any> {
    const filter: any = {};
    if (venueId) filter.venueId = new Types.ObjectId(venueId);

    const [total, byStatus, byType, byCondition, byMaintenanceStatus] = await Promise.all([
      this.equipmentModel.countDocuments({ ...filter, 'archive.isArchived': false }).exec(),
      this.equipmentModel.aggregate([
        { $match: { ...filter, 'archive.isArchived': false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.equipmentModel.aggregate([
        { $match: { ...filter, 'archive.isArchived': false } },
        { $group: { _id: '$equipmentType', count: { $sum: 1 } } },
      ]),
      this.equipmentModel.aggregate([
        { $match: { ...filter, 'archive.isArchived': false } },
        { $group: { _id: '$condition', count: { $sum: 1 } } },
      ]),
      this.equipmentModel.aggregate([
        { $match: { ...filter, 'archive.isArchived': false } },
        { $group: { _id: '$maintenanceFrequency', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byType: byType.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byCondition: byCondition.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byMaintenanceStatus: byMaintenanceStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      underWarranty: await this.equipmentModel.countDocuments({
        ...filter,
        'archive.isArchived': false,
        'warranty.hasWarranty': true,
        'warranty.warrantyEndDate': { $gt: new Date() },
      }),
      warrantyExpiringSoon: await this.equipmentModel.countDocuments({
        ...filter,
        'archive.isArchived': false,
        'warranty.hasWarranty': true,
        'warranty.warrantyEndDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), $gt: new Date() },
      }),
      needingMaintenance: await this.equipmentModel.countDocuments({
        ...filter,
        'archive.isArchived': false,
        nextMaintenanceDate: { $lte: new Date() },
      }),
    };
  }
}