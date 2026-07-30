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
exports.FacilityPaginatedResponseDto = exports.FacilityResponseDto = exports.FacilitySearchDto = exports.UpdateFacilityDto = exports.CreateFacilityDto = exports.CreateAccessHoursDto = exports.CreateAccessControlDto = exports.CreateCleaningScheduleDto = exports.CreateMaintenanceScheduleDto = exports.CreateCoordinatesDto = exports.CreateFacilityLocationDto = exports.CreateFacilityFeaturesDto = exports.CreateFacilityDimensionsDto = exports.CreateFacilityCapacityDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const facility_schema_1 = require("../schemas/facility.schema");
class CreateFacilityCapacityDto {
}
exports.CreateFacilityCapacityDto = CreateFacilityCapacityDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityCapacityDto.prototype, "seated", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityCapacityDto.prototype, "standing", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityCapacityDto.prototype, "wheelchairAccessible", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityCapacityDto.prototype, "maxOccupancy", void 0);
class CreateFacilityDimensionsDto {
}
exports.CreateFacilityDimensionsDto = CreateFacilityDimensionsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDimensionsDto.prototype, "length", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDimensionsDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDimensionsDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDimensionsDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFacilityDimensionsDto.prototype, "volume", void 0);
class CreateFacilityFeaturesDto {
}
exports.CreateFacilityFeaturesDto = CreateFacilityFeaturesDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasHVAC", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasWiFi", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasPowerOutlets", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasWaterSupply", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasDrainage", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasNaturalLight", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasEmergencyLighting", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasFireExtinguisher", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasFirstAidKit", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasSecurityCamera", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasAccessControl", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "isWheelchairAccessible", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasAudioSystem", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasVideoDisplay", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityFeaturesDto.prototype, "hasClimateControl", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateFacilityFeaturesDto.prototype, "customFeatures", void 0);
class CreateFacilityLocationDto {
}
exports.CreateFacilityLocationDto = CreateFacilityLocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacilityLocationDto.prototype, "floor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacilityLocationDto.prototype, "section", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFacilityLocationDto.prototype, "roomNumber", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCoordinatesDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCoordinatesDto)
], CreateFacilityLocationDto.prototype, "coordinates", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFacilityLocationDto.prototype, "nearestCourt", void 0);
class CreateCoordinatesDto {
}
exports.CreateCoordinatesDto = CreateCoordinatesDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCoordinatesDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCoordinatesDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCoordinatesDto.prototype, "z", void 0);
class CreateMaintenanceScheduleDto {
}
exports.CreateMaintenanceScheduleDto = CreateMaintenanceScheduleDto;
__decorate([
    (0, class_validator_1.IsEnum)(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as_needed']),
    __metadata("design:type", String)
], CreateMaintenanceScheduleDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateMaintenanceScheduleDto.prototype, "lastMaintenance", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateMaintenanceScheduleDto.prototype, "nextMaintenance", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMaintenanceScheduleDto.prototype, "maintenanceTasks", void 0);
class CreateCleaningScheduleDto {
}
exports.CreateCleaningScheduleDto = CreateCleaningScheduleDto;
__decorate([
    (0, class_validator_1.IsEnum)(['daily', 'weekly', 'monthly', 'after_each_use', 'as_needed']),
    __metadata("design:type", String)
], CreateCleaningScheduleDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateCleaningScheduleDto.prototype, "lastCleaning", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateCleaningScheduleDto.prototype, "nextCleaning", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCleaningScheduleDto.prototype, "cleaningProtocol", void 0);
class CreateAccessControlDto {
}
exports.CreateAccessControlDto = CreateAccessControlDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAccessControlDto.prototype, "requiredAccessLevel", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAccessControlDto.prototype, "requiresKeyCard", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAccessControlDto.prototype, "requiresBiometric", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAccessHoursDto),
    __metadata("design:type", Array)
], CreateAccessControlDto.prototype, "accessHours", void 0);
class CreateAccessHoursDto {
}
exports.CreateAccessHoursDto = CreateAccessHoursDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], CreateAccessHoursDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/),
    __metadata("design:type", String)
], CreateAccessHoursDto.prototype, "end", void 0);
class CreateFacilityDto {
    constructor() {
        this.status = facility_schema_1.FacilityStatus.AVAILABLE;
        this.assignedEquipment = [];
        this.metadata = {};
    }
}
exports.CreateFacilityDto = CreateFacilityDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "facilityCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(facility_schema_1.FacilityType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "facilityType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityLocationDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateFacilityLocationDto)
], CreateFacilityDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityCapacityDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateFacilityCapacityDto)
], CreateFacilityDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityDimensionsDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateFacilityDimensionsDto)
], CreateFacilityDto.prototype, "dimensions", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityFeaturesDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateFacilityFeaturesDto)
], CreateFacilityDto.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(facility_schema_1.FacilityStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateFacilityDto.prototype, "assignedEquipment", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateMaintenanceScheduleDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateMaintenanceScheduleDto)
], CreateFacilityDto.prototype, "maintenanceSchedule", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCleaningScheduleDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateCleaningScheduleDto)
], CreateFacilityDto.prototype, "cleaningSchedule", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateAccessControlDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", CreateAccessControlDto)
], CreateFacilityDto.prototype, "accessControl", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFacilityDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "createdBy", void 0);
class UpdateFacilityDto {
}
exports.UpdateFacilityDto = UpdateFacilityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateFacilityDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateFacilityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityLocationDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateFacilityLocationDto)
], UpdateFacilityDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityCapacityDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateFacilityCapacityDto)
], UpdateFacilityDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateFacilityFeaturesDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateFacilityFeaturesDto)
], UpdateFacilityDto.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(facility_schema_1.FacilityStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFacilityDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], UpdateFacilityDto.prototype, "assignedEquipment", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateMaintenanceScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateMaintenanceScheduleDto)
], UpdateFacilityDto.prototype, "maintenanceSchedule", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCleaningScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCleaningScheduleDto)
], UpdateFacilityDto.prototype, "cleaningSchedule", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateAccessControlDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateAccessControlDto)
], UpdateFacilityDto.prototype, "accessControl", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateFacilityDto.prototype, "metadata", void 0);
class FacilitySearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.FacilitySearchDto = FacilitySearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FacilitySearchDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FacilitySearchDto.prototype, "venueId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(facility_schema_1.FacilityType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FacilitySearchDto.prototype, "facilityType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(facility_schema_1.FacilityStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FacilitySearchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FacilitySearchDto.prototype, "nearestCourt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FacilitySearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], FacilitySearchDto.prototype, "limit", void 0);
class FacilityResponseDto {
}
exports.FacilityResponseDto = FacilityResponseDto;
class FacilityPaginatedResponseDto {
}
exports.FacilityPaginatedResponseDto = FacilityPaginatedResponseDto;
//# sourceMappingURL=facility.dto.js.map