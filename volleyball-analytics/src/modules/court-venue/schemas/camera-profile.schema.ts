import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CameraProfileType { STANDARD = 'standard', HIGH_SPEED = 'high_speed', LOW_LIGHT = 'low_light', WIDE_ANGLE = 'wide_angle', ZOOM = 'zoom', THERMAL = 'thermal', STEREO = 'stereo', CUSTOM = 'custom' }

export interface ICameraProfile extends Document {
  profileCode: string; name: string; profileType: CameraProfileType; description?: string;
  manufacturer?: string; model?: string;
  specifications: { resolution: { width: number; height: number }; frameRateRange: { min: number; max: number }; bitrateRange: { min: number; max: number }; supportedCodecs: string[]; supportedProtocols: string[]; sensorType?: string; sensorSize?: string; focalLengthRange?: { min: number; max: number }; apertureRange?: { min: number; max: number }; isoRange?: { min: number; max: number }; shutterSpeedRange?: { min: string; max: string }; whiteBalanceModes?: string[]; focusModes?: string[]; };
  aiConfiguration: { detectionModel?: string; trackingModel?: string; poseModel?: string; actionRecognitionModel?: string; ballTrackingModel?: string; jerseyDetectionModel?: string; inferenceDevice?: 'cpu' | 'gpu' | 'tpu' | 'npu'; batchSize?: number; confidenceThreshold?: number; nmsThreshold?: number; customConfig?: Record<string, unknown>; };
  defaultSettings: { resolution: { width: number; height: number }; frameRate: number; bitrate: number; codec: string; protocol: string; exposure?: string; whiteBalance?: string; focusMode?: string; gain?: number; brightness?: number; contrast?: number; saturation?: number; sharpness?: number; };
  calibrationRequirements: { minReferencePoints: number; maxReprojectionError: number; requiresGroundTruth: boolean; supportedPatterns: string[]; };
  isActive: boolean; isDefault: boolean; version: number;
  metadata: Record<string, unknown>; createdBy: Types.ObjectId;
  createdAt: Date; updatedAt: Date;
}

const CameraProfileSchema = new Schema(
  {
    profileCode: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    profileType: { type: String, enum: Object.values(CameraProfileType), required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    manufacturer: { type: String, trim: true, maxlength: 100 }, model: { type: String, trim: true, maxlength: 100 },
    specifications: {
      resolution: { width: { type: Number, required: true, min: 320 }, height: { type: Number, required: true, min: 240 } },
      frameRateRange: { min: { type: Number, required: true, min: 1 }, max: { type: Number, required: true, min: 1 } },
      bitrateRange: { min: { type: Number, required: true, min: 1000 }, max: { type: Number, required: true, min: 1000 } },
      supportedCodecs: [{ type: String, trim: true }], supportedProtocols: [{ type: String, trim: true }],
      sensorType: { type: String, trim: true }, sensorSize: { type: String, trim: true },
      focalLengthRange: { min: { type: Number }, max: { type: Number } },
      apertureRange: { min: { type: Number }, max: { type: Number } },
      isoRange: { min: { type: Number }, max: { type: Number } },
      shutterSpeedRange: { min: { type: String }, max: { type: String } },
      whiteBalanceModes: [{ type: String }], focusModes: [{ type: String }],
    },
    aiConfiguration: {
      detectionModel: { type: String }, trackingModel: { type: String }, poseModel: { type: String },
      actionRecognitionModel: { type: String }, ballTrackingModel: { type: String },
      jerseyDetectionModel: { type: String },
      inferenceDevice: { type: String, enum: ['cpu', 'gpu', 'tpu', 'npu'] },
      batchSize: { type: Number, min: 1 }, confidenceThreshold: { type: Number, min: 0, max: 1 },
      nmsThreshold: { type: Number, min: 0, max: 1 }, customConfig: { type: Schema.Types.Mixed },
    },
    defaultSettings: {
      resolution: { width: { type: Number, required: true }, height: { type: Number, required: true } },
      frameRate: { type: Number, required: true }, bitrate: { type: Number, required: true },
      codec: { type: String, required: true }, protocol: { type: String, required: true },
      exposure: { type: String }, whiteBalance: { type: String }, focusMode: { type: String },
      gain: { type: Number }, brightness: { type: Number }, contrast: { type: Number },
      saturation: { type: Number }, sharpness: { type: Number },
    },
    calibrationRequirements: { minReferencePoints: { type: Number, default: 4, min: 4 }, maxReprojectionError: { type: Number, default: 1.0, min: 0.1 }, requiresGroundTruth: { type: Boolean, default: false }, supportedPatterns: [{ type: String }] },
    isActive: { type: Boolean, default: true }, isDefault: { type: Boolean, default: false }, version: { type: Number, default: 1, min: 1 },
    metadata: { type: Schema.Types.Mixed, default: {} }, createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true, collection: 'camera_profiles' }
);

CameraProfileSchema.index({ profileType: 1, isActive: 1 }); CameraProfileSchema.index({ isDefault: 1 }); CameraProfileSchema.index({ manufacturer: 1, model: 1 });

CameraProfileSchema.pre('save', function (next) { if (this.isDefault) this.constructor.updateMany({ isDefault: true, _id: { $ne: this._id } }, { isDefault: false }).exec(); next(); });

export const CameraProfileSchema = CameraProfileSchema;
export const CameraProfile = models.CameraProfile || model('CameraProfile', CameraProfileSchema);








