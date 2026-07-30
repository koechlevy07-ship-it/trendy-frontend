"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverageZone = exports.CoverageZoneSchema = exports.CoveragePriority = exports.CoverageZoneType = void 0;
const mongoose_1 = require("mongoose");
var CoverageZoneType;
(function (CoverageZoneType) {
    CoverageZoneType["PLAY_AREA"] = "play_area";
    CoverageZoneType["FREE_ZONE"] = "free_zone";
    CoverageZoneType["SERVICE_ZONE"] = "service_zone";
    CoverageZoneType["SUBSTITUTION_ZONE"] = "substitution_zone";
    CoverageZoneType["LIBERO_ZONE"] = "libero_zone";
    CoverageZoneType["WARM_UP_AREA"] = "warm_up_area";
    CoverageZoneType["TEAM_BENCH"] = "team_bench";
    CoverageZoneType["OFFICIALS_TABLE"] = "officials_table";
    CoverageZoneType["REFEREE_POSITION"] = "referee_position";
    CoverageZoneType["LINE_JUDGE_POSITION"] = "line_judge_position";
    CoverageZoneType["CAMERA_POSITION"] = "camera_position";
    CoverageZoneType["SPECTATOR_AREA"] = "spectator_area";
    CoverageZoneType["MEDIA_AREA"] = "media_area";
    CoverageZoneType["BROADCAST_ZONE"] = "broadcast_zone";
    CoverageZoneType["CUSTOM"] = "custom";
})(CoverageZoneType || (exports.CoverageZoneType = CoverageZoneType = {}));
var CoveragePriority;
(function (CoveragePriority) {
    CoveragePriority["CRITICAL"] = "critical";
    CoveragePriority["HIGH"] = "high";
    CoveragePriority["MEDIUM"] = "medium";
    CoveragePriority["LOW"] = "low";
})(CoveragePriority || (exports.CoveragePriority = CoveragePriority = {}));
const CoverageRequirementsSchema = new mongoose_1.Schema({ minResolution: { width: { type: Number, required: true, min: 320 }, height: { type: Number, required: true, min: 240 } }, minFrameRate: { type: Number, required: true, min: 15, max: 240 }, maxLatencyMs: { type: Number, required: true, min: 0 }, requiredFOV: { horizontal: { type: Number, required: true, min: 1, max: 180 }, vertical: { type: Number, required: true, min: 1, max: 180 } }, overlapPercentage: { type: Number, required: true, min: 0, max: 100 }, redundancyLevel: { type: Number, required: true, min: 0, max: 5 } }, { _id: false });
const CalibrationRequirementsSchema = new mongoose_1.Schema({ minReferencePoints: { type: Number, required: true, min: 4 }, maxReprojectionError: { type: Number, required: true, min: 0.1 }, requiredAccuracy: { type: Number, required: true, min: 0 } }, { _id: false });
const AIRequirementsSchema = new mongoose_1.Schema({ detectionRequired: { type: Boolean, default: true }, trackingRequired: { type: Boolean, default: true }, poseEstimationRequired: { type: Boolean, default: false }, actionRecognitionRequired: { type: Boolean, default: false }, ballTrackingRequired: { type: Boolean, default: false }, jerseyDetectionRequired: { type: Boolean, default: false } }, { _id: false });
const CoverageMetricsSchema = new mongoose_1.Schema({ actualCameraCount: { type: Number, default: 0, min: 0 }, coveragePercentage: { type: Number, default: 0, min: 0, max: 100 }, averageResolution: { width: { type: Number, default: 0 }, height: { type: Number, default: 0 } }, averageFrameRate: { type: Number, default: 0 }, averageLatencyMs: { type: Number, default: 0 }, overlapAchieved: { type: Number, default: 0, min: 0, max: 100 }, redundancyAchieved: { type: Number, default: 0, min: 0 }, lastCalculated: { type: Date, default: Date.now } }, { _id: false });
const ValidationResultsSchema = new mongoose_1.Schema({ validatedAt: { type: Date, required: true }, validatedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, passed: { type: Boolean, required: true }, issues: [{ type: String, trim: true }], recommendations: [{ type: String, trim: true }] }, { _id: false });
const CoverageZoneSchema = new mongoose_1.Schema({
    courtId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Court' },
    zoneCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    zoneType: { type: String, enum: Object.values(CoverageZoneType), required: true },
    priority: { type: String, enum: Object.values(CoveragePriority), default: CoveragePriority.MEDIUM },
    geometry: { type: { type: String, enum: ['Polygon', 'Point'], required: true }, coordinates: { type: mongoose_1.Schema.Types.Mixed, required: true } },
    area: { type: Number, min: 0 },
    requiredCameraCount: { type: Number, required: true, min: 1, max: 20 },
    assignedCameras: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Camera' }],
    coverageRequirements: { type: CoverageRequirementsSchema, required: true },
    calibrationRequirements: { type: CalibrationRequirementsSchema, required: true },
    aiRequirements: { type: AIRequirementsSchema, required: true },
    status: { type: String, enum: ['designed', 'configured', 'calibrated', 'validated', 'active', 'degraded', 'offline'], default: 'designed' },
    coverageMetrics: { type: CoverageMetricsSchema, default: {} },
    validationResults: { type: ValidationResultsSchema },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true, collection: 'coverage_zones' });
CoverageZoneSchema.index({ courtId: 1, zoneCode: 1 }, { unique: true });
CoverageZoneSchema.index({ courtId: 1, zoneType: 1 });
CoverageZoneSchema.index({ courtId: 1, status: 1 });
CoverageZoneSchema.index({ assignedCameras: 1 });
CoverageZoneSchema.index({ geometry: '2dsphere' });
CoverageZoneSchema.virtual('isFullyCovered').get(function () { return this.coverageMetrics.coveragePercentage >= 95 && this.assignedCameras.length >= this.requiredCameraCount; });
CoverageZoneSchema.virtual('hasRedundancy').get(function () { return this.coverageMetrics.redundancyAchieved >= this.coverageRequirements.redundancyLevel; });
CoverageZoneSchema.methods.calculateMetrics = async function () { const Camera = mongoose_1.models.Camera || (await Promise.resolve().then(() => __importStar(require('./camera.schema')))).Camera; const cameras = await Camera.find({ _id: { $in: this.assignedCameras } }); if (cameras.length === 0) {
    this.coverageMetrics = { actualCameraCount: 0, coveragePercentage: 0, averageResolution: { width: 0, height: 0 }, averageFrameRate: 0, averageLatencyMs: 0, overlapAchieved: 0, redundancyAchieved: 0, lastCalculated: new Date() };
    return this.coverageMetrics;
} const totalResWidth = cameras.reduce((sum, c) => sum + c.resolution.width, 0); const totalResHeight = cameras.reduce((sum, c) => sum + c.resolution.height, 0); const totalFrameRate = cameras.reduce((sum, c) => sum + c.frameRate, 0); const totalLatency = cameras.reduce((sum, c) => sum + (c.healthMetrics?.latencyMs || 0), 0); this.coverageMetrics = { actualCameraCount: cameras.length, coveragePercentage: Math.min(100, (cameras.length / this.requiredCameraCount) * 100), averageResolution: { width: Math.round(totalResWidth / cameras.length), height: Math.round(totalResHeight / cameras.length) }, averageFrameRate: Math.round(totalFrameRate / cameras.length), averageLatencyMs: Math.round(totalLatency / cameras.length), overlapAchieved: 0, redundancyAchieved: Math.max(0, cameras.length - this.requiredCameraCount), lastCalculated: new Date() }; return this.coverageMetrics; };
CoverageZoneSchema.pre('save', async function (next) { if (this.isModified('geometry') || this.isModified('assignedCameras'))
    await this.calculateMetrics(); next(); });
exports.CoverageZoneSchema = CoverageZoneSchema;
exports.CoverageZone = mongoose_1.models.CoverageZone || (0, mongoose_1.model)('CoverageZone', CoverageZoneSchema);
//# sourceMappingURL=coverage-zone.schema.js.map