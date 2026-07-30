import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Venue, VenueDocument, VenueType, VenueStatus, SurfaceType, CertificationStatus } from '../schemas/venue.schema';
import { CreateVenueDTO, UpdateVenueDTO, VenueSearchDTO, VenueResponseDTO, VenueSummaryDTO } from '../dto/venue.dto';
import { VenueValidator } from '../validators/venue.validator';

@Injectable()
export class VenueService {
  constructor(
    @InjectModel('Venue') private readonly venueModel: Model<VenueDocument>,
    private readonly venueValidator: VenueValidator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateVenueDTO, tenantId: string, createdBy: string): Promise<VenueResponseDTO> {
    await this.venueValidator.validateCreate(dto);

    const venue = new this.venueModel({
      ...dto,
      _id: new Types.ObjectId(),
      venueId: `vn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      status: VenueStatus.DRAFT,
      audit: {
        createdBy: new Types.ObjectId(createdBy),
        updatedBy: new Types.ObjectId(createdBy),
        version: 0,
      },
      archive: {
        isArchived: false,
      },
      metadata: {},
    });

    const saved = await venue.save();

    // Emit event
    this.eventEmitter.emit('venue.created', {
      venueId: saved.venueId,
      name: saved.identity.name,
      type: saved.identity.type,
      tenantId,
      createdBy,
    });

    return this.toResponseDTO(saved);
  }

  async findById(id: string): Promise<VenueResponseDTO> {
    const venue = await this.venueModel.findById(id).exec();
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }
    return this.toResponseDTO(venue);
  }

  async findByVenueId(venueId: string): Promise<VenueResponseDTO | null> {
    return this.venueModel.findOne({ venueId }).exec();
  }

  async findByCode(code: string): Promise<VenueResponseDTO | null> {
    return this.venueModel.findOne({ 'identity.shortName': code }).exec();
  }

  async findByRegistrationNumber(regNumber: string): Promise<VenueResponseDTO | null> {
    return this.venueModel.findOne({ 'registration.registrationNumber': regNumber }).exec();
  }

  async findByName(name: string, tenantId: string): Promise<VenueResponseDTO[]> {
    return this.venueModel
      .find({ 'identity.name': { $regex: name, $options: 'i' }, tenantId })
      .limit(100)
      .exec();
  }

  async search(filters: VenueSearchDTO): Promise<{ data: VenueResponseDTO[]; total: number; page: number; perPage: number; totalPages: number }> {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.type) {
      filter['identity.type'] = filters.type;
    }
    if (filters.status) {
      filter['operationalStatus.status'] = filters.status;
    }
    if (filters.tenantId) {
      filter.tenantId = filters.tenantId;
    }
    if (filters.organizationId) {
      filter['ownership.organizationId'] = new Types.ObjectId(filters.organizationId);
    }
    if (filters.parentOrganizationId) {
      filter['ownership.parentOrganizationId'] = new Types.ObjectId(filters.parentOrganizationId);
    }

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.venueModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.venueModel.countDocuments(filter).exec(),
    );

    return {
      data: data.map(d => this.toResponseDTO(d)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async update(id: string, dto: UpdateVenueDTO, updatedBy: string): Promise<VenueResponseDTO> {
    await this.venueValidator.validateUpdate(id, dto);

    const updated = await this.venueModel
      .findByIdAndUpdate(id, { ...dto, 'audit.updatedBy': new Types.ObjectId(updatedBy), $inc: { 'audit.version': 1 } }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    this.eventEmitter.emit('venue.updated', {
      venueId: updated.venueId,
      changes: dto,
      updatedBy,
    });

    return this.toResponseDTO(updated);
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<void> {
    const venue = await this.venueModel.findById(id).exec();
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    if (venue.archive.isArchived) {
      throw new ConflictException('Venue is already archived');
    }

    venue.archive = {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: new Types.ObjectId(archivedBy),
      archiveReason: reason,
      snapshot: venue.toObject(),
    };
    venue.operationalStatus.status = VenueStatus.ARCHIVED;
    venue.updatedAt = new Date();
    venue.audit.updatedBy = new Types.ObjectId(archivedBy);
    venue.audit.version += 1;

    await venue.save();

    this.eventEmitter.emit('venue.archived', {
      venueId: venue.venueId,
      archivedBy,
      reason,
    });
  }

  async restore(id: string, restoredBy: string): Promise<VenueResponseDTO> {
    const venue = await this.venueModel.findById(id).exec();
    if (!venue) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    if (!venue.archive.isArchived) {
      throw new ConflictException('Venue is not archived');
    }

    venue.archive = {
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      snapshot: null,
    };
    venue.operationalStatus.status = VenueStatus.DRAFT;
    venue.updatedAt = new Date();
    venue.audit.updatedBy = new Types.ObjectId(restoredBy);
    venue.audit.version += 1;

    await venue.save();

    this.eventEmitter.emit('venue.restored', {
      venueId: venue.venueId,
      restoredBy,
    });

    return this.toResponseDTO(venue);
  }

  async addParticipant(venueId: string, teamId: string): Promise<VenueResponseDTO> {
    const updated = await this.venueModel.findByIdAndUpdate(
      venueId,
      { $addToSet: { participantIds: new Types.ObjectId(teamId) }, $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Venue with ID ${venueId} not found`);
    }

    return this.toResponseDTO(updated);
  }

  async removeParticipant(venueId: string, teamId: string): Promise<VenueResponseDTO> {
    const updated = await this.venueModel.findByIdAndUpdate(
      venueId,
      { $pull: { participantIds: new Types.ObjectId(teamId) }, $inc: { 'audit.version': 1 } },
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Venue with ID ${venueId} not found`);
    }

    return this.toResponseDTO(updated);
  }

  async getStatistics(tenantId: string): Promise<any> {
    const [total, byType, byStatus] = await Promise.all([
      this.venueModel.countDocuments({ tenantId }).exec(),
      this.venueModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$identity.type', count: { $sum: 1 } } },
      ]).exec(),
      this.venueModel.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$operationalStatus.status', count: { $sum: 1 } } },
      ]).exec(),
    );

    const typeMap = byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const statusMap = byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalVenues: total,
      byType: typeMap,
      byStatus: statusMap,
      totalTeams: 0, // Would need TeamRepository
      totalFacilities: 0, // Would need FacilityRepository
    };
  }

  private toResponseDTO(venue: VenueDocument): VenueResponseDTO {
    return {
      id: venue._id.toString(),
      venueId: venue.venueId,
      name: venue.identity.name,
      shortName: venue.identity.shortName,
      displayName: venue.identity.displayName,
      type: venue.identity.type,
      status: venue.operationalStatus.status,
      organizationId: venue.ownership.organizationId.toString(),
      address: venue.address,
      coordinates: venue.coordinates,
      capacity: venue.capacity,
      courtIds: venue.courtIds?.map(id => id.toString()) || [],
      facilityIds: venue.facilityIds?.map(id => id.toString()) || [],
      documentIds: venue.documentIds?.map(id => id.toString()) || [],
      licenseIds: venue.licenseIds?.map(id => id.toString()) || [],
      competitionMembershipIds: venue.competitionMembershipIds?.map(id => id.toString()) || [],
      staffIds: venue.staffIds?.map(id => id.toString()) || [],
      playerIds: venue.playerIds?.map(id => id.toString()) || [],
      tenantId: venue.tenantId,
      dataRegion: venue.dataRegion,
      version: venue.audit.version,
      isDeleted: venue.isDeleted,
      deletedAt: venue.deletedAt,
      deletedBy: venue.deletedBy?.toString(),
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      createdBy: venue.audit.createdBy?.toString(),
      updatedBy: venue.audit.updatedBy?.toString(),
    };
  }
}