import { Injectable, BadRequestException, NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Court, ICourt, CourtType, CourtStatus, MaintenanceStatus, CourtOrientation } from '../schemas/court.schema';
import { Venue, IVenue } from '../schemas/venue.schema';
import { Camera, ICamera } from '../schemas/camera.schema';
import { CalibrationProfile, ICalibrationProfile } from '../schemas/calibration.schema';
import { CoverageZone, ICoverageZone } from '../schemas/coverage-zone.schema';
import { createDomainEvent, eventPublisher } from '@shared/domain-events';

@Injectable()
export class CourtService {
  constructor(
    @InjectModel(Court.name) private courtModel: Model<ICourt>,
    @InjectModel(Venue.name) private venueModel: Model<IVenue>,
    @InjectModel(Camera.name) private cameraModel: Model<ICamera>,
    @InjectModel(CalibrationProfile.name) private calibrationModel: Model<ICalibrationProfile>,
    @InjectModel(CoverageZone.name) private coverageZoneModel: Model<ICoverageZone>,
  ) {}

  async createCourt(dto: CreateCourtDto): Promise<ICourt> {
    const venue = await this.venueModel.findById(dto.venueId);
    if (!venue) throw new NotFoundException('Venue not found');
    if (venue.status !== 'active') throw new BadRequestException('Cannot create court in inactive venue');

    const existingCode = await this.courtModel.findOne({ venueId: dto.venueId, courtCode: dto.courtCode.toUpperCase() });
    if (existingCode) throw new ConflictException('Court code already exists in this venue');

    const court = new this.courtModel({
      ...dto, venueId: new Types.ObjectId(dto.venueId), courtCode: dto.courtCode.toUpperCase(),
      status: CourtStatus.DRAFT, maintenanceStatus: MaintenanceStatus.NONE,
      aiConfiguration: { ...dto.aiConfiguration, cameraProfileId: dto.aiConfiguration.cameraProfileId ? new Types.ObjectId(dto.aiConfiguration.cameraProfileId) : undefined, calibrationProfileId: dto.aiConfiguration.calibrationProfileId ? new Types.ObjectId(dto.aiConfiguration.calibrationProfileId) : undefined },
      assignedCameraIds: dto.assignedCameraIds?.map(id => new Types.ObjectId(id)) || [],
    });

    await court.save();

    await this.publishEvent('CourtCreated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, venueId: court.venueId.toString(), courtType: court.courtType, surfaceType: court.surfaceType }, { userId: dto.createdBy });

    return court;
  }

  async getCourtById(id: string): Promise<ICourt> { const court = await this.courtModel.findById(id).populate('venueId').populate('assignedCameraIds').populate('activeCalibrationId').exec(); if (!court) throw new NotFoundException('Court not found'); return court; }

  async updateCourt(id: string, dto: UpdateCourtDto): Promise<ICourt> {
    const court = await this.courtModel.findById(id);
    if (!court) throw new NotFoundException('Court not found');
    if (dto.availability !== undefined) court.availability = dto.availability;
    if (dto.maintenanceStatus !== undefined) { court.maintenanceStatus = dto.maintenanceStatus; if (dto.maintenanceStatus === MaintenanceStatus.IN_PROGRESS) court.status = CourtStatus.MAINTENANCE; }
    if (dto.equipment) court.equipment = dto.equipment;
    if (dto.cameraProfile) court.aiConfiguration.cameraProfileId = new Types.ObjectId(dto.cameraProfile);
    if (dto.calibrationProfile) court.aiConfiguration.calibrationProfileId = new Types.ObjectId(dto.calibrationProfile);
    if (dto.metadata) court.metadata = { ...court.metadata, ...dto.metadata };
    await court.save();
    await this.publishEvent('CourtUpdated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, updatedFields: Object.keys(dto) }, {});
    return court;
  }

  async activateCourt(id: string, activatedBy: string): Promise<ICourt> {
    const court = await this.courtModel.findById(id);
    if (!court) throw new NotFoundException('Court not found');
    if (court.status === CourtStatus.ACTIVE) throw new BadRequestException('Court is already active');
    if (court.maintenanceStatus === MaintenanceStatus.IN_PROGRESS) throw new BadRequestException('Cannot activate court under maintenance');
    const venue = await this.venueModel.findById(court.venueId);
    if (venue?.status !== 'active') throw new BadRequestException('Cannot activate court in inactive venue');
    court.status = CourtStatus.ACTIVE; court.activatedAt = new Date(); court.activatedBy = new Types.ObjectId(activatedBy);
    await court.save();
    await this.publishEvent('CourtActivated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, venueId: court.venueId.toString(), activatedBy }, { userId: activatedBy });
    return court;
  }

  async setMaintenance(id: string, dto: SetMaintenanceDto): Promise<ICourt> {
    const court = await this.courtModel.findById(id);
    if (!court) throw new NotFoundException('Court not found');
    if (dto.isUnderMaintenance) {
      if (court.status === CourtStatus.ACTIVE) throw new BadRequestException('Cannot set maintenance on active court. Deactivate first.');
      court.status = CourtStatus.MAINTENANCE; court.maintenanceStatus = MaintenanceStatus.IN_PROGRESS; court.maintenanceStatus.maintenanceStartDate = dto.maintenanceStartDate || new Date(); court.maintenanceStatus.maintenanceReason = dto.maintenanceReason; court.maintenanceStatus.scheduledMaintenance = dto.scheduledMaintenance || [];
    } else {
      court.maintenanceStatus = { isUnderMaintenance: false, maintenanceCompletedAt: new Date() }; court.status = CourtStatus.DRAFT;
    }
    await court.save();
    await this.publishEvent(dto.isUnderMaintenance ? 'CourtMaintenanceStarted' : 'CourtMaintenanceCompleted', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, isUnderMaintenance: dto.isUnderMaintenance }, {});
    return court;
  }

  async assignCamera(id: string, cameraId: string): Promise<ICourt> {
    const court = await this.courtModel.findById(id); if (!court) throw new NotFoundException('Court not found');
    const camera = await this.cameraModel.findById(cameraId); if (!camera) throw new NotFoundException('Camera not found');
    if (camera.courtId && camera.courtId.toString() !== id) throw new BadRequestException('Camera already assigned to another court');
    if (!court.assignedCameraIds.some(c => c.toString() === cameraId)) { court.assignedCameraIds.push(new Types.ObjectId(cameraId)); await court.save(); }
    camera.courtId = new Types.ObjectId(id); await camera.save();
    await this.publishEvent('CameraAssignedToCourt', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, cameraId }, {});
    return court;
  }

  async removeCamera(id: string, cameraId: string): Promise<ICourt> {
    const court = await this.courtModel.findById(id); if (!court) throw new NotFoundException('Court not found');
    court.assignedCameraIds = court.assignedCameraIds.filter(c => c.toString() !== cameraId); await court.save();
    await this.cameraModel.findByIdAndUpdate(cameraId, { courtId: null }).exec();
    await this.publishEvent('CameraRemovedFromCourt', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, cameraId }, {});
    return court;
  }

  async getCourts(searchDto: CourtSearchDto): Promise<any> {
    const filter: any = {};
    if (searchDto.search) filter.$or = [{ courtName: { $regex: searchDto.search, $options: 'i' } }, { courtCode: { $regex: searchDto.search, $options: 'i' } }];
    if (searchDto.venueId) filter.venueId = new Types.ObjectId(searchDto.venueId);
    if (searchDto.courtType) filter.courtType = searchDto.courtType;
    if (searchDto.surfaceType) filter.surfaceType = searchDto.surfaceType;
    if (searchDto.status) filter.status = searchDto.status;
    if (searchDto.maintenanceStatus) filter.maintenanceStatus = searchDto.maintenanceStatus;
    const page = searchDto.page || 1; const limit = Math.min(searchDto.limit || 20, 100); const skip = (page - 1) * limit;
    const sort: any = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
    const [data, total] = await Promise.all([ this.courtModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.courtModel.countDocuments(filter).exec() ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCourtsByVenue(venueId: string, page = 1, limit = 20): Promise<any> { return this.courtModel.paginate({ venueId: new Types.ObjectId(venueId) }, { page, limit }); }

  async archiveCourt(id: string, userId: string): Promise<ICourt> {
    const court = await this.courtModel.findById(id); if (!court) throw new NotFoundException('Court not found');
    if (court.status === CourtStatus.ACTIVE) throw new BadRequestException('Cannot archive active court. Deactivate first.');
    court.status = CourtStatus.ARCHIVED; court.archivedAt = new Date(); court.archivedBy = new Types.ObjectId(userId); await court.save();
    await this.publishEvent('CourtArchived', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, archivedBy: userId }, { userId });
    return court;
  }

  async restoreCourt(id: string, userId: string): Promise<ICourt> {
    const court = await this.courtModel.findById(id); if (!court) throw new NotFoundException('Court not found');
    if (court.status !== CourtStatus.ARCHIVED) throw new BadRequestException('Court is not archived');
    court.status = CourtStatus.DRAFT; court.archivedAt = undefined; court.archivedBy = undefined; await court.save();
    await this.publishEvent('CourtRestored', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, restoredBy: userId }, { userId });
    return court;
  }

  async deleteCourt(id: string): Promise<void> { await this.courtModel.findByIdAndDelete(id).exec(); }

  async getCourtStats(venueId?: string): Promise<any> {
    const match = venueId ? { venueId: new Types.ObjectId(venueId) } : {};
    const [total, byType, byStatus, byMaintenance] = await Promise.all([ this.courtModel.countDocuments(match), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$courtType', count: { $sum: 1 } } }]), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$maintenanceStatus', count: { $sum: 1 } } }]), ]);
    return { total, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byMaintenance: byMaintenance.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}) };
  }

  private async publishEvent(eventType: string, aggregateId: string, aggregateType: string, payload: Record<string, unknown>, metadata: Record<string, unknown>): Promise<void> { const event = createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata); await eventPublisher.publish(event); }
}

export interface CreateCourtDto {
  venueId: string; courtCode: string; courtName: string; courtType: string; surfaceType: string;
  dimensions: { length: number; width: number; freeZoneLength: number; freeZoneWidth: number; ceilingHeight?: number; netHeight: number; attackLineDistance: number; serviceZoneWidth: number; };
  orientation: string; equipment: { netSystem: string; posts: string; antennas: string; scoreboard: string; refereeStand: string; lighting: string; flooring: string; };
  aiConfiguration: { cameraProfileId?: string; calibrationProfileId?: string; trackingEnabled: boolean; actionRecognitionEnabled: boolean; poseEstimationEnabled: boolean; ballTrackingEnabled: boolean; jerseyDetectionEnabled: boolean; customModelConfig?: Record<string, unknown>; };
  assignedCameraIds?: string[]; metadata?: Record<string, unknown>; createdBy: string;
}
export interface UpdateCourtDto { availability?: boolean; maintenanceStatus?: MaintenanceStatus; equipment?: any; cameraProfile?: string; calibrationProfile?: string; metadata?: Record<string, unknown>; }
export interface SetMaintenanceDto { isUnderMaintenance: boolean; maintenanceStartDate?: Date; maintenanceEndDate?: Date; maintenanceReason?: string; scheduledMaintenance?: Date[]; }
export interface CourtSearchDto { search?: string; venueId?: string; courtType?: string; surfaceType?: string; status?: string; maintenanceStatus?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; }