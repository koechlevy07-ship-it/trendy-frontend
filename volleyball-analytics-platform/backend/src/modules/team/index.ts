/**
 * Team Module - Chapter 11 Part 1
 * 
 * Team management within organizations for the Team & Organization Management Module.
 * Handles team creation, roster management, coaching staff, and team lifecycle.
 */

export { TeamCategory, TeamGender, TeamStatus } from '../organization/schemas/organization.model';
export type { 
  Team, 
  TeamHistoricalRecord, 
  TeamSeasonRecord, 
  TeamRosterEntry, 
  TeamCoachingStaffEntry,
  TeamRegistrationDTO, 
  TeamSearchParams, 
  TeamWithOrganization 
} from '../organization/schemas/organization.model';

// Re-export types for external use
export type { Team as TeamModel } from '../organization/schemas/organization.model';