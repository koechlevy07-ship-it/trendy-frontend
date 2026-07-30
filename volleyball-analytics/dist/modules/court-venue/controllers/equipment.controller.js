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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const equipment_service_1 = require("../services/equipment.service");
const equipment_dto_1 = require("../dtos/equipment.dto");
const api_response_1 = require("@shared/api-response");
let EquipmentController = class EquipmentController {
    constructor(equipmentService) {
        this.equipmentService = equipmentService;
    }
    async createEquipment(createEquipmentDto) {
        const equipment = await this.equipmentService.createEquipment(createEquipmentDto);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment registered successfully');
    }
    async getEquipment(venueId, category, status, condition, page = 1, limit = 20) {
        const result = await this.equipmentService.getEquipmentByVenue(venueId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Equipment retrieved successfully');
    }
    async getEquipmentById(id) {
        const equipment = await this.equipmentService.getEquipmentById(id);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment retrieved successfully');
    }
    async updateEquipment(id, updateEquipmentDto) {
        const equipment = await this.equipmentService.updateEquipment(id, updateEquipmentDto);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment updated successfully');
    }
    async assignEquipment(id, userId, location) {
        const equipment = await this.equipmentService.assignEquipment(id, userId, location);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment assigned successfully');
    }
    async unassignEquipment(id) {
        const equipment = await this.equipmentService.unassignEquipment(id);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment unassigned successfully');
    }
    async addMaintenanceRecord(id, maintenanceRecord) {
        const equipment = await this.equipmentService.addMaintenanceRecord(id, maintenanceRecord);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Maintenance record added successfully');
    }
    async addCertification(id, certification) {
        const equipment = await this.equipmentService.addCertification(id, certification);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Certification added successfully');
    }
    async updateCertificationStatus(id, index, status) {
        const equipment = await this.equipmentService.updateCertificationStatus(id, index, status);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Certification status updated successfully');
    }
    async addCalibrationRecord(id, calibrationRecord) {
        const equipment = await this.equipmentService.addCalibrationRecord(id, calibrationRecord);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Calibration record added successfully');
    }
    async retireEquipment(id, reason) {
        const equipment = await this.equipmentService.retireEquipment(id, reason);
        return api_response_1.ApiResponseBuilder.success(equipment, 'Equipment retired successfully');
    }
    async getEquipmentStats(venueId) {
        const stats = await this.equipmentService.getEquipmentStats(venueId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Equipment statistics retrieved successfully');
    }
};
exports.EquipmentController = EquipmentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register equipment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Equipment registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Equipment code or serial number already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof equipment_dto_1.CreateEquipmentDto !== "undefined" && equipment_dto_1.CreateEquipmentDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "createEquipment", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List equipment with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'venueId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'condition', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('venueId')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('condition')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "getEquipment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get equipment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "getEquipmentById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update equipment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof equipment_dto_1.UpdateEquipmentDto !== "undefined" && equipment_dto_1.UpdateEquipmentDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "updateEquipment", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign equipment to user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment assigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "assignEquipment", null);
__decorate([
    (0, common_1.Post)(':id/unassign'),
    (0, swagger_1.ApiOperation)({ summary: 'Unassign equipment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment unassigned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "unassignEquipment", null);
__decorate([
    (0, common_1.Post)(':id/maintenance'),
    (0, swagger_1.ApiOperation)({ summary: 'Add maintenance record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance record added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "addMaintenanceRecord", null);
__decorate([
    (0, common_1.Post)(':id/certification'),
    (0, swagger_1.ApiOperation)({ summary: 'Add certification to equipment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certification added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "addCertification", null);
__decorate([
    (0, common_1.Patch)(':id/certification/:index/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update certification status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiParam)({ name: 'index', description: 'Certification index' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certification status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('index')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "updateCertificationStatus", null);
__decorate([
    (0, common_1.Post)(':id/calibration'),
    (0, swagger_1.ApiOperation)({ summary: 'Add calibration record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration record added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "addCalibrationRecord", null);
__decorate([
    (0, common_1.Patch)(':id/retire'),
    (0, swagger_1.ApiOperation)({ summary: 'Retire equipment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Equipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment retired successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Equipment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "retireEquipment", null);
__decorate([
    (0, common_1.Get)('stats/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get equipment statistics for venue' }),
    (0, swagger_1.ApiParam)({ name: 'venueId', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Equipment statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('venueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EquipmentController.prototype, "getEquipmentStats", null);
exports.EquipmentController = EquipmentController = __decorate([
    (0, swagger_1.ApiTags)('Equipment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('equipment'),
    __metadata("design:paramtypes", [typeof (_a = typeof equipment_service_1.EquipmentService !== "undefined" && equipment_service_1.EquipmentService) === "function" ? _a : Object])
], EquipmentController);
//# sourceMappingURL=equipment.controller.js.map