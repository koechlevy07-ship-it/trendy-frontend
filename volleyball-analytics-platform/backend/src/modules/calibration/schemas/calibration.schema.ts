import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CalibrationDocument = Calibration & Document;

export enum CalibrationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

export enum CalibrationMethod {
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semi_automatic',
  FULLY_AUTOMATIC = 'fully_automatic',
  HYBRID = 'hybrid',
  ZHANG = 'zhang',
  TSUCHI = 'tsuchi',
  HEIKKILA = 'heikkila',
}

@Schema({ _id: false })
export class IntrinsicParameters {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  focalLength: [number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  principalPoint: [number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  skew: number;

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  distortionCoefficients: [number, number, number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  pixelSize: [number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  aspectRatio?: [number, number];
}

@Schema({ _id: false })
export class ExtrinsicParameters {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  rotationMatrix: [number, number, number, number, number, number, number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  translationVector: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  cameraPosition?: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  cameraRotation?: [number, number, number];
}

@Schema({ _id: false })
export class DistortionCoefficients {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  radial: [number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  tangential: [number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  thinPrism?: [number, number, number, number];
}

@Schema({ _id: false })
export class ReferencePoint {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  worldCoordinates: [number, number, number];

  @ApiProperty()
  @Prop({ type: [Number], required: true })
  imageCoordinates: [number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  weight?: number;
}

@Schema({ _id: false })
export class HomographyMatrix {
  @ApiProperty()
  @Prop({ type: [Number], required: true })
  matrix: [number, number, number, number, number, number, number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  inverseMatrix?: [number, number, number, number, number, number, number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  normalizationFactors?: [number, number];
}

@Schema({ _id: false })
export class CalibrationAccuracy {
  @ApiProperty()
  @Prop({ type: Number, required: true })
  meanReprojectionError: number;

  @ApiProperty()
  @Prop({ type: Number, required: true })
  maxReprojectionError: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  standardDeviation?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  confidenceInterval?: number;
}

@Schema({ _id: false })
export class CalibrationMethod {
  @ApiProperty({ enum: ['manual', 'semi_automatic', 'fully_automatic', 'hybrid', 'zhang', 'tsuchiya', 'heikkila'] })
  @Prop({ type: String, enum: ['manual', 'semi_automatic', 'fully_automatic', 'hybrid', 'zhang', 'tsuchiya', 'heikkila'], required: true })
  method: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  toolVersion?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  toolsUsed: string[];
}

@Schema({ _id: false })
export class CalibrationEnvironment {
  @ApiProperty({ required: false })
  @Prop({ type: Number })
  temperature?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  humidity?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  lighting?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class CalibrationValidation {
  @ApiProperty()
  @Prop({ type: Boolean, required: true, default: false })
  isValidated: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  validatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  validatedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  validationNotes?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  issues: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  reCalibrationRequired?: number;
}

@Schema({ _id: false })
export class CalibrationAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  validatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class CalibrationArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  archiveReason?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  snapshot?: Record<string, any>;
}

@Schema({
  collection: 'calibrations',
  timestamps: true,
  versionKey: 'version',
})
export class Calibration {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  calibrationId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true, index: true })
  courtId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Camera', required: true, index: true })
  cameraId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Venue' })
  venueId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibrationProfileId?: string;

  @ApiProperty({ enum: ['manual', 'semi_automatic', 'fully_automatic', 'hybrid', 'zhang', 'tsuchiya', 'heikkila'] })
  @Prop({ type: String, enum: ['manual', 'semi_automatic', 'fully_automatic', 'hybrid', 'zhang', 'tsuchiya', 'heikkila'], required: true })
  method: string;

  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'failed', 'expired', 'archived'] })
  @Prop({ type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'expired', 'archived'], required: true, default: 'pending', index: true })
  status: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  intrinsicParameters: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  extrinsicParameters: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  distortionCoefficients: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  referencePoints: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  homographyMatrix: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  accuracy: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  method: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  environment: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  validation: any;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  calibrationDate: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibrationEngineer?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  engineerId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  expirationDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 1 })
  @Prop({ type: Number, default: 1 })
  version: number;

  @ApiProperty({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const CalibrationSchema = SchemaFactory.createForClass(Calibration);

// Indexes
CalibrationSchema.index({ calibrationId: 1 }, { unique: true });
CalibrationSchema.index({ courtId: 1, status: 1 });
CalibrationSchema.index({ cameraId: 1, status: 1 });
CalibrationSchema.index({ calibrationDate: -1 });
CalibrationSchema.index({ status: 1 });
CalibrationSchema.index({ venueId: 1 });