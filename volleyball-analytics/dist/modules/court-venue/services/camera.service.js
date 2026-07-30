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
exports.CameraPaginatedResponseDto = exports.CameraResponseDto = exports.CalibrateCameraDto = exports.ActivateCameraDto = exports.CameraSearchDto = exports.CameraService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const camera_schema_1 = require("../schemas/camera.schema");
const court_schema_1 = require("../schemas/court.schema");
const coverage_zone_schema_1 = require("../schemas/coverage-zone.schema");
const calibration_schema_1 = require("../schemas/calibration.schema");
const domain_events_1 = require("@shared/domain-events");
let CameraService = class CameraService {
    constructor(cameraModel, courtModel, coverageZoneModel, calibrationModel) {
        this.cameraModel = cameraModel;
        this.courtModel = courtModel;
        this.coverageZoneModel = coverageZoneModel;
        this.calibrationModel = calibrationModel;
    }
    async createCamera(dto, userId) {
        const court = await this.courtModel.findById(dto.courtId);
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        await this.validateCameraPositioning(dto.courtId, dto.position);
        const existingSerial = await this.cameraModel.findOne({ serialNumber: dto.serialNumber });
        if (existingSerial)
            throw new common_1.ConflictException('Camera with this serial number already exists');
        const existingCameraId = await this.cameraModel.findOne({ cameraId: dto.cameraId.toUpperCase() });
        if (existingCameraId)
            throw new common_1.ConflictException('Camera ID already exists');
        const camera = new this.cameraModel({ ...dto, courtId: new mongoose_2.Types.ObjectId(dto.courtId), cameraId: dto.cameraId.toUpperCase(), createdBy: new mongoose_2.Types.ObjectId(userId) });
        const savedCamera = await camera.save();
        if (dto.assignedCoverageZones?.length) {
            await this.coverageZoneModel.updateMany({ _id: { $in: dto.assignedCoverageZones.map(id => new mongoose_2.Types.ObjectId(id)) } }, { $addToSet: { assignedCameras: savedCamera._id } }).exec();
        }
        await this.publishEvent('CameraRegistered', savedCamera._id.toString(), 'Camera', { cameraId: savedCamera.cameraId, courtId: savedCamera.courtId.toString(), manufacturer: savedCamera.manufacturer, model: savedCamera.model, serialNumber: savedCamera.serialNumber, mountType: savedCamera.mountType, status: savedCamera.status }, { userId });
        return savedCamera;
    }
    async getCameras(searchDto) {
        const filter = {};
        if (searchDto.search)
            filter.$or = [{ cameraId: { $regex: searchDto.search, $options: 'i' } }, { name: { $regex: searchDto.search, $options: 'i' } }, { serialNumber: { $regex: searchDto.search, $options: 'i' } }];
        if (searchDto.courtId)
            filter.courtId = new mongoose_2.Types.ObjectId(searchDto.courtId);
        if (searchDto.manufacturer)
            filter.manufacturer = searchDto.manufacturer;
        if (searchDto.mountType)
            filter.mountType = searchDto.mountType;
        if (searchDto.status)
            filter.status = searchDto.status;
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100);
        const skip = (page - 1) * limit;
        const sort = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
        const [data, total] = await Promise.all([this.cameraModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.cameraModel.countDocuments(filter).exec()]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getCameraById(id) { return this.cameraModel.findById(id).populate('courtId').populate('calibrationProfileId').populate('assignedCoverageZones').exec(); }
    async getCameraByCameraId(cameraId) { const camera = await this.cameraModel.findOne({ cameraId: cameraId.toUpperCase() }).exec(); if (!camera)
        throw new common_1.NotFoundException('Camera not found'); return camera; }
    async getCamerasByCourt(courtId) { return this.cameraModel.find({ courtId: new mongoose_2.Types.ObjectId(courtId) }).sort({ createdAt: -1 }).exec(); }
    async updateCamera(id, updateCameraDto, userId) {
        const camera = await this.cameraModel.findById(id);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        if (updateCameraDto.position)
            await this.validateCameraPositioning(camera.courtId.toString(), updateCameraDto.position, id);
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { ...updateCameraDto, updatedBy: new mongoose_2.Types.ObjectId(userId) }, { new: true, runValidators: true }).exec();
        await this.publishEvent('CameraUpdated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, changes: updateCameraDto }, { userId });
        return updatedCamera;
    }
    async activateCamera(id) {
        const camera = await this.cameraModel.findById(id);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        if (camera.status === camera_schema_1.CameraStatus.ACTIVE)
            throw new common_1.BadRequestException('Camera is already active');
        if (!camera.calibrationProfileId)
            throw new common_1.BadRequestException('Camera must have a calibration profile before activation');
        const calibration = await this.calibrationModel.findById(camera.calibrationProfileId);
        if (calibration?.status !== 'active')
            throw new common_1.BadRequestException('Calibration profile must be active before camera activation');
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: camera_schema_1.CameraStatus.ACTIVE, activatedAt: new Date() }, { new: true }).exec();
        await this.publishEvent('CameraActivated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString(), activatedAt: updatedCamera.activatedAt }, {});
        return updatedCamera;
    }
    async deactivateCamera(id, userId) {
        const camera = await this.cameraModel.findById(id);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        if (camera.status !== camera_schema_1.CameraStatus.ACTIVE)
            throw new common_1.BadRequestException('Camera is not active');
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: camera_schema_1.CameraStatus.INACTIVE }, { new: true }).exec();
        await this.publishEvent('CameraDeactivated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString() }, { userId });
        return updatedCamera;
    }
    async assignCalibrationProfile(id, calibrationProfileId, userId) {
        const camera = await this.cameraModel.findById(id);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        const calibration = await this.calibrationModel.findById(calibrationProfileId);
        if (!calibration)
            throw new common_1.NotFoundException('Calibration profile not found');
        if (calibration.status !== 'active')
            throw new common_1.BadRequestException('Only active calibration profiles can be assigned');
        if (calibration.cameraInstallationId.toString() !== camera._id.toString())
            throw new common_1.BadRequestException('Calibration profile does not match this camera');
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { calibrationProfileId: new mongoose_2.Types.ObjectId(calibrationProfileId), status: camera_schema_1.CameraStatus.CALIBRATED, calibratedAt: new Date() }, { new: true }).exec();
        await this.publishEvent('CameraCalibrated', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, calibrationProfileId }, { userId });
        return updatedCamera;
    }
    async assignCoverageZone(cameraId, zoneId) { return this.cameraModel.findByIdAndUpdate(cameraId, { $addToSet: { assignedCoverageZones: new mongoose_2.Types.ObjectId(zoneId) } }, { new: true }).exec(); }
    async removeCoverageZone(cameraId, zoneId) { return this.cameraModel.findByIdAndUpdate(cameraId, { $pull: { assignedCoverageZones: new mongoose_2.Types.ObjectId(zoneId) } }, { new: true }).exec(); }
    async updatePosition(id, position, userId) {
        await this.validateCameraPositioning((await this.cameraModel.findById(id)).courtId.toString(), position, id);
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { position, status: camera_schema_1.CameraStatus.CALIBRATING }, { new: true }).exec();
        await this.publishEvent('CameraRepositioned', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, oldPosition: (await this.cameraModel.findById(id)).position, newPosition: position }, { userId });
        return updatedCamera;
    }
    async updateStreamConfig(id, streamConfig) { return this.cameraModel.findByIdAndUpdate(id, { streamConfig }, { new: true }).exec(); }
    async recordHeartbeat(id) { return this.cameraModel.findByIdAndUpdate(id, { lastHeartbeat: new Date(), status: camera_schema_1.CameraStatus.CONNECTED }, { new: true }).exec(); }
    async recordError(id, error) { return this.cameraModel.findByIdAndUpdate(id, { $inc: { 'healthMetrics.errorCount': 1 }, errorMessage: error, status: camera_schema_1.CameraStatus.ERROR }, { new: true }).exec(); }
    async getCameraStats(courtId) { return this.cameraModel.getCameraStats(courtId); }
    async decommissionCamera(id, userId) {
        const camera = await this.cameraModel.findById(id);
        if (!camera)
            throw new common_1.NotFoundException('Camera not found');
        if (camera.status === camera_schema_1.CameraStatus.DECOMMISSIONED)
            throw new common_1.BadRequestException('Camera is already decommissioned');
        const updatedCamera = await this.cameraModel.findByIdAndUpdate(id, { status: camera_schema_1.CameraStatus.DECOMMISSIONED, decommissionedAt: new Date() }, { new: true }).exec();
        await this.coverageZoneModel.updateMany({ assignedCameras: camera._id }, { $pull: { assignedCameras: camera._id } }).exec();
        await this.publishEvent('CameraDecommissioned', updatedCamera._id.toString(), 'Camera', { cameraId: updatedCamera.cameraId, courtId: updatedCamera.courtId.toString() }, { userId });
        return updatedCamera;
    }
    async validateCameraPositioning(courtId, position, excludeCameraId) {
        const existingCameras = await this.cameraModel.find({ courtId: new mongoose_2.Types.ObjectId(courtId) });
        for (const camera of existingCameras) {
            if (excludeCameraId && camera._id.toString() === excludeCameraId)
                continue;
            const distance = Math.sqrt(Math.pow(camera.position.x - position.x, 2) + Math.pow(camera.position.y - position.y, 2) + Math.pow(camera.position.z - position.z, 2));
            if (distance < 0.5)
                throw new common_1.UnprocessableEntityException({ success: false, message: `Camera position conflicts with existing camera ${camera.cameraId}`, errors: [{ field: 'position', message: `Camera must be at least 0.5m away from other cameras`, code: 'CAMERA_POSITION_CONFLICT' }], timestamp: new Date().toISOString() });
        }
    }
    async publishEvent(eventType, aggregateId, aggregateType, payload, metadata) { const event = (0, domain_events_1.createDomainEvent)(eventType, aggregateId, aggregateType, payload, metadata); await domain_events_1.eventPublisher.publish(event); }
};
exports.CameraService = CameraService;
exports.CameraService = CameraService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(camera_schema_1.Camera.name)),
    __param(1, (0, mongoose_1.InjectModel)(court_schema_1.Court.name)),
    __param(2, (0, mongoose_1.InjectModel)(coverage_zone_schema_1.CoverageZone.name)),
    __param(3, (0, mongoose_1.InjectModel)(calibration_schema_1.CalibrationProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CameraService);
class CameraSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.CameraSearchDto = CameraSearchDto;
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "search", void 0);
__decorate([
    IsMongoId(),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "courtId", void 0);
__decorate([
    IsEnum(camera_schema_1.CameraManufacturer),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "manufacturer", void 0);
__decorate([
    IsEnum(camera_schema_1.CameraMountType),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "mountType", void 0);
__decorate([
    IsEnum(camera_schema_1.CameraStatus),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "status", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    Min(1),
    __metadata("design:type", Number)
], CameraSearchDto.prototype, "page", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], CameraSearchDto.prototype, "limit", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "sortBy", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "sortOrder", void 0);
class ActivateCameraDto {
}
exports.ActivateCameraDto = ActivateCameraDto;
__decorate([
    IsMongoId(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ActivateCameraDto.prototype, "cameraId", void 0);
class CalibrateCameraDto {
}
exports.CalibrateCameraDto = CalibrateCameraDto;
__decorate([
    IsMongoId(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CalibrateCameraDto.prototype, "cameraId", void 0);
__decorate([
    IsMongoId(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CalibrateCameraDto.prototype, "calibrationProfileId", void 0);
class CameraResponseDto {
}
exports.CameraResponseDto = CameraResponseDto;
class CameraPaginatedResponseDto {
}
exports.CameraPaginatedResponseDto = CameraPaginatedResponseDto;
//# sourceMappingURL=camera.service.js.map