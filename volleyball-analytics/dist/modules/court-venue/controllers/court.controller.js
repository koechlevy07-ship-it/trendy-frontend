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
exports.CourtController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const court_service_1 = require("../services/court.service");
const court_dto_1 = require("../dtos/court.dto");
const api_response_1 = require("@shared/api-response");
let CourtController = class CourtController {
    constructor(courtService) {
        this.courtService = courtService;
    }
    async createCourt(createCourtDto) {
        const court = await this.courtService.createCourt(createCourtDto);
        return api_response_1.ApiResponseBuilder.success(court, 'Court registered successfully');
    }
    async getCourts(searchDto) {
        const result = await this.courtService.getCourts(searchDto);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Courts retrieved successfully');
    }
    async getCourtById(id) {
        const court = await this.courtService.getCourtById(id);
        return api_response_1.ApiResponseBuilder.success(court, 'Court retrieved successfully');
    }
    async getCourtsByVenue(venueId, page = 1, limit = 20) {
        const result = await this.courtService.getCourtsByVenue(venueId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Courts retrieved successfully');
    }
    async updateCourt(id, updateCourtDto) {
        const court = await this.courtService.updateCourt(id, updateCourtDto);
        return api_response_1.ApiResponseBuilder.success(court, 'Court updated successfully');
    }
    async activateCourt(id, activateDto) {
        const court = await this.courtService.activateCourt(id, activateDto.activatedBy);
        return api_response_1.ApiResponseBuilder.success(court, 'Court activated successfully');
    }
    async setMaintenance(id, maintenanceDto) {
        const court = await this.courtService.setMaintenance(id, maintenanceDto);
        return api_response_1.ApiResponseBuilder.success(court, maintenanceDto.isUnderMaintenance ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    }
    async assignCamera(id, assignDto) {
        const court = await this.courtService.assignCamera(id, assignDto.cameraId);
        return api_response_1.ApiResponseBuilder.success(court, 'Camera assigned to court successfully');
    }
    async removeCamera(id, cameraId) {
        const court = await this.courtService.removeCamera(id, cameraId);
        return api_response_1.ApiResponseBuilder.success(court, 'Camera removed from court successfully');
    }
    async archiveCourt(id) {
        await this.courtService.archiveCourt(id, 'system');
        return api_response_1.ApiResponseBuilder.success(null, 'Court archived successfully');
    }
    async restoreCourt(id) {
        const court = await this.courtService.restoreCourt(id, 'system');
        return api_response_1.ApiResponseBuilder.success(court, 'Court restored successfully');
    }
    async getCourtStats(venueId) {
        const stats = await this.courtService.getCourtStats(venueId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Court statistics retrieved successfully');
    }
};
exports.CourtController = CourtController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new court' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Court registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Court code already exists in venue' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [court_dto_1.CreateCourtDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "createCourt", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List courts with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'venueId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'courtType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'surfaceType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'maintenanceStatus', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [court_dto_1.CourtSearchDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "getCourts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get court by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Court found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "getCourtById", null);
__decorate([
    (0, common_1.Get)('venue/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get courts by venue' }),
    (0, swagger_1.ApiParam)({ name: 'venueId', description: 'Venue ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('venueId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "getCourtsByVenue", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Court updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, court_dto_1.UpdateCourtDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "updateCourt", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Court activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Court already active or under maintenance' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, court_dto_1.ActivateCourtDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "activateCourt", null);
__decorate([
    (0, common_1.Patch)(':id/maintenance'),
    (0, swagger_1.ApiOperation)({ summary: 'Set court maintenance mode' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance mode updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot set maintenance on active court' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, court_dto_1.SetMaintenanceDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "setMaintenance", null);
__decorate([
    (0, common_1.Post)(':id/cameras'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign camera to court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court or camera not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Camera already assigned to another court' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, court_dto_1.AssignCameraDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "assignCamera", null);
__decorate([
    (0, common_1.Delete)(':id/cameras/:cameraId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove camera from court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiParam)({ name: 'cameraId', description: 'Camera ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Camera removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('cameraId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "removeCamera", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Archive court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Court archived successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot archive active court' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "archiveCourt", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore archived court' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Court ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Court restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Court is not archived' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Court not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "restoreCourt", null);
__decorate([
    (0, common_1.Get)('stats/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get court statistics for venue' }),
    (0, swagger_1.ApiParam)({ name: 'venueId', description: 'Venue ID' }),
    __param(0, (0, common_1.Param)('venueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "getCourtStats", null);
exports.CourtController = CourtController = __decorate([
    (0, swagger_1.ApiTags)('Courts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('courts'),
    __metadata("design:paramtypes", [court_service_1.CourtService])
], CourtController);
//# sourceMappingURL=court.controller.js.map