import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum ConstraintType {
  AVAILABILITY = 'availability',
  CAPACITY = 'capacity',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  RESOURCE = 'resource',
  QUALIFICATION = 'qualification',
  COMPLIANCE = 'compliance',
  AI_CV = 'ai_cv',
  CUSTOM = 'custom'
}

export enum ConstraintSeverity {
  HARD = 'hard',
  SOFT = 'soft',
  ADVISORY = 'advisory'
}

export enum ConstraintScope {
  TOURNAMENT = 'tournament',
  MATCH = 'match',
  VENUE = 'venue',
  COURT = 'court',
  TEAM = 'team',
  OFFICIAL = 'official',
  CAMERA = 'camera',
  COVERAGE_ZONE = 'coverage_zone'
}

export interface IConstraintExpression {
  // Temporal
  before?: Date;
  after?: Date;
  between?: [Date, Date];
  notBetween?: [Date, Date];
  onDayOfWeek?: number[];
  notOnDayOfWeek?: number[];
  
  // Spatial
  withinDistance?: { from: { x: number; y: number }; maxDistance: number };
  withinVenue?: Types.ObjectId[];
  notWithinVenue?: Types.ObjectId[];
  
  // Resource
  requiresResource?: string[];
  excludesResource?: string[];
  maxConcurrent?: number;
  minGap?: number; // minutes
  
  // Qualification
  requiresCertification?: string[];
  requiresQualification?: string[];
  minExperience?: number; // months
  
  // AI/CV
  requiresCalibration?: boolean;
  minCalibrationAccuracy?: number;
  requiredCameraCoverage?: Types.ObjectId[];
  minCameraOverlap?: number;
  minLightingLux?: number;
  cameraSpecRequirements?: Record<string, any>;
  
  // Custom
  customExpression?: string;
}

export interface ISchedulingConstraint {
  constraintId: string;
  name: string;
  type: ConstraintType;
  severity: ConstraintSeverity;
  weight?: number;
  scope: ConstraintScope;
  expression: IConstraintExpression;
  parameters: Record<string, any>;
  applicableEntities: string[];
  applicableStates: string[];
  enabled: boolean;
  description: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConstraintSet extends Document {
  constraintSetId: string;
  name: string;
  description?: string;
  tournamentId: Types.ObjectId;
  constraints: ITournamentConstraint[];
  version: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ConstraintSetDocument = HydratedDocument<IConstraintSet>;

const ConstraintExpressionSchema = new Schema(
  {
    before: { type: Date },
    after: { type: Date },
    between: [{ type: Date }],
    notBetween: [{ type: Date }],
    onDayOfWeek: [{ type: Number, min: 0, max: 6 }],
    notOnDayOfWeek: [{ type: Number, min: 0, max: 6 }],
    withinDistance: {
      from: { x: { type: Number }, y: { type: Number } },
      maxDistance: { type: Number, min: 0 }
    },
    withinVenue: [{ type: Schema.Types.ObjectId, ref: 'Venue' }],
    notWithinVenue: [{ type: Schema.Types.ObjectId, ref: 'Venue' }],
    requiresResource: [{ type: String }],
    excludesResource: [{ type: String }],
    maxConcurrent: { type: Number, min: 1 },
    minGap: { type: Number, min: 0 },
    requiresCertification: [{ type: String }],
    requiresQualification: [{ type: String }],
    minExperience: { type: Number, min: 0 },
    requiresCalibration: { type: Boolean },
    minCalibrationAccuracy: { type: Number, min: 0 },
    requiredCameraCoverage: [{ type: Schema.Types.ObjectId, ref: 'CoverageZone' }],
    minCameraOverlap: { type: Number, min: 0 },
    minLightingLux: { type: Number, min: 0 },
    cameraSpecRequirements: { type: Schema.Types.Mixed },
    customExpression: { type: String }
  }, { _id: false });

const TournamentConstraintSchema = new Schema(
  {
    constraintId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: Object.values(['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv', 'custom']), required: true },
    severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
    weight: { type: Number, min: 0, max: 100 },
    scope: { type: String, enum: ['tournament', 'match', 'venue', 'court', 'team', 'official', 'camera', 'coverage_zone'], required: true },
    expression: { type: Schema.Types.Mixed, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    applicableEntities: [{ type: String }],
    applicableStates: [{ type: String }],
    enabled: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 1000 },
    priority: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, { _id: false });

const ConstraintSetSchema = new Schema(
  {
    constraintSetId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    tournamentId: { type: Schema.Types.ObjectId, required: true, ref: 'Tournament' },
    constraints: [{
      constraintId: { type: String, required: true },
      name: { type: String, required: true, trim: true, maxlength: 200 },
      type: { type: String, enum: ['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv', 'custom'], required: true },
      severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
      weight: { type: Number, min: 0, max: 100 },
      scope: { type: String, enum: ['tournament', 'match', 'venue', 'court', 'team', 'official', 'camera', 'coverage_zone'], required: true },
      expression: { type: Schema.Types.Mixed, required: true },
      parameters: { type: Schema.Types.Mixed, default: {} },
      applicableEntities: [{ type: String }],
      applicableStates: [{ type: String }],
      enabled: { type: Boolean, default: true },
      description: { type: String, trim: true, maxlength: 1000 },
      priority: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true,
    collection: 'constraint_sets',
    versionKey: 'version'
  }
);

ConstraintSetSchema.index({ tournamentId: 1, isActive: 1 });
ConstraintSetSchema.index({ constraintSetId: 1 }, { unique: true });

ConstraintSetSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.version = (this.version || 0) + 1;
  next();
});

export const ConstraintSet = models.ConstraintSet || model('ConstraintSet', ConstraintSetSchema);