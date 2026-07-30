import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CoverageZoneType { PLAY_AREA = 'play_area', FREE_ZONE = 'free_zone', SERVICE_ZONE = 'service_zone', SUBSTITUTION_ZONE = 'substitution_zone', LIBERO_ZONE = 'libero_zone', WARM_UP_AREA = 'warm_up_area', TEAM_BENCH = 'team_bench', OFFICIALS_TABLE = 'officials_table', REFEREE_POSITION = 'referee_position', LINE_JUDGE_POSITION = 'line_judge_position', CAMERA_POSITION = 'camera_position', SPECTATOR_AREA = 'spectator_area', MEDIA_AREA = 'media_area', BROADCAST_ZONE = 'broadcast_zone', CUSTOM = 'custom' }
export enum CoveragePriority { CRITICAL = 'critical', HIGH = 'high', MEDIUM = 'medium', LOW = 'low' }

export interface ICoveragePolygon { type: 'Polygon'; coordinates: number[][][]; }
export interface ICoveragePoint { type: 'Point'; coordinates: [number, number, number?]; }

export interface ICoverageZone extends Document {
  courtId: Types.ObjectId; zoneCode: string; name: string; zoneType: CoverageZoneType; priority: CoveragePriority;
  geometry: ICoveragePolygon | ICoveragePoint; area?: number;
  requiredCameraCount: number; assignedCameras: Types.ObjectId[];
  coverageRequirements: { minResolution: { width: number; height: number }; minFrameRate: number; maxLatencyMs: number; requiredFOV: { horizontal: number; vertical: number }; overlapPercentage: number; redundancyLevel: number; };
  calibrationRequirements: { minReferencePoints: number; maxReprojectionError: number; requiredAccuracy: number; };
  aiRequirements: { detectionRequired: boolean; trackingRequired: boolean; poseEstimationRequired: boolean; actionRecognitionRequired: boolean; ballTrackingRequired: boolean; jerseyDetectionRequired: boolean; };
  status: 'designed' | 'configured' | 'calibrated' | 'validated' | 'active' | 'degraded' | 'offline';
  coverageMetrics: { actualCameraCount: number; coveragePercentage: number; averageResolution: { width: number; height: number }; averageFrameRate: number; averageLatencyMs: number; overlapAchieved: number; redundancyAchieved: number; lastCalculated: Date; };
  validationResults?: { validatedAt: Date; validatedBy: Types.ObjectId; passed: boolean; issues: string[]; recommendations: string[]; };
  metadata: Record<string, unknown>; createdBy: Types.ObjectId; createdAt: Date; updatedAt: Date;
}

const CoverageRequirementsSchema = new Schema({ minResolution: { width: { type: Number, required: true, min: 320 }, height: { type: Number, required: true, min: 240 } }, minFrameRate: { type: Number, required: true, min: 15, max: 240 }, maxLatencyMs: { type: Number, required: true, min: 0 }, requiredFOV: { horizontal: { type: Number, required: true, min: 1, max: 180 }, vertical: { type: Number, required: true, min: 1, max: 180 } }, overlapPercentage: { type: Number, required: true, min: 0, max: 100 }, redundancyLevel: { type: Number, required: true, min: 0, max: 5 } }, { _id: false });
const CalibrationRequirementsSchema = new Schema({ minReferencePoints: { type: Number, required: true, min: 4 }, maxReprojectionError: { type: Number, required: true, min: 0.1 }, requiredAccuracy: { type: Number, required: true, min: 0 } }, { _id: false });
const AIRequirementsSchema = new Schema({ detectionRequired: { type: Boolean, default: true }, trackingRequired: { type: Boolean, default: true }, poseEstimationRequired: { type: Boolean, default: false }, actionRecognitionRequired: { type: Boolean, default: false }, ballTrackingRequired: { type: Boolean, default: false }, jerseyDetectionRequired: { type: Boolean, default: false } }, { _id: false });
const CoverageMetricsSchema = new Schema({ actualCameraCount: { type: Number, default: 0, min: 0 }, coveragePercentage: { type: Number, default: 0, min: 0, max: 100 }, averageResolution: { width: { type: Number, default: 0 }, height: { type: Number, default: 0 } }, averageFrameRate: { type: Number, default: 0 }, averageLatencyMs: { type: Number, default: 0 }, overlapAchieved: { type: Number, default: 0, min: 0, max: 100 }, redundancyAchieved: { type: Number, default: 0, min: 0 }, lastCalculated: { type: Date, default: Date.now } }, { _id: false });
const ValidationResultsSchema = new Schema({ validatedAt: { type: Date, required: true }, validatedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, passed: { type: Boolean, required: true }, issues: [{ type: String, trim: true }], recommendations: [{ type: String, trim: true }] }, { _id: false });

const CoverageZoneSchema = new Schema(
  {
    courtId: { type: Schema.Types.ObjectId, required: true, ref: 'Court' },
    zoneCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    zoneType: { type: String, enum: Object.values(CoverageZoneType), required: true },
    priority: { type: String, enum: Object.values(CoveragePriority), default: CoveragePriority.MEDIUM },
    geometry: { type: { type: String, enum: ['Polygon', 'Point'], required: true }, coordinates: { type: Schema.Types.Mixed, required: true } },
    area: { type: Number, min: 0 },
    requiredCameraCount: { type: Number, required: true, min: 1, max: 20 },
    assignedCameras: [{ type: Schema.Types.ObjectId, ref: 'Camera' }],
    coverageRequirements: { type: CoverageRequirementsSchema, required: true },
    calibrationRequirements: { type: CalibrationRequirementsSchema, required: true },
    aiRequirements: { type: AIRequirementsSchema, required: true },
    status: { type: String, enum: ['designed', 'configured', 'calibrated', 'validated', 'active', 'degraded', 'offline'], default: 'designed' },
    coverageMetrics: { type: CoverageMetricsSchema, default: {} },
    validationResults: { type: ValidationResultsSchema },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true, collection: 'coverage_zones' }
);

CoverageZoneSchema.index({ courtId: 1, zoneCode: 1 }, { unique: true });
CoverageZoneSchema.index({ courtId: 1, zoneType: 1 });
CoverageZoneSchema.index({ courtId: 1, status: 1 });
CoverageZoneSchema.index({ assignedCameras: 1 });
CoverageZoneSchema.index({ geometry: '2dsphere' });

CoverageZoneSchema.virtual('isFullyCovered').get(function () { return this.coverageMetrics.coveragePercentage >= 95 && this.assignedCameras.length >= this.requiredCameraCount; });
CoverageZoneSchema.virtual('hasRedundancy').get(function () { return this.coverageMetrics.redundancyAchieved >= this.coverageRequirements.redundancyLevel; });
CoverageZoneSchema.methods.calculateMetrics = async function () { const Camera = models.Camera || (await import('./camera.schema')).Camera; const cameras = await Camera.find({ _id: { $in: this.assignedCameras } }); if (cameras.length === 0) { this.coverageMetrics = { actualCameraCount: 0, coveragePercentage: 0, averageResolution: { width: 0, height: 0 }, averageFrameRate: 0, averageLatencyMs: 0, overlapAchieved: 0, redundancyAchieved: 0, lastCalculated: new Date() }; return this.coverageMetrics; } const totalResWidth = cameras.reduce((sum, c) => sum + c.resolution.width, 0); const totalResHeight = cameras.reduce((sum, c) => sum + c.resolution.height, 0); const totalFrameRate = cameras.reduce((sum, c) => sum + c.frameRate, 0); const totalLatency = cameras.reduce((sum, c) => sum + (c.healthMetrics?.latencyMs || 0), 0); this.coverageMetrics = { actualCameraCount: cameras.length, coveragePercentage: Math.min(100, (cameras.length / this.requiredCameraCount) * 100), averageResolution: { width: Math.round(totalResWidth / cameras.length), height: Math.round(totalResHeight / cameras.length) }, averageFrameRate: Math.round(totalFrameRate / cameras.length), averageLatencyMs: Math.round(totalLatency / cameras.length), overlapAchieved: 0, redundancyAchieved: Math.max(0, cameras.length - this.requiredCameraCount), lastCalculated: new Date() }; return this.coverageMetrics; };

CoverageZoneSchema.pre('save', async function (next) { if (this.isModified('geometry') || this.isModified('assignedCameras')) await this.calculateMetrics(); next(); });

export const CoverageZoneSchema = CoverageZoneSchema;
export const CoverageZone = models.CoverageZone || model('CoverageZone', CoverageZoneSchema);








