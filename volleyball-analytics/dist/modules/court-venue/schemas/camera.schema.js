"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera = exports.CameraManufacturer = exports.CameraStatus = exports.CameraMountType = void 0;
const mongoose_1 = require("mongoose");
var CameraMountType;
(function (CameraMountType) {
    CameraMountType["CEILING"] = "ceiling";
    CameraMountType["WALL"] = "wall";
    CameraMountType["POLE"] = "pole";
    CameraMountType["TRIPOD"] = "tripod";
    CameraMountType["GANTRY"] = "gantry";
    CameraMountType["HANDHELD"] = "handheld";
    CameraMountType["DRONE"] = "drone";
})(CameraMountType || (exports.CameraMountType = CameraMountType = {}));
var CameraStatus;
(function (CameraStatus) {
    CameraStatus["REGISTERED"] = "registered";
    CameraStatus["CONNECTING"] = "connecting";
    CameraStatus["CONNECTED"] = "connected";
    CameraStatus["ACTIVE"] = "active";
    CameraStatus["INACTIVE"] = "inactive";
    CameraStatus["CALIBRATING"] = "calibrating";
    CameraStatus["CALIBRATED"] = "calibrated";
    CameraStatus["ERROR"] = "error";
    CameraStatus["MAINTENANCE"] = "maintenance";
    CameraStatus["DECOMMISSIONED"] = "decommissioned";
})(CameraStatus || (exports.CameraStatus = CameraStatus = {}));
var CameraManufacturer;
(function (CameraManufacturer) {
    CameraManufacturer["SONY"] = "sony";
    CameraManufacturer["PANASONIC"] = "panasonic";
    CameraManufacturer["CANON"] = "canon";
    CameraManufacturer["HIKVISION"] = "hikvision";
    CameraManufacturer["DAHUA"] = "dahua";
    CameraManufacturer["AXIS"] = "axis";
    CameraManufacturer["BOSCH"] = "bosch";
    CameraManufacturer["FLIR"] = "flir";
    CameraManufacturer["BASLER"] = "basler";
    CameraManufacturer["IDS"] = "ids";
    CameraManufacturer["POINT_GREY"] = "point_grey";
    CameraManufacturer["LOGITECH"] = "logitech";
    CameraManufacturer["GOPRO"] = "gopro";
    CameraManufacturer["DJI"] = "dji";
    CameraManufacturer["CUSTOM"] = "custom";
})(CameraManufacturer || (exports.CameraManufacturer = CameraManufacturer = {}));
const CameraPositionSchema = new mongoose_1.Schema({ x: { type: Number, required: true }, y: { type: Number, required: true }, z: { type: Number, required: true }, roll: { type: Number, required: true, min: -180, max: 180 }, pitch: { type: Number, required: true, min: -90, max: 90 }, yaw: { type: Number, required: true, min: -180, max: 180 } }, { _id: false });
const CameraFOVSchema = new mongoose_1.Schema({ horizontal: { type: Number, required: true, min: 1, max: 180 }, vertical: { type: Number, required: true, min: 1, max: 180 } }, { _id: false });
const CameraResolutionSchema = new mongoose_1.Schema({ width: { type: Number, required: true, min: 320, max: 8192 }, height: { type: Number, required: true, min: 240, max: 8192 } }, { _id: false });
const CameraStreamConfigSchema = new mongoose_1.Schema({ protocol: { type: String, enum: ['rtsp', 'rtmp', 'http', 'https', 'websocket', 'srt', 'ndi'], required: true }, url: { type: String, required: true, trim: true }, username: { type: String, trim: true }, password: { type: String, trim: true }, streamPath: { type: String, trim: true }, backupUrl: { type: String, trim: true }, transport: { type: String, enum: ['tcp', 'udp', 'multicast'] } }, { _id: false });
const CameraSpecsSchema = new mongoose_1.Schema({ sensorType: { type: String, required: true }, sensorSize: { type: String, required: true }, focalLength: { type: Number, required: true, min: 1, max: 1000 }, aperture: { type: String, required: true }, isoRange: { type: String, required: true }, shutterSpeedRange: { type: String, required: true }, whiteBalance: [{ type: String }], focusMode: [{ type: String }] }, { _id: false });
const CameraSchema = new mongoose_1.Schema({
    courtId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Court' },
    cameraId: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    manufacturer: { type: String, enum: Object.values(CameraManufacturer), required: true },
    model: { type: String, required: true, trim: true, maxlength: 100 },
    serialNumber: { type: String, required: true, trim: true, unique: true },
    firmwareVersion: { type: String, trim: true },
    mountType: { type: String, enum: Object.values(CameraMountType), required: true },
    position: { type: CameraPositionSchema, required: true },
    fieldOfView: { type: CameraFOVSchema, required: true },
    resolution: { type: CameraResolutionSchema, required: true },
    frameRate: { type: Number, required: true, min: 15, max: 240 },
    bitrate: { type: Number, min: 1000, max: 100000000 },
    codec: { type: String, enum: ['h264', 'h265', 'mjpeg', 'vp8', 'vp9', 'av1'] },
    streamConfig: { type: CameraStreamConfigSchema, required: true },
    specs: { type: CameraSpecsSchema, required: true },
    status: { type: String, enum: Object.values(CameraStatus), default: CameraStatus.REGISTERED },
    assignedCoverageZones: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CoverageZone' }],
    calibrationProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CalibrationProfile' },
    healthMetrics: { lastHeartbeat: { type: Date }, uptimePercentage: { type: Number, default: 100, min: 0, max: 100 }, frameDropRate: { type: Number, default: 0, min: 0, max: 100 }, latencyMs: { type: Number, default: 0, min: 0 }, errorCount: { type: Number, default: 0 }, lastError: { type: String } },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    connectedAt: { type: Date }, activatedAt: { type: Date }, calibratedAt: { type: Date }, decommissionedAt: { type: Date },
}, { timestamps: true, collection: 'cameras' });
CameraSchema.index({ courtId: 1, status: 1 });
CameraSchema.index({ cameraId: 1 });
CameraSchema.index({ serialNumber: 1 });
CameraSchema.index({ status: 1 });
CameraSchema.index({ calibrationProfileId: 1 });
CameraSchema.index({ assignedCoverageZones: 1 });
CameraSchema.pre('validate', function (next) { if (this.status === CameraStatus.ACTIVE && !this.calibrationProfileId)
    this.status = CameraStatus.CONNECTED; next(); });
exports.Camera = mongoose_1.models.Camera || (0, mongoose_1.model)('Camera', CameraSchema);
//# sourceMappingURL=camera.schema.js.map