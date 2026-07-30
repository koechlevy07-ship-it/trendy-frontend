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
exports.CalibrationProfilePaginatedResponseDto = exports.CalibrationProfileResponseDto = exports.ValidateCalibrationDto = exports.ActivateCalibrationDto = exports.CalibrationProfileSearchDto = exports.CalibrationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const calibration_schema_1 = require("../schemas/calibration.schema");
const camera_repository_1 = require("../repositories/camera.repository");
const domain_events_1 = require("@shared/domain-events");
let CalibrationService = class CalibrationService {
    constructor(calibrationModel, cameraRepository) {
        this.calibrationModel = calibrationModel;
        this.cameraRepository = cameraRepository;
    }
    async createCalibration(createCalibrationDto, userId) {
        const camera = await this.cameraRepository.findByIdOrThrow(createCalibrationDto.cameraInstallationId);
        const existingActive = await this.calibrationRepository.findActiveByCamera(createCalibrationDto.cameraInstallationId);
        if (existingActive)
            throw new common_1.ConflictException('Active calibration already exists for this camera. Archive it first.');
        const latestVersion = await this.calibrationRepository.findLatestByCamera(createCalibrationDto.cameraInstallationId);
        const version = (latestVersion?.version || 0) + 1;
        const calibration = new this.calibrationModel({ ...createCalibrationDto, cameraInstallationId: new mongoose_2.Types.ObjectId(createCalibrationDto.cameraInstallationId), version, createdBy: new mongoose_2.Types.ObjectId(userId) });
        const savedCalibration = await calibration.save();
        await this.publishEvent('CalibrationCreated', savedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: savedCalibration._id.toString(), cameraInstallationId: savedCalibration.cameraInstallationId.toString(), profileName: savedCalibration.profileName, version: savedCalibration.version, method: savedCalibration.method, status: savedCalibration.status }, { userId });
        return savedCalibration;
    }
    async getCalibrations(searchDto) {
        const filter = {};
        if (searchDto.cameraInstallationId)
            filter.cameraInstallationId = new mongoose_2.Types.ObjectId(searchDto.cameraInstallationId);
        if (searchDto.status)
            filter.status = searchDto.status;
        if (searchDto.method)
            filter.method = searchDto.method;
        const page = searchDto.page || 1;
        const limit = Math.min(searchDto.limit || 20, 100);
        const skip = (page - 1) * limit;
        const sort = { [searchDto.sortBy || 'createdAt']: searchDto.sortOrder === 'asc' ? 1 : -1 };
        const [data, total] = await Promise.all([this.calibrationModel.find(filter).sort(sort).skip(skip).limit(limit).exec(), this.calibrationModel.countDocuments(filter).exec()]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getCalibrationById(id) { return this.calibrationRepository.findByIdOrThrow(id); }
    async getActiveCalibration(cameraInstallationId) { return this.calibrationRepository.findActiveByCamera(cameraInstallationId); }
    async updateCalibration(id, updateDto, userId) {
        const calibration = await this.calibrationRepository.findByIdOrThrow(id);
        if (calibration.status === calibration_schema_1.CalibrationStatus.ACTIVE)
            throw new common_1.BadRequestException('Cannot update active calibration. Archive it first.');
        const updatedCalibration = await this.calibrationRepository.update(id, { ...updateDto, updatedBy: new mongoose_2.Types.ObjectId(userId) });
        await this.publishEvent('CalibrationUpdated', updatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: updatedCalibration._id.toString(), changes: updateDto }, { userId });
        return updatedCalibration;
    }
    async activateCalibration(id, activateDto) {
        const calibration = await this.calibrationRepository.findByIdOrThrow(id);
        if (calibration.status === calibration_schema_1.CalibrationStatus.ACTIVE)
            throw new common_1.BadRequestException('Calibration is already active');
        if (calibration.status === calibration_schema_1.CalibrationStatus.ARCHIVED)
            throw new common_1.BadRequestException('Cannot activate archived calibration. Create a new version instead.');
        if (calibration.metrics.reprojectionError > 1.0)
            throw new common_1.BadRequestException('Calibration accuracy does not meet activation requirements');
        await this.calibrationModel.updateMany({ cameraInstallationId: calibration.cameraInstallationId, status: calibration_schema_1.CalibrationStatus.ACTIVE }, { status: calibration_schema_1.CalibrationStatus.ARCHIVED });
        const activatedCalibration = await this.calibrationRepository.activateProfile(id, new mongoose_2.Types.ObjectId(activateDto.activatedBy));
        await this.publishEvent('CalibrationActivated', activatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: activatedCalibration._id.toString(), cameraInstallationId: activatedCalibration.cameraInstallationId.toString(), version: activatedCalibration.version, activatedBy: activateDto.activatedBy }, { userId: activateDto.activatedBy });
        return activatedCalibration;
    }
    async validateCalibration(id, validateDto, userId) {
        const calibration = await this.calibrationRepository.findByIdOrThrow(id);
        if (calibration.status !== calibration_schema_1.CalibrationStatus.PENDING_VALIDATION)
            throw new common_1.BadRequestException('Calibration is not pending validation');
        const validatedCalibration = await this.calibrationRepository.setValidationResult(id, validateDto.passed, validateDto.details, new mongoose_2.Types.ObjectId(userId));
        if (validateDto.passed) {
            validatedCalibration.status = calibration_schema_1.CalibrationStatus.ACTIVE;
            validatedCalibration.activatedAt = new Date();
            validatedCalibration.activatedBy = new mongoose_2.Types.ObjectId(userId);
            await validatedCalibration.save();
            await this.publishEvent('CalibrationValidated', validatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: validatedCalibration._id.toString(), passed: validateDto.passed, validatedBy: userId }, { userId });
        }
        else {
            validatedCalibration.status = calibration_schema_1.CalibrationStatus.FAILED;
            await validatedCalibration.save();
            await this.publishEvent('CalibrationValidationFailed', validatedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: validatedCalibration._id.toString(), details: validateDto.details, validatedBy: userId }, { userId });
        }
        return validatedCalibration;
    }
    async archiveCalibration(id, userId) {
        const calibration = await this.calibrationRepository.findByIdOrThrow(id);
        if (calibration.status === calibration_schema_1.CalibrationStatus.ACTIVE)
            throw new common_1.BadRequestException('Cannot archive active calibration. Deactivate it first.');
        const archivedCalibration = await this.calibrationRepository.archiveProfile(id, new mongoose_2.Types.ObjectId(userId));
        await this.publishEvent('CalibrationArchived', archivedCalibration._id.toString(), 'CalibrationProfile', { calibrationId: archivedCalibration._id.toString(), cameraInstallationId: archivedCalibration.cameraInstallationId.toString(), archivedBy: userId }, { userId });
        return archivedCalibration;
    }
    async updateMetrics(id, metrics) { return this.calibrationRepository.updateMetrics(id, metrics); }
    async updateAIProfile(id, aiMetadata) { return this.calibrationRepository.updateAIProfile(id, aiMetadata); }
    async getCalibrationStats() { return this.calibrationRepository.getCalibrationStats(); }
    async findNeedingRecalibration(maxError = 1.0) { return this.calibrationRepository.findNeedingRecalibration(maxError); }
    async publishEvent(eventType, aggregateId, aggregateType, payload, metadata) { const event = (0, domain_events_1.createDomainEvent)(eventType, aggregateId, aggregateType, payload, metadata); await domain_events_1.eventPublisher.publish(event); }
};
exports.CalibrationService = CalibrationService;
exports.CalibrationService = CalibrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(calibration_schema_1.CalibrationProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        camera_repository_1.CameraRepository])
], CalibrationService);
class CalibrationProfileSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.CalibrationProfileSearchDto = CalibrationProfileSearchDto;
__decorate([
    IsMongoId(),
    IsOptional(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "cameraInstallationId", void 0);
__decorate([
    IsEnum(calibration_schema_1.CalibrationStatus),
    IsOptional(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "status", void 0);
__decorate([
    IsEnum(calibration_schema_1.CalibrationMethod),
    IsOptional(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "method", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    Min(1),
    __metadata("design:type", Number)
], CalibrationProfileSearchDto.prototype, "page", void 0);
__decorate([
    IsNumber(),
    IsOptional(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], CalibrationProfileSearchDto.prototype, "limit", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "sortBy", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "sortOrder", void 0);
class ActivateCalibrationDto {
}
exports.ActivateCalibrationDto = ActivateCalibrationDto;
__decorate([
    IsMongoId(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ActivateCalibrationDto.prototype, "activatedBy", void 0);
class ValidateCalibrationDto {
}
exports.ValidateCalibrationDto = ValidateCalibrationDto;
__decorate([
    IsBoolean(),
    IsNotEmpty(),
    __metadata("design:type", Boolean)
], ValidateCalibrationDto.prototype, "passed", void 0);
__decorate([
    IsObject(),
    IsNotEmpty(),
    __metadata("design:type", Object)
], ValidateCalibrationDto.prototype, "details", void 0);
__decorate([
    IsMongoId(),
    IsNotEmpty(),
    __metadata("design:type", String)
], ValidateCalibrationDto.prototype, "validatedBy", void 0);
class CalibrationProfileResponseDto {
}
exports.CalibrationProfileResponseDto = CalibrationProfileResponseDto;
class CalibrationProfilePaginatedResponseDto {
}
exports.CalibrationProfilePaginatedResponseDto = CalibrationProfilePaginatedResponseDto;
//# sourceMappingURL=calibration.service.js.map