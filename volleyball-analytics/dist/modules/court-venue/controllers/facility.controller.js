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
exports.FacilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facility_service_1 = require("../services/facility.service");
const facility_dto_1 = require("../dtos/facility.dto");
const api_response_1 = require("@shared/api-response");
let FacilityController = class FacilityController {
    constructor(facilityService) {
        this.facilityService = facilityService;
    }
    async createFacility(createFacilityDto) {
        const facility = await this.facilityService.createFacility(createFacilityDto);
        return api_response_1.ApiResponseBuilder.success(facility, 'Facility created successfully');
    }
    async getFacilities(venueId, facilityType, status, page = 1, limit = 20) {
        const result = await this.facilityService.getFacilitiesByVenue(venueId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Facilities retrieved successfully');
    }
    async getFacilityById(id) {
        const facility = await this.facilityService.getFacilityById(id);
        return api_response_1.ApiResponseBuilder.success(facility, 'Facility retrieved successfully');
    }
    async updateFacility(id, updateFacilityDto) {
        const facility = await this.facilityService.updateFacility(id, updateFacilityDto);
        return api_response_1.ApiResponseBuilder.success(facility, 'Facility updated successfully');
    }
    async updateFacilityStatus(id, status) {
        const facility = await this.facilityService.updateStatus(id, status);
        return api_response_1.ApiResponseBuilder.success(facility, 'Facility status updated successfully');
    }
    async assignEquipment(id, equipmentId) {
        const facility = await this.facilityService.assignEquipment(id, equipmentId);
        return api_response_1.ApiResponseBuilder.success(facility, 'Equipment assigned successfully');
    }
    async removeEquipment(id, equipmentId) {
        const facility = await this.facilityService.removeEquipment(id, equipmentId);
        return api_response_1.ApiResponseBuilder.success(facility, 'Equipment removed successfully');
    }
    async updateUtilization(id, hoursUsed) {
        const facility = await this.facilityService.updateUtilization(id, hoursUsed);
        return api_response_1.ApiResponseBuilder.success(facility, 'Utilization updated successfully');
    }
    async updateMaintenanceSchedule(id, lastMaintenance, nextMaintenance) {
        const facility = await this.facilityService.updateMaintenanceSchedule(id, lastMaintenance, nextMaintenance);
        return api_response_1.ApiResponseBuilder.success(facility, 'Maintenance schedule updated successfully');
    }
    async getFacilityStats(venueId) {
        const stats = await this.facilityService.getFacilityStats(venueId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Facility statistics retrieved successfully');
    }
    async decommissionFacility(id, reason) {
        const facility = await this.facilityService.decommissionFacility(id, reason);
        return api_response_1.ApiResponseBuilder.success(facility, 'Facility decommissioned successfully');
    }
};
exports.FacilityController = FacilityController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create facility' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Facility created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Facility code already exists in venue' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [facility_dto_1.CreateFacilityDto]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "createFacility", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List facilities with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'venueId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'facilityType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('venueId')),
    __param(1, (0, common_1.Query)('facilityType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "getFacilities", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get facility by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "getFacilityById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update facility' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, facility_dto_1.UpdateFacilityDto]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "updateFacility", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update facility status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "updateFacilityStatus", null);
__decorate([
    (0, common_1.Post)(':id/equipment/:equipmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign equipment to facility' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiParam)({ name: 'equipmentId', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility or equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "assignEquipment", null);
__decorate([
    (0, common_1.Delete)(':id/equipment/:equipmentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove equipment from facility' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiParam)({ name: 'equipmentId', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('equipmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "removeEquipment", null);
__decorate([
    (0, common_1.Post)(':id/utilization'),
    (0, swagger_1.ApiOperation)({ summary: 'Update facility utilization' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilization updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('hoursUsed')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "updateUtilization", null);
__decorate([
    (0, common_1.Post)(':id/maintenance-schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Update maintenance schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance schedule updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('lastMaintenance')),
    __param(2, (0, common_1.Body)('nextMaintenance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "updateMaintenanceSchedule", null);
__decorate([
    (0, common_1.Get)('stats/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get facility statistics for venue' }),
    (0, swagger_1.ApiParam)({ name: 'venueId', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('venueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "getFacilityStats", null);
__decorate([
    (0, common_1.Patch)(':id/decommission'),
    (0, swagger_1.ApiOperation)({ summary: 'Decommission facility' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Facility ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Facility decommissioned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "decommissionFacility", null);
exports.FacilityController = FacilityController = __decorate([
    (0, swagger_1.ApiTags)('Facilities'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('facilities'),
    __metadata("design:paramtypes", [facility_service_1.FacilityService])
], FacilityController);
//# sourceMappingURL=facility.controller.js.map