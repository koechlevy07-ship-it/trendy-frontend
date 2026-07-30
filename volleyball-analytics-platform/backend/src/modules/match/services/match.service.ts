import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { MatchRepository } from '../repositories/match.repository';
import { MatchValidator } from '../validators/match.validator';
import { Match, MatchDocument, MatchStatus, MatchType } from '../schemas/match.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { MatchOfficials, MatchOfficialsDocument, OfficialRole, AssignmentStatus } from '../schemas/match-officials.schema';
import { MatchStatistics, MatchStatisticsDocument, StatisticsStatus } from '../schemas/match-statistics.schema';
import { MatchEvent, MatchEventDocument, MatchEventType, EventSource } from '../schemas/match-event.schema';
import { MatchTimeline, MatchTimelineDocument } from '../schemas/match-event.schema';
import { MatchSetResult, MatchSetResultDocument, SetStatus } from '../schemas/match-event.schema';
import { MatchLineup, MatchLineupDocument } from '../schemas/match-event.schema';
import { MatchSubstitution, MatchSubstitutionDocument } from '../schemas/match-event.schema';
import { MatchTimeout, MatchTimeoutDocument } from '../schemas/match-event.schema';
import { MatchChallenge, MatchChallengeDocument } from '../schemas/match-event.schema';
import { MatchSanction, MatchSanctionDocument } from '../schemas/match-event.schema';
import { MatchIncident, MatchIncidentDocument } from '../schemas/match-event.schema';
import { CreateMatchDTO, UpdateMatchDTO, MatchStatusUpdateDTO, MatchEventDTO, SetResultDTO } from '../dto/match.dto';
import { FixtureService } from '../../competition/services/fixture.service';
import { OfficialAssignmentService } from '../../officials/services/official-assignment.service';
import { AIMetadataService } from './ai-metadata.service';
import { VideoReferenceService } from './video-reference.service';
import { StatisticsService } from './statistics.service';
import { TimelineService } from './timeline.service';
import { OfficialAssignmentService } from '../../officials/services/official-assignment.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly matchValidator: MatchValidator,
    @Inject(forwardRef(() => FixtureService))
    private readonly fixtureService: FixtureService,
    private readonly officialAssignmentService: OfficialAssignmentService,
    private readonly aiMetadataService: AIMetadataService,
    private readonly videoReferenceService: VideoReferenceService,
    private readonly statisticsService: StatisticsService,
    private readonly timelineService: TimelineService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================================================================
  // MATCH LIFECYCLE METHODS
  // ============================================================================

  async registerMatch(dto: CreateMatchDTO): Promise<MatchDocument> {
    await this.matchValidator.validateCreateMatch(dto);

    // Verify fixture exists and is valid
    const fixture = await this.fixtureService.findById(dto.fixtureId);
    if (fixture.status !== FixtureStatus.CONFIRMED && fixture.status !== FixtureStatus.SCHEDULED) {
      throw new BadRequestException(`Cannot create match from fixture with status ${fixture.status}`);
    }

    // Verify teams are different
    if (dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Check if match already exists for this fixture
    const existingMatch = await this.matchRepository.findByFixtureId(dto.fixtureId);
    if (existingMatch) {
      throw new ConflictException('Match already exists for this fixture');
    }

    // Validate mandatory officials are assigned
    const mandatoryRoles = [
      OfficialRole.FIRST_REFEREE,
      OfficialRole.SECOND_REFEREE,
      OfficialRole.SCORER,
      OfficialRole.LINE_JUDGE_1,
      OfficialRole.LINE_JUDGE_2,
    ];

    const assignedRoles = new Set([
      dto.firstReferee.role,
      dto.secondReferee?.role,
      dto.scorer?.role,
      dto.assistantScorer?.role,
      ...dto.lineJudges.map(lj => lj.role),
    ].filter(Boolean));

    for (const role of mandatoryRoles) {
      if (!assignedRoles.has(role)) {
        throw new BadRequestException(`Mandatory role ${role} is not assigned`);
      }
    }

    // Create match
    const match = new this.matchModel({
      ...dto,
      identity: {
        matchId: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchCode: dto.matchCode,
        type: dto.type || MatchType.REGULAR,
        round: dto.round || 1,
      },
      competition: {
        competitionId: new Types.ObjectId(dto.competitionId),
        seasonId: new Types.ObjectId(dto.seasonId),
        phaseId: dto.phaseId ? new Types.ObjectId(dto.phaseId) : undefined,
        groupId: dto.groupId ? new Types.ObjectId(dto.groupId) : undefined,
      },
      homeTeam: {
        teamId: new Types.ObjectId(dto.homeTeamId),
        teamName: '', // Will be populated from team service
        shortName: '',
        teamCode: '',
        side: 'home',
        stats: {
          setsWon: 0,
          setsLost: 0,
          pointsWon: 0,
          pointsLost: 0,
          setScores: [],
        },
        lineup: {
          starters: [],
          substitutes: [],
        },
      },
      awayTeam: {
        teamId: new Types.ObjectId(dto.awayTeamId),
        teamName: '',
        shortName: '',
        teamCode: '',
        side: 'away',
        stats: {
          setsWon: 0,
          setsLost: 0,
          pointsWon: 0,
          pointsLost: 0,
          setScores: [],
        },
        lineup: {
          starters: [],
          substitutes: [],
        },
      },
      venue: dto.venueId ? {
        facilityId: new Types.ObjectId(dto.venueId),
      } : undefined,
      officials: {
        firstReferee: dto.firstReferee ? {
          officialId: new Types.ObjectId(dto.firstReferee.officialId),
          name: dto.firstReferee.name,
        } : undefined,
        secondReferee: dto.secondReferee ? {
          officialId: new Types.ObjectId(dto.secondReferee.officialId),
          name: dto.secondReferee.name,
        } : undefined,
        lineJudges: dto.lineJudges?.map(lj => ({
          officialId: new Types.ObjectId(lj.officialId),
          name: lj.name,
        })) || [],
        scorer: dto.scorer ? {
          officialId: new Types.ObjectId(dto.scorer.officialId),
          name: dto.scorer.name,
        } : undefined,
        assistantScorer: dto.assistantScorer ? {
          officialId: new Types.ObjectId(dto.assistantScorer.officialId),
          name: dto.assistantScorer.name,
        } : undefined,
      },
      schedule: {
        scheduledStart: new Date(dto.scheduledStart),
        estimatedEndDate: dto.estimatedEndDate ? new Date(dto.estimatedEndDate) : undefined,
      },
      status: MatchStatus.DRAFT,
      statusInfo: {
        status: MatchStatus.DRAFT,
      },
      liveData: {
        currentSet: 1,
        homeSetScore: 0,
        awaySetScore: 0,
        homePointScore: 0,
        awayPointScore: 0,
        remainingTimeoutsHome: 2,
        remainingTimeoutsAway: 2,
      },
      aiMetadata: dto.aiMetadata ? {
        matchId: dto.aiMetadata.matchId,
        videoSync: dto.aiMetadata.videoSync,
        streams: dto.aiMetadata.streams,
        config: dto.aiMetadata.config,
        analytics: dto.aiMetadata.analytics,
      } : undefined,
      statistics: {
        matchStatsId: null,
        teamStatsHomeId: null,
        teamStatsAwayId: null,
        playerStatsIds: [],
        rallyIds: [],
      },
      videos: {
        highlightIds: [],
        challengeVideoIds: [],
        analysisVideoIds: [],
      },
      timeline: {
        entries: [],
      },
      audit: {
        createdBy: 'system',
        updatedBy: 'system',
        version: 0,
      },
      archive: {
        isArchived: false,
      },
      metadata: {},
    });

    const match = await match.save();

    // Create related documents
    await this.initializeMatchDocuments(match._id);

    // Publish domain event
    this.eventEmitter.emit('match.created', {
      matchId: match.identity.matchId,
      competitionId: match.competition.competitionId,
      fixtureId: match.fixtureId,
      homeTeamId: match.homeTeam.teamId,
      awayTeamId: match.awayTeam.teamId,
      scheduledStart: match.schedule.scheduledStart,
    });

    return match;
  }

  async startMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    // Pre-match validations
    await this.validatePreMatchReadiness(match);

    // Update status
    match.status = MatchStatus.IN_PROGRESS;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.IN_PROGRESS,
      previousStatus: MatchStatus.SCHEDULED,
      statusChangedAt: new Date(),
      statusChangedBy: 'system',
    };
    match.liveData.currentSet = 1;

    await match.save();

    // Initialize first set
    await this.initializeSet(match._id, 1);

    // Initialize AI processing
    await this.aiMetadataService.initializeMatchProcessing(match._id.toString());

    // Emit event
    this.eventEmitter.emit('match.started', {
      matchId: match.identity.matchId,
      homeTeamId: match.homeTeam.teamId,
      awayTeamId: match.awayTeam.teamId,
      startTime: new Date(),
    });

    return match;
  }

  async pauseMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    if (match.status !== MatchStatus.IN_PROGRESS && match.status !== MatchStatus.WARMUP) {
      throw new BadRequestException(`Cannot pause match in ${match.status} status`);
    }

    match.status = MatchStatus.SUSPENDED;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.SUSPENDED,
      previousStatus: MatchStatus.IN_PROGRESS,
      statusChangedAt: new Date(),
      statusChangeReason: 'Paused by user',
    };

    await match.save();

    this.eventEmitter.emit('match.paused', {
      matchId: match.identity.matchId,
      pausedAt: new Date(),
    });

    return match;
  }

  async resumeMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    if (match.status !== MatchStatus.SUSPENDED) {
      throw new BadRequestException(`Cannot resume match in ${match.status} status`);
    }

    match.status = MatchStatus.IN_PROGRESS;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.IN_PROGRESS,
      previousStatus: MatchStatus.SUSPENDED,
      statusChangedAt: new Date(),
      statusChangeReason: 'Resumed by user',
    };

    await match.save();

    this.eventEmitter.emit('match.resumed', {
      matchId: match.identity.matchId,
      resumedAt: new Date(),
    });

    return match;
  }

  async completeMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.ARCHIVED) {
      throw new ConflictException('Match is already completed or archived');
    }

    if (!match.isCompleted) {
      throw new BadRequestException('Match is not ready for completion - not all sets are finished');
    }

    // Finalize statistics
    await this.statisticsService.finalizeStatistics(match._id.toString());

    // Generate AI analytics
    await this.aiMetadataService.generatePostMatchAnalytics(match._id.toString());

    // Finalize timeline
    await this.timelineService.finalizeTimeline(match._id.toString());

    match.status = MatchStatus.COMPLETED;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.COMPLETED,
      previousStatus: MatchStatus.IN_PROGRESS,
      statusChangedAt: new Date(),
      statusChangedBy: 'system',
    };
    match.schedule.actualEnd = new Date();

    await match.save();

    // Emit event
    this.eventEmitter.emit('match.completed', {
      matchId: match.identity.matchId,
      competitionId: match.competition.competitionId,
      winner: match.winner,
      homeScore: match.homeTeam.stats.setsWon,
      awayScore: match.awayTeam.stats.setsLost,
      completedAt: new Date(),
    });

    return match;
  }

  async archiveMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    if (match.status === MatchStatus.ARCHIVED) {
      throw new ConflictException('Match is already archived');
    }

    if (match.status === MatchStatus.IN_PROGRESS || match.status === MatchStatus.WARMUP) {
      throw new BadRequestException('Cannot archive a live match');
    }

    match.archive = {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: 'system',
      archiveReason: 'Standard archival process',
      snapshot: match.toObject(),
    };

    match.status = MatchStatus.ARCHIVED;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.ARCHIVED,
      previousStatus: match.status,
      statusChangedAt: new Date(),
      statusChangedBy: 'system',
    };

    await match.save();

    this.eventEmitter.emit('match.archived', {
      matchId: match.identity.matchId,
      archivedAt: new Date(),
    });

    return match;
  }

  async restoreMatch(matchId: string): Promise<MatchDocument> {
    const match = await this.findById(matchId);

    if (match.status !== MatchStatus.ARCHIVED) {
      throw new ConflictException('Only archived matches can be restored');
    }

    match.archive = {
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      snapshot: null,
    };

    match.status = MatchStatus.COMPLETED;
    match.statusInfo = {
      ...match.statusInfo,
      status: MatchStatus.COMPLETED,
      previousStatus: MatchStatus.ARCHIVED,
      statusChangedAt: new Date(),
      statusChangedBy: 'system',
    };

    await match.save();

    this.eventEmitter.emit('match.restored', {
      matchId: match.identity.matchId,
      restoredAt: new Date(),
    });

    return match;
  }

  // ============================================================================
  // MATCH OPERATIONS
  // ============================================================================

  async validatePreMatchReadiness(match: MatchDocument): Promise<void> {
    const errors: string[] = [];

    // Check mandatory officials
    const mandatoryRoles = [
      'firstReferee',
      'secondReferee',
      'scorer',
      'lineJudge_1',
      'lineJudge_2',
    ];

    for (const role of mandatoryRoles) {
      const official = match.officials[role];
      if (!official || official.assignmentStatus !== AssignmentStatus.CONFIRMED) {
        errors.push(`Mandatory official role ${role} is not confirmed`);
      }
    }

    // Check venue
    if (!match.venue.facilityId) {
      errors.push('Venue is not assigned');
    }

    // Check teams
    if (!match.homeTeam.teamId || !match.awayTeam.teamId) {
      errors.push('Both teams must be assigned');
    }

    // Check lineups
    if (!match.homeTeam.lineup?.starters?.length || !match.awayTeam.lineup?.starters?.length) {
      errors.push('Both teams must have starting lineups submitted');
    }

    // Check AI readiness
    if (!match.aiMetadata || !match.aiMetadata.videoSync || match.aiMetadata.videoSync.status !== 'synced') {
      errors.push('AI metadata and video sync must be ready');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Match is not ready to start',
        errors,
      });
    }
  }

  async initializeSet(matchId: string, setNumber: number): Promise<MatchSetResultDocument> {
    const match = await this.findById(matchId);

    const setResult = new this.setResultModel({
      matchId: new Types.ObjectId(matchId),
      setNumber,
      homeScore: 0,
      awayScore: 0,
      durationMinutes: 0,
      startTime: new Date(),
      status: SetStatus.IN_PROGRESS,
      events: [],
    });

    const setResult = await setResult.save();

    // Update match live data
    await this.matchModel.findByIdAndUpdate(matchId, {
      'liveData.currentSet': setNumber,
      $push: { sets: setResult._id },
    });

    // Initialize timeline for this set
    await this.timelineService.initializeSetTimeline(match._id.toString(), setNumber);

    return setResult;
  }

  async completeSet(matchId: string, setNumber: number, homeScore: number, awayScore: number): Promise<MatchSetResultDocument> {
    const setResult = await this.setResultModel.findOneAndUpdate(
      { matchId: new Types.ObjectId(matchId), setNumber },
      {
        $set: {
          homeScore,
          awayScore,
          status: SetStatus.COMPLETED,
          endTime: new Date(),
          durationMinutes: 0, // Will be calculated
          winningTeamSide: homeScore > awayScore ? 'home' : 'away',
        },
      },
      { new: true },
    ).exec();

    if (!setResult) {
      throw new NotFoundException(`Set ${setNumber} not found for match`);
    }

    // Update match live data
    const match = await this.findById(matchId);
    const homeSetsWon = match.sets.filter(s => s.winningTeamSide === 'home').length;
    const awaySetsWon = match.sets.filter(s => s.winningTeamSide === 'away').length;

    await this.matchModel.findByIdAndUpdate(matchId, {
      'liveData.currentSet': setNumber + 1,
      'liveData.homeSetScore': homeSetsWon,
      'liveData.awaySetScore': awaySetsWon,
      'homeTeam.stats.setsWon': homeSetsWon,
      'homeTeam.stats.setsLost': awaySetsWon,
      'awayTeam.stats.setsWon': awaySetsWon,
      'awayTeam.stats.setsLost': homeSetsWon,
    });

    // Check if match is complete
    const isBestOf5 = match.sets.length >= 5;
    const maxSets = isBestOf5 ? 3 : 2;
    
    if (homeSetsWon >= maxSets || awaySetsWon >= maxSets) {
      // Match is complete
      await this.completeMatch(match._id.toString());
    } else {
      // Initialize next set
      await this.initializeSet(matchId, setNumber + 1);
    }

    // Emit event
    this.eventEmitter.emit('match.set.completed', {
      matchId: match.identity.matchId,
      setNumber,
      homeScore,
      awayScore,
    });

    return setResult;
  }

  // ============================================================================
  // MATCH EVENTS
  // ============================================================================

  async recordEvent(matchId: string, event: MatchEventDTO): Promise<MatchEventDocument> {
    const match = await this.findById(matchId);

    if (match.status !== MatchStatus.IN_PROGRESS && match.status !== MatchStatus.WARMUP) {
      throw new BadRequestException('Can only record events during live match');
    }

    const eventDoc = new this.eventModel({
      ...event,
      _id: new Types.ObjectId(),
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId: new Types.ObjectId(matchId),
      teamId: new Types.ObjectId(event.teamId),
      playerId: event.playerId ? new Types.ObjectId(event.playerId) : undefined,
      source: EventSource.MANUAL,
      audit: {
        recordedBy: 'user',
        recordedAt: new Date(),
      },
    });

    await eventDoc.save();

    // Update timeline
    await this.timelineService.addEntry(match._id.toString(), {
      eventType: event.type,
      timestamp: event.timestamp,
      setNumber: event.setNumber,
      description: this.generateEventDescription(event),
      teamId: event.teamId,
      playerId: event.playerId,
    });

    // Update live scores
    await this.updateLiveScores(match._id.toString(), event);

    // Emit real-time event
    this.eventEmitter.emit('match.event.recorded', {
      matchId: match.identity.matchId,
      event,
    });

    return eventDoc;
  }

  async bulkRecordEvents(matchId: string, events: MatchEventDTO[]): Promise<MatchEventDocument[]> {
    const match = await this.findById(matchId);
    const eventDocs = events.map(event => ({
      ...event,
      _id: new Types.ObjectId(),
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId: new Types.ObjectId(matchId),
      teamId: new Types.ObjectId(event.teamId),
      playerId: event.playerId ? new Types.ObjectId(event.playerId) : undefined,
      source: EventSource.MANUAL,
      audit: {
        recordedBy: 'user',
        recordedAt: new Date(),
      },
    }));

    const saved = await this.eventModel.insertMany(eventDocs);

    // Update timeline and scores
    for (const event of events) {
      await this.timelineService.addEntry(matchId, {
        eventType: event.type,
        timestamp: event.timestamp,
        setNumber: event.setNumber,
        description: this.generateEventDescription(event),
        teamId: event.teamId,
        playerId: event.playerId,
      });
    }

    return saved;
  }

  private generateEventDescription(event: MatchEventDTO): string {
    const actionMap: Record<string, string> = {
      [MatchEventType.POINT]: 'scored a point',
      [MatchEventType.SERVE]: 'served',
      [MatchEventType.ATTACK]: 'attacked',
      [MatchEventType.KILL]: 'scored a kill',
      [MatchEventType.ATTACK_ERROR]: 'made an attack error',
      [MatchEventType.ATTACK_BLOCKED]: 'had attack blocked',
      [MatchEventType.BLOCK]: 'made a block',
      [MatchEventType.BLOCK_POINT]: 'scored a block point',
      [MatchEventType.BLOCK_ERROR]: 'made a block error',
      [MatchEventType.DIG]: 'made a dig',
      [MatchEventType.EXCELLENT_DIG]: 'made an excellent dig',
      [MatchEventType.RECEPTION]: 'received',
      [MatchEventType.PERFECT_RECEPTION]: 'made a perfect reception',
      [MatchEventType.RECEPTION_ERROR]: 'made a reception error',
      [MatchEventType.SET]: 'set',
      [MatchEventType.PERFECT_SET]: 'made a perfect set',
      [MatchEventType.SET_ERROR]: 'made a set error',
      [MatchEventType.ACE]: 'scored an ace',
      [MatchEventType.SERVICE_ERROR]: 'made a service error',
      [MatchEventType.SUBSTITUTION]: 'substituted',
      [MatchEventType.TIMEOUT]: 'called timeout',
      [MatchEventType.CHALLENGE]: 'challenged',
    };

    return actionMap[event.type] || event.type;
  }

  private async updateLiveScores(matchId: string, event: MatchEventDTO): Promise<void> {
    const updates: any = {};

    // Update point scores
    if ([MatchEventType.POINT, MatchEventType.KILL, MatchEventType.ACE, MatchEventType.BLOCK_POINT].includes(event.type)) {
      if (event.teamId === (await this.findById(matchId)).homeTeam.teamId.toString()) {
        updates['liveData.homePointScore'] = { $inc: 1 };
      } else {
        updates['liveData.awayPointScore'] = { $inc: 1 };
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.matchModel.findByIdAndUpdate(matchId, { $set: updates });
    }
  }

  // ============================================================================
  // LINEUP MANAGEMENT
  // ============================================================================

  async submitLineup(matchId: string, teamId: string, setNumber: number, lineup: any): Promise<MatchLineupDocument> {
    const match = await this.findById(matchId);

    if (match.status !== MatchStatus.DRAFT && match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Lineups can only be submitted before match starts');
    }

    // Validate lineup
    const starters = lineup.players.filter(p => p.isStarting);
    if (starters.length !== 6) {
      throw new BadRequestException('Exactly 6 starting players required');
    }

    const liberoCount = lineup.players.filter(p => p.isLibero).length;
    if (liberoCount > 1) {
      throw new BadRequestException('Maximum 1 libero allowed');
    }

    const captainCount = lineup.players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      throw new BadRequestException('Exactly 1 captain required');
    }

    // Check jersey numbers are unique
    const jerseyNumbers = lineup.players.map(p => p.jerseyNumber);
    if (new Set(jerseyNumbers).size !== jerseyNumbers.length) {
      throw new BadRequestException('Jersey numbers must be unique');
    }

    const lineupDoc = new this.lineupModel({
      _id: new Types.ObjectId(),
      lineupId: `lu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matchId: new Types.ObjectId(matchId),
      teamId: new Types.ObjectId(teamId),
      setNumber,
      players: lineup.players.map(p => ({
        playerId: new Types.ObjectId(p.playerId),
        jerseyNumber: p.jerseyNumber,
        position: p.position,
        isCaptain: p.isCaptain,
        isLibero: p.isLibero,
        isStarting: p.isStarting,
      })),
      captainId: lineup.captainId ? new Types.ObjectId(lineup.captainId) : undefined,
      liberoId: lineup.liberoId ? new Types.ObjectId(lineup.liberoId) : undefined,
      coachId: lineup.coachId ? new Types.ObjectId(lineup.coachId) : undefined,
      audit: {
        submittedBy: 'coach',
        submittedAt: new Date(),
      },
    });

    return lineupDoc.save();
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  async findById(id: string): Promise<MatchDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid match ID format`);
    }
    const match = await this.matchModel.findById(id).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async findByMatchId(matchId: string): Promise<MatchDocument | null> {
    return this.matchModel.findOne({ 'identity.matchId': matchId }).exec();
  }

  async findByMatchCode(matchCode: string): Promise<MatchDocument | null> {
    return this.matchModel.findOne({ 'identity.matchCode': matchCode }).exec();
  }

  async findByFixtureId(fixtureId: string): Promise<MatchDocument | null> {
    return this.matchModel.findOne({ fixtureId: new Types.ObjectId(fixtureId) }).exec();
  }

  async search(searchDto: MatchSearchDTO): Promise<MatchPaginatedResult> {
    const query: any = {};

    if (searchDto.query) {
      query.$text = { $search: searchDto.query };
    }
    if (searchDto.status) query.status = searchDto.status;
    if (searchDto.type) query['identity.type'] = searchDto.type;
    if (searchDto.competitionId) query['competition.competitionId'] = new Types.ObjectId(searchDto.competitionId);
    if (searchDto.seasonId) query['competition.seasonId'] = new Types.ObjectId(searchDto.seasonId);
    if (searchDto.teamId) {
      query.$or = [
        { 'homeTeam.teamId': new Types.ObjectId(searchDto.teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(searchDto.teamId) },
      ];
    }
    if (searchDto.venueId) query['venue.facilityId'] = new Types.ObjectId(searchDto.venueId);

    if (searchDto.dateFrom || searchDto.dateTo) {
      query['schedule.scheduledStart'] = {};
      if (searchDto.dateFrom) query['schedule.scheduledStart'].$gte = searchDto.dateFrom;
      if (searchDto.dateTo) query['schedule.scheduledStart'].$lte = searchDto.dateTo;
    }

    const page = searchDto.page || 1;
    const perPage = searchDto.perPage || 20;
    const sortBy = searchDto.sortBy || 'schedule.scheduledStart';
    const sortOrder = searchDto.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.matchModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.matchModel.countDocuments(query).exec(),
    );

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async getLiveMatches(): Promise<MatchDocument[]> {
    return this.matchModel
      .find({
        status: { $in: [MatchStatus.IN_PROGRESS, MatchStatus.WARMUP, MatchStatus.SET_BREAK] },
      })
      .exec();
  }

  async getUpcomingMatches(limit = 10): Promise<MatchDocument[]> {
    return this.matchModel
      .find({
        status: { $in: [MatchStatus.SCHEDULED, MatchStatus.CONFIRMED] },
        'schedule.scheduledStart': { $gte: new Date() },
      })
      .sort({ 'schedule.scheduledStart': 1 })
      .limit(limit)
      .exec();
  }

  async getTeamMatches(teamId: string, status?: string): Promise<MatchDocument[]> {
    const query: any = {
      $or: [
        { 'homeTeam.teamId': new Types.ObjectId(teamId) },
        { 'awayTeam.teamId': new Types.ObjectId(teamId) },
      ],
    };
    if (status) query.status = status;
    return this.matchModel.find(query).sort({ 'schedule.scheduledStart': -1 }).exec();
  }

  async getMatchStatistics(matchId: string) {
    const match = await this.findById(matchId);
    const [stats, events, timeline] = await Promise.all([
      this.statisticsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
      this.eventModel.find({ matchId: new Types.ObjectId(matchId) }).sort({ timestamp: 1 }).exec(),
      this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
    ]);

    return { match, stats, events, timeline };
  }

  async getMatchHealth(matchId: string): Promise<any> {
    const match = await this.findById(matchId);
    
    const [stats, events, timeline] = await Promise.all([
      this.statisticsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
      this.eventModel.find({ matchId: new Types.ObjectId(matchId) }).exec(),
      this.timelineModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec(),
    ]);

    return {
      matchId: match.identity.matchId,
      status: match.status,
      isLive: match.isLive,
      setsPlayed: match.setsPlayed,
      currentSet: match.liveData.currentSet,
      score: {
        home: `${match.liveData.homeSetScore}-${match.liveData.homePointScore}`,
        away: `${match.liveData.awaySetScore}-${match.liveData.awayPointScore}`,
      },
      eventsCount: events.length,
      timelineEntries: timeline?.entries?.length || 0,
      aiProcessing: match.aiMetadata?.config?.realTimeProcessing ? 'active' : 'inactive',
      lastEvent: events.length > 0 ? events[events.length - 1] : null,
    };
  }

  // ============================================================================
  // AI INTEGRATION
  // ============================================================================

  async initializeAIMetadata(matchId: string, aiConfig: any): Promise<MatchDocument> {
    const match = await this.findById(matchId);
    
    match.aiMetadata = {
      ...match.aiMetadata,
      config: aiConfig,
    };

    return match.save();
  }

  async syncVideo(matchId: string, videoSyncData: any): Promise<MatchDocument> {
    const match = await this.findById(matchId);
    
    match.aiMetadata = {
      ...match.aiMetadata,
      videoSync: videoSyncData,
    };

    return match.save();
  }

  async getAIProcessingStatus(matchId: string): Promise<any> {
    const match = await this.findById(matchId);
    return {
      matchId: match.identity.matchId,
      videoSync: match.aiMetadata?.videoSync,
      processing: match.aiMetadata?.config?.realTimeProcessing ? 'active' : 'inactive',
      enabledModules: match.aiMetadata?.config?.enabledModules || [],
      lastProcessed: match.aiMetadata?.videoSync?.syncedAt,
    };
  }
}