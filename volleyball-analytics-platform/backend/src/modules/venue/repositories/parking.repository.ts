import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueParking, VenueParkingDocument } from '../schemas/venue-parking.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface ParkingSearchFilters {
  query?: string;
  status?: string;
  type?: string;
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
export class ParkingRepository {
  constructor(
    @InjectModel('VenueParking') private readonly parkingModel: Model<any>,
  ) {}

  async create(parking: Partial<any>): Promise<any> {
    const doc = new this.parkingModel({
      ...parking,
      _id: new Types.ObjectId(),
      parkingId: `pk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: parking.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.parkingModel.findById(id).exec();
  }

  async findByParkingId(parkingId: string) {
    return this.parkingModel.findOne({ parkingId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.parkingModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.parkingModel.findByIdAndUpdate(id, {
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
    return this.parkingModel.findByIdAndUpdate(id, {
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

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.parkingModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.parkingModel.countDocuments(filter).exec(),
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
    return this.parkingModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findAvailableSpots(venueId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.parkingModel.aggregate([
      {
        $match: {
          venueId: new Types.ObjectId(venueId),
          status: 'active',
          'spaces.status': 'available',
        },
      },
      {
        $unwind: '$spaces',
      },
      {
        $match: {
          'spaces.status': 'available',
        },
      },
      {
        $project: {
          parkingId: 1,
          'spaces.spotId': 1,
          'spaces.type': 1,
          'spaces.status': 1,
        },
      },
    ]).exec();
  }

  async updateSpotStatus(parkingId: string, spotId: string, status: string): Promise<boolean> {
    const result = await this.parkingModel.updateOne(
      { parkingId, 'spaces.spotId': spotId },
      { $set: { 'spaces.$.status': status } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async getStatistics(venueId: string): Promise<any> {
    const parking = await this.parkingModel.findOne({ venueId: new Types.ObjectId(venueId) }).exec();
    if (!parking) return null;

    const totalCapacity = parking.totalCapacity || 0;
    const occupied = parking.occupiedCapacity || 0;
    const available = totalCapacity - occupied;

    return {
      totalCapacity,
      occupied,
      available,
      occupancyRate: totalCapacity > 0 ? (occupied / totalCapacity) * 100 : 0,
      byType: this.getOccupancyByType(parking),
      revenue: await this.calculateRevenue(parking),
    };
  }

  private getOccupancyByType(parking: any): any {
    const byType: any = {};
    for (const spot of parking.spaces || []) {
      if (!byType[spot.type]) {
        byType[spot.type] = { total: 0, occupied: 0, available: 0 };
      }
      byType[spot.type].total++;
      if (spot.status === 'occupied' || spot.status === 'reserved') {
        byType[spot.type].occupied++;
      } else {
        byType[spot.type].available++;
      }
    }
    return byType;
  }

  async calculateRevenue(parking: any): Promise<number> {
    // This would integrate with payment system
    return 0;
  }
}