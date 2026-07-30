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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtPaginatedResponseDto = exports.CourtResponseDto = exports.AssignCameraDto = exports.SetMaintenanceDto = exports.ActivateCourtDto = exports.CourtSearchDto = exports.UpdateCourtDto = exports.CreateCourtDto = exports.CreateCourtAIConfigurationDto = exports.CreateCourtEquipmentDto = exports.CreateCourtDimensionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const court_schema_1 = require("../schemas/court.schema");
class CreateCourtDimensionsDto {
}
exports.CreateCourtDimensionsDto = CreateCourtDimensionsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "length", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "freeZoneLength", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "freeZoneWidth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.5),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "netHeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2.5),
    (0, class_validator_1.Max)(4),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "attackLineDistance", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(8),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "serviceZoneWidth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(7),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], CreateCourtDimensionsDto.prototype, "ceilingHeight", void 0);
class CreateCourtEquipmentDto {
}
exports.CreateCourtEquipmentDto = CreateCourtEquipmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "netSystem", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "posts", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "antennas", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "scoreboard", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "refereeStand", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "lighting", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtEquipmentDto.prototype, "flooring", void 0);
class CreateCourtAIConfigurationDto {
    constructor() {
        this.trackingEnabled = true;
        this.actionRecognitionEnabled = true;
        this.poseEstimationEnabled = true;
        this.ballTrackingEnabled = true;
        this.jerseyDetectionEnabled = true;
        this.customModelConfig = {};
    }
}
exports.CreateCourtAIConfigurationDto = CreateCourtAIConfigurationDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourtAIConfigurationDto.prototype, "cameraProfileId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourtAIConfigurationDto.prototype, "calibrationProfileId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourtAIConfigurationDto.prototype, "trackingEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourtAIConfigurationDto.prototype, "actionRecognitionEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourtAIConfigurationDto.prototype, "poseEstimationEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourtAIConfigurationDto.prototype, "ballTrackingEnabled", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCourtAIConfigurationDto.prototype, "jerseyDetectionEnabled", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCourtAIConfigurationDto.prototype, "customModelConfig", void 0);
class CreateCourtDto {
    constructor() {
        this.status = court_schema_1.CourtStatus.DRAFT;
        this.assignedCameraIds = [];
        this.metadata = {};
    }
}
exports.CreateCourtDto = CreateCourtDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "courtCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "courtName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.CourtType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "courtType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.SurfaceType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "surfaceType", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCourtDimensionsDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateCourtDimensionsDto)
], CreateCourtDto.prototype, "dimensions", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.CourtOrientation),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "orientation", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.CourtStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCourtEquipmentDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateCourtEquipmentDto)
], CreateCourtDto.prototype, "equipment", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCourtAIConfigurationDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateCourtAIConfigurationDto)
], CreateCourtDto.prototype, "aiConfiguration", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateCourtDto.prototype, "assignedCameraIds", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCourtDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourtDto.prototype, "createdBy", void 0);
class UpdateCourtDto {
}
exports.UpdateCourtDto = UpdateCourtDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateCourtDto.prototype, "availability", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.MaintenanceStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourtDto.prototype, "maintenanceStatus", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCourtDto.prototype, "equipment", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourtDto.prototype, "cameraProfile", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourtDto.prototype, "calibrationProfile", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCourtDto.prototype, "metadata", void 0);
class CourtSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.CourtSearchDto = CourtSearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.CourtType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "courtType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.SurfaceType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "surfaceType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.CourtStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(court_schema_1.MaintenanceStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "maintenanceStatus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CourtSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CourtSearchDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CourtSearchDto.prototype, "sortOrder", void 0);
class ActivateCourtDto {
}
exports.ActivateCourtDto = ActivateCourtDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActivateCourtDto.prototype, "activatedBy", void 0);
class SetMaintenanceDto {
}
exports.SetMaintenanceDto = SetMaintenanceDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], SetMaintenanceDto.prototype, "isUnderMaintenance", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SetMaintenanceDto.prototype, "maintenanceStartDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SetMaintenanceDto.prototype, "maintenanceEndDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SetMaintenanceDto.prototype, "maintenanceReason", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)({ each: true }),
    __metadata("design:type", Array)
], SetMaintenanceDto.prototype, "scheduledMaintenance", void 0);
class AssignCameraDto {
}
exports.AssignCameraDto = AssignCameraDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignCameraDto.prototype, "cameraId", void 0);
class CourtResponseDto {
}
exports.CourtResponseDto = CourtResponseDto;
class CourtPaginatedResponseDto {
}
exports.CourtPaginatedResponseDto = CourtPaginatedResponseDto;
//# sourceMappingURL=court.dto.js.map