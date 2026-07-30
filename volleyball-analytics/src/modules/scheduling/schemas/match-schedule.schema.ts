import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum ScheduleStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export interface ITeamReference {
  teamId: Types.ObjectId;
  teamName: string;
  teamCode: string;
  logoUrl?: string;
  isHome: boolean;
  seed?: number;
  rosterId?: Types.ObjectId;
}

export interface IOfficialAssignment {
  officialId: Types.ObjectId;
  officialName: string;
  role: 'referee' | 'first_referee' | 'second_referee' | 'scorer' | 'assistant_scorer' | 'line_judge' | 'line_judge_1' | 'line_judge_2' | 'line_judge_3' | 'line_judge_4' | 'medical' | 'match_commissioner' | 'technical_delegate' | 'camera_operator' | 'broadcast_coordinator';
  isPrimary: boolean;
  certified: boolean;
  certificationLevel?: string;
  confirmedAt?: Date;
  confirmedBy?: Types.ObjectId;
}

export interface ICameraAssignment {
  cameraId: Types.ObjectId;
  cameraCode: string;
  cameraName: string;
  position: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  fieldOfView: { horizontal: number; vertical: number };
  assignedCoverageZones: Types.ObjectId[];
  calibrationProfileId?: Types.ObjectId;
  isPrimary: boolean;
  streamConfig?: {
    protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
    url: string;
    username?: string;
    password?: string;
    streamPath?: string;
    transport?: 'tcp' | 'udp' | 'multicast';
  };
  specs?: {
    sensorType: string;
    sensorSize: string;
    focalLength: number;
    aperture: string;
    isoRange: string;
    shutterSpeedRange: string;
    whiteBalance: string[];
    focusMode: string[];
  };
  isActive: boolean;
  assignedAt: Date;
  assignedBy: Types.ObjectId;
}

export interface ICoverageZoneAssignment {
  zoneId: Types.ObjectId;
  zoneCode: string;
  zoneName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requiredCameraCount: number;
  assignedCameras: Types.ObjectId[];
  aiRequirements: {
    detectionRequired: boolean;
    trackingRequired: boolean;
    poseEstimationRequired: boolean;
    actionRecognitionRequired: boolean;
    ballTrackingRequired: boolean;
    jerseyDetectionRequired: boolean;
  };
  calibrationRequirements: {
    minReferencePoints: number;
    maxReprojectionError: number;
    requiredAccuracy: number;
  };
}

export interface IMatchScheduleConstraint {
  constraintId: string;
  constraintType: 'availability' | 'capacity' | 'temporal' | 'spatial' | 'resource' | 'qualification' | 'compliance' | 'ai_cv';
  severity: 'hard' | 'soft' | 'advisory';
  expression: Record<string, any>;
  affectedEntities: string[];
  description: string;
}

export interface IMatchResult {
  homeTeamScore: number;
  awayTeamScore: number;
  sets: Array<{
    setNumber: number;
    homeScore: number;
    awayScore: number;
    duration: number;
  }>;
  totalDuration: number;
  winner: 'home' | 'away';
  mvpPlayerId?: Types.ObjectId;
  statistics?: Record<string, any>;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
}

export interface IMatchSchedule extends Document {
  scheduleId: string;
  tournamentId: Types.ObjectId;
  matchId: Types.ObjectId;
  homeTeam: {
    teamId: Types.ObjectId;
    teamName: string;
    teamCode: string;
    logoUrl?: string;
    isHome: boolean;
    seed?: number;
    rosterId?: Types.ObjectId;
  };
  awayTeam: {
    teamId: Types.ObjectId;
    teamName: string;
    teamCode: string;
    logoUrl?: string;
    isHome: boolean;
    seed?: number;
    rosterId?: Types.ObjectId;
  };
  scheduledAt: Date;
  venueId: Types.ObjectId;
  courtId: Types.ObjectId;
  duration: number;
  assignedOfficials: {
    officialId: Types.ObjectId;
    officialName: string;
    role: 'referee' | 'first_referee' | 'second_referee' | 'scorer' | 'assistant_scorer' | 'line_judge' | 'line_judge_1' | 'line_judge_2' | 'line_judge_3' | 'line_judge_4' | 'medical' | 'match_commissioner' | 'technical_delegate' | 'camera_operator' | 'broadcast_coordinator';
    isPrimary: boolean;
    certified: boolean;
    certificationLevel?: string;
    confirmedAt?: Date;
    confirmedBy?: Types.ObjectId;
  }[];
  assignedCameras: {
    cameraId: Types.ObjectId;
    cameraCode: string;
    cameraName: string;
    position: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
    fieldOfView: { horizontal: number; vertical: number };
    assignedCoverageZones: Types.ObjectId[];
    calibrationProfileId?: Types.ObjectId;
    isPrimary: boolean;
    streamConfig?: {
      protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
      url: string;
      username?: string;
      password?: string;
      streamPath?: string;
      transport?: 'tcp' | 'udp' | 'multicast';
    };
    specs?: {
      sensorType: string;
      sensorSize: string;
      focalLength: number;
      aperture: string;
      isoRange: string;
      shutterSpeedRange: string;
      whiteBalance: string[];
      focusMode: string[];
    };
    isActive: boolean;
    assignedAt: Date;
    assignedBy: Types.ObjectId;
  }[];
  assignedCoverageZones: {
    zoneId: Types.ObjectId;
    zoneCode: string;
    zoneName: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    aiRequirements: {
      detectionRequired: boolean;
      trackingRequired: boolean;
      poseEstimationRequired: boolean;
      actionRecognitionRequired: boolean;
      ballTrackingRequired: boolean;
      jerseyDetectionRequired: boolean;
    };
    calibrationRequirements: {
      minReferencePoints: number;
      maxReprojectionError: number;
      requiredAccuracy: number;
    };
  }[];
  constraints: {
    constraintId: string;
    constraintType: 'availability' | 'capacity' | 'temporal' | 'spatial' | 'resource' | 'qualification' | 'compliance' | 'ai_cv';
    severity: 'hard' | 'soft' | 'advisory';
    expression: Record<string, any>;
    affectedEntities: string[];
    description: string;
  }[];
  status: ScheduleStatus;
  scheduledAt: Date;
  venueId: Types.ObjectId;
  courtId: Types.ObjectId;
  duration: number;
  assignedOfficials: {
    officialId: Types.ObjectId;
    officialName: string;
    role: 'referee' | 'first_referee' | 'second_referee' | 'scorer' | 'assistant_scorer' | 'line_judge' | 'line_judge_1' | 'line_judge_2' | 'line_judge_3' | 'line_judge_4' | 'medical' | 'match_commissioner' | 'technical_delegate' | 'camera_operator' | 'broadcast_coordinator';
    isPrimary: boolean;
    certified: boolean;
    certificationLevel?: string;
    confirmedAt?: Date;
    confirmedBy?: Types.ObjectId;
  }[];
  assignedCameras: {
    cameraId: Types.ObjectId;
    cameraCode: string;
    cameraName: string;
    position: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
    fieldOfView: { horizontal: number; vertical: number };
    assignedCoverageZones: Types.ObjectId[];
    calibrationProfileId?: Types.ObjectId;
    isPrimary: boolean;
    streamConfig?: {
      protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
      url: string;
      username?: string;
      password?: string;
      streamPath?: string;
      transport?: 'tcp' | 'udp' | 'multicast';
    };
    specs?: {
      sensorType: string;
      sensorSize: string;
      focalLength: number;
      aperture: string;
      isoRange: string;
      shutterSpeedRange: string;
      whiteBalance: string[];
      focusMode: string[];
    };
    isActive: boolean;
    assignedAt: Date;
    assignedBy: Types.ObjectId;
  }[];
  assignedCoverageZones: {
    zoneId: Types.ObjectId;
    zoneCode: string;
    zoneName: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    aiRequirements: {
      detectionRequired: boolean;
      trackingRequired: boolean;
      poseEstimationRequired: boolean;
      actionRecognitionRequired: boolean;
      ballTrackingRequired: boolean;
      jerseyDetectionRequired: boolean;
    };
    calibrationRequirements: {
      minReferencePoints: number;
      maxReprojectionError: number;
      requiredAccuracy: number;
    };
  }[];
  constraints: {
    constraintId: string;
    constraintType: 'availability' | 'capacity' | 'temporal' | 'spatial' | 'resource' | 'qualification' | 'compliance' | 'ai_cv';
    severity: 'hard' | 'soft' | 'advisory';
    expression: Record<string, any>;
    affectedEntities: string[];
    description: string;
  }[];
  status: ScheduleStatus;
  scheduledAt: Date;
  venueId: Types.ObjectId;
  courtId: Types.ObjectId;
  duration: number;
  assignedOfficials: {
    officialId: Types.ObjectId;
    officialName: string;
    role: 'referee' | 'first_referee' | 'second_referee' | 'scorer' | 'assistant_scorer' | 'line_judge' | 'line_judge_1' | 'line_judge_2' | 'line_judge_3' | 'line_judge_4' | 'medical' | 'match_commissioner' | 'technical_delegate' | 'camera_operator' | 'broadcast_coordinator';
    isPrimary: boolean;
    certified: boolean;
    certificationLevel?: string;
    confirmedAt?: Date;
    confirmedBy?: Types.ObjectId;
  }[];
  assignedCameras: {
    cameraId: Types.ObjectId;
    cameraCode: string;
    cameraName: string;
    position: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
    fieldOfView: { horizontal: number; vertical: number };
    assignedCoverageZones: Types.ObjectId[];
    calibrationProfileId?: Types.ObjectId;
    isPrimary: boolean;
    streamConfig?: {
      protocol: 'rtsp' | 'rtmp' | 'http' | 'https' | 'websocket' | 'srt' | 'ndi';
      url: string;
      username?: string;
      password?: string;
      streamPath?: string;
      transport?: 'tcp' | 'udp' | 'multicast';
    };
    specs?: {
      sensorType: string;
      sensorSize: string;
      focalLength: number;
      aperture: string;
      isoRange: string;
      shutterSpeedRange: string;
      whiteBalance: string[];
      focusMode: string[];
    };
    isActive: boolean;
    assignedAt: Date;
    assignedBy: Types.ObjectId;
  }[];
  assignedCoverageZones: {
    zoneId: Types.ObjectId;
    zoneCode: string;
    zoneName: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    requiredCameraCount: number;
    assignedCameras: Types.ObjectId[];
    aiRequirements: {
      detectionRequired: boolean;
      trackingRequired: boolean;
      poseEstimationRequired: boolean;
      actionRecognitionRequired: boolean;
      ballTrackingRequired: boolean;
      jerseyDetectionRequired: boolean;
    };
    calibrationRequirements: {
      minReferencePoints: number;
      maxReprojectionError: number;
      requiredAccuracy: number;
    };
  }[];
  constraints: {
    constraintId: string;
    constraintType: 'availability' | 'capacity' | 'temporal' | 'spatial' | 'resource' | 'qualification' | 'compliance' | 'ai_cv';
    severity: 'hard' | 'soft' | 'advisory';
    expression: Record<string, any>;
    affectedEntities: string[];
    description: string;
  }[];
  status: ScheduleStatus;
  scheduledAt: Date;
  venueId: Types.ObjectId;
  courtId: Types.ObjectId;
  duration: number;
  actualStartAt?: Date;
  actualEndAt?: Date;
  actualDuration?: number;
  result?: {
    homeTeamScore: number;
    awayTeamScore: number;
    sets: Array<{
      setNumber: number;
      homeScore: number;
      awayScore: number;
      duration: number;
    }>;
    totalDuration: number;
    winner: 'home' | 'away';
    mvpPlayerId?: Types.ObjectId;
    statistics?: Record<string, any>;
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type MatchScheduleDocument = HydratedDocument<IMatchSchedule>;

const TeamReferenceSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, required: true, ref: 'Team' },
    teamName: { type: String, required: true, trim: true, maxlength: 100 },
    teamCode: { type: String, required: true, trim: true, maxlength: 20 },
    logoUrl: { type: String, trim: true },
    isHome: { type: Boolean, required: true },
    seed: { type: Number, min: 1 },
    rosterId: { type: Schema.Types.ObjectId, ref: 'Roster' }
  },
  { _id: false }
);

const OfficialAssignmentSchema = new Schema(
  {
    officialId: { type: Schema.Types.ObjectId, required: true, ref: 'Official' },
    officialName: { type: String, required: true, trim: true, maxlength: 100 },
    role: {
      type: String,
      enum: ['referee', 'first_referee', 'second_referee', 'scorer', 'assistant_scorer', 'line_judge', 'line_judge_1', 'line_judge_2', 'line_judge_3', 'line_judge_4', 'medical', 'match_commissioner', 'technical_delegate', 'camera_operator', 'broadcast_coordinator'],
      required: true
    },
    isPrimary: { type: Boolean, default: false },
    certified: { type: Boolean, default: false },
    certificationLevel: { type: String, trim: true },
    confirmedAt: { type: Date },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: false }
);

const CameraAssignmentSchema = new Schema(
  {
    cameraId: { type: Schema.Types.ObjectId, required: true, ref: 'Camera' },
    cameraCode: { type: String, required: true, trim: true, maxlength: 50 },
    cameraName: { type: String, required: true, trim: true, maxlength: 100 },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      roll: { type: Number, required: true, min: -180, max: 180 },
      pitch: { type: Number, required: true, min: -90, max: 90 },
      yaw: { type: Number, required: true, min: -180, max: 180 }
    },
    fieldOfView: {
      horizontal: { type: Number, required: true, min: 1, max: 180 },
      vertical: { type: Number, required: true, min: 1, max: 180 }
    },
    assignedCoverageZones: [{ type: Schema.Types.ObjectId, ref: 'CoverageZone' }],
    calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' },
    isPrimary: { type: Boolean, default: false },
    streamConfig: {
      protocol: { type: String, enum: ['rtsp', 'rtmp', 'http', 'https', 'websocket', 'srt', 'ndi'] },
      url: { type: String, required: true, trim: true },
      username: { type: String, trim: true },
      password: { type: String, trim: true },
      streamPath: { type: String, trim: true },
      transport: { type: String, enum: ['tcp', 'udp', 'multicast'] }
    },
    specs: {
      sensorType: { type: String, trim: true },
      sensorSize: { type: String, trim: true },
      focalLength: { type: Number, min: 1 },
      aperture: { type: String, trim: true },
      isoRange: { type: String, trim: true },
      shutterSpeedRange: { type: String, trim: true },
      whiteBalance: [{ type: String, trim: true }],
      focusMode: [{ type: String, trim: true }]
    },
    isActive: { type: Boolean, default: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
  },
  { _id: false }
);

const CoverageZoneAssignmentSchema = new Schema(
  {
    zoneId: { type: Schema.Types.ObjectId, required: true, ref: 'CoverageZone' },
    zoneCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
    zoneName: { type: String, required: true, trim: true, maxlength: 200 },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    requiredCameraCount: { type: Number, required: true, min: 1 },
    assignedCameras: [{ type: Schema.Types.ObjectId, ref: 'Camera' }],
    aiRequirements: {
      detectionRequired: { type: Boolean, default: true },
      trackingRequired: { type: Boolean, default: true },
      poseEstimationRequired: { type: Boolean, default: false },
      actionRecognitionRequired: { type: Boolean, default: false },
      ballTrackingRequired: { type: Boolean, default: false },
      jerseyDetectionRequired: { type: Boolean, default: false }
    },
    calibrationRequirements: {
      minReferencePoints: { type: Number, required: true, min: 4 },
      maxReprojectionError: { type: Number, required: true, min: 0.1 },
      requiredAccuracy: { type: Number, required: true, min: 0 }
    }
  },
  { _id: false }
);

const MatchScheduleConstraintSchema = new Schema(
  {
    constraintId: { type: String, required: true },
    constraintType: { type: String, enum: ['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv'], required: true },
    severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
    expression: { type: Schema.Types.Mixed, required: true },
    affectedEntities: [{ type: String, required: true }],
    description: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { _id: false }
);

const MatchResultSchema = new Schema(
  {
    homeTeamScore: { type: Number, required: true, min: 0 },
    awayTeamScore: { type: Number, required: true, min: 0 },
    sets: [{
      setNumber: { type: Number, required: true, min: 1 },
      homeScore: { type: Number, required: true, min: 0 },
      awayScore: { type: Number, required: true, min: 0 },
      duration: { type: Number, required: true, min: 0 }
    }],
    totalDuration: { type: Number, required: true, min: 0 },
    winner: { type: String, enum: ['home', 'away'], required: true },
    mvpPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
    statistics: { type: Schema.Types.Mixed, default: {} },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: false }
);

const MatchScheduleSchema = new Schema(
  {
    scheduleId: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    tournamentId: { type: Schema.Types.ObjectId, required: true, ref: 'Tournament' },
    matchId: { type: Schema.Types.ObjectId, required: true, ref: 'Match' },
    homeTeam: {
      teamId: { type: Schema.Types.ObjectId, required: true, ref: 'Team' },
      teamName: { type: String, required: true, trim: true, maxlength: 100 },
      teamCode: { type: String, required: true, trim: true, maxlength: 20 },
      logoUrl: { type: String, trim: true },
      isHome: { type: Boolean, required: true },
      seed: { type: Number, min: 1 },
      rosterId: { type: Schema.Types.ObjectId, ref: 'Roster' }
    },
    awayTeam: {
      teamId: { type: Schema.Types.ObjectId, required: true, ref: 'Team' },
      teamName: { type: String, required: true, trim: true, maxlength: 100 },
      teamCode: { type: String, required: true, trim: true, maxlength: 20 },
      logoUrl: { type: String, trim: true },
      isHome: { type: Boolean, required: true },
      seed: { type: Number, min: 1 },
      rosterId: { type: Schema.Types.ObjectId, ref: 'Roster' }
    },
    scheduledAt: { type: Date, required: true },
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
    courtId: { type: Schema.Types.ObjectId, required: true, ref: 'Court' },
    duration: { type: Number, required: true, min: 1 },
    assignedOfficials: [{
      officialId: { type: Schema.Types.ObjectId, required: true, ref: 'Official' },
      officialName: { type: String, required: true, trim: true, maxlength: 100 },
      role: {
        type: String,
        enum: ['referee', 'first_referee', 'second_referee', 'scorer', 'assistant_scorer', 'line_judge', 'line_judge_1', 'line_judge_2', 'line_judge_3', 'line_judge_4', 'medical', 'match_commissioner', 'technical_delegate', 'camera_operator', 'broadcast_coordinator'],
        required: true
      },
      isPrimary: { type: Boolean, default: false },
      certified: { type: Boolean, default: false },
      certificationLevel: { type: String, trim: true },
      confirmedAt: { type: Date },
      confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    assignedCameras: [{
      cameraId: { type: Schema.Types.ObjectId, required: true, ref: 'Camera' },
      cameraCode: { type: String, required: true, trim: true, maxlength: 50 },
      cameraName: { type: String, required: true, trim: true, maxlength: 100 },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true },
        roll: { type: Number, required: true, min: -180, max: 180 },
        pitch: { type: Number, required: true, min: -90, max: 90 },
        yaw: { type: Number, required: true, min: -180, max: 180 }
      },
      fieldOfView: {
        horizontal: { type: Number, required: true, min: 1, max: 180 },
        vertical: { type: Number, required: true, min: 1, max: 180 }
      },
      assignedCoverageZones: [{ type: Schema.Types.ObjectId, ref: 'CoverageZone' }],
      calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' },
      isPrimary: { type: Boolean, default: false },
      streamConfig: {
        protocol: { type: String, enum: ['rtsp', 'rtmp', 'http', 'https', 'websocket', 'srt', 'ndi'] },
        url: { type: String, required: true, trim: true },
        username: { type: String, trim: true },
        password: { type: String, trim: true },
        streamPath: { type: String, trim: true },
        transport: { type: String, enum: ['tcp', 'udp', 'multicast'] }
      },
      specs: {
        sensorType: { type: String, trim: true },
        sensorSize: { type: String, trim: true },
        focalLength: { type: Number, min: 1 },
        aperture: { type: String, trim: true },
        isoRange: { type: String, trim: true },
        shutterSpeedRange: { type: String, trim: true },
        whiteBalance: [{ type: String, trim: true }],
        focusMode: [{ type: String, trim: true }]
      },
      isActive: { type: Boolean, default: true },
      assignedAt: { type: Date, default: Date.now },
      assignedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }],
    assignedCoverageZones: [{
      zoneId: { type: Schema.Types.ObjectId, required: true, ref: 'CoverageZone' },
      zoneCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
      zoneName: { type: String, required: true, trim: true, maxlength: 200 },
      priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
      requiredCameraCount: { type: Number, required: true, min: 1 },
      assignedCameras: [{ type: Schema.Types.ObjectId, ref: 'Camera' }],
      aiRequirements: {
        detectionRequired: { type: Boolean, default: true },
        trackingRequired: { type: Boolean, default: true },
        poseEstimationRequired: { type: Boolean, default: false },
        actionRecognitionRequired: { type: Boolean, default: false },
        ballTrackingRequired: { type: Boolean, default: false },
        jerseyDetectionRequired: { type: Boolean, default: false }
      },
      calibrationRequirements: {
        minReferencePoints: { type: Number, required: true, min: 4 },
        maxReprojectionError: { type: Number, required: true, min: 0.1 },
        requiredAccuracy: { type: Number, required: true, min: 0 }
      }
    }],
    constraints: [{
      constraintId: { type: String, required: true },
      constraintType: { type: String, enum: ['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv'], required: true },
      severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
      expression: { type: Schema.Types.Mixed, required: true },
      affectedEntities: [{ type: String, required: true }],
      description: { type: String, required: true, trim: true, maxlength: 500 }
    }],
    status: { type: String, enum: Object.values(ScheduleStatus), default: ScheduleStatus.DRAFT },
    scheduledAt: { type: Date, required: true },
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
    courtId: { type: Schema.Types.ObjectId, required: true, ref: 'Court' },
    duration: { type: Number, required: true, min: 1 },
    assignedOfficials: [{
      officialId: { type: Schema.Types.ObjectId, required: true, ref: 'Official' },
      officialName: { type: String, required: true, trim: true, maxlength: 100 },
      role: {
        type: String,
        enum: ['referee', 'first_referee', 'second_referee', 'scorer', 'assistant_scorer', 'line_judge', 'line_judge_1', 'line_judge_2', 'line_judge_3', 'line_judge_4', 'medical', 'match_commissioner', 'technical_delegate', 'camera_operator', 'broadcast_coordinator'],
        required: true
      },
      isPrimary: { type: Boolean, default: false },
      certified: { type: Boolean, default: false },
      certificationLevel: { type: String, trim: true },
      confirmedAt: { type: Date },
      confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    assignedCameras: [{
      cameraId: { type: Schema.Types.ObjectId, required: true, ref: 'Camera' },
      cameraCode: { type: String, required: true, trim: true, maxlength: 50 },
      cameraName: { type: String, required: true, trim: true, maxlength: 100 },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        z: { type: Number, required: true },
        roll: { type: Number, required: true, min: -180, max: 180 },
        pitch: { type: Number, required: true, min: -90, max: 90 },
        yaw: { type: Number, required: true, min: -180, max: 180 }
      },
      fieldOfView: {
        horizontal: { type: Number, required: true, min: 1, max: 180 },
        vertical: { type: Number, required: true, min: 1, max: 180 }
      },
      assignedCoverageZones: [{ type: Schema.Types.ObjectId, ref: 'CoverageZone' }],
      calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' },
      isPrimary: { type: Boolean, default: false },
      streamConfig: {
        protocol: { type: String, enum: ['rtsp', 'rtmp', 'http', 'https', 'websocket', 'srt', 'ndi'] },
        url: { type: String, required: true, trim: true },
        username: { type: String, trim: true },
        password: { type: String, trim: true },
        streamPath: { type: String, trim: true },
        transport: { type: String, enum: ['tcp', 'udp', 'multicast'] }
      },
      specs: {
        sensorType: { type: String, trim: true },
        sensorSize: { type: String, trim: true },
        focalLength: { type: Number, min: 1 },
        aperture: { type: String, trim: true },
        isoRange: { type: String, trim: true },
        shutterSpeedRange: { type: String, trim: true },
        whiteBalance: [{ type: String, trim: true }],
        focusMode: [{ type: String, trim: true }]
      },
      isActive: { type: Boolean, default: true },
      assignedAt: { type: Date, default: Date.now },
      assignedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }],
    assignedCoverageZones: [{
      zoneId: { type: Schema.Types.ObjectId, required: true, ref: 'CoverageZone' },
      zoneCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
      zoneName: { type: String, required: true, trim: true, maxlength: 200 },
      priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
      requiredCameraCount: { type: Number, required: true, min: 1 },
      assignedCameras: [{ type: Schema.Types.ObjectId, ref: 'Camera' }],
      aiRequirements: {
        detectionRequired: { type: Boolean, default: true },
        trackingRequired: { type: Boolean, default: true },
        poseEstimationRequired: { type: Boolean, default: false },
        actionRecognitionRequired: { type: Boolean, default: false },
        ballTrackingRequired: { type: Boolean, default: false },
        jerseyDetectionRequired: { type: Boolean, default: false }
      },
      calibrationRequirements: {
        minReferencePoints: { type: Number, required: true, min: 4 },
        maxReprojectionError: { type: Number, required: true, min: 0.1 },
        requiredAccuracy: { type: Number, required: true, min: 0 }
      }
    }],
    constraints: [{
      constraintId: { type: String, required: true },
      constraintType: { type: String, enum: ['availability', 'capacity', 'temporal', 'spatial', 'resource', 'qualification', 'compliance', 'ai_cv'], required: true },
      severity: { type: String, enum: ['hard', 'soft', 'advisory'], required: true },
      expression: { type: Schema.Types.Mixed, required: true },
      affectedEntities: [{ type: String, required: true }],
      description: { type: String, required: true, trim: true, maxlength: 500 }
    }],
    status: { type: String, enum: Object.values(ScheduleStatus), default: ScheduleStatus.DRAFT },
    scheduledAt: { type: Date, required: true },
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
    courtId: { type: Schema.Types.ObjectId, required: true, ref: 'Court' },
    duration: { type: Number, required: true, min: 1 },
    actualStartAt: { type: Date },
    actualEndAt: { type: Date },
    actualDuration: { type: Number },
    result: {
      homeTeamScore: { type: Number, required: true, min: 0 },
      awayTeamScore: { type: Number, required: true, min: 0 },
      sets: [{
        setNumber: { type: Number, required: true, min: 1 },
        homeScore: { type: Number, required: true, min: 0 },
        awayScore: { type: Number, required: true, min: 0 },
        duration: { type: Number, required: true, min: 0 }
      }],
      totalDuration: { type: Number, required: true, min: 0 },
      winner: { type: String, enum: ['home', 'away'], required: true },
      mvpPlayerId: { type: Schema.Types.ObjectId, ref: 'Player' },
      statistics: { type: Schema.Types.Mixed, default: {} },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    collection: 'match_schedules',
    versionKey: 'version'
  }
);

MatchScheduleSchema.index({ tournamentId: 1, status: 1 });
MatchScheduleSchema.index({ scheduledAt: 1, status: 1 });
MatchScheduleSchema.index({ venueId: 1, scheduledAt: 1 });
MatchScheduleSchema.index({ courtId: 1, scheduledAt: 1 });
MatchScheduleSchema.index({ 'homeTeam.teamId': 1, scheduledAt: 1 });
MatchScheduleSchema.index({ 'awayTeam.teamId': 1, scheduledAt: 1 });
MatchScheduleSchema.index({ status: 1, scheduledAt: 1 });

MatchScheduleSchema.virtual('isActive').get(function() {
  return this.status === 'scheduled' || this.status === 'in_progress' || this.status === 'confirmed';
});

MatchScheduleSchema.virtual('isConflicted').get(function() {
  return this.constraints.some(c => c.severity === 'hard' && !this.isConstraintSatisfied(c));
});

MatchScheduleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  this.version = (this.version || 0) + 1;
  next();
});

export const MatchSchedule = models.MatchSchedule || model<IMatchSchedule>('MatchSchedule', MatchScheduleSchema);