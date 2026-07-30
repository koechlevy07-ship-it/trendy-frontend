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
exports.CourtService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const court_schema_1 = require("../schemas/court.schema");
const venue_schema_1 = require("../schemas/venue.schema");
const camera_schema_1 = require("../schemas/camera.schema");
const calibration_schema_1 = require("../schemas/calibration.schema");
const coverage_zone_schema_1 = require("../schemas/coverage-zone.schema");
const domain_events_1 = require("@shared/domain-events");
let CourtService = class CourtService {
    constructor(courtModel, venueModel, cameraModel, calibrationModel, coverageZoneModel) {
        this.courtModel = courtModel;
        this.venueModel = venueModel;
        this.cameraModel = cameraModel;
        this.calibrationModel = calibrationModel;
        this.coverageZoneModel = coverageZoneModel;
    }
    async createCourt(dto) {
        const venue = await this.venueModel.findById(dto.venueId);
        if (!venue)
            throw new common_1.NotFoundException('Venue not found');
        if (venue.status !== 'active')
            throw new common_1.BadRequestException('Cannot create court in inactive venue');
        const existingCode = await this.courtModel.findOne({ venueId: dto.venueId, courtCode: dto.courtCode.toUpperCase() });
        if (existingCode)
            throw new common_1.ConflictException('Court code already exists in this venue');
        const court = new this.courtModel({
            ...dto, venueId: new mongoose_2.Types.ObjectId(dto.venueId), courtCode: dto.courtCode.toUpperCase(),
            status: court_schema_1.CourtStatus.DRAFT, maintenanceStatus: court_schema_1.MaintenanceStatus.NONE,
            aiConfiguration: { ...dto.aiConfiguration, cameraProfileId: dto.aiConfiguration.cameraProfileId ? new mongoose_2.Types.ObjectId(dto.aiConfiguration.cameraProfileId) : undefined, calibrationProfileId: dto.aiConfiguration.calibrationProfileId ? new mongoose_2.Types.ObjectId(dto.aiConfiguration.calibrationProfileId) : undefined },
            assignedCameraIds: dto.assignedCameraIds?.map(id => new mongoose_2.Types.ObjectId(id)) || [],
        });
        await court.save();
        await this.publishEvent('CourtCreated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, venueId: court.venueId.toString(), courtType: court.courtType, surfaceType: court.surfaceType }, { userId: dto.createdBy });
        return court;
    }
    async getCourtById(id) { const court = await this.courtModel.findById(id).populate('venueId').populate('assignedCameraIds').populate('activeCalibrationId').exec(); if (!court)
        throw new common_1.NotFoundException('Court not found'); return court; }
    async updateCourt(id, dto) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        if (dto.availability !== undefined)
            court.availability = dto.availability;
        if (dto.maintenanceStatus !== undefined) {
            court.maintenanceStatus = dto.maintenanceStatus;
            if (dto.maintenanceStatus === court_schema_1.MaintenanceStatus.IN_PROGRESS)
                court.status = court_schema_1.CourtStatus.MAINTENANCE;
        }
        if (dto.equipment)
            court.equipment = dto.equipment;
        if (dto.cameraProfile)
            court.aiConfiguration.cameraProfileId = new mongoose_2.Types.ObjectId(dto.cameraProfile);
        if (dto.calibrationProfile)
            court.aiConfiguration.calibrationProfileId = new mongoose_2.Types.ObjectId(dto.calibrationProfile);
        if (dto.metadata)
            court.metadata = { ...court.metadata, ...dto.metadata };
        await court.save();
        await this.publishEvent('CourtUpdated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, updatedFields: Object.keys(dto) }, {});
        return court;
    }
    async activateCourt(id, activatedBy) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        if (court.status === court_schema_1.CourtStatus.ACTIVE)
            throw new common_1.BadRequestException('Court is already active');
        if (court.maintenanceStatus === court_schema_1.MaintenanceStatus.IN_PROGRESS)
            throw new common_1.BadRequestException('Cannot activate court under maintenance');
        const venue = await this.venueModel.findById(court.venueId);
        if (venue?.status !== 'active')
            throw new common_1.BadRequestException('Cannot activate court in inactive venue');
        court.status = court_schema_1.CourtStatus.ACTIVE;
        court.activatedAt = new Date();
        court.activatedBy = new mongoose_2.Types.ObjectId(activatedBy);
        await court.save();
        await this.publishEvent('CourtActivated', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, venueId: court.venueId.toString(), activatedBy }, { userId: activatedBy });
        return court;
    }
    async setMaintenance(id, dto) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        if (dto.isUnderMaintenance) {
            if (court.status === court_schema_1.CourtStatus.ACTIVE)
                throw new common_1.BadRequestException('Cannot set maintenance on active court. Deactivate first.');
            court.status = court_schema_1.CourtStatus.MAINTENANCE;
            court.maintenanceStatus = court_schema_1.MaintenanceStatus.IN_PROGRESS;
            court.maintenanceStatus.maintenanceStartDate = dto.maintenanceStartDate || new Date();
            court.maintenanceStatus.maintenanceReason = dto.maintenanceReason;
            court.maintenanceStatus.scheduledMaintenance = dto.scheduledMaintenance || [];
        }
        else {
            court.maintenanceStatus = { isUnderMaintenance: false, maintenanceCompletedAt: new Date() };
            court.status = court_schema_1.CourtStatus.DRAFT;
        }
        await court.save();
        await this.publishEvent(dto.isUnderMaintenance ? 'CourtMaintenanceStarted' : 'CourtMaintenanceCompleted', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, isUnderMaintenance: dto.isUnderMaintenance }, {});
        return court;
    }
    async assignCamera(id, cameraId) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        const camera = await this.cameraModel.findById(cameraId);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        if (camera.courtId && camera.courtId.toString() !== id)
            throw new common_1.BadRequestException('Camera already assigned to another court');
        if (!court.assignedCameraIds.some(c => c.toString() === cameraId)) {
            court.assignedCameraIds.push(new mongoose_2.Types.ObjectId(cameraId));
            await court.save();
        }
        camera.courtId = new mongoose_2.Types.ObjectId(id);
        await camera.save();
        await this.publishEvent('CameraAssignedToCourt', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, cameraId }, {});
        return court;
    }
    async removeCamera(id, cameraId) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        court.assignedCameraIds = court.assignedCameraIds.filter(c => c.toString() !== cameraId);
        await court.save();
        await this.cameraModel.findByIdAndUpdate(cameraId, { courtId: null }).exec();
        await this.publishEvent('CameraRemovedFromCourt', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, cameraId }, {});
        return court;
    }
    async getCourts(searchDto) {
        const filter = {};
        if (searchDto.search)
            filter.$or = [{ courtName: { $regex: searchDto.search, $options: 'i' } }, { courtCode: { $regex: searchDto.search, $options: 'i' } }];
        if (searchDto.venueId)
            filter.venueId = new mongoose_2.Types.ObjectId(searchDto.venueId);
        if (searchDto.courtType)
            filter.courtType = searchDto.courtType;
        if (searchDto.surfaceType)
            filter.surfaceType = searchDto.surfaceType;
        if (searchDto.status)
            filter.status = searchDto.status;
        if (searchDto.maintenanceStatus)
            filter.maintenanceStatus = searchDto.maintenanceStatus;
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100);
        const skip = (page - 1) * limit;
        const sort = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
        const [data, total] = await Promise.all([this.courtModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.courtModel.countDocuments(filter).exec()]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getCourtsByVenue(venueId, page = 1, limit = 20) { return this.courtModel.paginate({ venueId: new mongoose_2.Types.ObjectId(venueId) }, { page, limit }); }
    async archiveCourt(id, userId) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        if (court.status === court_schema_1.CourtStatus.ACTIVE)
            throw new common_1.BadRequestException('Cannot archive active court. Deactivate first.');
        court.status = court_schema_1.CourtStatus.ARCHIVED;
        court.archivedAt = new Date();
        court.archivedBy = new mongoose_2.Types.ObjectId(userId);
        await court.save();
        await this.publishEvent('CourtArchived', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, archivedBy: userId }, { userId });
        return court;
    }
    async restoreCourt(id, userId) {
        const court = await this.courtModel.findById(id);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        if (court.status !== court_schema_1.CourtStatus.ARCHIVED)
            throw new common_1.BadRequestException('Court is not archived');
        court.status = court_schema_1.CourtStatus.DRAFT;
        court.archivedAt = undefined;
        court.archivedBy = undefined;
        await court.save();
        await this.publishEvent('CourtRestored', court._id.toString(), 'Court', { courtId: court._id.toString(), courtCode: court.courtCode, restoredBy: userId }, { userId });
        return court;
    }
    async deleteCourt(id) { await this.courtModel.findByIdAndDelete(id).exec(); }
    async getCourtStats(venueId) {
        const match = venueId ? { venueId: new mongoose_2.Types.ObjectId(venueId) } : {};
        const [total, byType, byStatus, byMaintenance] = await Promise.all([this.courtModel.countDocuments(match), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$courtType', count: { $sum: 1 } } }]), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]), this.courtModel.aggregate([{ $match: match }, { $group: { _id: '$maintenanceStatus', count: { $sum: 1 } } }]),]);
        return { total, byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}), byMaintenance: byMaintenance.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}) };
    }
    async publishEvent(eventType, aggregateId, aggregateType, payload, metadata) { const event = (0, domain_events_1.createDomainEvent)(eventType, aggregateId, aggregateType, payload, metadata); await domain_events_1.eventPublisher.publish(event); }
};
exports.CourtService = CourtService;
exports.CourtService = CourtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(court_schema_1.Court.name)),
    __param(1, (0, mongoose_1.InjectModel)(venue_schema_1.Venue.name)),
    __param(2, (0, mongoose_1.InjectModel)(camera_schema_1.Camera.name)),
    __param(3, (0, mongoose_1.InjectModel)(calibration_schema_1.CalibrationProfile.name)),
    __param(4, (0, mongoose_1.InjectModel)(coverage_zone_schema_1.CoverageZone.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CourtService);
//# sourceMappingURL=court.service.js.map