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
exports.SensorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sensor_service_1 = require("../services/sensor.service");
const sensor_dto_1 = require("../dtos/sensor.dto");
const api_response_1 = require("@shared/api-response");
let SensorController = class SensorController {
    constructor(sensorService) {
        this.sensorService = sensorService;
    }
    async createSensor(createSensorDto) {
        const sensor = await this.sensorService.createSensor(createSensorDto);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Sensor registered successfully');
    }
    async getSensors(venueId, courtId, facilityId, equipmentId, sensorType, status, page = 1, limit = 20) {
        const result = await this.sensorService.getSensorsByVenue(venueId, page, limit);
        return api_response_1.ApiResponseBuilder.paginated(result.data, { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages }, 'Sensors retrieved successfully');
    }
    async getSensorById(id) {
        const sensor = await this.sensorService.getSensorById(id);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Sensor retrieved successfully');
    }
    async updateSensor(id, updateSensorDto) {
        const sensor = await this.sensorService.updateSensor(id, updateSensorDto);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Sensor updated successfully');
    }
    async updateSensorStatus(id, status) {
        const sensor = await this.sensorService.updateSensorStatus(id, status);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Sensor status updated successfully');
    }
    async recordReading(id, reading) {
        const sensor = await this.sensorService.recordReading(id, reading.value, reading.unit, reading.quality, reading.metadata);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Reading recorded successfully');
    }
    async recordCalibration(id, calibration) {
        const sensor = await this.sensorService.recordCalibration(id, calibration);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Calibration recorded successfully');
    }
    async updateBatteryLevel(id, level) {
        const sensor = await this.sensorService.updateBatteryLevel(id, level);
        return api_response_1.ApiResponseBuilder.success(sensor, 'Battery level updated successfully');
    }
    async getSensorStats(venueId) {
        const stats = await this.sensorService.getSensorStats(venueId);
        return api_response_1.ApiResponseBuilder.success(stats, 'Sensor statistics retrieved successfully');
    }
};
exports.SensorController = SensorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register sensor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sensor registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Sensor ID or serial number already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof sensor_dto_1.CreateSensorDto !== "undefined" && sensor_dto_1.CreateSensorDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "createSensor", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List sensors with search and pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'venueId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'courtId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'facilityId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'equipmentId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sensorType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('venueId')),
    __param(1, (0, common_1.Query)('courtId')),
    __param(2, (0, common_1.Query)('facilityId')),
    __param(3, (0, common_1.Query)('equipmentId')),
    __param(4, (0, common_1.Query)('sensorType')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getSensors", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sensor by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getSensorById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sensor' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof sensor_dto_1.UpdateSensorDto !== "undefined" && sensor_dto_1.UpdateSensorDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "updateSensor", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sensor status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "updateSensorStatus", null);
__decorate([
    (0, common_1.Post)(':id/reading'),
    (0, swagger_1.ApiOperation)({ summary: 'Record sensor reading' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reading recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "recordReading", null);
__decorate([
    (0, common_1.Post)(':id/calibration'),
    (0, swagger_1.ApiOperation)({ summary: 'Record sensor calibration' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calibration recorded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "recordCalibration", null);
__decorate([
    (0, common_1.Patch)(':id/battery'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sensor battery level' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Battery level updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "updateBatteryLevel", null);
__decorate([
    (0, common_1.Get)('stats/:venueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sensor statistics for venue' }),
    (0, swagger_1.ApiParam)({ name: 'venueId', description: 'Venue ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor statistics retrieved successfully' }),
    __param(0, (0, common_1.Param)('venueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getSensorStats", null);
exports.SensorController = SensorController = __decorate([
    (0, swagger_1.ApiTags)('Sensors'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sensors'),
    __metadata("design:paramtypes", [typeof (_a = typeof sensor_service_1.SensorService !== "undefined" && sensor_service_1.SensorService) === "function" ? _a : Object])
], SensorController);
//# sourceMappingURL=sensor.controller.js.map