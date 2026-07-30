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
exports.CameraPaginatedResponseDto = exports.CameraResponseDto = exports.CalibrateCameraDto = exports.ActivateCameraDto = exports.CameraSearchDto = exports.UpdateCameraDto = exports.CreateCameraDto = exports.CreateCameraSpecsDto = exports.CreateCameraStreamConfigDto = exports.CreateCameraResolutionDto = exports.CreateCameraFOVDto = exports.CreateCameraPositionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const camera_schema_1 = require("../schemas/camera.schema");
class CreateCameraPositionDto {
}
exports.CreateCameraPositionDto = CreateCameraPositionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "z", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "roll", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "pitch", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateCameraPositionDto.prototype, "yaw", void 0);
class CreateCameraFOVDto {
}
exports.CreateCameraFOVDto = CreateCameraFOVDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateCameraFOVDto.prototype, "horizontal", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateCameraFOVDto.prototype, "vertical", void 0);
class CreateCameraResolutionDto {
}
exports.CreateCameraResolutionDto = CreateCameraResolutionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(320),
    __metadata("design:type", Number)
], CreateCameraResolutionDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(240),
    __metadata("design:type", Number)
], CreateCameraResolutionDto.prototype, "height", void 0);
class CreateCameraStreamConfigDto {
}
exports.CreateCameraStreamConfigDto = CreateCameraStreamConfigDto;
__decorate([
    (0, class_validator_1.IsEnum)(['rtsp', 'rtmp', 'http', 'https', 'websocket', 'srt', 'ndi']),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "protocol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "streamPath", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "backupUrl", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['tcp', 'udp', 'multicast']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraStreamConfigDto.prototype, "transport", void 0);
class CreateCameraSpecsDto {
}
exports.CreateCameraSpecsDto = CreateCameraSpecsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraSpecsDto.prototype, "sensorType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraSpecsDto.prototype, "sensorSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCameraSpecsDto.prototype, "focalLength", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraSpecsDto.prototype, "aperture", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraSpecsDto.prototype, "isoRange", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraSpecsDto.prototype, "shutterSpeedRange", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCameraSpecsDto.prototype, "whiteBalance", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCameraSpecsDto.prototype, "focusMode", void 0);
class CreateCameraDto {
    constructor() {
        this.status = camera_schema_1.CameraStatus.REGISTERED;
        this.assignedCoverageZones = [];
        this.metadata = {};
    }
}
exports.CreateCameraDto = CreateCameraDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "courtId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "cameraId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraManufacturer),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "serialNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "firmwareVersion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraMountType),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "mountType", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraPositionDto),
    __metadata("design:type", CreateCameraPositionDto)
], CreateCameraDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraFOVDto),
    __metadata("design:type", CreateCameraFOVDto)
], CreateCameraDto.prototype, "fieldOfView", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraResolutionDto),
    __metadata("design:type", CreateCameraResolutionDto)
], CreateCameraDto.prototype, "resolution", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(240),
    __metadata("design:type", Number)
], CreateCameraDto.prototype, "frameRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCameraDto.prototype, "bitrate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "codec", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraStreamConfigDto),
    __metadata("design:type", CreateCameraStreamConfigDto)
], CreateCameraDto.prototype, "streamConfig", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraSpecsDto),
    __metadata("design:type", CreateCameraSpecsDto)
], CreateCameraDto.prototype, "specs", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateCameraDto.prototype, "assignedCoverageZones", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "calibrationProfileId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCameraDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCameraDto.prototype, "createdBy", void 0);
class UpdateCameraDto {
}
exports.UpdateCameraDto = UpdateCameraDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCameraDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraPositionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCameraPositionDto)
], UpdateCameraDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraFOVDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCameraFOVDto)
], UpdateCameraDto.prototype, "fieldOfView", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(240),
    __metadata("design:type", Number)
], UpdateCameraDto.prototype, "frameRate", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CreateCameraStreamConfigDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateCameraStreamConfigDto)
], UpdateCameraDto.prototype, "streamConfig", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCameraDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCameraDto.prototype, "calibrationProfileId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], UpdateCameraDto.prototype, "assignedCoverageZones", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCameraDto.prototype, "metadata", void 0);
class CameraSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.CameraSearchDto = CameraSearchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "courtId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraManufacturer),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "manufacturer", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraMountType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "mountType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(camera_schema_1.CameraStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CameraSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CameraSearchDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CameraSearchDto.prototype, "sortOrder", void 0);
class ActivateCameraDto {
}
exports.ActivateCameraDto = ActivateCameraDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActivateCameraDto.prototype, "cameraId", void 0);
class CalibrateCameraDto {
}
exports.CalibrateCameraDto = CalibrateCameraDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CalibrateCameraDto.prototype, "cameraId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CalibrateCameraDto.prototype, "calibrationProfileId", void 0);
class CameraResponseDto {
}
exports.CameraResponseDto = CameraResponseDto;
class CameraPaginatedResponseDto {
}
exports.CameraPaginatedResponseDto = CameraPaginatedResponseDto;
//# sourceMappingURL=camera.dto.js.map