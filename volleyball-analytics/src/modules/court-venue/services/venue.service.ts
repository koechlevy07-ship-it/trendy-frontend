import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Venue, IVenue, VenueType, VenueStatus } from '../schemas/venue.schema';
import { CreateVenueDto, UpdateVenueDto, ActivateVenueDto, SuspendVenueDto, VenueSearchDto } from '../dtos/venue.dto';
import { VenueRepository } from '../repositories/venue.repository';
import { BusinessValidator } from '../validators/business.validator';
import { ApiResponseBuilder } from '@shared/api-response';
import { createDomainEvent, eventPublisher } from '@shared/domain-events';

@Injectable()
export class VenueService {
  constructor(
    @InjectModel(Venue.name) private readonly venueModel: Model<IVenue>,
    private readonly venueRepository: VenueRepository,
    private readonly businessValidator: BusinessValidator,
  ) {}

  async createVenue(createVenueDto: CreateVenueDto, userId: string): Promise<IVenue> {
    await this.businessValidator.validateVenueUniqueness(createVenueDto.venueCode, createVenueDto.organizationId, createVenueDto.venueName);

    const venue = new this.venueModel({
      ...createVenueDto,
      organizationId: new Types.ObjectId(createVenueDto.organizationId),
      coordinates: { latitude: createVenueDto.latitude, longitude: createVenueDto.longitude },
      createdBy: new Types.ObjectId(userId),
    });

    const savedVenue = await venue.save();

    await this.publishEvent('VenueCreated', savedVenue._id.toString(), 'Venue', { venueId: savedVenue._id.toString(), venueCode: savedVenue.venueCode, venueName: savedVenue.venueName, organizationId: savedVenue.organizationId.toString(), venueType: savedVenue.venueType, status: savedVenue.status }, { userId });

    return savedVenue;
  }

  async getVenues(searchDto: VenueSearchDto): Promise<any> {
    const filter: any = {};
    if (searchDto.search) filter.$or = [{ venueName: { $regex: searchDto.search, $options: 'i' } }, { venueCode: { $regex: searchDto.search, $options: 'i' } }];
    if (searchDto.venueType) filter.venueType = searchDto.venueType;
    if (searchDto.status) filter.status = searchDto.status;
    if (searchDto.organizationId) filter.organizationId = new Types.ObjectId(searchDto.organizationId);
    if (searchDto.latitude && searchDto.longitude) { const maxDistance = searchDto.radiusKm ? searchDto.radiusKm * 1000 : 50000; filter.coordinates = { $near: { $geometry: { type: 'Point', coordinates: [searchDto.longitude, searchDto.latitude] }, $maxDistance: maxDistance } }; }

    const page = searchDto.page || 1; const limit = Math.min(searchDto.limit || 20, 100); const skip = (page - 1) * limit;
    const sort: any = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.venueModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.venueModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getVenueById(id: string): Promise<IVenue> { return this.venueRepository.findByIdOrThrow(id); }
  async getVenueByCode(venueCode: string): Promise<IVenue> { const venue = await this.venueRepository.findByVenueCode(venueCode); if (!venue) throw new NotFoundException('Venue not found'); return venue; }

  async updateVenue(id: string, updateVenueDto: UpdateVenueDto, userId: string): Promise<IVenue> {
    const venue = await this.venueRepository.findByIdOrThrow(id);
    if (updateVenueDto.venueName && updateVenueDto.venueName !== venue.venueName) {
      await this.businessValidator.validateVenueUniqueness(venue.venueCode, venue.organizationId.toString(), updateVenueDto.venueName, id);
    }
    const updatedVenue = await this.venueRepository.update(id, { ...updateVenueDto, updatedBy: new Types.ObjectId(userId) });
    await this.publishEvent('VenueUpdated', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), changes: updateVenueDto }, { userId });
    return updatedVenue;
  }

  async activateVenue(id: string, activateDto: ActivateVenueDto): Promise<IVenue> {
    const venue = await this.venueRepository.findByIdOrThrow(id);
    if (venue.status === VenueStatus.ACTIVE) throw new BadRequestException('Venue is already active');
    await this.businessValidator.validateVenueEligibility(id);
    const updatedVenue = await this.venueRepository.update(id, { status: VenueStatus.ACTIVE, activatedAt: new Date(), activatedBy: new Types.ObjectId(activateDto.activatedBy) });
    await this.publishEvent('VenueActivated', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, activatedBy: activateDto.activatedBy }, { userId: activateDto.activatedBy });
    return updatedVenue;
  }

  async suspendVenue(id: string, suspendDto: SuspendVenueDto): Promise<IVenue> {
    const venue = await this.venueRepository.findByIdOrThrow(id);
    if (venue.status === VenueStatus.SUSPENDED) throw new BadRequestException('Venue is already suspended');
    if (venue.status === VenueStatus.ARCHIVED) throw new BadRequestException('Cannot suspend an archived venue');
    const updatedVenue = await this.venueRepository.update(id, { status: VenueStatus.SUSPENDED, suspendedAt: new Date(), suspendedBy: new Types.ObjectId(suspendDto.suspendedBy), suspendedReason: suspendDto.reason });
    await this.publishEvent('VenueSuspended', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, suspendedBy: suspendDto.suspendedBy, reason: suspendDto.reason }, { userId: suspendDto.suspendedBy });
    return updatedVenue;
  }

  async archiveVenue(id: string, userId: string): Promise<IVenue> {
    const venue = await this.venueRepository.findByIdOrThrow(id);
    if (venue.status === VenueStatus.ARCHIVED) throw new BadRequestException('Venue is already archived');
    if (venue.status === VenueStatus.ACTIVE) throw new BadRequestException('Cannot archive an active venue. Suspend first.');
    const updatedVenue = await this.venueRepository.softDelete(id);
    await this.publishEvent('VenueArchived', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, archivedBy: userId }, { userId });
    return updatedVenue;
  }

  async restoreVenue(id: string, userId: string): Promise<IVenue> {
    const venue = await this.venueRepository.findByIdOrThrow(id);
    if (venue.status !== VenueStatus.ARCHIVED) throw new BadRequestException('Venue is not archived');
    const updatedVenue = await this.venueRepository.restore(id);
    await this.publishEvent('VenueRestored', updatedVenue._id.toString(), 'Venue', { venueId: updatedVenue._id.toString(), venueCode: updatedVenue.venueCode, restoredBy: userId }, { userId });
    return updatedVenue;
  }

  async deleteVenue(id: string): Promise<void> { const venue = await this.venueRepository.findByIdOrThrow(id); await this.venueRepository.delete(id); }

  async getVenuesByOrganization(organizationId: string, page = 1, limit = 20): Promise<any> { return this.venueRepository.find({ organizationId: new Types.ObjectId(organizationId) }, { page, limit }); }

  async getVenueStats(organizationId: string): Promise<any> { const [total, byType, byStatus, active] = await Promise.all([ this.venueModel.countDocuments({ organizationId: new Types.ObjectId(organizationId) }), this.venueModel.aggregate([{ $match: { organizationId: new Types.ObjectId(organizationId) } }, { $group: { _id: '$venueType', count: { $sum: 1 } } }]), this.venueModel.aggregate([{ $match: { organizationId: new Types.ObjectId(organizationId) } }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.venueModel.countDocuments({ organizationId: new Types.ObjectId(organizationId), status: VenueStatus.ACTIVE }), ]); return { total, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), active }; }

  private async publishEvent(eventType: string, aggregateId: string, aggregateType: string, payload: Record<string, unknown>, metadata: Record<string, unknown>): Promise<void> { const event = createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata); await eventPublisher.publish(event); }
}