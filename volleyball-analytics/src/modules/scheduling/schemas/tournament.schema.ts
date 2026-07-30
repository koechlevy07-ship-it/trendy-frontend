import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum TournamentType {
  LEAGUE = 'league',
  TOURNAMENT = 'tournament',
  CHAMPIONSHIP = 'championship',
  CUP = 'cup',
  FRIENDLY = 'friendly',
  QUALIFIER = 'qualifier',
  PLAYOFF = 'playoff',
  EXHIBITION = 'exhibition',
  TRAINING = 'training'
}

export enum TournamentFormat {
  ROUND_ROBIN = 'round_robin',
  DOUBLE_ROUND_ROBIN = 'double_round_robin',
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  SWISS = 'swiss',
  GROUP_STAGE_KNOCKOUT = 'group_stage_knockout',
  PAGE_PLAYOFF = 'page_playoff',
  MODIFIED_SWISS = 'modified_swiss',
  CUSTOM = 'custom'
}

export enum TournamentStatus {
  DRAFT = 'draft',
  VALIDATING = 'validating',
  OPTIMIZING = 'optimizing',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled'
}

export interface IVenuePreference {
  venueId: Types.ObjectId;
  priority: number;
  availableCourts: Types.ObjectId[];
  availableDates: { start: Date; end: Date }[];
  blackoutDates: { start: Date; end: Date }[];
  costPerMatch: number;
  travelDistance?: number;
  preferredForTournamentTypes: TournamentType[];
}

export interface ICourtRequirement {
  courtType: string;
  surfaceType: string;
  minDimensions: { length: number; width: number };
  preferredDimensions?: { length: number; width: number };
  netHeightRequired: boolean;
  minLightingLux: number;
  cameraInfrastructureRequired: boolean;
  minCameraPositions: number;
  surfaceCertificationRequired: boolean;
  equipmentRequirements: {
    name: string;
    required: boolean;
    quantity: number;
    specifications?: string;
  }[];
}

export interface IScheduleWindow {
  earliestStart: Date;
  latestEnd: Date;
  matchDuration: number; // minutes
  breakBetweenMatches: number; // minutes
  maxMatchesPerDay: number;
  preferredDaysOfWeek: number[];
  blackoutDates: Date[];
  timeZone: string;
}

export interface ITournamentConstraint {
  constraintId: string;
  name: string;
  type: 'availability' | 'capacity' | 'temporal' | 'spatial' | 'resource' | 'qualification' | 'compliance' | 'ai_cv' | 'custom';
  severity: 'hard' | 'soft' | 'advisory';
  weight?: number;
  scope: 'tournament' | 'match' | 'venue' | 'court' | 'team' | 'official' | 'camera' | 'coverage_zone';
  expression: Record<string, any>;
  parameters: Record<string, any>;
  applicableEntities: string[];
  applicableStates: string[];
  enabled: boolean;
  description: string;
}

export interface ITournamentMetadata {
  description?: string;
  tags: string[];
  organizerNotes?: string;
  broadcastInfo?: {
    hasBroadcast: boolean;
    broadcastWindows: { start: Date; end: Date; channel?: string }[];
    mediaRequirements?: string[];
  };
  aiConfiguration?: {
    aiEnabled: boolean;
    aiCameraAllocation: boolean;
    calibrationRequired: boolean;
    aiModels?: string[];
  };
  customFields: Record<string, any>;
}

export interface ITournament extends Document {
  tournamentId: string;
  name: string;
  tournamentType: TournamentType;
  format: TournamentFormat;
  status: TournamentStatus;
  season: string;
  organizationId: Types.ObjectId;
  venuePreferences: IVenuePreference[];
  courtRequirements: ICourtRequirement[];
  participatingTeams: Types.ObjectId[];
  participatingOfficials: Types.ObjectId[];
  scheduleWindow: IScheduleWindow;
  constraints: ITournamentConstraint[];
  brackets: Types.ObjectId[];
  calendarId: Types.ObjectId;
  metadata: ITournamentMetadata;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type TournamentDocument = HydratedDocument<ITournament>;

const VenuePreferenceSchema = new Schema<IVenuePreference>(
  {
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
    priority: { type: Number, required: true, min: 1 },
    availableCourts: [{ type: Schema.Types.ObjectId, ref: 'Court' }],
    availableDates: [{
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    }],
    blackoutDates: [{
      start: { type: Date, required: true },
      end: { type: Date, required: true }
    }],
    costPerMatch: { type: Number, required: true, min: 0 },
    travelDistance: { type: Number, min: 0 },
    preferredForTournamentTypes: [{ type: String, enum: Object.values(TournamentType) }]
  }, { _id: false });

const CourtRequirementSchema = new Schema<ICourtRequirement>(
  {
    courtType: { type: String, required: true, trim: true },
    surfaceType: { type: String, required: true, trim: true },
    minDimensions: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 }
    },
    preferredDimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 }
    },
    netHeightRequired: { type: Boolean, default: true },
    minLightingLux: { type: Number, required: true, min: 0 },
    cameraInfrastructureRequired: { type: Boolean, default: false },
    minCameraPositions: { type: Number, default: 1, min: 1 },
    surfaceCertificationRequired: { type: Boolean, default: false },
    equipmentRequirements: [{
      name: { type: String, required: true },
      required: { type: Boolean, default: true },
      quantity: { type: Number, default: 1, min: 1 },
      specifications: { type: String }
    }]
  }, { _id: false });

const ScheduleWindowSchema = new Schema<IScheduleWindow>(
  {
    earliestStart: { type: Date, required: true },
    latestEnd: { type: Date, required: true },
    matchDuration: { type: Number, required: true, min: 1 },
    breakBetweenMatches: { type: Number, required: true, min: 0 },
    maxMatchesPerDay: { type: Number, required: true, min: 1, max: 20 },
    preferredDaysOfWeek: [{ type: Number, min: 0, max: 6 }],
    blackoutDates: [{ type: Date }],
    timeZone: { type: String, required: true, default: 'UTC' }
  }, { _id: false });

const TournamentConstraintSchema = new Schema<ITournamentConstraint>(
  {
    constraintId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    type: {
      type: String,
      enum: ['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv', 'custom'],
      required: true
    },
    severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
    weight: { type: Number, min: 0, max: 100 },
    scope: { type: String, enum: ['tournament', 'match', 'venue', 'court', 'team', 'official', 'camera', 'coverage_zone'], required: true },
    expression: { type: Schema.Types.Mixed, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    applicableEntities: [{ type: String, required: true }],
    applicableStates: [{ type: String, required: true }],
    enabled: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 1000 }
  }, { _id: false });

const TournamentMetadataSchema = new Schema<ITournamentMetadata>(
  {
    description: { type: String, trim: true, maxlength: 5000 },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    organizerNotes: { type: String, trim: true, maxlength: 5000 },
    broadcastInfo: {
      hasBroadcast: { type: Boolean, default: false },
      broadcastWindows: [{
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        channel: { type: String, trim: true }
      }],
      mediaRequirements: [{ type: String, trim: true }]
    },
    aiConfiguration: {
      aiEnabled: { type: Boolean, default: false },
      aiCameraAllocation: { type: Boolean, default: false },
      calibrationRequired: { type: Boolean, default: false },
      aiModels: [{ type: String, trim: true }]
    },
    customFields: { type: Schema.Types.Mixed, default: {} }
  }, { _id: false });

const TournamentSchema = new Schema<ITournament>(
  {
    tournamentId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    tournamentType: { type: String, enum: Object.values(TournamentType), required: true },
    format: { type: String, enum: Object.values(TournamentFormat), required: true },
    status: { type: String, enum: Object.values(TournamentStatus), default: TournamentStatus.DRAFT },
    season: { type: String, required: true, trim: true, maxlength: 50 },
    organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' },
    venuePreferences: [VenuePreferenceSchema],
    courtRequirements: [CourtRequirementSchema],
    participatingTeams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    participatingOfficials: [{ type: Schema.Types.ObjectId, ref: 'Official' }],
    scheduleWindow: { type: ScheduleWindowSchema, required: true },
    constraints: [TournamentConstraintSchema],
    brackets: [{ type: Schema.Types.ObjectId, ref: 'Bracket' }],
    calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
    metadata: { type: TournamentMetadataSchema, default: {} },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    collection: 'tournaments',
    versionKey: 'version'
  }
);

TournamentSchema.index({ organizationId: 1, status: 1 });
TournamentSchema.index({ tournamentId: 1 }, { unique: true });
TournamentSchema.index({ status: 1, season: 1 });
TournamentSchema.index({ season: 1, organizationId: 1 });
TournamentSchema.index({ tournamentType: 1, status: 1 });

TournamentSchema.virtual('isActive').get(function() {
  return this.status === 'in_progress' || this.status === 'published';
});

TournamentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.version = (this.version || 0) + 1;
  next();
});

export const Tournament = models.Tournament || model<ITournament>('Tournament', TournamentSchema);