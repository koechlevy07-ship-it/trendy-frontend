import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Court, CourtDocument, CourtType, CourtSurface, CourtOrientation, CourtStatus } from '../schemas/court.schema';
import { CreateCourtDTO, UpdateCourtDTO, CourtSearchDTO, CourtResponseDTO, CourtSummaryDTO } from '../dto/court.dto';

@Injectable()
export class CourtRepository {
  constructor(
    @InjectModel('Court') private readonly courtModel: Model<CourtDocument>,
  ) {}

  async create(dto: CreateCourtDTO): Promise<CourtDocument> {
    const court = new this.courtModel({
      ...dto,
      _id: new Types.ObjectId(),
      courtId: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: CourtStatus.DRAFT,
      operationalStatus: {
        status: CourtStatus.DRAFT,
      },
      availability: {
        status: 'available',
      },
      aiMetadata: dto.aiMetadata || {},
      audit: { version: 0 },
      archive: { isArchived: false },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return court.save();
  }

  async findById(id: string): Promise<CourtDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.courtModel.findById(id).exec();
  }

  async findByCourtId(courtId: string): Promise<CourtDocument | null> {
    return this.courtModel.findOne({ courtId }).exec();
  }

  async findByVenue(venueId: string): Promise<CourtDocument[]> {
    return this.courtModel.find({ 'venue.venueId': new Types.ObjectId(venueId) }).exec();
  }

  async search(filters: CourtSearchDTO): Promise<{ data: CourtResponseDTO[]; total: number; page: number; perPage: number; totalPages: number }> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) filter['identity.type'] = filters.type;
    if (filters.surface) filter['surface.surfaceType'] = filters.surface;
    if (filters.status) filter['operationalStatus.status'] = filters.status;
    if (filters.venueId) filter['venue.venueId'] = new Types.ObjectId(filters.venueId);

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (page - 1) * perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.courtModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.courtModel.countDocuments(filter).exec(),
    );

    return {
      data: data.map(d => this.toResponseDTO(d)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async update(id: string, dto: UpdateCourtDTO): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.courtModel
      .findByIdAndUpdate(id, { ...dto, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async updateStatus(id: string, status: CourtStatus): Promise<any | null> {
    return this.courtModel.findByIdAndUpdate(id, {
      'operationalStatus.status': status,
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async archive(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.courtModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'operationalStatus.status': 'archived',
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.courtModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      'operationalStatus.status': 'certificateStatus.OPERATIONAL',
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async addPlayerToRoster(courtId: string, teamId: string, player: any): Promise<any | null> {
    return this.courtModel.findByIdAndUpdate(
      courtId,
      { $addToSet: { 'rosters.$[team].players': player } },
      { arrayFilters: [{ 'team.teamId': teamId }], new: true }
    ).exec();
  }

  async removePlayerFromRoster(courtId: string, teamId: string, playerId: string): Promise<any> {
    return this.courtModel.findByIdAndUpdate(
      courtId,
      { $pull: { 'rosters.$[team].players': { playerId } } },
      { arrayFilters: [{ 'team.teamId': teamId }], new: true }
    ).exec();
  }

  async updateRoster(courtId: string, teamId: string, players: any[]): Promise<any> {
    return this.courtModel.findByIdAndUpdate(
      courtId,
      { $set: { 'rosters.$[team].players': players } },
      { arrayFilters: [{ 'team.teamId': teamId }], new: true }
    ).exec();
  }

  async addMatch(courtId: string, matchId: string): Promise<any> {
    return this.courtModel.findByIdAndUpdate(
      courtId,
      { $addToSet: { matchIds: new Types.ObjectId(matchId) } },
      { new: true }
    ).exec();
  }

  async removeMatch(courtId: string, matchId: string): Promise<boolean> {
    const result = await this.courtModel.updateOne(
      { _id: new Types.ObjectId(courtId) },
      { $pull: { matchIds: new Types.ObjectId(matchId) } }
    ).exec();
    return true;
  }

  async getStatistics(courtId: string): Promise<any> {
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) return null;

    return {
      courtId: court.courtId,
      name: court.identity.name,
      type: court.identity.type,
      status: court.operationalStatus.status,
      surface: court.surface.surfaceType,
      area: court.dimensions.length * court.dimensions.width,
      totalFixtures: 0, // Would need fixture service
      totalMatches: 0, // Would need match service
      upcomingFixtures: 0,
      completedMatches: 0,
      liveMatches: 0,
    };
  }

  async getAvailableCourts(venueId: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
    const courts = await this.courtModel.find({
      'venue.venueId': new Types.ObjectId(venueId),
      operationalStatus: { status: 'operational' },
    }).exec();

    // Filter by availability (no fixtures in the date range)
    // This would need fixture service integration
    return courts;
  }

  async bulkUpdateStatus(courtIds: string[], status: string): Promise<number> {
    const result = await this.courtModel.updateMany(
      { _id: { $in: courtIds.map(id => new Types.ObjectId(id)) } },
      { 'operationalStatus.status': status, updatedAt: new Date() }
    ).exec();
    return result.modifiedCount;
  }
}