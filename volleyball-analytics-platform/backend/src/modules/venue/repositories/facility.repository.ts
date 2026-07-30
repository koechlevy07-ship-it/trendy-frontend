import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { VenueFacility, VenueFacilityDocument, FacilityType, FacilityStatus, FacilityAvailability } from '../schemas/venue-facility.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface FacilitySearchFilters {
  query?: string;
  type?: FacilityType;
  status?: FacilityStatus;
  venueId?: string;
  availability?: FacilityAvailability;
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
export class FacilityRepository {
  constructor(
    @InjectModel('VenueFacility') private readonly facilityModel: Model<VenueFacilityDocument>,
  ) {}

  async create(facility: Partial<VenueFacilityDocument>): Promise<VenueFacilityDocument> {
    const doc = new this.facilityModel({
      ...facility,
      _id: new Types.ObjectId(),
      facilityId: `fac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: facility.status || FacilityStatus.ACTIVE,
      availability: facility.availability || FacilityAvailability.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string): Promise<VenueFacilityDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.facilityModel.findById(id).exec();
  }

  async findByFacilityId(facilityId: string): Promise<VenueFacilityDocument | null> {
    return this.facilityModel.findOne({ facilityId }).exec();
  }

  async findByVenue(venueId: string): Promise<VenueFacilityDocument[]> {
    return this.facilityModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByType(type: FacilityType, venueId?: string): Promise<VenueFacilityDocument[]> {
    const filter: any = { facilityType: type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.facilityModel.find(filter).exec();
  }

  async search(filters: FacilitySearchFilters): Promise<PaginatedResult<VenueFacilityDocument>> {
    const filter: FilterQuery<VenueFacilityDocument> = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter.facilityType = filters.type;
    if (filters.status) filter.status = filters.status;
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.availability) filter.availability = filters.availability;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.facilityModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.facilityModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async update(id: string, update: Partial<VenueFacilityDocument>): Promise<VenueFacilityDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.facilityModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.facilityModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      status: FacilityStatus.ARCHIVED,
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<VenueFacilityDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.facilityModel
      .findByIdAndUpdate(id, {
        'archive.isArchived': false,
        'archive.archivedAt': null,
        'archive.archivedBy': null,
        status: FacilityStatus.ACTIVE,
        updatedAt: new Date(),
      }, { new: true })
      .exec();
  }

  async findByVenue(venueId: string): Promise<VenueFacilityDocument[]> {
    return this.facilityModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByType(type: FacilityType, venueId?: string): Promise<VenueFacilityDocument[]> {
    const filter: any = { facilityType: type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.facilityModel.find(filter).exec();
  }

  async findAvailable(venueId: string, date: Date): Promise<VenueFacilityDocument[]> {
    return this.facilityModel.find({
      venueId: new Types.ObjectId(venueId),
      availability: FacilityAvailability.AVAILABLE,
      status: FacilityStatus.ACTIVE,
    }).exec();
  }

  async getFacilityUtilization(venueId: string, startDate: Date, endDate: Date): Promise<any> {
    const facilities = await this.facilityModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
    return {
      total: facilities.length,
      byType: facilities.reduce((acc, f) => {
        acc[f.facilityType] = (acc[f.facilityType] || 0) + 1;
        return acc;
      }, {}),
      byStatus: facilities.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {}),
      byAvailability: facilities.reduce((acc, f) => {
        acc[f.availability] = (acc[f.availability] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}