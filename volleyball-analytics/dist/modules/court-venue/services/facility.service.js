"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const facility_schema_1 = require("../schemas/facility.schema");
const equipment_schema_1 = require("../schemas/equipment.schema");
const domain_events_1 = require("@shared/domain-events");
let FacilityService = class FacilityService {
    constructor(facilityModel, equipmentModel) {
        this.facilityModel = facilityModel;
        this.equipmentModel = equipmentModel;
    }
    async createFacility(dto) {
        const existingCode = await this.facilityModel.findOne({ venueId: dto.venueId, facilityCode: dto.facilityCode.toUpperCase() });
        if (existingCode)
            throw new common_1.ConflictException('Facility code already exists in this venue');
        const facility = new this.facilityModel({ ...dto, venueId: new mongoose_2.Types.ObjectId(dto.venueId), facilityCode: dto.facilityCode.toUpperCase(), status: facility_schema_1.FacilityStatus.AVAILABLE, utilizationMetrics: { totalBookings: 0, totalHoursUsed: 0, averageOccupancyRate: 0, peakUsageHours: [], lastUpdated: new Date() } });
        await facility.save();
        await this.publishEvent('FacilityCreated', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, venueId: facility.venueId.toString(), facilityType: facility.facilityType }, { userId: dto.createdBy });
        return facility;
    }
    async getFacilityById(id) {
        const facility = await this.facilityModel.findById(id).populate('venueId').populate('assignedEquipment').exec();
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        return facility;
    }
    async getFacilitiesByVenue(venueId, page = 1, limit = 20) { return this.facilityModel.paginate({ venueId: new mongoose_2.Types.ObjectId(venueId) }, { page, limit }); }
    async updateFacility(id, dto) {
        const facility = await this.facilityModel.findById(id);
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        Object.keys(dto).forEach(key => { if (dto[key] !== undefined)
            facility[key] = dto[key]; });
        await facility.save();
        await this.publishEvent('FacilityUpdated', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, updatedFields: Object.keys(dto) }, {});
        return facility;
    }
    async updateStatus(id, status) {
        const facility = await this.facilityModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        await this.publishEvent('FacilityStatusChanged', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, newStatus: status }, {});
        return facility;
    }
    async assignEquipment(id, equipmentId) {
        const facility = await this.facilityModel.findById(id);
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        const equipment = await this.equipmentModel.findById(equipmentId);
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        if (!facility.assignedEquipment.some(e => e.toString() === equipmentId)) {
            facility.assignedEquipment.push(new mongoose_2.Types.ObjectId(equipmentId));
            await facility.save();
        }
        equipment.facilityId = new mongoose_2.Types.ObjectId(id);
        await equipment.save();
        return facility;
    }
    async removeEquipment(id, equipmentId) {
        const facility = await this.facilityModel.findById(id);
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        facility.assignedEquipment = facility.assignedEquipment.filter(e => e.toString() !== equipmentId);
        await facility.save();
        await this.equipmentModel.findByIdAndUpdate(equipmentId, { facilityId: null }).exec();
        return facility;
    }
    async updateUtilization(id, hoursUsed) { return this.facilityModel.findByIdAndUpdate(id, { $inc: { 'utilizationMetrics.totalBookings': 1, 'utilizationMetrics.totalHoursUsed': hoursUsed }, $set: { 'utilizationMetrics.lastUpdated': new Date() } }, { new: true }).exec(); }
    async updateMaintenanceSchedule(id, lastMaintenance, nextMaintenance) { return this.facilityModel.findByIdAndUpdate(id, { 'maintenanceSchedule.lastMaintenance': lastMaintenance, 'maintenanceSchedule.nextMaintenance': nextMaintenance }, { new: true }).exec(); }
    async updateCleaningSchedule(id, lastCleaning, nextCleaning) { return this.facilityModel.findByIdAndUpdate(id, { 'cleaningSchedule.lastCleaning': lastCleaning, 'cleaningSchedule.nextCleaning': nextCleaning }, { new: true }).exec(); }
    async getFacilityStats(venueId) { return this.facilityModel.getFacilityStats(venueId); }
    async decommissionFacility(id, reason) {
        const facility = await this.facilityModel.findByIdAndUpdate(id, { status: facility_schema_1.FacilityStatus.DECOMMISSIONED, decommissionedAt: new Date(), decommissionedReason: reason }, { new: true }).exec();
        if (!facility)
            throw new common_1.NotFoundException('Facility not found');
        await this.publishEvent('FacilityDecommissioned', facility._id.toString(), 'Facility', { facilityId: facility._id.toString(), facilityCode: facility.facilityCode, reason }, {});
        return facility;
    }
    async publishEvent(eventType, aggregateId, aggregateType, payload, metadata) { const event = (0, domain_events_1.createDomainEvent)(eventType, aggregateId, aggregateType, payload, metadata); await domain_events_1.eventPublisher.publish(event); }
};
exports.FacilityService = FacilityService;
exports.FacilityService = FacilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(facility_schema_1.Facility.name)),
    __param(1, (0, mongoose_1.InjectModel)(equipment_schema_1.Equipment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FacilityService);
//# sourceMappingURL=facility.service.js.map