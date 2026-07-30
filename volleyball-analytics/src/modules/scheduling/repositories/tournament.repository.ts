import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { Tournament, TournamentDocument, TournamentSchema } from '../schemas/tournament.schema';
import { CreateTournamentDto, UpdateTournamentDto, TournamentSearchDto } from '../dto/tournament.dto';

@Injectable()
export class TournamentRepository {
  constructor(
    @InjectModel('Tournament') private readonly tournamentModel: Model<TournamentDocument>
  ) {}

  async create(dto: CreateTournamentDto): Promise<TournamentDocument> {
    const tournament = new this.tournamentModel({
      ...dto,
      organizationId: new Types.ObjectId(dto.organizationId),
      participatingTeams: dto.participatingTeams?.map(id => new Types.ObjectId(id)) || [],
      participatingOfficials: dto.participatingOfficials?.map(id => new Types.ObjectId(id)) || [],
      scheduleWindow: {
        ...dto.scheduleWindow,
        earliestStart: new Date(dto.scheduleWindow.earliestStart),
        latestEnd: new Date(dto.scheduleWindow.latestEnd),
        blackoutDates: dto.scheduleWindow.blackoutDates?.map(d => new Date(d)) || [],
      },
      venuePreferences: dto.venuePreferences?.map(vp => ({
        ...vp,
        venueId: new Types.ObjectId(vp.venueId),
        availableCourts: vp.availableCourts?.map(id => new Types.ObjectId(id)) || [],
        availableDates: vp.availableDates?.map(d => ({
          start: new Date(d.start),
          end: new Date(d.end)
        })) || [],
        nearestCourt: vp.nearestCourt ? new Types.ObjectId(vp.nearestCourt) : undefined,
      }) || [],
      courtRequirements: dto.courtRequirements?.map(cr => ({
        ...cr,
        minDimensions: cr.minDimensions,
        preferredDimensions: cr.preferredDimensions,
        equipmentRequirements: cr.equipmentRequirements?.map(er => ({
          ...er,
          lastInspection: er.lastInspection ? new Date(er.lastInspection) : undefined,
        })) || [],
      }) || [],
      scheduleWindow: {
        earliestStart: new Date(dto.scheduleWindow.earliestStart),
        latestEnd: new Date(dto.scheduleWindow.latestEnd),
        matchDuration: dto.scheduleWindow.matchDuration,
        breakBetweenMatches: dto.scheduleWindow.breakBetweenMatches,
        maxMatchesPerDay: dto.scheduleWindow.maxMatchesPerDay,
        preferredDaysOfWeek: dto.scheduleWindow.preferredDaysOfWeek,
        blackoutDates: dto.scheduleWindow.blackoutDates?.map(d => new Date(d)) || [],
        timeZone: dto.scheduleWindow.timeZone,
      },
      constraints: dto.constraints?.map(c => ({
        ...c,
        expression: c.expression,
        parameters: c.parameters,
        applicableEntities: c.applicableEntities,
        applicableStates: c.applicableStates,
      })) || [],
      metadata: dto.metadata || {},
      createdBy: new Types.ObjectId(dto.createdBy),
    }) as any;

    return tournament.save();
  }

  async findById(id: string): Promise<TournamentDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.tournamentModel.findById(id).exec();
  }

  async findByTournamentId(tournamentId: string): Promise<TournamentDocument | null> {
    return this.tournamentModel.findOne({ tournamentId }).exec();
  }

  async findByOrganization(organizationId: string, options?: QueryOptions): Promise<TournamentDocument[]> {
    const query: FilterQuery<TournamentDocument> = { organizationId: new Types.ObjectId(organizationId) };
    let queryBuilder = this.tournamentModel.find(query);

    if (options?.sortBy) {
      queryBuilder = queryBuilder.sort({ [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 });
    }
    if (options?.page && options?.limit) {
      queryBuilder = queryBuilder.skip((options.page - 1) * options.limit).limit(options.limit);
    }

    return queryBuilder.exec();
  }

  async search(searchDto: TournamentSearchDto): Promise<TournamentDocument[]> {
    const query: FilterQuery<TournamentDocument> = {};

    if (searchDto.organizationId) {
      query.organizationId = new Types.ObjectId(searchDto.organizationId);
    }
    if (searchDto.status) {
      query.status = searchDto.status;
    }
    if (searchDto.tournamentType) {
      query.tournamentType = searchDto.tournamentType;
    }
    if (searchDto.search) {
      query.$or = [
        { name: { $regex: searchDto.search, $options: 'i' } },
        { tournamentId: { $regex: searchDto.search, $options: 'i' } },
      ];
    }
    if (searchDto.venueType) {
      query.venuePreferences = { $elemMatch: { venueType: searchDto.venueType } };
    }

    let queryBuilder = this.tournamentModel.find(query);

    if (searchDto.sortBy) {
      queryBuilder = queryBuilder.sort({ [searchDto.sortBy]: searchDto.sortOrder === 'asc' ? 1 : -1 });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const page = searchDto.page || 1;
    const limit = Math.min(searchDto.limit || 20, 100);
    queryBuilder = queryBuilder.skip((searchDto.page - 1) * limit).limit(limit);

    return queryBuilder.exec();
  }

  async update(id: string, dto: UpdateTournamentDto): Promise<TournamentDocument | null> {
    const update: UpdateQuery<TournamentDocument> = { ...dto };
    
    if (dto.organizationId) {
      update.organizationId = new Types.ObjectId(dto.organizationId);
    }
    if (dto.participatingTeams) {
      update.participatingTeams = dto.participatingTeams.map(id => new Types.ObjectId(id));
    }
    if (dto.participatingOfficials) {
      update.participatingOfficials = dto.participatingOfficials.map(id => new Types.ObjectId(id));
    }
    if (dto.scheduleWindow) {
      update.scheduleWindow = {
        ...dto.scheduleWindow,
        earliestStart: new Date(dto.scheduleWindow.earliestStart),
        latestEnd: new Date(dto.scheduleWindow.latestEnd),
        blackoutDates: dto.scheduleWindow.blackoutDates?.map(d => new Date(d)) || [],
      };
    }
    if (dto.venuePreferences) {
      update.venuePreferences = dto.venuePreferences.map(vp => ({
        ...vp,
        venueId: new Types.ObjectId(vp.venueId),
        availableCourts: vp.availableCourts?.map(id => new Types.ObjectId(id)) || [],
        availableDates: vp.availableDates?.map(d => ({
          start: new Date(d.start),
          end: new Date(d.end)
        })) || [],
      });
    }
    if (dto.courtRequirements) {
      update.courtRequirements = dto.courtRequirements.map(cr => ({
        ...cr,
        equipmentRequirements: cr.equipmentRequirements?.map(er => ({
          ...er,
          lastInspection: er.lastInspection ? new Date(er.lastInspection) : undefined,
        })) || [],
      });
    }
    if (dto.scheduleWindow) {
      update.scheduleWindow = {
        ...dto.scheduleWindow,
        earliestStart: new Date(dto.scheduleWindow.earliestStart),
        latestEnd: new Date(dto.scheduleWindow.latestEnd),
        blackoutDates: dto.scheduleWindow.blackoutDates?.map(d => new Date(d)) || [],
      };
    }
    if (dto.constraints) {
      update.constraints = dto.constraints.map(c => ({
        ...c,
        expression: c.expression,
        parameters: c.parameters,
        applicableEntities: c.applicableEntities,
        applicableStates: c.applicableStates,
      }));
    }

    update.updatedAt = new Date();

    return this.tournamentModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id: string, status: string, userId: string): Promise<TournamentDocument | null> {
    const update: UpdateQuery<TournamentDocument> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'active') {
      (update as any).activatedAt = new Date();
      (update as any).activatedBy = new Types.ObjectId(id);
    } else if (status === 'archived') {
      (update as any).archivedAt = new Date();
      (update as any).archivedBy = new Types.ObjectId(id);
    } else if (status === 'cancelled') {
      (update as any).cancelledAt = new Date();
      (update as any).cancelledBy = new Types.ObjectId(id);
      (update as any).cancellationReason = ''; // Would need to be passed
    }

    return this.tournamentModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async addBracket(tournamentId: string, bracketId: Types.ObjectId): Promise<TournamentDocument | null> {
    return this.tournamentModel.findByIdAndUpdate(
      tournamentId,
      { $addToSet: { brackets: bracketId } },
      { new: true }
    ).exec();
  }

  async removeBracket(tournamentId: string, bracketId: Types.ObjectId): Promise<TournamentDocument | null> {
    return this.tournamentModel.findByIdAndUpdate(
      tournamentId,
      { $pull: { brackets: bracketId } },
      { new: true }
    ).exec();
  }

  async addContact(tournamentId: string, contact: any): Promise<TournamentDocument | null> {
    return this.tournamentModel.findByIdAndUpdate(
      tournamentId,
      { $push: { contacts: contact } },
      { new: true }
    ).exec();
  }

  async removeContact(tournamentId: string, contactIndex: number): Promise<TournamentDocument | null> {
    const tournament = await this.tournamentModel.findById(tournamentId);
    if (!tournament) return null;
    tournament.contacts.splice(contactIndex, 1);
    return tournament.save();
  }

  async getTournamentStats(tournamentId: string): Promise<any> {
    const tournament = await this.tournamentModel.findById(tournamentId).populate('brackets').exec();
    if (!tournament) return null;

    return {
      total: 1,
      byType: { [tournament.tournamentType]: 1 },
      byStatus: { [tournament.status]: 1 },
      active: tournament.status === 'active' ? 1 : 0,
      byVenueType: {},
      totalCapacity: tournament.venuePreferences.reduce((sum, vp) => sum + vp.capacity, 0),
    };
  }

  async findRequiringCertification(): Promise<TournamentDocument[]> {
    return this.tournamentModel.find({
      'metadata.certificationRequired': true,
      $or: [
        { certificationId: { $exists: false } },
        { certificationId: null },
      ],
    }).exec();
  }

  async findByVenue(venueId: string): Promise<TournamentDocument[]> {
    return this.tournamentModel.find({ 'venuePreferences.venueId': new Types.ObjectId(venueId) }).exec();
  }

  async findActiveByOrganization(organizationId: string): Promise<TournamentDocument[]> {
    return this.tournamentModel.find({
      organizationId: new Types.ObjectId(organizationId),
      status: { $in: ['draft', 'active', 'paused'] }
    }).sort({ createdAt: -1 }).exec();
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.tournamentModel.countDocuments({ organizationId: new Types.ObjectId(organizationId) }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tournamentModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async softDelete(id: string): Promise<TournamentDocument | null> {
    return this.tournamentModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true }).exec();
  }

  async findBySeason(season: string, organizationId?: string): Promise<TournamentDocument[]> {
    const query: any = { season };
    if (organizationId) {
      query.organizationId = new Types.ObjectId(organizationId);
    }
    return this.tournamentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async addBracket(tournamentId: string, bracketId: Types.ObjectId): Promise<any> {
    return this.tournamentModel.findByIdAndUpdate(
      tournamentId,
      { $addToSet: { brackets: bracketId } },
      { new: true }
    ).exec();
  }

  async removeBracket(tournamentId: string, bracketId: Types.ObjectId): Promise<any> {
    return this.tournamentModel.findByIdAndUpdate(
      tournamentId,
      { $pull: { brackets: bracketId } },
      { new: true }
    ).exec();
  }

  async getTournamentStats(organizationId: string): Promise<any> {
    const [total, byType, byStatus, active, byVenueType] = await Promise.all([
      this.tournamentModel.countDocuments({ organizationId: new Types.ObjectId(organizationId) }),
      this.tournamentModel.aggregate([
        { $match: { organizationId: new Types.ObjectId(organizationId) } },
        { $group: { _id: '$tournamentType', count: { $sum: 1 } } }
      ]),
      this.tournamentModel.aggregate([
        { $match: { organizationId: new Types.ObjectId(organizationId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.tournamentModel.countDocuments({ organizationId: new Types.ObjectId(organizationId), status: 'active' }),
      this.tournamentModel.aggregate([
        { $match: { organizationId: new Types.ObjectId(organizationId) } },
        { $group: { _id: '$venueType', count: { $sum: 1 } } }
      ]),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      active,
      byVenueType: byVenueType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    };
  }
}