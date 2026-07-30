import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum DomainEventType {
  // Competition events
  COMPETITION_CREATED = 'competition.created',
  COMPETITION_UPDATED = 'competition.updated',
  COMPETITION_VERIFIED = 'competition.verified',
  COMPETITION_APPROVED = 'competition.approved',
  COMPETITION_REJECTED = 'competition.rejected',
  COMPETITION_ACTIVATED = 'competition.activated',
  COMPETITION_SUSPENDED = 'competition.suspended',
  COMPETITION_ARCHIVED = 'competition.archived',
  COMPETITION_RESTORED = 'competition.restored',
  COMPETITION_TEAM_REGISTERED = 'competition.team_registered',
  COMPETITION_TEAM_UNREGISTERED = 'competition.team_unregistered',
  FIXTURES_GENERATED = 'fixtures.generated',

  // Fixture events
  FIXTURE_CREATED = 'fixture.created',
  FIXTURE_UPDATED = 'fixture.updated',
  FIXTURE_CANCELLED = 'fixture.cancelled',
  FIXTURE_OFFICIALS_ASSIGNED = 'fixture.officials.assigned',
  FIXTURE_VENUE_ASSIGNED = 'fixture.venue.assigned',

  // Match events
  MATCH_CREATED = 'match.created',
  MATCH_STARTED = 'match.started',
  MATCH_PAUSED = 'match.paused',
  MATCH_RESUMED = 'match.resumed',
  MATCH_COMPLETED = 'match.completed',
  MATCH_ARCHIVED = 'match.archived',
  MATCH_RESTORED = 'match.restored',
  MATCH_SET_COMPLETED = 'match.set.completed',
  MATCH_EVENT_RECORDED = 'match.event.recorded',
  MATCH_LINEUP_SUBMITTED = 'match.lineup.submitted',

  // Season events
  SEASON_CREATED = 'season.created',
  SEASON_UPDATED = 'season.updated',
  SEASON_ACTIVATED = 'season.activated',
  SEASON_CLOSED = 'season.closed',
  SEASON_ARCHIVED = 'season.archived',
  SEASON_RESTORED = 'season.restored',
  SEASON_COMPETITION_ADDED = 'season.competition.added',
  SEASON_COMPETITION_REMOVED = 'season.competition.removed',

  // Fixture events
  FIXTURE_OFFICIALS_ASSIGNED = 'fixture.officials.assigned',
  FIXTURE_VENUE_ASSIGNED = 'fixture.venue.assigned',

  // Officials events
  OFFICIAL_CREATED = 'official.created',
  OFFICIAL_UPDATED = 'official.updated',
  OFFICIAL_ASSIGNED = 'official.assigned',
  OFFICIAL_REPLACED = 'official.replaced',
  OFFICIAL_ASSIGNMENT_CONFIRMED = 'official.assignment.confirmed',

  // Standings events
  STANDINGS_CREATED = 'standings.created',
  STANDINGS_UPDATED = 'standings.updated',
  STANDINGS_FINALIZED = 'standings.finalized',
  STANDINGS_RECALCULATED = 'standings.recalculated',

  // AI events
  AI_METADATA_INITIALIZED = 'ai.metadata.initialized',
  AI_VIDEO_SYNCED = 'ai.video.synced',
  AI_POST_MATCH_ANALYTICS_GENERATED = 'ai.post_match.analytics.generated',
}

@Injectable()
export class DomainEventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(eventType: DomainEventType, payload: any): void {
    this.eventEmitter.emit(eventType, {
      eventType,
      payload,
      timestamp: new Date(),
      eventId: `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  emitAsync(eventType: DomainEventType, payload: any): Promise<void> {
    return this.eventEmitter.emitAsync(eventType, {
      eventType,
      payload,
      timestamp: new Date(),
      eventId: `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // Convenience methods for common events
  emitCompetitionCreated(competition: any): void {
    this.emit(DomainEventType.COMPETITION_CREATED, { competition });
  }

  emitCompetitionActivated(competition: any): void {
    this.emit(DomainEventType.COMPETITION_ACTIVATED, { competition });
  }

  emitCompetitionArchived(competition: any): void {
    this.emit(DomainEventType.COMPETITION_ARCHIVED, { competition });
  }

  emitMatchStarted(match: any): void {
    this.emit(DomainEventType.MATCH_STARTED, { match });
  }

  emitMatchCompleted(match: any): void {
    this.emit(DomainEventType.MATCH_COMPLETED, { match });
  }

  emitMatchEventRecorded(match: any, event: any): void {
    this.emit(DomainEventType.MATCH_EVENT_RECORDED, { match, event });
  }

  emitFixtureCreated(fixture: any): void {
    this.emit(DomainEventType.FIXTURE_CREATED, { fixture });
  }

  emitOfficialsAssigned(fixture: any, officialIds: string[]): void {
    this.emit(DomainEventType.FIXTURE_OFFICIALS_ASSIGNED, { fixture, officialIds });
  }

  emitVenueAssigned(fixture: any, venueId: string): void {
    this.emit(DomainEventType.FIXTURE_VENUE_ASSIGNED, { fixture, venueId });
  }

  emitSeasonCreated(season: any): void {
    this.emit(DomainEventType.SEASON_CREATED, { season });
  }

  emitSeasonActivated(season: any): void {
    this.emit(DomainEventType.SEASON_ACTIVATED, { season });
  }

  emitStandingsFinalized(standings: any): void {
    this.emit(DomainEventType.STANDINGS_FINALIZED, { standings });
  }

  emitOfficialAssigned(match: any, officialId: string, role: string): void {
    this.emit(DomainEventType.OFFICIAL_ASSIGNED, { match, officialId, role });
  }

  emitStandingsFinalized(standings: any): void {
    this.emit(DomainEventType.STANDINGS_FINALIZED, { standings });
  }

  emitAIModuleInitialized(match: any, config: any): void {
    this.emit(DomainEventType.AI_MODULE_INITIALIZED, { match, config });
  }

  emitVideoSynced(match: any, syncData: any): void {
    this.emit(DomainEventType.AI_VIDEO_SYNCED, { match, syncData });
  }

  emitPostMatchAnalyticsGenerated(match: any, analytics: any): void {
    this.emit(DomainEventType.AI_POST_MATCH_ANALYTICS_GENERATED, { match, analytics });
  }
}