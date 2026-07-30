export enum TournamentType {
  LEAGUE = 'league',
  KNOCKOUT = 'knockout',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
  GROUP_STAGE_KNOCKOUT = 'group_stage_knockout',
  CUSTOM = 'custom'
}

export enum TournamentStatus {
  DRAFT = 'draft',
  REGISTRATION_OPEN = 'registration_open',
  REGISTRATION_CLOSED = 'registration_closed',
  SCHEDULE_PENDING = 'schedule_pending',
  SCHEDULE_GENERATED = 'schedule_generated',
  SCHEDULE_OPTIMIZED = 'schedule_optimized',
  SCHEDULE_APPROVED = 'schedule_approved',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum TournamentFormat {
  SINGLE_ROUND_ROBIN = 'single_round_robin',
  DOUBLE_ROUND_ROBIN = 'double_round_robin',
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  GROUP_STAGE = 'group_stage',
  GROUP_STAGE_THEN_KNOCKOUT = 'group_stage_then_knockout',
  SWISS = 'swiss',
  LADDER = 'ladder',
  CUSTOM = 'custom'
}

export interface TournamentRules {
  maxTeams: number;
  minTeams: number;
  maxPlayersPerTeam: number;
  minPlayersPerTeam: number;
  allowGuestPlayers: boolean;
  maxGuestPlayers: number;
  substitutionRules: SubstitutionRule[];
  tieBreakingRules: TieBreakingRule[];
  matchDuration: MatchDurationRules;
  scoringSystem: ScoringSystem;
  technicalTimeouts: boolean;
  videoReview: boolean;
}

export interface SubstitutionRule {
  maxSubstitutionsPerSet: number;
  maxSubstitutionsPerMatch: number;
  liberoSubstitutionsUnlimited: boolean;
  technicalTimeoutSubAllowed: boolean;
}

export interface TieBreakingRule {
  priority: number;
  criterion: 'points' | 'sets_ratio' | 'points_ratio' | 'head_to_head' | 'matches_won' | 'sets_won' | 'random';
  description: string;
}

export interface MatchDurationRules {
  maxSets: number;
  pointsPerSet: number;
  finalSetPoints: number;
  minLead: number;
  timeoutDuration: number;
  technicalTimeoutPoints: number[];
  intervalBetweenSets: number;
}

export interface ScoringSystem {
  type: 'rally_point' | 'side_out';
  pointsPerWin: number;
  pointsPerLoss: number;
  pointsPerDraw: number;
}

export interface TournamentStage {
  id: string;
  name: string;
  type: TournamentStageType;
  order: number;
  format: TournamentFormat;
  startDate: Date;
  endDate: Date;
  teams: string[];
  groups?: TournamentGroup[];
  bracket?: TournamentBracket;
  settings: StageSettings;
}

export enum TournamentStageType {
  GROUP_STAGE = 'group_stage',
  KNOCKOUT = 'knockout',
  QUALIFICATION = 'qualification',
  CLASSIFICATION = 'classification',
  CONSOLATION = 'consolation',
  FINAL = 'final',
  SEMI_FINAL = 'semi_final',
  QUARTER_FINAL = 'quarter_final',
  ROUND_OF_16 = 'round_of_16',
  ROUND_OF_32 = 'round_of_32',
  ROUND_OF_64 = 'round_of_64',
  CUSTOM = 'custom'
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: string[];
  rules: GroupRules;
}

export interface GroupRules {
  advancementCount: number;
  tieBreakingRules: TieBreakingRule[];
  matchFormat: TournamentFormat;
}

export interface TournamentBracket {
  id: string;
  type: BracketType;
  size: number;
  seeding: BracketSeeding;
  nodes: BracketNode[];
  settings: BracketSettings;
}

export enum BracketType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  PAGE_PLAYOFF = 'page_playoff',
  CUSTOM = 'custom'
}

export enum BracketSeeding {
  RANDOM = 'random',
  RANKING = 'ranking',
  MANUAL = 'manual',
  SERPENTINE = 'serpentine',
  GEOGRAPHIC = 'geographic'
}

export interface BracketNode {
  id: string;
  round: number;
  position: number;
  matchId?: string;
  team1Source?: BracketSource;
  team2Source?: BracketSource;
  winnerSource?: BracketSource;
  loserSource?: BracketSource;
}

export interface BracketSource {
  type: 'fixed' | 'winner' | 'loser';
  matchId?: string;
  teamId?: string;
  bracketNodeId?: string;
}

export interface BracketSettings {
  thirdPlaceMatch: boolean;
  reseeding: boolean;
  fixedSides: boolean;
  homeAwayAlternation: boolean;
}

export interface StageSettings {
  matchDuration: MatchDurationRules;
  pointsSystem: PointsSystem;
  homeAwayAlternation: boolean;
  restDaysBetweenMatches: number;
  maxMatchesPerDay: number;
  preferredTimeSlots: TimeSlot[];
  venueConstraints: VenueConstraint[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  courts: string[];
}

export interface VenueConstraint {
  venueId: string;
  maxMatchesPerDay: number;
  preferredTimeSlots: TimeSlot[];
  unavailableDates: Date[];
  courtTypes: string[];
}

export interface Tournament {
  id: string;
  name: string;
  code: string;
  type: TournamentType;
  status: TournamentStatus;
  format: TournamentFormat;
  organizationId: string;
  seasonId?: string;
  parentTournamentId?: string;
  rules: TournamentRules;
  stages: TournamentStage[];
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  maxTeams: number;
  minTeams: number;
  registeredTeams: TeamRegistration[];
  invitedTeams: TeamInvitation[];
  venues: string[];
  courts: string[];
  officials: string[];
  cameras: string[];
  settings: TournamentSettings;
  metadata: TournamentMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface TeamRegistration {
  teamId: string;
  teamName: string;
  registrationDate: Date;
  status: RegistrationStatus;
  players: PlayerRegistration[];
  staff: StaffRegistration[];
  documents: DocumentReference[];
  payment: PaymentStatus;
  confirmedAt?: Date;
  confirmedBy?: string;
}

export interface PlayerRegistration {
  playerId: string;
  name: string;
  number: number;
  position: string;
  dateOfBirth: Date;
  nationality: string;
  documents: DocumentReference[];
  status: RegistrationStatus;
}

export interface StaffRegistration {
  staffId: string;
  name: string;
  role: string;
  certifications: string[];
  status: RegistrationStatus;
}

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  WAITLISTED = 'waitlisted'
}

export interface DocumentReference {
  id: string;
  type: string;
  url: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'partial' | 'paid' | 'refunded' | 'waived';
  amount: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  method: string;
  date: Date;
  reference: string;
}

export interface TeamInvitation {
  teamId: string;
  teamName: string;
  invitedAt: Date;
  invitedBy: string;
  status: InvitationStatus;
  respondedAt?: Date;
  respondedBy?: string;
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface TournamentSettings {
  publicRegistration: boolean;
  autoSchedule: boolean;
  autoOptimize: boolean;
  requireApproval: boolean;
  notificationsEnabled: boolean;
  liveScoring: boolean;
  videoStreaming: boolean;
  statisticsLevel: StatisticsLevel;
  language: string;
  timezone: string;
}

export enum StatisticsLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  COMPREHENSIVE = 'comprehensive'
}

export interface TournamentMetadata {
  tags: string[];
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia: SocialMediaLinks;
  customFields: Record<string, unknown>;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}