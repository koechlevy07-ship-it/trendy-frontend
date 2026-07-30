/**
 * Shared Module - Chapter 11 Part 1
 * 
 * Shared types, constants, and utilities for the Team & Organization Management Module.
 */

// Re-export organization types
export { 
  OrganizationType, 
  OrganizationStatus 
} from '../organization/schemas/organization.model';

export type { 
  Organization, 
  OrganizationHistoricalRecord, 
  OrganizationRegistrationDTO, 
  OrganizationSearchParams,
  OrganizationHierarchyNode,
  OrganizationStatistics 
} from '../organization/schemas/organization.model';

// Re-export team types
export { 
  TeamCategory, 
  TeamGender, 
  TeamStatus 
} from '../organization/schemas/organization.model';

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

// Common constants
export const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
  federation: 'National Federation',
  league: 'League',
  club: 'Club',
  academy: 'Academy',
  school: 'School',
  university: 'University',
  regional: 'Regional Association',
  national_team: 'National Team',
  national_federation: 'National Federation',
  regional_federation: 'Regional Federation',
  amateur_league: 'Amateur League',
  professional_league: 'Professional League',
};

export const TEAM_CATEGORY_LABELS: Record<string, string> = {
  senior_men: 'Senior Men',
  senior_women: 'Senior Women',
  u23: 'U23',
  u21: 'U21',
  u19: 'U19',
  u17: 'U17',
  youth: 'Youth',
  junior: 'Junior',
  para_volleyball: 'Para Volleyball',
  beach_volleyball: 'Beach Volleyball',
  sitting_volleyball: 'Sitting Volleyball',
  development: 'Development',
  academy: 'Academy',
  recreational: 'Recreational',
};

export const TEAM_GENDER_LABELS: Record<string, string> = {
  men: 'Men',
  women: 'Women',
  coed: 'Co-ed',
};

export const ORGANIZATION_STATUS_LABELS: Record<string, string> = {
  pending_verification: 'Pending Verification',
  active: 'Active',
  suspended: 'Suspended',
  archived: 'Archived',
  dissolved: 'Dissolved',
};

export const TEAM_STATUS_LABELS: Record<string, string> = {
  registering: 'Registering',
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  archived: 'Archived',
  disbanded: 'Disbanded',
};

// Validation constants
export const VALIDATION_CONSTANTS = {
  ORGANIZATION_NAME_MIN_LENGTH: 2,
  ORGANIZATION_NAME_MAX_LENGTH: 200,
  ORGANIZATION_SHORT_NAME_MAX_LENGTH: 20,
  ORGANIZATION_REGISTRATION_NUMBER_MAX_LENGTH: 50,
  TEAM_NAME_MIN_LENGTH: 2,
  TEAM_NAME_MAX_LENGTH: 100,
  TEAM_SHORT_NAME_MAX_LENGTH: 10,
  JERSEY_NUMBER_MIN: 1,
  JERSEY_NUMBER_MAX: 99,
  MAX_ROSTER_SIZE: 25,
  MIN_ROSTER_SIZE: 6,
} as const;

// Organization hierarchy constants
export const HIERARCHY_CONSTANTS = {
  FEDERATION_LEVEL: 0,
  LEAGUE_LEVEL: 1,
  REGIONAL_LEVEL: 2,
  CLUB_LEVEL: 3,
  ACADEMY_LEVEL: 3,
  SCHOOL_LEVEL: 3,
  UNIVERSITY_LEVEL: 3,
  NATIONAL_TEAM_LEVEL: 1,
  MAX_DEPTH: 5,
} as const;

// Default values
export const DEFAULTS = {
  MAX_ROSTER_SIZE: 14,
  MIN_ROSTER_SIZE: 6,
  DEFAULT_TEAM_STATUS: 'registering' as const,
  DEFAULT_ORG_STATUS: 'pending_verification' as const,
  DEFAULT_TEAM_CATEGORY: 'senior_men' as const,
  DEFAULT_TEAM_GENDER: 'men' as const,
} as const;