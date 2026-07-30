import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourtConfigurationDocument = CourtConfiguration & Document;

export enum ConfigurationType {
  STANDARD = 'standard',
  COMPETITION = 'competition',
  TRAINING = 'training',
  WARMUP = 'warmup',
  PRACTICE = 'practice',
  COMPETITION_OFFICIAL = 'competition_official',
  TRAINING_OFFICIAL = 'training_official',
  CUSTOM = 'custom',
}

export enum ConfigurationStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

@Schema({ _id: false })
export class ConfigurationRules {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  governingBody?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  ruleSet?: string;

  @ApiProperty({ required: false, type: [String] })
  @Prop({ type: [String], default: [] })
  applicableCompetitions: string[];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  rulesDocumentUrl?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  customRules?: Record<string, any>;
}

@Schema({ _id: false })
export class ConfigurationSchedule {
  @ApiProperty({ required: false })
  @Prop({ type: Date })
  effectiveFrom?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  effectiveUntil?: Date;

  @ApiProperty({ required: false, type: [String] })
  @Prop({ type: [String], default: [] })
  applicableSeasons: string[];

  @ApiProperty({ required: false })
  @Prop({ type: [String] })
  applicableCompetitions?: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  timeSlotConstraints?: {
    earliestStart: string;
    latestEnd: string;
    minRestHours: number;
  };
}

@Schema({ _id: false })
export class ConfigurationAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class ConfigurationArchive {
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
  collection: 'court_configurations',
  timestamps: true,
  versionKey: 'version',
})
export class CourtConfiguration {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  configurationId: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ enum: ['standard', 'competition', 'training', 'warmup', 'practice', 'competition_official', 'training_official', 'custom'] })
  @Prop({ type: String, enum: ['standard', 'competition', 'training', 'warmup', 'practice', 'competition_official', 'training_official', 'custom'], required: true, index: true })
  type: string;

  @ApiProperty({ enum: ['draft', 'active', 'archived', 'deprecated'] })
  @Prop({ type: String, enum: ['draft', 'active', 'archived', 'deprecated'], required: true, default: 'draft', index: true })
  status: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  dimensions: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  surface: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  markings: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  net: any;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  lighting?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  safetyZones: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  equipment: any;

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  cameraPositions?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  rules: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  schedule: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  audit: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, required: true })
  archive: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CourtConfigurationSchema = SchemaFactory.createForClass(CourtConfiguration);

// Indexes
CourtConfigurationSchema.index({ configurationId: 1 }, { unique: true });
CourtConfigurationSchema.index({ name: 1 });
CourtConfigurationSchema.index({ type: 1, status: 1 });
CourtConfigurationSchema.index({ status: 1 });

// Virtual for isActive
CourtConfigurationSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for isArchived
CourtConfigurationSchema.virtual('isArchived').get(function() {
  return this.status === 'archived';
});