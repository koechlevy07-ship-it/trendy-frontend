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
exports.CalibrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calibration_service_1 = require("../services/calibration.service");
const calibration_dto_1 = require("../dtos/calibration.dto");
const api_response_1 = require("@shared/api-response");
let CalibrationController = class CalibrationController {
    constructor(calibrationService) {
        this.calibrationService = calibrationService;
    }
    async createCalibration(createCalibrationDto) {
        const calibration = await this.calibrationService.createCalibration(createCalibrationDto, 'system');
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile created successfully');
    }
    async getCalibrations(searchDto) {
        const result = await this.calibrationService.getCalibrations(searchDto);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Calibration profiles retrieved successfully');
    }
    async getCalibrationById(id) {
        const calibration = await this.calibrationService.getCalibrationById(id);
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile retrieved successfully');
    }
    async getActiveCalibration(cameraInstallationId) {
        const calibration = await this.calibrationService.getActiveCalibration(cameraInstallationId);
        return api_response_1.ApiResponseBuilder.success(calibration, 'Active calibration profile retrieved successfully');
    }
    async updateCalibration(id, updateDto) {
        const calibration = await this.calibrationService.updateCalibration(id, updateDto, 'system');
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile updated successfully');
    }
    async activateCalibration(id, activateDto) {
        const calibration = await this.calibrationService.activateCalibration(id, activateDto);
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile activated successfully');
    }
    async validateCalibration(id, validateDto) {
        const calibration = await this.calibrationService.validateCalibration(id, validateDto, 'system');
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile validated successfully');
    }
    async archiveCalibration(id) {
        const calibration = await this.calibrationService.archiveCalibration(id, 'system');
        return api_response_1.ApiResponseBuilder.success(calibration, 'Calibration profile archived successfully');
    }
    async getCalibrationStats() {
        const stats = await this.calibrationService.getCalibrationStats();
        return api_response_1.ApiResponseBuilder.success(stats, 'Calibration statistics retrieved successfully');
    }
};
exports.CalibrationController = CalibrationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create calibration profile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Calibration profile created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Active calibration already exists for camera' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calibration_dto_1.CreateCalibrationProfileDto]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "createCalibration", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List calibration profiles with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'cameraInstallationId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'method', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calibration_dto_1.CalibrationProfileSearchDto]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "getCalibrations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calibration profile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Calibration profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration profile found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "getCalibrationById", null);
__decorate([
    (0, common_1.Get)('camera/:cameraInstallationId/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active calibration for camera' }),
    (0, swagger_1.ApiParam)({ name: 'cameraInstallationId', description: 'Camera installation ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active calibration profile found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No active calibration found' }),
    __param(0, (0, common_1.Param)('cameraInstallationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "getActiveCalibration", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update calibration profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Calibration profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update active calibration' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, calibration_dto_1.UpdateCalibrationProfileDto]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "updateCalibration", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate calibration profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Calibration profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration profile activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Already active or accuracy requirements not met' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, calibration_dto_1.ActivateCalibrationDto]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "activateCalibration", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate calibration profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Calibration profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration validated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Not pending validation' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, calibration_dto_1.ValidateCalibrationDto]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "validateCalibration", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive calibration profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Calibration profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration profile archived successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "archiveCalibration", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calibration statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CalibrationController.prototype, "getCalibrationStats", null);
exports.CalibrationController = CalibrationController = __decorate([
    (0, swagger_1.ApiTags)('Calibrations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('calibrations'),
    __metadata("design:paramtypes", [calibration_service_1.CalibrationService])
], CalibrationController);
//# sourceMappingURL=calibration.controller.js.map