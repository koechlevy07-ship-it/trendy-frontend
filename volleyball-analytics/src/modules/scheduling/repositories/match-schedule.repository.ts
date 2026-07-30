import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { MatchSchedule, MatchScheduleDocument } from '../schemas/match-schedule.schema';
import { ScheduleStatus } from '../schemas/match-schedule.schema';

export interface MatchScheduleSearchDto {
  tournamentId?: string;
  venueId?: string;
  courtId?: string;
  teamId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MatchScheduleResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class MatchScheduleRepository {
  constructor(
    @InjectModel('MatchSchedule') private matchScheduleModel: Model<MatchScheduleDocument>,
  ) {}

  async findById(id: string): Promise<any> {
    return this.matchScheduleModel.findById(id).exec();
  }

  async findByScheduleId(scheduleId: string): Promise<any> {
    return this.matchScheduleModel.findOne({ scheduleId }).exec();
  }

  async findByMatchId(matchId: string): Promise<any> {
    return this.matchScheduleModel.findOne({ matchId }).exec();
  }

  async findByTournament(tournamentId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({ tournamentId: new Types.ObjectId(tournamentId) });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: 1 }).exec();
  }

  async findByVenue(venueId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({ venueId: new Types.ObjectId(venueId) });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: 1 }).exec();
  }

  async findByCourt(courtId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({ courtId: new Types.ObjectId(courtId) });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: 1 }).exec();
  }

  async findByTeam(teamId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({
      $or: [
        { 'homeTeam.teamId': new Types.ObjectId(teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(teamId) }
      ]
    });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: -1 }).exec();
  }

  async findByStatus(status: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({ status });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: 1 }).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.matchScheduleModel.find({
      scheduledAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.sort({ scheduledAt: 1 }).exec();
  }

  async search(searchDto: any): Promise<any> {
    const filter: any = {};

    if (searchDto.tournamentId) {
      filter.tournamentId = new Types.ObjectId(searchDto.tournamentId);
    }
    if (searchDto.venueId) {
      filter.venueId = new Types.ObjectId(searchDto.venueId);
    }
    if (searchDto.courtId) {
      filter.courtId = new Types.ObjectId(searchDto.courtId);
    }
    if (searchDto.teamId) {
      filter.$or = [
        { 'homeTeam.teamId': new Types.ObjectId(searchDto.teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(searchDto.teamId) }
      ];
    }
    if (searchDto.status) {
      filter.status = searchDto.status;
    }
    if (searchDto.startDate || searchDto.endDate) {
      filter.scheduledAt = {};
      if (searchDto.startDate) filter.scheduledAt.$gte = new Date(searchDto.startDate);
      if (searchDto.endDate) filter.scheduledAt.$lte = new Date(searchDto.endDate);
    }

    const page = searchDto.page || 1;
    const limit = Math.min(searchDto.limit || 20, 100);
    const skip = (searchDto.page - 1) * limit;
    const sortBy = searchDto.sortBy || 'scheduledAt';
    const sortOrder = searchDto.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.matchScheduleModel
        .find(filter)
        .sort({ [searchDto.sortBy || 'scheduledAt']: searchDto.sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.matchScheduleModel.countDocuments(filter).exec()
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findActiveByTournament(tournamentId: string): Promise<any[]> {
    return this.matchScheduleModel.find({
      tournamentId: new Types.ObjectId(tournamentId),
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    }).sort({ scheduledAt: 1 }).exec();
  }

  async findByCourtAndDate(courtId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(courtId);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(courtId);
    endOfDay.setHours(23, 59, 59, 999);

    return this.matchScheduleModel.find({
      courtId: new Types.ObjectId(courtId),
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'archived'] }
    }).sort({ scheduledAt: 1 }).exec();
  }

  async findConflictingMatches(courtId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<any[]> {
    const filter: any = {
      courtId: new Types.ObjectId(courtId),
      status: { $nin: ['cancelled', 'archived', 'completed'] },
      $or: [
        { scheduledAt: { $lt: endTime }, actualEndAt: { $gt: startTime } },
        { scheduledAt: { $lt: endTime }, actualEndAt: { $exists: false } }
      ]
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    return this.matchScheduleModel.find(filter).exec();
  }

  async create(data: any): Promise<any> {
    const schedule = new this.matchScheduleModel(data);
    return schedule.save();
  }

  async update(id: string, data: any): Promise<any> {
    return this.matchScheduleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id: string, status: string, userId?: string): Promise<any> {
    const updateData: any = { status };
    if (status === 'in_progress') updateData.actualStartAt = new Date();
    if (status === 'completed') updateData.actualEndAt = new Date();
    return this.matchScheduleModel.findByIdAndUpdate(
      new Types.ObjectId(data),
      { $set: { status, ...(status === 'in_progress' ? { actualStartAt: new Date() } : {}), ...(status === 'completed' ? { actualEndAt: new Date() } : {}) } },
      { new: true, runValidators: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.matchScheduleModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async archive(id: string): Promise<any> {
    return this.matchScheduleModel.findByIdAndUpdate(
      id,
      { status: 'archived', archivedAt: new Date() },
      { new: true }
    ).exec();
  }

  async restore(id: string): Promise<any> {
    return this.matchScheduleModel.findByIdAndUpdate(
      id,
      { status: 'draft', archivedAt: null },
      { new: true }
    ).exec();
  }

  async getScheduleStats(tournamentId?: string): Promise<any> {
    const match: any = {};
    if (tournamentId) {
      match.tournamentId = new Types.ObjectId(tournamentId);
    }

    const [total, byStatus, byType, bySurface] = await Promise.all([
      this.matchScheduleModel.countDocuments().exec(),
      this.matchScheduleModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $group: { _id: '$courtType', count: { $sum: 1 } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $group: { _id: '$surfaceType', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      bySurface: bySurface.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    };
  }

  async findOverdueMatches(): Promise<any[]> {
    const now = new Date();
    return this.matchScheduleModel.find({
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledAt: { $lt: new Date() }
    }).sort({ scheduledAt: 1 }).exec();
  }

  async findUpcomingMatches(days: number = 7): Promise<any[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.matchScheduleModel.find({
      scheduledAt: { $gte: new Date(), $lte: futureDate },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ scheduledAt: 1 }).exec();
  }

  async findMatchesNeedingConfirmation(): Promise<any[]> {
    return this.matchScheduleModel.find({
      status: 'pending_confirmation',
      scheduledAt: { $gt: new Date() }
    }).sort({ scheduledAt: 1 }).exec();
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    const result = await this.matchScheduleModel.updateMany(
      { _id: { $in: ids.map(id => new Types.ObjectId(id)) } },
      { $set: { status } }
    ).exec();
    return result.modifiedCount;
  }

  async bulkAssignCameras(matchIds: string[], cameraId: string): Promise<number> {
    const result = await this.matchScheduleModel.updateMany(
      { _id: { $in: matchIds.map(id => new Types.ObjectId(id)) } },
      { $addToSet: { assignedCameras: new Types.ObjectId(cameraId) } }
    ).exec();
    return result.modifiedCount;
  }

  async bulkAssignOfficials(matchIds: string[], officialId: string, role: string): Promise<number> {
    const result = await this.matchScheduleModel.updateMany(
      { _id: { $in: matchIds.map(id => new Types.ObjectId(id)) } },
      { $addToSet: { assignedOfficials: { officialId: new Types.ObjectId(officialId), role } } }
    ).exec();
    return result.modifiedCount;
  }

  async getScheduleStats(tournamentId?: string): Promise<any> {
    const match: any = {};
    if (tournamentId) {
      match.tournamentId = new Types.ObjectId(tournamentId);
    }

    const [total, byStatus, byType, byMaintenance, costs, durations] = await Promise.all([
      this.matchScheduleModel.countDocuments(),
      this.matchScheduleModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $group: { _id: '$courtType', count: { $sum: 1 } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $match: { status: { $in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS] } } },
        { $group: { _id: '$maintenanceType', count: { $sum: 1 } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $match: { status: 'completed', actualDurationMinutes: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$actualDurationMinutes' }, total: { $sum: '$actualDurationMinutes' } } }
      ]),
      this.matchScheduleModel.aggregate([
        { $match: { status: 'completed', actualDurationMinutes: { $exists: true } } },
        { $group: { _id: '$courtType', avg: { $avg: '$actualDurationMinutes' } } }
      ])
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byMaintenance: byMaintenance.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      avgDuration: costs[0]?.avg || 0,
      totalDuration: costs[0]?.total || 0,
      avgDurationByType: durations.reduce((acc, item) => ({ ...acc, [item._id]: Math.round(item.avg) }), {}),
    };
  }
}