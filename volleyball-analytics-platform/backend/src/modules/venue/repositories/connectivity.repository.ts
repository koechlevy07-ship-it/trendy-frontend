import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueConnectivity, VenueConnectivityDocument } from '../schemas/venue-connectivity.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface ConnectivitySearchFilters {
  query?: string;
  venueId?: string;
  type?: string;
  status?: string;
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
export class ConnectivityRepository {
  constructor(
    @InjectModel('VenueConnectivity') private readonly connModel: Model<any>,
  ) {}

  async create(conn: Partial<any>): Promise<any> {
    const doc = new this.connModel({
      ...conn,
      _id: new Types.ObjectId(),
      connectivityId: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.connModel.findById(id).exec();
  }

  async findByConnectivityId(connId: string) {
    return this.connModel.findOne({ connectivityId: connId }).exec();
  }

  async update(id: string, update: any): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.connModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.connModel.findByIdAndUpdate(id, {
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
    return this.connModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async search(filters: any): Promise<PaginatedResult<any>> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.type) filter['interfaces.type'] = filters.type;
    if (filters.status) filter.status = filters.status;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.connModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.connModel.countDocuments(filter).exec(),
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
    return this.connModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByType(type: string, venueId?: string) {
    const filter: any = { 'interfaces.type': type };
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    return this.connModel.find(filter).exec();
  }

  async updateInterfaceStatus(
    connectivityId: string,
    interfaceId: string,
    status: string,
  ): Promise<boolean> {
    const result = await this.connModel.updateOne(
      { _id: new Types.ObjectId(connectivityId), 'interfaces.interfaceId': interfaceId },
      { $set: { 'interfaces.$.status': status, updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async checkInterfaceAvailability(
    venueId: string,
    type: string,
    date: Date,
  ): Promise<boolean> {
    const conn = await this.connModel.findOne({
      venueId: new Types.ObjectId(venueId),
      'interfaces.type': type,
      'interfaces.status': 'active',
    }).exec();
    return !!conn;
  }

  async getConnectivityStatistics(venueId: string): Promise<any> {
    const conns = await this.connModel.find({ venueId: new Types.ObjectId(venueId) }).exec();

    const stats = {
      total: conns.length,
      byType: {},
      byStatus: {},
      byProvider: {},
      totalBandwidth: 0,
      averageUptime: 0,
    };

    for (const conn of conns) {
      stats.byType[conn.type] = (stats.byType[conn.type] || 0) + 1;
      stats.byStatus[conn.status] = (stats.byStatus[conn.status] || 0) + 1;
      for (const provider of conn.providers || []) {
        stats.byProvider[provider.name] = (stats.byProvider[provider.name] || 0) + 1;
      }
      for (const iface of conn.interfaces || []) {
        if (iface.bitrate) stats.totalBandwidth += iface.bitrate;
      }
    }

    return stats;
  }

  async findAvailableInterfaces(
    venueId: string,
    type: string,
    date: Date,
  ): Promise<any[]> {
    return this.connModel
      .find({
        venueId: new Types.ObjectId(venueId),
        'interfaces.type': type,
        'interfaces.status': 'active',
      })
      .exec();
  }
}