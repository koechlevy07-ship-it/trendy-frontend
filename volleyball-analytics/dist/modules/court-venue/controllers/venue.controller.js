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
exports.VenueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const venue_service_1 = require("../services/venue.service");
const venue_dto_1 = require("../dtos/venue.dto");
const api_response_1 = require("@shared/api-response");
let VenueController = class VenueController {
    constructor(venueService) {
        this.venueService = venueService;
    }
    async createVenue(createVenueDto) {
        const venue = await this.venueService.createVenue(createVenueDto, 'system');
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue registered successfully');
    }
    async getVenues(searchDto) {
        const result = await this.venueService.getVenues(searchDto);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Venues retrieved successfully');
    }
    async getVenueById(id) {
        const venue = await this.venueService.getVenueById(id);
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue retrieved successfully');
    }
    async getVenueByCode(venueCode) {
        const venue = await this.venueService.getVenueByCode(venueCode);
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue retrieved successfully');
    }
    async updateVenue(id, updateVenueDto) {
        const venue = await this.venueService.updateVenue(id, updateVenueDto, 'system');
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue updated successfully');
    }
    async activateVenue(id, activateDto) {
        const venue = await this.venueService.activateVenue(id, activateDto);
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue activated successfully');
    }
    async suspendVenue(id, suspendDto) {
        const venue = await this.venueService.suspendVenue(id, suspendDto);
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue suspended successfully');
    }
    async archiveVenue(id) {
        await this.venueService.archiveVenue(id, 'system');
        return api_response_1.ApiResponseBuilder.success(null, 'Venue archived successfully');
    }
    async restoreVenue(id) {
        const venue = await this.venueService.restoreVenue(id, 'system');
        return api_response_1.ApiResponseBuilder.success(venue, 'Venue restored successfully');
    }
    async getVenuesByOrganization(organizationId, page = 1, limit = 20) {
        const result = await this.venueService.getVenuesByOrganization(organizationId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Venues retrieved successfully');
    }
    async getVenueStats(organizationId) {
        const stats = await this.venueService.getVenueStats(organizationId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Venue statistics retrieved successfully');
    }
};
exports.VenueController = VenueController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new venue' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Venue registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Venue code or name already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [venue_dto_1.CreateVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "createVenue", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List venues with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'venueType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'organizationId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'latitude', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'longitude', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'maxDistanceKm', required: false, type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [venue_dto_1.VenueSearchDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "getVenues", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "getVenueById", null);
__decorate([
    (0, common_1.Get)('code/:venueCode'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue by venue code' }),
    (0, swagger_1.ApiParam)({ name: 'venueCode', description: 'Venue code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('venueCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "getVenueByCode", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update venue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Venue name already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, venue_dto_1.UpdateVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "updateVenue", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate venue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue activated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Venue already active or certification required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, venue_dto_1.ActivateVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "activateVenue", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend venue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue suspended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Venue already suspended or archived' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, venue_dto_1.SuspendVenueDto]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "suspendVenue", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Archive venue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue archived successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Venue already archived or active' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "archiveVenue", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore archived venue' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Venue restored successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Venue is not archived' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Venue not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "restoreVenue", null);
__decorate([
    (0, common_1.Get)('organization/:organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venues by organization' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'Organization ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('organizationId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "getVenuesByOrganization", null);
__decorate([
    (0, common_1.Get)('stats/:organizationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get venue statistics for organization' }),
    (0, swagger_1.ApiParam)({ name: 'organizationId', description: 'Organization ID' }),
    __param(0, (0, common_1.Param)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VenueController.prototype, "getVenueStats", null);
exports.VenueController = VenueController = __decorate([
    (0, swagger_1.ApiTags)('Venues'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('venues'),
    __metadata("design:paramtypes", [venue_service_1.VenueService])
], VenueController);
//# sourceMappingURL=venue.controller.js.map