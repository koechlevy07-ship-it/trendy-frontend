import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum BracketType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  GROUP_STAGE = 'group_stage',
  SWISS = 'swiss',
  PAGE_PLAYOFF = 'page_playoff',
  CUSTOM = 'custom'
}

export enum BracketStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum MatchType {
  WINNER_ADVANCES = 'winner_advances',
  LOSER_ADVANCES = 'loser_advances',
  PLACEMENT = 'placement',
  CLASSIFICATION = 'classification'
}

export interface IBracketNode {
  nodeId: string;
  round: number;
  position: number;
  matchId?: Types.ObjectId;
  homeTeamSource?: {
    sourceType: 'seed' | 'winner' | 'loser' | 'fixed';
    sourceId: string;
    matchId?: Types.ObjectId;
    position?: 'winner' | 'loser';
  };
  awayTeamSource?: {
    sourceType: 'seed' | 'winner' | 'loser' | 'fixed';
    sourceId: string;
    matchId?: Types.ObjectId;
    position?: 'winner' | 'loser';
  };
  winnerId?: Types.ObjectId;
  loserId?: Types.ObjectId;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface IBracketSettings {
  type: BracketType;
  totalRounds: number;
  teamsPerMatch: number;
  advancementRule: 'winner' | 'best_of' | 'points';
  bestOf?: number;
  seedingMethod: 'manual' | 'ranking' | 'random' | 'snake';
  reseeding: boolean;
  thirdPlaceMatch: boolean;
  consolationBracket: boolean;
  seeding: Array<{
    position: number;
    teamId: Types.ObjectId;
    seed: number;
  }>;
}

export interface IBracket extends Document {
  bracketId: string;
  tournamentId: Types.ObjectId;
  name: string;
  type: BracketType;
  status: BracketStatus;
  settings: IBracketSettings;
  nodes: IBracketNode[];
  currentRound: number;
  totalMatches: number;
  completedMatches: number;
  championId?: Types.ObjectId;
  runnerUpId?: Types.ObjectId;
  thirdPlaceId?: Types.ObjectId;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type BracketDocument = HydratedDocument<IBracket>;

const BracketNodeSchema = new Schema(
  {
    nodeId: { type: String, required: true, trim: true, maxlength: 50 },
    round: { type: Number, required: true, min: 1 },
    position: { type: Number, required: true, min: 1 },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    homeTeamSource: {
      sourceType: { type: String, enum: ['seed', 'winner', 'loser', 'fixed'], required: true },
      sourceId: { type: String, required: true },
      matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
      position: { type: String, enum: ['winner', 'loser'] }
    },
    awayTeamSource: {
      sourceType: { type: String, enum: ['seed', 'winner', 'loser', 'fixed'], required: true },
      sourceId: { type: String, required: true },
      matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
      position: { type: String, enum: ['winner', 'loser'] }
    },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Team' },
    loserId: { type: Schema.Types.ObjectId, ref: 'Team' },
    status: { type: String, enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'], default: 'pending' }
  }, { _id: false });

const BracketSettingsSchema = new Schema(
  {
    type: { type: String, enum: Object.values(['single_elimination', 'double_elimination', 'round_robin', 'group_stage', 'swiss', 'page_playoff', 'custom']), required: true },
    totalRounds: { type: Number, required: true, min: 1, max: 10 },
    teamsPerMatch: { type: Number, default: 2, min: 2, max: 4 },
    advancementRule: { type: String, enum: ['winner', 'best_of', 'points'], default: 'winner' },
    bestOf: { type: Number, min: 1, max: 7 },
    seedingMethod: { type: String, enum: ['manual', 'ranking', 'random', 'snake'], default: 'manual' },
    reseeding: { type: Boolean, default: false },
    thirdPlaceMatch: { type: Boolean, default: false },
    consolationBracket: { type: Boolean, default: false },
    seeding: [{
      position: { type: Number, required: true, min: 1 },
      teamId: { type: Schema.Types.ObjectId, required: true, ref: 'Team' },
      seed: { type: Number, required: true, min: 1 }
    }]
  }, { _id: false });

const BracketSchema = new Schema(
  {
    bracketId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    tournamentId: { type: Schema.Types.ObjectId, required: true, ref: 'Tournament' },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: ['single_elimination', 'double_elimination', 'round_robin', 'group_stage', 'swiss', 'page_playoff', 'custom'], required: true },
    status: { type: String, enum: ['draft', 'generating', 'ready', 'in_progress', 'completed', 'archived'], default: 'draft' },
    settings: { type: Object, required: true },
    nodes: [{ type: Object }],
    currentRound: { type: Number, default: 1, min: 0 },
    totalMatches: { type: Number, default: 0 },
    completedMatches: { type: Number, default: 0 },
    championId: { type: Schema.Types.ObjectId, ref: 'Team' },
    runnerUpId: { type: Schema.Types.ObjectId, ref: 'Team' },
    thirdPlaceId: { type: Schema.Types.ObjectId, ref: 'Team' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    collection: 'brackets',
    versionKey: 'version'
  }
);

BracketSchema.index({ tournamentId: 1, status: 1 });
BracketSchema.index({ bracketId: 1 }, { unique: true });
BracketSchema.index({ status: 1 });

BracketSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.version = (this.version || 0) + 1;
  next();
});

export const Bracket = models.Bracket || model('Bracket', BracketSchema);