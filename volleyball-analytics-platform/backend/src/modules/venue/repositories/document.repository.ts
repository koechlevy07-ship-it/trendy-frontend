import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueDocument, VenueDocumentDocument } from '../schemas/venue-document.schema';

export interface DocumentSearchFilters {
  query?: string;
  type?: string;
  status?: string;
  visibility?: string;
  venueId?: string;
  courtId?: string;
  facilityId?: string;
  equipmentId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: any[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectModel('VenueDocument') private readonly docModel: Model<any>,
  ) {}

  async create(doc: Partial<any>): Promise<any> {
    const doc = new this.docModel({
      ...doc,
      _id: new Types.ObjectId(),
      documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: doc.status || 'draft',
      visibility: doc.visibility || 'internal',
      versions: [],
      reviews: [],
      access: {
        readAccess: [],
        writeAccess: [],
        adminAccess: [],
        authorizedRoles: [],
        authorizedGroups: [],
        isPublic: false,
        requiresAuthentication: true,
      },
      tags: [],
      keywords: [],
      audit: { version: 0 },
      archive: { isArchived: false },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.docModel.findById(id).exec();
  }

  async findByDocumentId(documentId: string): Promise<any | null> {
    return this.docModel.findOne({ documentId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.docModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.docModel.findByIdAndUpdate(id, {
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
    return this.docModel.findByIdAndUpdate(id, {
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
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.visibility) filter.visibility = filters.visibility;
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);
    if (filters.facilityId) filter.facilityId = new Types.ObjectId(filters.facilityId);
    if (filters.equipmentId) filter.equipmentId = new Types.ObjectId(filters.equipmentId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.docModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.docModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByVenue(venueId: string, filters?: any): Promise<any[]> {
    const filter: any = { venueId: new Types.ObjectId(venueId) };
    if (filters?.type) filter.type = filters.type;
    if (filters?.status) filter.status = filters.status;
    return this.docModel.find(filter).exec();
  }

  async findByType(type: string, venueId?: string): Promise<any[]> {
    const filter: any = { type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.docModel.find(filter).exec();
  }

  async findByStatus(status: string, venueId?: string): Promise<any[]> {
    const filter: any = { status };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.docModel.find(filter).exec();
  }

  async findExpiring(days: number = 30): Promise<any[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.docModel.find({
      expiryDate: { $lte: cutoff, $gte: new Date() },
      status: 'approved',
    }).exec();
  }

  async findNeedingReview(): Promise<any[]> {
    return this.docModel.find({
      reviewDate: { $lte: new Date() },
      status: 'approved',
    }).exec();
  }

  async addVersion(documentId: string, version: any): Promise<any> {
    return this.docModel.findByIdAndUpdate(
      documentId,
      { $push: { versions: version }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async addReview(documentId: string, review: any): Promise<any> {
    return this.docModel.findByIdAndUpdate(
      documentId,
      { $push: { reviews: review }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.docModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $addToSet: { tags: tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.docModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $pull: { tags: tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async findByExpiryRange(start: Date, end: Date): Promise<any[]> {
    return this.docModel.find({
      expiryDate: { $gte: start, $lte: end },
      status: 'approved',
    }).exec();
  }

  async findByReviewDateRange(start: Date, end: Date): Promise<any[]> {
    return this.docModel.find({
      reviewDate: { $gte: start, $lte: end },
      status: 'approved',
    }).exec();
  }

  async getStatistics(venueId?: string): Promise<any> {
    const filter: any = {};
    if (venueId) filter.venueId = new Types.ObjectId(venueId);

    const [total, byType, byStatus, byVisibility] = await Promise.all([
      this.docModel.countDocuments({ 'archive.isArchived': false }),
      this.docModel.aggregate([
        { $match: { 'archive.isArchived': false } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.docModel.aggregate([
        { $match: { 'archive.isArchived': false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.docModel.aggregate([
        { $match: { 'archive.isArchived': false } },
        { $group: { _id: '$visibility', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byVisibility: byVisibility.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
    };
  }
}