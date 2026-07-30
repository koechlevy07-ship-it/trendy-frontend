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
exports.CameraController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const camera_service_1 = require("../services/camera.service");
const camera_dto_1 = require("../dtos/camera.dto");
const api_response_1 = require("@shared/api-response");
let CameraController = class CameraController {
    constructor(cameraService) {
        this.cameraService = cameraService;
    }
    async createCamera(createCameraDto) {
        const camera = await this.cameraService.createCamera(createCameraDto, 'system');
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera registered successfully');
    }
    async getCameras(searchDto) {
        const result = await this.cameraService.getCameras(searchDto);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Cameras retrieved successfully');
    }
    async getCameraById(id) {
        const camera = await this.cameraService.getCameraById(id);
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera retrieved successfully');
    }
    async getCamerasByCourt(courtId, page = 1, limit = 20) {
        const result = await this.cameraService.getCamerasByCourt(courtId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Cameras retrieved successfully');
    }
    async updateCamera(id, updateCameraDto) {
        const camera = await this.cameraService.updateCamera(id, updateCameraDto, 'system');
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera updated successfully');
    }
    async activateCamera(id) {
        const camera = await this.cameraService.activateCamera(id);
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera activated successfully');
    }
    async deactivateCamera(id) {
        const camera = await this.cameraService.deactivateCamera(id);
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera deactivated successfully');
    }
    async calibrateCamera(id, calibrateDto) {
        const camera = await this.cameraService.assignCalibrationProfile(id, calibrateDto.calibrationProfileId, 'system');
        return api_response_1.ApiResponseBuilder.success(camera, 'Calibration profile assigned successfully');
    }
    async assignCoverageZone(id, zoneId) {
        const camera = await this.cameraService.assignCoverageZone(id, zoneId);
        return api_response_1.ApiResponseBuilder.success(camera, 'Coverage zone assigned successfully');
    }
    async removeCoverageZone(id, zoneId) {
        const camera = await this.cameraService.removeCoverageZone(id, zoneId);
        return api_response_1.ApiResponseBuilder.success(camera, 'Coverage zone removed successfully');
    }
    async updateHeartbeat(id) {
        const camera = await this.cameraService.updateHeartbeat(id);
        return api_response_1.ApiResponseBuilder.success(camera, 'Heartbeat updated successfully');
    }
    async getCameraStats(courtId) {
        const stats = await this.cameraService.getCameraStats(courtId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Camera statistics retrieved successfully');
    }
    async decommissionCamera(id) {
        const camera = await this.cameraService.decommissionCamera(id);
        return api_response_1.ApiResponseBuilder.success(camera, 'Camera decommissioned successfully');
    }
};
exports.CameraController = CameraController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new camera' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Camera registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Camera ID or serial number already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [camera_dto_1.CreateCameraDto]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "createCamera", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List cameras with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'courtId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'manufacturer', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'mountType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [camera_dto_1.CameraSearchDto]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "getCameras", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get camera by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "getCameraById", null);
__decorate([
    (0, common_1.Get)('court/:courtId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cameras by court' }),
    (0, swagger_1.ApiParam)({ name: 'courtId', description: 'Court ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('courtId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "getCamerasByCourt", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, camera_dto_1.UpdateCameraDto]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "updateCamera", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Camera already active' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "activateCamera", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "deactivateCamera", null);
__decorate([
    (0, common_1.Patch)(':id/calibrate'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign calibration profile to camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration profile assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Calibration profile not active' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera or calibration profile not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, camera_dto_1.CalibrateCameraDto]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "calibrateCamera", null);
__decorate([
    (0, common_1.Post)(':id/coverage-zones/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign coverage zone to camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Coverage zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coverage zone assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera or coverage zone not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "assignCoverageZone", null);
__decorate([
    (0, common_1.Delete)(':id/coverage-zones/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove coverage zone from camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Coverage zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coverage zone removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "removeCoverageZone", null);
__decorate([
    (0, common_1.Patch)(':id/heartbeat'),
    (0, swagger_1.ApiOperation)({ summary: 'Update camera heartbeat' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Heartbeat updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "updateHeartbeat", null);
__decorate([
    (0, common_1.Get)('court/:courtId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get camera statistics for court' }),
    (0, swagger_1.ApiParam)({ name: 'courtId', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('courtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "getCameraStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Decommission camera' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera decommissioned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Camera not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CameraController.prototype, "decommissionCamera", null);
exports.CameraController = CameraController = __decorate([
    (0, swagger_1.ApiTags)('Cameras'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('cameras'),
    __metadata("design:paramtypes", [camera_service_1.CameraService])
], CameraController);
//# sourceMappingURL=camera.controller.js.map