/**
 * Team Schemas - Chapter 11 Part 1
 * 
 * Additional Team-specific schemas and validation.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// ============================================================================
// TEAM SEASON RECORD (Immutable after season ends)
// ============================================================================

export class TeamSeasonStats {
  @ApiProperty({ required: false })
  seasonId: Types.ObjectId;

  @ApiProperty({ required: false })
  seasonName: string;

  @ApiProperty({ required: false })
  leagueId: Types.ObjectId;

  @ApiProperty({ required: false })
  leagueName: string;

  @ApiProperty({ required: false })
  division?: string;

  @ApiProperty({ required: false })
  finalStanding?: number;

  @ApiProperty()
  matchesPlayed: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  losses: number;

  @ApiProperty({ required: false })
  draws?: number;

  @ApiProperty({ required: false })
  pointsFor?: number;

  @ApiProperty({ required: false })
  pointsAgainst?: number;

  @ApiProperty({ required: false })
  setsWon?: number;

  @ApiProperty({ required: false })
  setsLost?: number;

  @ApiProperty({ required: false })
  pointsFor?: number;

  @ApiProperty({ required: false })
  pointsAgainst?: number;

  @ApiProperty({ required: false })
  rosterSnapshot?: Types.ObjectId[];

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty({ required: false })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  archivedBy?: Types.ObjectId;
}

// ============================================================================
// TEAM ROSTER (with immutability for historical records)
// ============================================================================

export class TeamRosterEntry {
  @ApiProperty()
  playerId: Types.ObjectId;

  @ApiProperty()
  playerName: string;

  @ApiProperty()
  jerseyNumber: number;

  @ApiProperty()
  position: string;

  @ApiProperty()
  joinDate: Date;

  @ApiProperty({ required: false })
  leaveDate?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  isCaptain?: boolean;

  @ApiProperty({ required: false })
  isLibero?: boolean;

  @ApiProperty({ required: false })
  isViceCaptain?: boolean;

  @ApiProperty({ type: [Types.ObjectId] })
  seasonIds: Types.ObjectId[];

  @ApiProperty()
  addedBy: Types.ObjectId;

  @ApiProperty({ required: false })
  removedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  removalReason?: string;

  @ApiProperty({ required: false })
  isHistorical?: boolean;  // True if this is a historical record
}

export class TeamCoachingStaffEntry {
  @ApiProperty()
  staffId: Types.ObjectId;

  @ApiProperty()
  staffName: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ required: false })
  endDate?: Date;

  @ApiProperty({ required: false })
  isHeadCoach?: boolean;

  @ApiProperty({ required: false, type: [String] })
  responsibilities?: string[];

  @ApiProperty({ required: false, type: [String] })
  certifications?: string[];

  @ApiProperty({ required: false })
  isActive?: boolean;
}

export class TeamSeasonRecord {
  @ApiProperty()
  seasonId: Types.ObjectId;

  @ApiProperty()
  seasonName: string;

  @ApiProperty()
  leagueId: Types.ObjectId;

  @ApiProperty()
  leagueName: string;

  @ApiProperty({ required: false })
  division?: string;

  @ApiProperty({ required: false })
  finalStanding?: number;

  @ApiProperty()
  matchesPlayed: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  losses: number;

  @ApiProperty({ required: false })
  draws?: number;

  @ApiProperty({ required: false })
  pointsFor?: number;

  @ApiProperty({ required: false })
  pointsAgainst?: number;

  @ApiProperty({ required: false })
  setsWon?: number;

  @ApiProperty({ required: false })
  setsLost?: number;

  @ApiProperty({ required: false })
  pointsFor?: number;

  @ApiProperty({ required: false })
  pointsAgainst?: number;

  @ApiProperty({ required: false })
  rosterSnapshot?: Types.ObjectId[];

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty({ required: false })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  archivedBy?: Types.ObjectId;
}

// ============================================================================
// TEAM BRANDING
// ============================================================================

export class TeamBranding {
  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  accentColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  mascot?: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  motto?: string;

  @ApiProperty({ required: false })
  kitDesign?: {
    home: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    away: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    alternate?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    goalkeeper?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
  };
}

// ============================================================================
// TEAM AI METADATA
// ============================================================================

export class TeamAIMetadata {
  @ApiProperty({ type: [Number], required: false })
  teamEmbedding?: number[];

  @ApiProperty({ required: false })
  jerseyRecognition?: {
    home?: { 
      primaryColor: string; 
      secondaryColor: string; 
      pattern?: string; 
      numberFont?: string; 
      numberColor?: string;
    };
    away?: { 
      primaryColor: string; 
      secondaryColor: string; 
      pattern?: string; 
      numberFont?: string; 
      numberColor?: string;
    };
    alternate?: { 
      primaryColor: string; 
      secondaryColor: string; 
      pattern?: string; 
      numberFont?: string; 
      numberColor?: string;
    };
    goalkeeper?: { 
      primaryColor: string; 
      secondaryColor: string; 
      pattern?: string; 
      numberFont?: string; 
      numberColor?: string;
    };
  };

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  teamPhotoUrl?: string;

  @ApiProperty({ required: false })
  courtSidePreference?: 'left' | 'right' | 'no_preference';

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  recognitionConfidenceThreshold?: number;
}

// ============================================================================
// TEAM BRANDING (override organization branding)
// ============================================================================

export class TeamBranding {
  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  accentColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  mascot?: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  motto?: string;
}

// ============================================================================
// TEAM AI METADATA
// ============================================================================

export class TeamAIMetadata {
  @ApiProperty({ type: [Number], required: false })
  teamEmbedding?: number[];

  @ApiProperty({ required: false })
  jerseyRecognition?: {
    home?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    away?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    alternate?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
    goalkeeper?: { primaryColor: string; secondaryColor: string; pattern?: string; numberFont?: string; numberColor?: string };
  };

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  teamPhotoUrl?: string;

  @ApiProperty({ required: false })
  courtSidePreference?: 'left' | 'right' | 'no_preference';

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  recognitionConfidenceThreshold?: number;
}

// ============================================================================
// TEAM ROSTER SNAPSHOT (immutable snapshot for season)
// ============================================================================

export class TeamRosterSnapshot {
  @ApiProperty()
  seasonId: Types.ObjectId;

  @ApiProperty()
  seasonName: string;

  @ApiProperty({ type: [Object] })
  players: TeamRosterEntry[];

  @ApiProperty({ type: [Object] })
  coachingStaff: TeamCoachingStaffEntry[];

  @ApiProperty()
  snapshotDate: Date;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TEAM_SCHEMA_NAME = 'Team';
export const TEAM_COLLECTION = 'teams';