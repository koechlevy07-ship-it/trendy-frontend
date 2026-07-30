/**
 * Unit Tests - Match & Competition Management Module
 * 
 * Tests for all services covering business logic
 * Target coverage: ≥ 90%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { MatchRepository } from '../repositories/match.repository';
import { MatchValidator } from '../validators/match.validator';
import { FixtureService } from '../../competition/services/fixture.service';
import { OfficialAssignmentService } from '../../officials/services/official-assignment.service';
import { AIMetadataService } from './ai-metadata.service';
import { VideoReferenceService } from './video-reference.service';
import { StatisticsService } from './statistics.service';
import { TimelineService } from './timeline.service';
import { CreateMatchDTO, UpdateMatchDTO, MatchEventDTO, SetResultDTO } from '../dto/match.dto';
import { Match, MatchDocument, MatchStatus, MatchType } from '../schemas/match.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { MatchOfficials, MatchOfficialsDocument, OfficialRole, AssignmentStatus } from '../schemas/match-officials.schema';
import { MatchStatistics, MatchStatisticsDocument, StatisticsStatus } from '../schemas/match-statistics.schema';
import { MatchEvent, MatchEventDocument, MatchEventType } from '../schemas/match-event.schema';
import { MatchTimeline, MatchTimelineDocument } from '../schemas/match-event.schema';
import { MatchSetResult, MatchSetResultDocument, SetStatus } from '../schemas/match-event.schema';
import { MatchLineup, MatchLineupDocument } from '../schemas/match-event.schema';
import { MatchSubstitution, MatchSubstitutionDocument } from '../schemas/match-event.schema';
import { MatchTimeout, MatchTimeoutDocument } from '../schemas/match-event.schema';
import { MatchChallenge, MatchChallengeDocument } from '../schemas/match-event.schema';
import { MatchSanction, MatchSanctionDocument } from '../schemas/match-event.schema';
import { MatchIncident, MatchIncidentDocument } from '../schemas/match-event.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../../competition/schemas/fixture.schema';

describe('MatchService', () => {
  let service: MatchService;
  let repository: jest.Mocked<MatchRepository>;
  let validator: jest.Mocked<MatchValidator>;
  let fixtureService: jest.Mocked<FixtureService>;
  let officialAssignmentService: jest.Mocked<OfficialAssignmentService>;
  let aiMetadataService: jest.Mocked<AIMetadataService>;
  let videoReferenceService: jest.Mocked<VideoReferenceService>;
  let statisticsService: jest.Mocked<StatisticsService>;
  let timelineService: jest.Mocked<TimelineService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockMatch: MatchDocument = {
    _id: new Types.ObjectId(),
    identity: {
      matchId: 'match_123',
      matchCode: 'MC-001',
      type: MatchType.REGULAR,
      round: 1,
    },
    competition: {
      competitionId: new Types.ObjectId(),
      seasonId: new Types.ObjectId(),
    },
    homeTeam: {
      teamId: new Types.ObjectId('team_1'),
      teamName: 'Home Team',
      shortName: 'HT',
      teamCode: 'HT',
      side: 'home',
      stats: { setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0, setScores: [] },
      lineup: { starters: [], substitutes: [] },
    },
    awayTeam: {
      teamId: new Types.ObjectId('team_2'),
      teamName: 'Away Team',
      shortName: 'AT',
      teamCode: 'AT',
      side: 'away',
      stats: { setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0, setScores: [] },
      lineup: { starters: [], substitutes: [] },
    },
    venue: { facilityId: new Types.ObjectId('venue_1') },
    officials: { firstReferee: {}, secondReferee: {}, lineJudges: [] },
    schedule: { scheduledStart: new Date(), estimatedEndDate: new Date() },
    status: MatchStatus.SCHEDULED,
    liveData: { currentSet: 1, homeSetScore: 0, awaySetScore: 0, homePointScore: 0, awayPointScore: 0 },
    aiMetadata: { streams: [], config: { enabledModules: [] } },
    statistics: { matchStatsId: null, teamStatsHomeId: null, teamStatsAwayId: null, playerStatsIds: [], rallyIds: [] },
    videos: { highlightIds: [], challengeVideoIds: [], analysisVideoIds: [] },
    timeline: { entries: [], currentPeriod: 'pre_match' },
    audit: { createdBy: 'system', updatedBy: 'system', version: 0 },
    archive: { isArchived: false },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockFixture: FixtureDocument = {
    _id: new Types.ObjectId(),
    fixtureId: 'fx_123',
    competitionId: new Types.ObjectId(),
    seasonId: new Types.ObjectId(),
    homeTeamId: new Types.ObjectId('team_1'),
    awayTeamId: new Types.ObjectId('team_2'),
    venue: { facilityId: new Types.ObjectId('venue_1') },
    scheduledDate: new Date(),
    status: FixtureStatus.CONFIRMED,
    generationMethod: 'manual',
  } as any;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByMatchId: jest.fn(),
      findByMatchCode: jest.fn(),
      findByFixtureId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      search: jest.fn(),
      getAllMatches: jest.fn(),
      findByCompetition: jest.fn(),
      findByTeam: jest.fn(),
      findByVenue: jest.fn(),
      findUpcoming: jest.fn(),
      findLive: jest.fn(),
      getStatistics: jest.fn(),
      getLineups: jest.fn(),
      getEvents: jest.fn(),
      getTimeline: jest.fn(),
      getSetResults: jest.fn(),
    };

    const mockValidator = {
      validateCreateMatch: jest.fn(),
      validateUpdateMatch: jest.fn(),
      validateMatchEvent: jest.fn(),
      validateLineup: jest.fn(),
      validateStatusTransition: jest.fn(),
    };

    const mockFixtureService = {
      findById: jest.fn(),
    };

    const mockOfficialAssignmentService = {
      checkAvailability: jest.fn(),
      assignOfficial: jest.fn(),
      validateAssignments: jest.fn(),
    };

    const mockAIMetadataService = {
      initializeMatchProcessing: jest.fn(),
      syncVideo: jest.fn(),
      addStream: jest.fn(),
      updateAIConfig: jest.fn(),
      getAIProcessingStatus: jest.fn(),
      generatePostMatchAnalytics: jest.fn(),
      processLiveEvent: jest.fn(),
    };

    const mockVideoReferenceService = {
      registerVideoReference: jest.fn(),
      findByMatchId: jest.fn(),
      updateSyncStatus: jest.fn(),
    };

    const mockStatisticsService = {
      finalizeStatistics: jest.fn(),
      calculateTeamStatistics: jest.fn(),
      calculatePlayerStatistics: jest.fn(),
      calculateSetStatistics: jest.fn,
    };

    const mockTimelineService = {
      initializeSetTimeline: jest.fn(),
      addEntry: jest.fn(),
      addBulkEntries: jest.fn(),
      finalizeTimeline: jest.fn(),
      getTimeline: jest.fn,
      getEntriesByPeriod: jest.fn,
      getEventsByType: jest.fn,
      getEventsByTeam: jest.fn,
      getEventsByPlayer: jest.fn,
      getEventsByTimeRange: jest.fn,
      syncWithEvents: jest.fn,
      rebuildTimeline: jest.fn,
    };

    const mockEventEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: MatchRepository, useValue: mockRepository },
        { provide: MatchValidator, useValue: mockValidator },
        { provide: FixtureService, useValue: mockFixtureService },
        { provide: OfficialAssignmentService, useValue: mockOfficialAssignmentService },
        { provide: AIMetadataService, useValue: mockAIMetadataService },
        { provide: VideoReferenceService, useValue: mockVideoReferenceService },
        { provide: StatisticsService, useValue: mockStatisticsService },
        { provide: TimelineService, useValue: mockTimelineService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    repository = module.get(MatchRepository);
    validator = module.get(MatchValidator);
    fixtureService = module.get(FixtureService);
    officialAssignmentService = module.get(OfficialAssignmentService);
    aiMetadataService = module.get(AIMetadataService);
    videoReferenceService = module.get(VideoReferenceService);
    statisticsService = module.get(StatisticsService);
    timelineService = module.get(TimelineService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerMatch', () => {
    const createDto: CreateMatchDTO = {
      fixtureId: 'fx_123',
      competitionId: 'comp_123',
      seasonId: 'season_123',
      homeTeamId: 'team_1',
      awayTeamId: 'team_2',
      venueId: 'venue_1',
      matchCode: 'MC-001',
      type: MatchType.REGULAR,
      round: 1,
      scheduledStart: new Date(),
      firstReferee: { officialId: 'off_1', name: 'Referee 1' },
      secondReferee: { officialId: 'off_2', name: 'Referee 2' },
      lineJudges: [{ officialId: 'off_3', name: 'Line Judge 1' }, { officialId: 'off_4', name: 'Line Judge 2' }],
      scorer: { officialId: 'off_5', name: 'Scorer 1' },
      courtConfiguration: { surface: 'indoor', dimensions: '18x9' },
    };

    it('should create match successfully', async () => {
      // Setup
      const fixture = { ...mockFixture, status: FixtureStatus.CONFIRMED };
      fixtureService.findById.mockResolvedValue(fixture);
      validator.validateCreateMatch.mockResolvedValue(undefined);
      repository.findByFixtureId.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockMatch);

      // Execute
      const result = await service.createMatch(createDto);

      // Verify
      expect(result).toBeDefined();
      expect(result.identity.matchId).toBeDefined();
      expect(fixtureService.findById).toHaveBeenCalledWith('fx_123');
      expect(validator.validateCreateMatch).toHaveBeenCalledWith(createDto);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if match already exists for fixture', async () => {
      const fixture = { ...mockFixture, status: FixtureStatus.CONFIRMED };
      fixtureService.findById.mockResolvedValue(fixture);
      repository.findByFixtureId.mockResolvedValue(mockMatch);

      await expect(service.createMatch(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if fixture not in valid state', async () => {
      const fixture = { ...mockFixture, status: FixtureStatus.DRAFT };
      fixtureService.findById.mockResolvedValue(fixture);

      await expect(service.createMatch(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if teams are the same', async () => {
      const dto = { ...createDto, awayTeamId: 'team_1' };
      await expect(service.createMatch(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid match type', async () => {
      const dto = { ...createDto, type: 'invalid_type' as MatchType };
      await expect(service.createMatch(dto)).rejects.toThrow(BadRequestException);
    });

    it('should validate officials assignments', async () => {
      const fixture = { ...mockFixture, status: FixtureStatus.CONFIRMED };
      fixtureService.findById.mockResolvedValue(fixture);
      
      const dto = { ...createDto, firstReferee: { officialId: 'off_1', name: 'Ref 1' }, secondReferee: { officialId: 'off_1', name: 'Ref 1' } };
      
      await expect(service.createMatch(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('startMatch', () => {
    it('should start match successfully after pre-match validations', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED };
      repository.findById.mockResolvedValue(match);
      repository.save.mockResolvedValue({ ...match, status: MatchStatus.IN_PROGRESS, liveData: { currentSet: 1 } });

      const result = await service.startMatch('match_123');

      expect(result.status).toBe(MatchStatus.IN_PROGRESS);
      expect(result.liveData.currentSet).toBe(1);
    });

    it('should throw BadRequestException if match not ready to start', async () => {
      const match = { ...mockMatch, status: MatchStatus.DRAFT };
      repository.findById.mockResolvedValue(match);

      await expect(service.startMatch('match_123')).rejects.toThrow(BadRequestException);
    });

    it('should validate pre-match readiness', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED, officials: { firstReferee: null } };
      repository.findById.mockResolvedValue(match);

      await expect(service.startMatch('match_123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeMatch', () => {
    it('should complete match successfully', async () => {
      const match = { 
        ...mockMatch, 
        status: MatchStatus.IN_PROGRESS,
        isCompleted: true,
        sets: [{ setNumber: 1, homeScore: 25, awayScore: 20, status: SetStatus.COMPLETED, winningTeamSide: 'home' }],
        homeTeam: { ...mockMatch.homeTeam, stats: { setsWon: 1, setsLost: 0 } },
        awayTeam: { ...mockMatch.awayTeam, stats: { setsWon: 0, setsLost: 1 } },
      };
      repository.findById.mockResolvedValue(match);
      repository.save.mockResolvedValue({ ...match, status: MatchStatus.COMPLETED });

      const result = await service.completeMatch('match_123');

      expect(result.status).toBe(MatchStatus.COMPLETED);
    });

    it('should throw BadRequestException if match not ready for completion', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED, isCompleted: false };
      repository.findById.mockResolvedValue(match);

      await expect(service.completeMatch('match_123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('recordEvent', () => {
    it('should record match event successfully', async () => {
      const match = { ...mockMatch, status: MatchStatus.IN_PROGRESS };
      repository.findById.mockResolvedValue(match);
      
      const eventDto: MatchEventDTO = {
        type: MatchEventType.POINT,
        teamId: 'team_1',
        setNumber: 1,
        timestamp: Date.now(),
        homeScore: 10,
        awayScore: 5,
      };

      const eventModel = {
        save: jest.fn().mockResolvedValue({ eventId: 'evt_1', ...eventDto, matchId: 'match_123' }),
      };

      const result = await service.recordEvent('match_123', eventDto);

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('should throw BadRequestException if match not live', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED };
      repository.findById.mockResolvedValue(match);

      await expect(service.recordEvent('match_123', { type: MatchEventType.POINT, teamId: 'team_1', setNumber: 1, timestamp: 0, homeScore: 0, awayScore: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should update live scores', async () => {
      const match = { 
        ...mockMatch, 
        status: MatchStatus.IN_PROGRESS,
        liveData: { homePointScore: 10, awayPointScore: 5 },
      };
      repository.findById.mockResolvedValue(match);
      repository.save.mockResolvedValue({ ...match, liveData: { homePointScore: 11, awayPointScore: 5 } });

      const eventDto: MatchEventDTO = {
        type: MatchEventType.POINT,
        teamId: 'team_1',
        setNumber: 1,
        timestamp: Date.now(),
        homeScore: 11,
        awayScore: 5,
      };

      await service.recordEvent('match_123', eventDto);

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('submitLineup', () => {
    it('should submit lineup successfully', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED };
      repository.findById.mockResolvedValue({ ...mockMatch, status: MatchStatus.SCHEDULED });
      
      const lineup = {
        teamId: 'team_1',
        setNumber: 1,
        players: [
          { playerId: 'p1', jerseyNumber: 1, position: 'Setter', isStarting: true, isCaptain: true, isLibero: false },
          { playerId: 'p2', jerseyNumber: 2, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p3', jerseyNumber: 3, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p4', jerseyNumber: 4, position: 'Opposite', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p5', jerseyNumber: 5, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p6', jerseyNumber: 6, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p7', jerseyNumber: 7, position: 'Libero', isStarting: false, isCaptain: false, isLibero: true },
        ];
      
      const lineupDoc = { save: jest.fn().mockResolvedValue({ lineupId: 'lu_1' }) };

      const result = await service.submitLineup('match_123', 'team_1', 1, { players: lineup });

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid lineup (not 6 starters)', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED };
      repository.findById.mockResolvedValue(match);

      const lineup = {
        teamId: 'team_1',
        setNumber: 1,
        players: [
          { playerId: 'p1', jerseyNumber: 1, position: 'Setter', isStarting: true, isCaptain: true, isLibero: false },
          { playerId: 'p2', jerseyNumber: 2, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
        ],
      };

      await expect(service.submitLineup('match_123', 'team_1', 1, { players: lineup })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for duplicate jersey numbers', async () => {
      const match = { ...mockMatch, status: MatchStatus.SCHEDULED };
      repository.findById.mockResolvedValue(match);

      const lineup = {
        teamId: 'team_1',
        setNumber: 1,
        players: [
          { playerId: 'p1', jerseyNumber: 1, position: 'Setter', isStarting: true, isCaptain: true, isLibero: false },
          { playerId: 'p2', jerseyNumber: 1, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p3', jerseyNumber: 3, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p4', jerseyNumber: 4, position: 'Opposite', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p5', jerseyNumber: 5, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p6', jerseyNumber: 6, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p7', jerseyNumber: 7, position: 'Libero', isStarting: false, isCaptain: false, isLibero: true },
        ],
      };

      await expect(service.submitLineup('match_123', 'team_1', 1, { players: lineup })).rejects.toThrow(BadRequestException);
    });
  });

  describe('search', () => {
    it('should search matches with filters', async () => {
      const searchDto = {
        competitionId: 'comp_123',
        status: MatchStatus.SCHEDULED,
        page: 1,
        perPage: 20,
      };

      repository.search.mockResolvedValue({
        data: [mockMatch],
        total: 1,
        page: 1,
        perPage: 20,
        totalPages: 1,
      });

      const result = await service.search({ ...searchDto, page: 1, perPage: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});