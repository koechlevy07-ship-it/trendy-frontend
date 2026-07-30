import { Types } from 'mongoose';

export enum MatchFormat {
  BEST_OF_3 = 'best_of_3',
  BEST_OF_5 = 'best_of_5',
  BEST_OF_7 = 'best_of_7',
  SINGLE_SET = 'single_set',
  CUSTOM = 'custom'
}

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  ABANDONED = 'abandoned',
  FORFEITED = 'forfeited',
  WALKOVER = 'walkover'
}

export enum MatchType {
  LEAGUE = 'league',
  TOURNAMENT = 'tournament',
  FRIENDLY = 'friendly',
  EXHIBITION = 'exhibition',
  PLAYOFF = 'playoff',
  QUALIFICATION = 'qualification',
  CONSOLATION = 'consolation',
  CLASSIFICATION = 'classification'
}

export enum Side {
  HOME = 'home',
  AWAY = 'away',
  NEUTRAL = 'neutral'
}

export interface TeamAllocation {
  teamId: string;
  side: Side;
  lineup: PlayerLineup[];
  staff: StaffAllocation[];
  equipment: EquipmentAllocation[];
  aiConfiguration: AIConfiguration[];
}

export interface PlayerLineup {
  playerId: string;
  position: string;
  number: number;
  starter: boolean;
  captain: boolean;
  libero: boolean;
}

export interface StaffAllocation {
  staffId: string;
  role: string;
  location: string;
}

export interface EquipmentAllocation {
  equipmentId: string;
  type: string;
  quantity: number;
  specifications: Record<string, unknown>;
}

export interface AIConfiguration {
  cameraId: string;
  trackingEnabled: boolean;
  actionRecognitionEnabled: boolean;
  poseEstimationEnabled: boolean;
  ballTrackingEnabled: boolean;
  jerseyDetectionEnabled: boolean;
  customModels: string[];
  inferenceThreshold: number;
}

export interface OfficialAllocation {
  officialId: string;
  role: OfficialRole;
  assignedAt: Date;
  confirmed: boolean;
  confirmedAt?: Date;
  confirmedBy?: string;
}

export enum OfficialRole {
  FIRST_REFEREE = 'first_referee',
  SECOND_REFEREE = 'second_referee',
  SCORER = 'scorer',
  ASSISTANT_SCORER = 'assistant_scorer',
  LINE_JUDGE_1 = 'line_judge_1',
  LINE_JUDGE_2 = 'line_judge_2',
  LINE_JUDGE_3 = 'line_judge_3',
  LINE_JUDGE_4 = 'line_judge_4',
  RESERVE_REFEREE = 'reserve_referee',
  CHALLENGE_REFEREE = 'challenge_referee',
  MATCH_COMMISSIONER = 'match_commissioner',
  TECHNICAL_DELEGATE = 'technical_delegate',
  MEDICAL_DELEGATE = 'medical_delegate',
  MEDIA_DELEGATE = 'media_delegate'
}

export interface BroadcastAllocation {
  broadcasterId: string;
  platform: BroadcastPlatform;
  rights: BroadcastRights;
  production: ProductionDetails;
  schedule: BroadcastSchedule;
}

export enum BroadcastPlatform {
  TELEVISION = 'television',
  STREAMING = 'streaming',
  SOCIAL_MEDIA = 'social_media',
  OTT = 'ott',
  RADIO = 'radio',
  IN_VENUE = 'in_venue'
}

export interface BroadcastRights {
  live: boolean;
  delayed: boolean;
  highlights: boolean;
  clips: boolean;
  archive: boolean;
  territories: string[];
  languages: string[];
}

export interface ProductionDetails {
  cameras: number;
  commentators: number;
  graphics: boolean;
  replays: boolean;
  statistics: boolean;
  augmentedReality: boolean;
  vrEnabled: boolean;
  drone: boolean;
}

export interface BroadcastSchedule {
  preMatchStart: Date;
  liveStart: Date;
  estimatedEnd: Date;
  postMatchDuration: number;
  adBreaks: AdBreak[];
}

export interface AdBreak {
  scheduledTime: Date;
  duration: number;
  type: 'fixed' | 'floating';
}

export interface EquipmentAllocation {
  equipmentId: string;
  type: EquipmentType;
  quantity: number;
  specifications: Record<string, unknown>;
  responsibleParty: string;
}

export enum EquipmentType {
  NET_SYSTEM = 'net_system',
  POSTS = 'posts',
  ANTENNAS = 'antennas',
  SCOREBOARD = 'scoreboard',
  REFEREE_STAND = 'referee_stand',
  LIGHTING = 'lighting',
  FLOORING = 'flooring',
  BALLS = 'balls',
  BALL_CART = 'ball_cart',
  NET_HEIGHT_GAUGE = 'net_height_gauge',
  MEASURING_TAPE = 'measuring_tape',
  COURT_LINE_MARKER = 'court_line_marker',
  SAND_RAKE = 'sand_rake',
  WATER_REMOVAL = 'water_removal',
  FIRST_AID = 'first_aid',
  AED = 'aed',
  ICE_MACHINE = 'ice_machine',
  TRAINING_AIDS = 'training_aids',
  VIDEO_REPLAY = 'video_replay',
  COMMUNICATION = 'communication',
  TIMING_SYSTEM = 'timing_system',
  STATISTICS_SYSTEM = 'statistics_system',
  CAMERA_SYSTEM = 'camera_system',
  CALIBRATION_TOOLS = 'calibration_tools',
  MAINTENANCE_TOOLS = 'maintenance_tools',
  CLEANING_EQUIPMENT = 'cleaning_equipment',
  SAFETY_EQUIPMENT = 'safety_equipment',
  OTHER = 'other'
}

export interface VenueAllocation {
  venueId: string;
  courtId: string;
  accessStart: Date;
  accessEnd: Date;
  zones: ZoneAllocation[];
  facilities: FacilityAllocation[];
}

export interface ZoneAllocation {
  zoneId: string;
  name: string;
  allocatedTo: string[];
  accessStart: Date;
  accessEnd: Date;
  capacity: number;
}

export interface FacilityAllocation {
  facilityId: string;
  type: string;
  allocatedTo: string[];
  accessStart: Date;
  accessEnd: Date;
}

export interface OfficialAllocation {
  officialId: string;
  role: string;
  assignedAt: Date;
  confirmed: boolean;
}

export interface BroadcastAllocation {
  broadcasterId: string;
  platform: string;
  rights: string[];
  production: object;
  schedule: object;
}

export interface MatchSchedule {
  id: string;
  matchId: string;
  tournamentId: string;
  stageId: string;
  roundId?: string;
  groupId?: string;
  matchNumber: number;
  matchType: MatchType;
  format: MatchFormat;
  status: MatchStatus;
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number;
  venueId: string;
  courtId: string;
  teamAllocations: TeamAllocation[];
  officialAllocations: OfficialAllocation[];
  aiCameraAllocations: AICameraAllocation[];
  broadcastAllocations: BroadcastAllocation[];
  equipmentAllocations: EquipmentAllocation[];
  venueAllocation: VenueAllocation;
  scoring: ScoringConfiguration;
  timing: TimingConfiguration;
  rules: MatchRules;
  constraints: SchedulingConstraint[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
}

export interface AICameraAllocation {
  cameraId: string;
  role: CameraRole;
  position: CameraPosition;
  configuration: AIConfiguration;
  calibration: CalibrationStatus;
  redundancy: RedundancyConfig;
}

export enum CameraRole {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TRACKING = 'tracking',
  ACTION_RECOGNITION = 'action_recognition',
  POSE_ESTIMATION = 'pose_estimation',
  BALL_TRACKING = 'ball_tracking',
  JERSEY_DETECTION = 'jersey_detection',
  OVERHEAD = 'overhead',
  SIDE = 'side',
  ENDLINE = 'endline',
  SERVICE_LINE = 'service_line',
  ATTACK_LINE = 'attack_line',
  NET = 'net',
  WIDE = 'wide',
  TIGHT = 'tight',
  SLOW_MOTION = 'slow_motion',
  DRONE = 'drone'
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
  pan: number;
  tilt: number;
  zoom: number;
  focus: number;
}

export interface CalibrationStatus {
  calibrated: boolean;
  calibratedAt?: Date;
  calibratedBy?: string;
  calibrationProfileId?: string;
  accuracy?: number;
  nextCalibrationDue?: Date;
}

export interface RedundancyConfig {
  level: RedundancyLevel;
  backupCameraIds: string[];
  failoverTime: number;
  autoFailover: boolean;
}

export enum RedundancyLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export interface ScoringConfiguration {
  system: ScoringSystem;
  pointsPerSet: number;
  finalSetPoints: number;
  minLead: number;
  maxSets: number;
  tieBreakerRules: TieBreakerRule[];
}

export interface ScoringSystem {
  type: 'rally_point' | 'side_out';
  pointsPerWin: number;
  pointsPerLoss: number;
  pointsPerDraw: number;
}

export interface TieBreakerRule {
  priority: number;
  criterion: string;
  description: string;
}

export interface TimingConfiguration {
  setDuration: number;
  maxSetDuration: number;
  timeoutDuration: number;
  timeoutCount: number;
  technicalTimeoutPoints: number[];
  intervalBetweenSets: number;
  warmupDuration: number;
  injuryTimeoutDuration: number;
  challengeTimeoutDuration: number;
  challengeCount: number;
}

export interface MatchRules {
  substitutionRules: SubstitutionRules;
  timeoutRules: TimeoutRules;
  challengeRules: ChallengeRules;
  medicalRules: MedicalRules;
  equipmentRules: EquipmentRules;
  conductRules: ConductRules;
}

export interface SubstitutionRules {
  maxSubstitutionsPerSet: number;
  maxSubstitutionsPerMatch: number;
  liberoSubstitutions: boolean;
  technicalTimeoutSubAllowed: boolean;
  substitutionZone: string;
}

export interface TimeoutRules {
  maxTimeoutsPerSet: number;
  maxTimeoutsPerMatch: number;
  duration: number;
  technicalTimeouts: boolean;
  technicalTimeoutPoints: number[];
}

export interface ChallengeRules {
  enabled: boolean;
  challengesPerSet: number;
  challengesPerMatch: number;
  duration: number;
  reviewableActions: string[];
}

export interface MedicalRules {
  injuryTimeoutDuration: number;
  medicalStaffRequired: boolean;
  concussionProtocol: boolean;
  bleedingProtocol: boolean;
}

export interface EquipmentRules {
  ballSpecifications: BallSpecification[];
  netHeight: NetHeightSpecification;
  courtDimensions: CourtDimensions;
  lightingRequirements: LightingRequirements;
}

export interface BallSpecification {
  type: string;
  weight: number;
  circumference: number;
  pressure: number;
  color: string;
  manufacturer: string;
}

export interface NetHeightSpecification {
  men: number;
  women: number;
  junior: number;
  tolerance: number;
}

export interface CourtDimensions {
  length: number;
  width: number;
  freeZoneLength: number;
  freeZoneWidth: number;
  ceilingHeight: number;
  netHeight: number;
  attackLineDistance: number;
  serviceZoneWidth: number;
}

export interface LightingRequirements {
  minLux: number;
  preferredLux: number;
  uniformity: number;
  colorTemperature: number;
  flickerFree: boolean;
}

export interface SchedulingConstraint {
  id: string;
  type: ConstraintType;
  severity: ConstraintSeverity;
  description: string;
  entities: string[];
  parameters: Record<string, unknown>;
  active: boolean;
}

export enum ConstraintType {
  TEAM_AVAILABILITY = 'team_availability',
  VENUE_AVAILABILITY = 'venue_availability',
  COURT_AVAILABILITY = 'court_availability',
  OFFICIAL_AVAILABILITY = 'official_availability',
  CAMERA_AVAILABILITY = 'camera_availability',
  MAINTENANCE_WINDOW = 'maintenance_window',
  REST_PERIOD = 'rest_period',
  MAX_MATCHES_PER_DAY = 'max_matches_per_day',
  TRAVEL_TIME = 'travel_time',
  BROADCAST_WINDOW = 'broadcast_window',
  AGE_GROUP = 'age_group',
  CERTIFICATION = 'certification',
  MAINTENANCE = 'maintenance',
  CONFLICT_OF_INTEREST = 'conflict_of_interest',
  AI_RESOURCE = 'ai_resource',
  STORAGE_CAPACITY = 'storage_capacity',
  PROCESSING_CAPACITY = 'processing_capacity'
}

export enum ConstraintSeverity {
  HARD = 'hard',
  SOFT = 'soft',
  PREFERENCE = 'preference'
}

export interface MatchScheduleChangeLog {
  id: string;
  matchScheduleId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changedAt: Date;
  changedBy: string;
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
}