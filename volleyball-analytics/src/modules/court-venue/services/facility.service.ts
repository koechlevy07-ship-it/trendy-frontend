import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Facility, IFacility, FacilityType, FacilityStatus } from '../schemas/facility.schema';
import { Equipment, IEquipment } from '../schemas/equipment.schema';
import { createDomainEvent, eventPublisher } from '@shared/domain-events';

@Injectable()
export class FacilityService {
  constructor(
    @InjectModel(Facility.name) private facilityModel: Model<IFacility>,
    @InjectModel(Equipment.name) private equipmentModel: Model<IEquipment>,
  ) {}

  async createFacility(dto: CreateFacilityDto): Promise<IFacility> {
    const existingCode = await this.facilityModel.findOne({ venueId: dto.venueId, facilityCode: dto.facilityCode.toUpperCase() });
    if (existingCode) throw new ConflictException('Facility code already exists in this venue');

    const facility = new this.facilityModel({ ...dto, venueId: new Types.ObjectId(dto.venueId), facilityCode: dto.facilityCode.toUpperCase(), status: FacilityStatus.AVAILABLE, utilizationMetrics: { totalBookings: 0, totalHoursUsed: 0, averageOccupancyRate: 0, peakUsageHours: [], lastUpdated: new Date() } });
    await facility.save();
    await this.publishEvent('FacilityCreated', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, venueId: facility.venueId.toString(), facilityType: facility.facilityType }, { userId: dto.createdBy });
    return facility;
  }

  async getFacilityById(id: string): Promise<IFacility> {
    const facility = await this.facilityModel.findById(id).populate('venueId').populate('assignedEquipment').exec();
    if (!facility) throw new NotFoundException('Facility not found');
    return facility;
  }

  async getFacilitiesByVenue(venueId: string, page = 1, limit = 20): Promise<any> { return this.facilityModel.paginate({ venueId: new Types.ObjectId(venueId) }, { page, limit }); }
  async updateFacility(id: string, dto: UpdateFacilityDto): Promise<IFacility> {
    const facility = await this.facilityModel.findById(id);
    if (!facility) throw new NotFoundException('Facility not found');
    Object.keys(dto).forEach(key => { if (dto[key] !== undefined) (facility as any)[key] = dto[key]; });
    await facility.save();
    await this.publishEvent('FacilityUpdated', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, updatedFields: Object.keys(dto) }, {});
    return facility;
  }

  async updateStatus(id: string, status: FacilityStatus): Promise<IFacility> {
    const facility = await this.facilityModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!facility) throw new NotFoundException('Facility not found');
    await this.publishEvent('FacilityStatusChanged', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, newStatus: status }, {});
    return facility;
  }

  async assignEquipment(id: string, equipmentId: string): Promise<IFacility> {
    const facility = await this.facilityModel.findById(id); if (!facility) throw new NotFoundException('Facility not found');
    const equipment = await this.equipmentModel.findById(equipmentId); if (!equipment) throw new NotFoundException('Equipment not found');
    if (!facility.assignedEquipment.some(e => e.toString() === equipmentId)) { facility.assignedEquipment.push(new Types.ObjectId(equipmentId)); await facility.save(); }
    equipment.facilityId = new Types.ObjectId(id); await equipment.save();
    return facility;
  }

  async removeEquipment(id: string, equipmentId: string): Promise<IFacility> {
    const facility = await this.facilityModel.findById(id); if (!facility) throw new NotFoundException('Facility not found');
    facility.assignedEquipment = facility.assignedEquipment.filter(e => e.toString() !== equipmentId); await facility.save();
    await this.equipmentModel.findByIdAndUpdate(equipmentId, { facilityId: null }).exec();
    return facility;
  }

  async updateUtilization(id: string, hoursUsed: number): Promise<IFacility> { return this.facilityModel.findByIdAndUpdate(id, { $inc: { 'utilizationMetrics.totalBookings': 1, 'utilizationMetrics.totalHoursUsed': hoursUsed }, $set: { 'utilizationMetrics.lastUpdated': new Date() } }, { new: true }).exec(); }
  async updateMaintenanceSchedule(id: string, lastMaintenance: Date, nextMaintenance: Date): Promise<IFacility> { return this.facilityModel.findByIdAndUpdate(id, { 'maintenanceSchedule.lastMaintenance': lastMaintenance, 'maintenanceSchedule.nextMaintenance': nextMaintenance }, { new: true }).exec(); }
  async updateCleaningSchedule(id: string, lastCleaning: Date, nextCleaning: Date): Promise<IFacility> { return this.facilityModel.findByIdAndUpdate(id, { 'cleaningSchedule.lastCleaning': lastCleaning, 'cleaningSchedule.nextCleaning': nextCleaning }, { new: true }).exec(); }
  async getFacilityStats(venueId: string): Promise<any> { return this.facilityModel.getFacilityStats(venueId); }
  async decommissionFacility(id: string, reason: string): Promise<IFacility> {
    const facility = await this.facilityModel.findByIdAndUpdate(id, { status: FacilityStatus.DECOMMISSIONED, decommissionedAt: new Date(), decommissionedReason: reason }, { new: true }).exec();
    if (!facility) throw new NotFoundException('Facility not found');
    await this.publishEvent('FacilityDecommissioned', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, reason }, {});
    return facility;
  }

  private async publishEvent(eventType: string, aggregateId: string, aggregateType: string, payload: any, metadata: any): Promise<void> { const event = createDomainEvent(eventType, aggregateId, aggregateType, payload, metadata); await eventPublisher.publish(event); }
}

export interface CreateFacilityDto { venueId: string; facilityCode: string; name: string; facilityType: FacilityType; description?: string; location: { floor: string; section: string; roomNumber: string; coordinates?: { x: number; y: number; z: number }; nearestCourt?: string; }; capacity: { seated: number; standing: number; wheelchairAccessible: number; maxOccupancy: number; }; dimensions: { length: number; width: number; height: number; area: number; volume: number; }; features: { hasHVAC: boolean; hasWiFi: boolean; hasPowerOutlets: boolean; hasWaterSupply: boolean; hasDrainage: boolean; hasNaturalLight: boolean; hasEmergencyLighting: boolean; hasFireExtinguisher: boolean; hasFirstAidKit: boolean; hasSecurityCamera: boolean; hasAccessControl: boolean; isWheelchairAccessible: boolean; hasAudioSystem: boolean; hasVideoDisplay: boolean; hasClimateControl: boolean; customFeatures: Record<string, unknown>; }; maintenanceSchedule: { frequency: 'daily'|'weekly'|'monthly'|'quarterly'|'annually'|'as_needed'; lastMaintenance?: Date; nextMaintenance?: Date; maintenanceTasks: string[]; }; cleaningSchedule: { frequency: 'daily'|'weekly'|'monthly'|'after_each_use'|'as_needed'; lastCleaning?: Date; nextCleaning?: Date; cleaningProtocol: string; }; accessControl: { requiredAccessLevel: string[]; requiresKeyCard: boolean; requiresBiometric: boolean; accessHours: { start: string; end: string }[]; }; metadata?: Record<string, unknown>; createdBy: string; }
export interface UpdateFacilityDto { name?: string; description?: string; location?: any; capacity?: any; features?: any; status?: FacilityStatus; assignedEquipment?: string[]; maintenanceSchedule?: any; cleaningSchedule?: any; accessControl?: any; metadata?: Record<string, unknown>; }