/**
 * Organization Module - Chapter 11 Part 1
 * 
 * Core organization management for the Team & Organization Management Module.
 * This module handles federations, leagues, clubs, academies, schools, universities,
 * national teams, and regional organizations.
 */

export { OrganizationType } from './schemas/organization.model';
export type { Organization, OrganizationHistoricalRecord, OrganizationRegistrationDTO, OrganizationSearchParams, OrganizationHierarchyNode, OrganizationStatistics } from './schemas/organization.model';

// Re-export types for external use
export type { Organization as OrganizationModel } from './schemas/organization.model';