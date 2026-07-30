import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CalibrationStatus { DRAFT = 'draft', PENDING_VALIDATION = 'pending_validation', ACTIVE = 'active', ARCHIVED = 'archived', FAILED = 'failed' }
export enum CalibrationMethod { CHECKERBOARD = 'checkerboard', CHARUCO = 'charuco', ARUCO = 'aruco', GRID = 'grid', MANUAL = 'manual', AUTO = 'auto', HYBRID = 'hybrid' }

export interface IIntrinsicParameters { focalLengthX: number; focalLengthY: number; principalPointX: number; principalPointY: number; skew: number; distortionCoefficients: number[]; }
export interface IExtrinsicParameters { rotationMatrix: number[][]; translationVector: number[]; cameraHeight: number; cameraTilt: number; cameraPan: number; cameraRoll: number; }
export interface IReferencePoint { id: string; name: string; worldCoordinates: { x: number; y: number; z: number }; imageCoordinates: { x: number; y: number }; confidence: number; }
export interface IHomographyMatrix { matrix: number[][]; sourcePoints: { x: number; y: number }[]; destinationPoints: { x: number; y: number }[]; }
export interface ICalibrationMetrics { reprojectionError: number; rmsError: number; maxError: number; standardDeviation: number; pointCount: number; validPointCount: number; }

export interface ICalibrationProfile extends Document {
  cameraInstallationId: Types.ObjectId; profileName: string; version: number; method: CalibrationMethod; status: CalibrationStatus; intrinsicParameters: IIntrinsicParameters; extrinsicParameters: IExtrinsicParameters; referencePoints: IReferencePoint[]; homographyMatrix: IHomographyMatrix; metrics: ICalibrationMetrics; validationResults?: { passed: boolean; details: Record<string, unknown>; validatedAt: Date; validatedBy: Types.ObjectId; }; aiMetadata: { modelVersion?: string; trainingDataHash?: string; featureExtractionConfig?: Record<string, unknown>; inferenceThreshold?: number; }; notes?: string; createdBy: Types.ObjectId; activatedAt?: Date; activatedBy?: Types.ObjectId; archivedAt?: Date; archivedBy?: Types.ObjectId; createdAt: Date; updatedAt: Date;
}

export type CalibrationProfileDocument = HydratedDocument<ICalibrationProfile>;

const IntrinsicParametersSchema = new Schema<IIntrinsicParameters>({ focalLengthX: { type: Number, required: true }, focalLengthY: { type: Number, required: true }, principalPointX: { type: Number, required: true }, principalPointY: { type: Number, required: true }, skew: { type: Number, default: 0 }, distortionCoefficients: { type: [Number], required: true, default: [] } }, { _id: false });
const ExtrinsicParametersSchema = new Schema<IExtrinsicParameters>({ rotationMatrix: { type: [[Number]], required: true }, translationVector: { type: [Number], required: true }, cameraHeight: { type: Number, required: true }, cameraTilt: { type: Number, required: true }, cameraPan: { type: Number, required: true }, cameraRoll: { type: Number, required: true } }, { _id: false });
const ReferencePointSchema = new Schema<IReferencePoint>({ id: { type: String, required: true }, name: { type: String, required: true, trim: true }, worldCoordinates: { x: { type: Number, required: true }, y: { type: Number, required: true }, z: { type: Number, required: true } }, imageCoordinates: { x: { type: Number, required: true }, y: { type: Number, required: true } }, confidence: { type: Number, required: true, min: 0, max: 1 } }, { _id: false });
const HomographyMatrixSchema = new Schema<IHomographyMatrix>({ matrix: { type: [[Number]], required: true }, sourcePoints: { type: [{ x: Number, y: Number }], required: true }, destinationPoints: { type: [{ x: Number, y: Number }], required: true } }, { _id: false });
const CalibrationMetricsSchema = new Schema<ICalibrationMetrics>({ reprojectionError: { type: Number, required: true, min: 0 }, rmsError: { type: Number, required: true, min: 0 }, maxError: { type: Number, required: true, min: 0 }, standardDeviation: { type: Number, required: true, min: 0 }, pointCount: { type: Number, required: true, min: 4 }, validPointCount: { type: Number, required: true, min: 4 } }, { _id: false });

const CalibrationProfileSchema = new Schema<ICalibrationProfile>(
  {
    cameraInstallationId: { type: Schema.Types.ObjectId, required: true, ref: 'Camera' }, profileName: { type: String, required: true, trim: true }, version: { type: Number, required: true, default: 1 }, method: { type: String, enum: Object.values(CalibrationMethod), required: true }, status: { type: String, enum: Object.values(CalibrationStatus), default: CalibrationStatus.DRAFT }, intrinsicParameters: { type: IntrinsicParametersSchema, required: true }, extrinsicParameters: { type: ExtrinsicParametersSchema, required: true }, referencePoints: { type: [ReferencePointSchema], required: true }, homographyMatrix: { type: HomographyMatrixSchema, required: true }, metrics: { type: CalibrationMetricsSchema, required: true }, validationResults: { passed: { type: Boolean }, details: { type: Schema.Types.Mixed }, validatedAt: { type: Date }, validatedBy: { type: Schema.Types.ObjectId, ref: 'User' } }, aiMetadata: { modelVersion: { type: String }, trainingDataHash: { type: String }, featureExtractionConfig: { type: Schema.Types.Mixed }, inferenceThreshold: { type: Number, min: 0, max: 1 } }, notes: { type: String }, createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, activatedAt: { type: Date }, activatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, archivedAt: { type: Date }, archivedBy: { type: Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true, collection: 'calibration_profiles' }
);

CalibrationProfileSchema.index({ cameraInstallationId: 1, status: 1 });
CalibrationProfileSchema.index({ cameraInstallationId: 1, version: -1 });
CalibrationProfileSchema.index({ status: 1, createdAt: -1 });

CalibrationProfileSchema.pre('save', function (next) {
  if (this.isNew && this.version === 1) {
    const existing = (this.constructor as any).findOne({ cameraInstallationId: this.cameraInstallationId }).sort({ version: -1 });
    if (existing) this.version = existing.version + 1;
  }
  next();
});

export const CalibrationProfile = models.CalibrationProfile || model<ICalibrationProfile>('CalibrationProfile', CalibrationProfileSchema);





