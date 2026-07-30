import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueCertification, VenueCertificationDocument, CertificationStatus, CertificationType } from '../schemas/certification.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface CertificationSearchFilters {
  query?: string;
  type?: string;
  status?: string;
  venueId?: string;
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
export class CertificationRepository {
  constructor(
    @InjectModel('VenueCertification') private readonly certModel: Model<any>,
  ) {}

  async create(cert: Partial<any>): Promise<any> {
    const doc = new this.certModel({
      ...cert,
      _id: new Types.ObjectId(),
      certificationId: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.certModel.findById(id).exec();
  }

  async findByCertificationId(certId: string): Promise<any | null> {
    return this.certModel.findOne({ certificationId: certId }).exec();
  }

  async findByVenue(venueId: string): Promise<any[]> {
    return this.certModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByVenueAndType(venueId: string, type: string): Promise<any | null> {
    return this.certModel.findOne({ venueId: new Types.ObjectId(venueId), type }).exec();
  }

  async findByStatus(status: string): Promise<any[]> {
    return this.certModel.find({ status }).exec();
  }

  async findExpiring(days: number = 30): Promise<any[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.certModel
      .find({
        expiryDate: { $lte: cutoff, $gte: new Date() },
        status: CertificationStatus.APPROVED,
      })
      .exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.certModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async renew(id: string, renewedBy: string, newExpiryDate: Date): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.certModel
      .findByIdAndUpdate(
        id,
        {
          status: CertificationStatus.APPROVED,
          expiryDate: newExpiryDate,
          lastRenewalDate: new Date(),
          $inc: { renewalCount: 1 },
          'audit.updatedBy': new Types.ObjectId(renewedBy),
        },
        { new: true },
      )
      .exec();
  }

  async expire(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.certModel
      .findByIdAndUpdate(id, { status: CertificationStatus.EXPIRED, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.certModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(archivedBy),
      'archive.archiveReason': reason,
      status: CertificationStatus.EXPIRED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.certModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: CertificationStatus.PENDING,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async getStatistics(venueId?: string): Promise<any> {
    const filter: any = {};
    if (venueId) filter.venueId = new Types.ObjectId(venueId);

    const [total, byType, byStatus] = await Promise.all([
      this.certModel.countDocuments(filter),
      this.certModel.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.certModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      byStatus: byStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
    };
  }
}