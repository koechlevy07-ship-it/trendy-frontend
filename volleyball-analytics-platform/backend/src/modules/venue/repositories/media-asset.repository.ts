import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueMediaAsset, VenueMediaAssetDocument } from '../schemas/venue-media-asset.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface MediaAssetSearchFilters {
  query?: string;
  venueId?: string;
  courtId?: string;
  type?: string;
  status?: string;
  accessLevel?: string;
  tags?: string[];
  category?: string;
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
export class MediaAssetRepository {
  constructor(
    @InjectModel('VenueMediaAsset') private readonly mediaModel: Model<any>,
  ) {}

  async create(media: Partial<any>): Promise<any> {
    const doc = new this.mediaModel({
      ...media,
      _id: new Types.ObjectId(),
      mediaAssetId: `ma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: media.status || 'processing',
      access: media.access || { isPublic: false, requiresAuthentication: true },
      usage: { viewCount: 0, downloadCount: 0, shareCount: 0, embedCount: 0 },
      processing: { status: 'pending', processingSteps: [] },
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
    return this.mediaModel.findById(id).exec();
  }

  async findByMediaAssetId(assetId: string): Promise<any | null> {
    return this.mediaModel.findOne({ mediaAssetId: assetId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.mediaModel.findByIdAndUpdate(id, {
      status: 'deleted',
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel.findByIdAndUpdate(id, {
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
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);
    if (filters.type) filter.type = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.accessLevel) filter.accessLevel = filters.accessLevel;
    if (filters.tags) filter['metadata.tags'] = { $in: filters.tags };
    if (filters.category) filter['metadata.category'] = filters.category;

    if (filters.dateFrom || filters.dateTo) {
      filter.createdAt = {};
      if (filters.dateFrom) filter.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) filter.createdAt.$lte = new Date(filters.dateTo);
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.mediaModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.mediaModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByVenue(venueId: string, type?: string, status?: string) {
    const filter: any = { venueId: new Types.ObjectId(venueId) };
    if (type) filter.type = type;
    if (status) filter.status = status;
    return this.mediaModel.find(filter).exec();
  }

  async findByCourt(courtId: string, type?: string) {
    const filter: any = { courtId: new Types.ObjectId(courtId) };
    if (type) filter.type = type;
    return this.mediaModel.find(filter).exec();
  }

  async updateStatus(id: string, status: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true }).exec();
  }

  async updateAccess(id: string, access: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel.findByIdAndUpdate(id, { access, updatedAt: new Date() }, { new: true }).exec();
  }

  async updateProcessing(id: string, processing: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel.findByIdAndUpdate(id, { processing, updatedAt: new Date() }, { new: true }).exec();
  }

  async addVariant(id: string, variant: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.mediaModel.findByIdAndUpdate(id, {
      $push: { variants: { ...variant, _id: new Types.ObjectId() } },
      $inc: { 'audit.version': 1 },
      $set: { updatedAt: new Date() },
    }, { new: true }).exec();
  }

  async removeVariant(id: string, variantId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(variantId)) return false;
    const result = await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $pull: { variants: { _id: new Types.ObjectId(variantId) } }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $addToSet: { 'metadata.tags': tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $pull: { 'metadata.tags': tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async getStatistics(venueId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = { venueId: new Types.ObjectId(venueId) };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const [total, byType, byStatus, byAccess, totalViews, totalDownloads, totalSize] = await Promise.all([
      this.mediaModel.countDocuments({ venueId: new Types.ObjectId(venueId) }),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: '$accessLevel', count: { $sum: 1 } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: null, total: { $sum: '$usage.viewCount' } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: null, total: { $sum: '$usage.downloadCount' } } },
      ]),
      this.mediaModel.aggregate([
        { $match: { venueId: new Types.ObjectId(venueId) } },
        { $group: { _id: null, total: { $sum: '$file.fileSize' } } },
      ]),
    ]);

    return {
      totalAssets: total,
      byType: byType.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byAccessLevel: byAccess.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalSizeBytes: totalSize[0]?.total || 0,
      totalSizeMB: Math.round((totalSize[0]?.total || 0) / (1024 * 1024) * 100) / 100,
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $inc: { 'usage.viewCount': 1, 'usage.lastAccessedAt': new Date() } },
    ).exec();
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $inc: { 'usage.downloadCount': 1 } },
    ).exec();
  }

  async incrementShareCount(id: string): Promise<void> {
    await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $inc: { 'usage.shareCount': 1 } },
    ).exec();
  }

  async incrementEmbedCount(id: string): Promise<void> {
    await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $inc: { 'usage.embedCount': 1 } },
    ).exec();
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $addToSet: { 'metadata.tags': tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.mediaModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $pull: { 'metadata.tags': tag }, $inc: { 'audit.version': 1 }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async addToCollection(id: string, collectionId: string): Promise<boolean> {
    return true;
  }

  async removeFromCollection(id: string, collectionId: string): Promise<boolean> {
    return true;
  }
}