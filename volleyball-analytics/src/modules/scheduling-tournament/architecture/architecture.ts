export interface TournamentArchitecture {
  modules: TournamentModule[];
  services: TournamentService[];
  events: TournamentEvent[];
  integrations: IntegrationPoint[];
}

export interface TournamentModule {
  name: string;
  responsibilities: string[];
  dependencies: string[];
}

export interface TournamentService {
  name: string;
  module: string;
  operations: ServiceOperation[];
}

export interface ServiceOperation {
  name: string;
  input: string;
  output: string;
  constraints: string[];
}

export interface TournamentEvent {
  name: string;
  payload: Record<string, unknown>;
  triggers: string[];
}

export interface IntegrationPoint {
  name: string;
  type: 'sync' | 'async';
  protocol: string;
  dataContract: string;
}

export const TOURNAMENT_ARCHITECTURE: TournamentArchitecture = {
  modules: [
    {
      name: 'tournament-core',
      responsibilities: ['Tournament lifecycle management', 'Format validation', 'Stage sequencing'],
      dependencies: ['team-management', 'competition-management']
    },
    {
      name: 'schedule-engine',
      responsibilities: ['Fixture generation', 'Optimization', 'Conflict resolution'],
      dependencies: ['court-venue', 'officials', 'ai-camera']
    },
    {
      name: 'constraint-engine',
      responsibilities: ['Constraint validation', 'Conflict detection', 'Feasibility checking'],
      dependencies: ['team', 'venue', 'official', 'ai-camera']
    },
    {
      name: 'resource-allocation',
      responsibilities: ['Resource assignment', 'Capacity planning', 'Conflict prevention'],
      dependencies: ['court-venue', 'officials', 'ai-camera', 'equipment']
    },
    {
      name: 'bracket-manager',
      responsibilities: ['Bracket generation', 'Progression tracking', 'Winner advancement'],
      dependencies: ['tournament-core', 'schedule-engine']
    },
    {
      name: 'calendar-manager',
      responsibilities: ['Tournament calendar', 'Match scheduling', 'Timeline management'],
      dependencies: ['venue', 'court', 'team', 'official']
    }
  ],
  services: [
    {
      name: 'TournamentService',
      module: 'tournament-core',
      operations: [
        { name: 'createTournament', input: 'TournamentDTO', output: 'Tournament', constraints: ['format-validation', 'date-validation'] },
        { name: 'updateTournament', input: 'TournamentDTO', output: 'Tournament', constraints: ['status-transition', 'date-validation'] },
        { name: 'registerTeams', input: 'TeamRegistrationDTO', output: 'TeamRegistration', constraints: ['eligibility', 'quota'] },
        { name: 'generateSchedule', input: 'ScheduleRequest', output: 'Schedule', constraints: ['constraints-satisfied', 'resources-available'] }
      ]
    },
    {
      name: 'ScheduleService',
      module: 'schedule-engine',
      operations: [
        { name: 'generateFixtures', input: 'FixtureRequest', output: 'Fixture[]', constraints: ['format-compatible', 'resources-available'] },
        { name: 'optimizeSchedule', input: 'Schedule', output: 'OptimizedSchedule', constraints: ['constraints-satisfied', 'optimal'] },
        { name: 'validateSchedule', input: 'Schedule', output: 'ValidationResult', constraints: ['all-constraints-met'] },
        { name: 'rescheduleMatch', input: 'RescheduleRequest', output: 'RescheduledMatch', constraints: ['minimal-disruption', 'constraints-met'] }
      ]
    },
    {
      name: 'ConstraintService',
      module: 'constraint-engine',
      operations: [
        { name: 'validateConstraints', input: 'Schedule', output: 'ValidationResult', constraints: ['all-hard-constraints', 'soft-constraints-scored'] },
        { name: 'detectConflicts', input: 'Schedule', output: 'Conflict[]', constraints: ['all-conflict-types'] },
        { name: 'checkFeasibility', input: 'ScheduleRequest', output: 'FeasibilityResult', constraints: ['resource-availability', 'temporal-constraints'] }
      ]
    },
    {
      name: 'AllocationService',
      module: 'resource-allocation',
      operations: [
        { name: 'allocateCourts', input: 'AllocationRequest', output: 'CourtAllocation[]', constraints: ['availability', 'certification'] },
        { name: 'allocateOfficials', input: 'AllocationRequest', output: 'OfficialAllocation[]', constraints: ['certification', 'conflict-of-interest'] },
        { name: 'allocateCameras', input: 'AllocationRequest', output: 'CameraAllocation[]', constraints: ['calibration-valid', 'coverage'] }
      ]
    }
  ],
  events: [
    { name: 'TournamentCreated', payload: { tournamentId: 'string', format: 'string', dates: 'DateRange' }, triggers: ['schedule-generation', 'resource-allocation'] },
    { name: 'TeamsRegistered', payload: { tournamentId: 'string', teamIds: 'string[]' }, triggers: ['schedule-regeneration'] },
    { name: 'ScheduleGenerated', payload: { tournamentId: 'string', scheduleId: 'string' }, triggers: ['validation', 'notification'] },
    { name: 'ScheduleOptimized', payload: { tournamentId: 'string', scheduleId: 'string', improvements: 'string[]' }, triggers: ['re-validation'] },
    { name: 'ScheduleApproved', payload: { tournamentId: 'string', scheduleId: 'string' }, triggers: ['publication', 'resource-confirmation'] },
    { name: 'MatchRescheduled', payload: { matchId: 'string', oldTime: 'Date', newTime: 'Date' }, triggers: ['notification', 'resource-update'] },
    { name: 'BracketUpdated', payload: { tournamentId: 'string', bracketId: 'string' }, triggers: ['schedule-regeneration'] }
  ],
  integrations: [
    { name: 'team-management', type: 'sync', protocol: 'REST', dataContract: 'TeamRegistrationContract' },
    { name: 'court-venue', type: 'sync', protocol: 'REST', dataContract: 'VenueAvailabilityContract' },
    { name: 'officials-management', type: 'async', protocol: 'MessageQueue', dataContract: 'OfficialAvailabilityContract' },
    { name: 'ai-camera', type: 'async', protocol: 'MessageQueue', dataContract: 'CameraAllocationContract' },
    { name: 'live-match-control', type: 'sync', protocol: 'WebSocket', dataContract: 'MatchControlContract' },
    { name: 'statistics-analytics', type: 'async', protocol: 'EventStream', dataContract: 'ScheduleEventContract' },
    { name: 'notification-service', type: 'async', protocol: 'MessageQueue', dataContract: 'NotificationContract' }
  ]
};