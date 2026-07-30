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
exports.CalibrationProfilePaginatedResponseDto = exports.CalibrationProfileResponseDto = exports.ValidateCalibrationDto = exports.ActivateCalibrationDto = exports.CalibrationProfileSearchDto = exports.UpdateCalibrationProfileDto = exports.CreateCalibrationProfileDto = exports.CreateCalibrationMetricsDto = exports.CreateHomographyMatrixDto = exports.CreateImageCoordinatesDto = exports.CreateWorldCoordinatesDto = exports.CreateReferencePointDto = exports.CreateExtrinsicParametersDto = exports.CreateIntrinsicParametersDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const calibration_schema_1 = require("../schemas/calibration.schema");
class CreateIntrinsicParametersDto {
}
exports.CreateIntrinsicParametersDto = CreateIntrinsicParametersDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateIntrinsicParametersDto.prototype, "focalLengthX", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateIntrinsicParametersDto.prototype, "focalLengthY", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateIntrinsicParametersDto.prototype, "principalPointX", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateIntrinsicParametersDto.prototype, "principalPointY", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateIntrinsicParametersDto.prototype, "skew", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateIntrinsicParametersDto.prototype, "distortionCoefficients", void 0);
class CreateExtrinsicParametersDto {
}
exports.CreateExtrinsicParametersDto = CreateExtrinsicParametersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateExtrinsicParametersDto.prototype, "rotationMatrix", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateExtrinsicParametersDto.prototype, "translationVector", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExtrinsicParametersDto.prototype, "cameraHeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExtrinsicParametersDto.prototype, "cameraTilt", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExtrinsicParametersDto.prototype, "cameraPan", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExtrinsicParametersDto.prototype, "cameraRoll", void 0);
class CreateReferencePointDto {
}
exports.CreateReferencePointDto = CreateReferencePointDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReferencePointDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReferencePointDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateWorldCoordinatesDto),
    __metadata("design:type", CreateWorldCoordinatesDto)
], CreateReferencePointDto.prototype, "worldCoordinates", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateImageCoordinatesDto),
    __metadata("design:type", CreateImageCoordinatesDto)
], CreateReferencePointDto.prototype, "imageCoordinates", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateReferencePointDto.prototype, "confidence", void 0);
class CreateWorldCoordinatesDto {
}
exports.CreateWorldCoordinatesDto = CreateWorldCoordinatesDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorldCoordinatesDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorldCoordinatesDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorldCoordinatesDto.prototype, "z", void 0);
class CreateImageCoordinatesDto {
}
exports.CreateImageCoordinatesDto = CreateImageCoordinatesDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImageCoordinatesDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImageCoordinatesDto.prototype, "y", void 0);
class CreateHomographyMatrixDto {
}
exports.CreateHomographyMatrixDto = CreateHomographyMatrixDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateHomographyMatrixDto.prototype, "matrix", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateImageCoordinatesDto),
    __metadata("design:type", Array)
], CreateHomographyMatrixDto.prototype, "sourcePoints", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateImageCoordinatesDto),
    __metadata("design:type", Array)
], CreateHomographyMatrixDto.prototype, "destinationPoints", void 0);
class CreateCalibrationMetricsDto {
}
exports.CreateCalibrationMetricsDto = CreateCalibrationMetricsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "reprojectionError", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "rmsError", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "maxError", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "standardDeviation", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(4),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "pointCount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(4),
    __metadata("design:type", Number)
], CreateCalibrationMetricsDto.prototype, "validPointCount", void 0);
class CreateCalibrationProfileDto {
}
exports.CreateCalibrationProfileDto = CreateCalibrationProfileDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCalibrationProfileDto.prototype, "cameraInstallationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateCalibrationProfileDto.prototype, "profileName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(calibration_schema_1.CalibrationMethod),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCalibrationProfileDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateIntrinsicParametersDto),
    __metadata("design:type", CreateIntrinsicParametersDto)
], CreateCalibrationProfileDto.prototype, "intrinsicParameters", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateExtrinsicParametersDto),
    __metadata("design:type", CreateExtrinsicParametersDto)
], CreateCalibrationProfileDto.prototype, "extrinsicParameters", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateReferencePointDto),
    __metadata("design:type", Array)
], CreateCalibrationProfileDto.prototype, "referencePoints", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateHomographyMatrixDto),
    __metadata("design:type", CreateHomographyMatrixDto)
], CreateCalibrationProfileDto.prototype, "homographyMatrix", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCalibrationMetricsDto),
    __metadata("design:type", CreateCalibrationMetricsDto)
], CreateCalibrationProfileDto.prototype, "metrics", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCalibrationProfileDto.prototype, "aiMetadata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCalibrationProfileDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCalibrationProfileDto.prototype, "createdBy", void 0);
class UpdateCalibrationProfileDto {
}
exports.UpdateCalibrationProfileDto = UpdateCalibrationProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateCalibrationProfileDto.prototype, "profileName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(calibration_schema_1.CalibrationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalibrationProfileDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateIntrinsicParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateIntrinsicParametersDto)
], UpdateCalibrationProfileDto.prototype, "intrinsicParameters", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateExtrinsicParametersDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateExtrinsicParametersDto)
], UpdateCalibrationProfileDto.prototype, "extrinsicParameters", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateReferencePointDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateCalibrationProfileDto.prototype, "referencePoints", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateHomographyMatrixDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateHomographyMatrixDto)
], UpdateCalibrationProfileDto.prototype, "homographyMatrix", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCalibrationMetricsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCalibrationMetricsDto)
], UpdateCalibrationProfileDto.prototype, "metrics", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCalibrationProfileDto.prototype, "aiMetadata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalibrationProfileDto.prototype, "notes", void 0);
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
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "cameraInstallationId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(calibration_schema_1.CalibrationStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(calibration_schema_1.CalibrationMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CalibrationProfileSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalibrationProfileSearchDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalibrationProfileSearchDto.prototype, "sortOrder", void 0);
class ActivateCalibrationDto {
}
exports.ActivateCalibrationDto = ActivateCalibrationDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActivateCalibrationDto.prototype, "activatedBy", void 0);
class ValidateCalibrationDto {
}
exports.ValidateCalibrationDto = ValidateCalibrationDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], ValidateCalibrationDto.prototype, "passed", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], ValidateCalibrationDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateCalibrationDto.prototype, "validatedBy", void 0);
class CalibrationProfileResponseDto {
}
exports.CalibrationProfileResponseDto = CalibrationProfileResponseDto;
class CalibrationProfilePaginatedResponseDto {
}
exports.CalibrationProfilePaginatedResponseDto = CalibrationProfilePaginatedResponseDto;
//# sourceMappingURL=calibration.dto.js.map