import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CameraMountType { CEILING = 'ceiling', WALL = 'wall', POLE = 'pole', TRIPOD = 'tripod', GANTRY = 'gantry', HANDHELD = 'handheld', DRONE = 'drone' }
export enum CameraStatus { REGISTERED = 'registered', CONNECTING = 'connecting', CONNECTED = 'connected', ACTIVE = 'active', INACTIVE = 'inactive', CALIBRATING = 'calibrating', CALIBRATED = 'calibrated', ERROR = 'error', MAINTENANCE = 'maintenance', DECOMMISSIONED = 'decommissioned' }
export enum CameraManufacturer { SONY = 'sony', PANASONIC = 'panasonic', CANON = 'canon', HIKVISION = 'hikvision', DAHUA = 'dahua', AXIS = 'axis', BOSCH = 'bosch', FLIR = 'flir', BASLER = 'basler', IDS = 'ids', POINT_GREY = 'point_grey', LOGITECH = 'logitech', GOPRO = 'gopro', DJI = 'dji', CUSTOM = 'custom' }

export interface ICameraPosition { x: number; y: number; z: number; roll: number; pitch: number; yaw: number; }
export interface ICameraFOV { horizontal: number; vertical: number; }
export interface ICameraResolution { width: number; height: number; }
export interface ICameraStreamConfig { protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi'; url: string; username?: string; password?: string; streamPath?: string; backupUrl?: string; transport?: 'tcp' | 'udp' | 'multicast'; }
export interface ICameraSpecs { sensorType: string; sensorSize: string; focalLength: number; aperture: string; isoRange: string; shutterSpeedRange: string; whiteBalance: string[]; focusMode: string[]; }

export interface ICamera {
  courtId: Types.ObjectId;
  cameraId: string;
  name: string;
  manufacturer: CameraManufacturer;
  model: string;
  serialNumber: string;
  firmwareVersion?: string;
  mountType: CameraMountType;
  position: ICameraPosition;
  fieldOfView: ICameraFOV;
  resolution: ICameraResolution;
  frameRate: number;
  bitrate?: number;
  codec?: string;
  streamConfig: ICameraStreamConfig;
  specs: ICameraSpecs;
  status: CameraStatus;
  assignedCoverageZones: Types.ObjectId[];
  calibrationProfileId?: Types.ObjectId;
  healthMetrics: { lastHeartbeat?: Date; uptimePercentage: number; frameDropRate: number; latencyMs: number; errorCount: number; lastError?: string; };
  metadata: Record<string, unknown>;
  connectedAt?: Date; activatedAt?: Date; calibratedAt?: Date; decommissionedAt?: Date;
  createdAt: Date; updatedAt: Date;
}

export type CameraDocument = HydratedDocument<ICamera>;

const CameraPositionSchema = new Schema<ICameraPosition>({ x: { type: Number, required: true }, y: { type: Number, required: true }, z: { type: Number, required: true }, roll: { type: Number, required: true, min: -180, max: 180 }, pitch: { type: Number, required: true, min: -90, max: 90 }, yaw: { type: Number, required: true, min: -180, max: 180 } }, { _id: false });
const CameraFOVSchema = new Schema<ICameraFOV>({ horizontal: { type: Number, required: true, min: 1, max: 180 }, vertical: { type: Number, required: true, min: 1, max: 180 } }, { _id: false });
const CameraResolutionSchema = new Schema<ICameraResolution>({ width: { type: Number, required: true, min: 320, max: 8192 }, height: { type: Number, required: true, min: 240, max: 8192 } }, { _id: false });
const CameraStreamConfigSchema = new Schema<ICameraStreamConfig>({ protocol: { type: String, enum: ['rtsp','rtmp','http','https','websocket','srt','ndi'], required: true }, url: { type: String, required: true, trim: true }, username: { type: String, trim: true }, password: { type: String, trim: true }, streamPath: { type: String, trim: true }, backupUrl: { type: String, trim: true }, transport: { type: String, enum: ['tcp','udp','multicast'] } }, { _id: false });
const CameraSpecsSchema = new Schema<ICameraSpecs>({ sensorType: { type: String, required: true }, sensorSize: { type: String, required: true }, focalLength: { type: Number, required: true, min: 1, max: 1000 }, aperture: { type: String, required: true }, isoRange: { type: String, required: true }, shutterSpeedRange: { type: String, required: true }, whiteBalance: [{ type: String }], focusMode: [{ type: String }] }, { _id: false });

const CameraSchema = new Schema<ICamera>(
  {
    courtId: { type: Schema.Types.ObjectId, required: true, ref: 'Court' },
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
    codec: { type: String, enum: ['h264','h265','mjpeg','vp8','vp9','av1'] },
    streamConfig: { type: CameraStreamConfigSchema, required: true },
    specs: { type: CameraSpecsSchema, required: true },
    status: { type: String, enum: Object.values(CameraStatus), default: CameraStatus.REGISTERED },
    assignedCoverageZones: [{ type: Schema.Types.ObjectId, ref: 'CoverageZone' }],
    calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' },
    healthMetrics: { lastHeartbeat: { type: Date }, uptimePercentage: { type: Number, default: 100, min: 0, max: 100 }, frameDropRate: { type: Number, default: 0, min: 0, max: 100 }, latencyMs: { type: Number, default: 0, min: 0 }, errorCount: { type: Number, default: 0 }, lastError: { type: String } },
    metadata: { type: Schema.Types.Mixed, default: {} },
    connectedAt: { type: Date }, activatedAt: { type: Date }, calibratedAt: { type: Date }, decommissionedAt: { type: Date },
  },
  { timestamps: true, collection: 'cameras' }
);

CameraSchema.index({ courtId: 1, status: 1 });
CameraSchema.index({ cameraId: 1 });
CameraSchema.index({ serialNumber: 1 });
CameraSchema.index({ status: 1 });
CameraSchema.index({ calibrationProfileId: 1 });
CameraSchema.index({ assignedCoverageZones: 1 });

CameraSchema.pre('validate', function (next) { if (this.status === CameraStatus.ACTIVE && !this.calibrationProfileId) this.status = CameraStatus.CONNECTED; next(); });

export const Camera = models.Camera || model<ICamera>('Camera', CameraSchema);





