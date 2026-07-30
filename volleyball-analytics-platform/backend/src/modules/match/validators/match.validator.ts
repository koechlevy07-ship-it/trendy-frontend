import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument, MatchStatus, MatchType, MatchEventType, SetStatus, EventSource } from '../schemas/match.schema';
import { Fixture, FixtureDocument } from '../schemas/fixture.schema';
import { MatchEvent, MatchEventDocument } from '../schemas/match-event.schema';
import { MatchLineup, MatchLineupDocument } from '../schemas/match-event.schema';
import { MatchSubstitution, MatchSubstitutionDocument, SubstitutionType } from '../schemas/match-event.schema';
import { MatchTimeout, MatchTimeoutDocument, TimeoutType } from '../schemas/match-event.schema';
import { MatchChallenge, MatchChallengeDocument, ChallengeType, ChallengeResult } from '../schemas/match-event.schema';
import { MatchSanction, MatchSanctionDocument, SanctionType, SanctionReason } from '../schemas/match-event.schema';
import { MatchIncident, MatchIncidentDocument, IncidentType, IncidentSeverity } from '../schemas/match-event.schema';
import { MatchTimeout, MatchTimeoutDocument } from '../schemas/match-event.schema';
import { MatchChallenge, MatchChallengeDocument } from '../schemas/match-event.schema';
import { MatchSanction, MatchSanctionDocument } from '../schemas/match-event.schema';

@Injectable()
export class MatchValidator {
  constructor(
    @InjectModel('Match') private readonly matchModel: Model<MatchDocument>,
    @InjectModel('Fixture') private readonly fixtureModel: Model<FixtureDocument>,
    @InjectModel('MatchEvent') private readonly eventModel: Model<MatchEventDocument>,
    @InjectModel('MatchLineup') private readonly lineupModel: Model<MatchLineupDocument>,
    @InjectModel('MatchSubstitution') private readonly substitutionModel: Model<MatchSubstitutionDocument>,
    @InjectModel('MatchTimeout') private readonly timeoutModel: Model<MatchTimeoutDocument>,
    @InjectModel('MatchChallenge') private readonly challengeModel: Model<MatchChallengeDocument>,
    @InjectModel('MatchSanction') private readonly sanctionModel: Model<MatchSanctionDocument>,
    @InjectModel('MatchIncident') private readonly incidentModel: Model<MatchIncidentDocument>,
  ) {}

  async validateCreateMatch(dto: any): Promise<void> {
    // Validate fixture exists and is in valid state
    const fixture = await this.fixtureModel.findById(dto.fixtureId).exec();
    if (!fixture) {
      throw new NotFoundException(`Fixture with ID ${dto.fixtureId} not found`);
    }

    if (fixture.status !== 'scheduled' && fixture.status !== 'confirmed') {
      throw new BadRequestException(`Cannot create match from fixture with status ${fixture.status}`);
    }

    // Check if match already exists for this fixture
    const existingMatch = await this.matchModel.findOne({ fixtureId: new Types.ObjectId(dto.fixtureId) }).exec();
    if (existingMatch) {
      throw new ConflictException('Match already exists for this fixture');
    }

    // Validate teams are different
    if (dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Validate match type
    if (!Object.values(MatchType).includes(dto.type)) {
      throw new BadRequestException(`Invalid match type: ${dto.type}`);
    }

    // Validate round number
    if (dto.round < 1) {
      throw new BadRequestException('Round number must be at least 1');
    }

    // Validate officials assignments
    this.validateOfficialsAssignments(dto);
  }

  async validateUpdateMatch(matchId: string, dto: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Cannot update completed/archived matches
    if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.ARCHIVED) {
      throw new BadRequestException(`Cannot update match in ${match.status} status`);
    }

    // Validate status transition if status is being updated
    if (dto.status && dto.status !== match.status) {
      this.validateStatusTransition(match.status, dto.status);
    }
  }

  async validateMatchEvent(matchId: string, dto: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS && match.status !== MatchStatus.WARMUP) {
      throw new BadRequestException('Events can only be recorded during live match');
    }

    // Validate event type
    if (!Object.values(MatchEventType).includes(dto.type)) {
      throw new BadRequestException(`Invalid event type: ${dto.type}`);
    }

    // Validate set number
    if (dto.setNumber < 1 || dto.setNumber > 5) {
      throw new BadRequestException('Set number must be between 1 and 5');
    }

    // Validate scores
    if (dto.homeScore < 0 || dto.awayScore < 0) {
      throw new BadRequestException('Scores cannot be negative');
    }

    // Validate timestamp
    if (dto.timestamp < 0) {
      throw new BadRequestException('Timestamp cannot be negative');
    }
  }

  async validateLineup(matchId: string, teamId: string, setNumber: number, lineup: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Lineups can only be submitted before match starts
    if (match.status !== MatchStatus.DRAFT && match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Lineups can only be submitted before match starts');
    }

    // Validate lineup structure
    if (!lineup.players || !Array.isArray(lineup.players)) {
      throw new BadRequestException('Lineup must contain players array');
    }

    // Validate exactly 6 starters
    const starters = lineup.players.filter(p => p.isStarting);
    if (starters.length !== 6) {
      throw new BadRequestException('Exactly 6 starting players required');
    }

    // Max 1 libero
    const liberoCount = lineup.players.filter(p => p.isLibero).length;
    if (liberoCount > 1) {
      throw new BadRequestException('Maximum 1 libero allowed per team');
    }

    // Exactly 1 captain
    const captainCount = lineup.players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      throw new BadRequestException('Exactly 1 captain required');
    }

    // Check unique jersey numbers
    const jerseyNumbers = lineup.players.map(p => p.jerseyNumber);
    if (new Set(jerseyNumbers).size !== jerseyNumbers.length) {
      throw new BadRequestException('Jersey numbers must be unique');
    }

    // Validate jersey number range
    for (const num of jerseyNumbers) {
      if (num < 1 || num > 99) {
        throw new BadRequestException('Jersey numbers must be between 1 and 99');
      }
    }

    // Validate captain is in starters
    if (lineup.captainId) {
      const captain = lineup.players.find(p => p.playerId === lineup.captainId);
      if (!captain || !captain.isStarting) {
        throw new BadRequestException('Captain must be a starting player');
      }
    }

    // Validate libero is in lineup
    if (lineup.liberoId) {
      const libero = lineup.players.find(p => p.playerId === lineup.liberoId);
      if (!libero) {
        throw new BadRequestException('Libero must be in the lineup');
      }
    }
  }

  async validateSubstitution(matchId: string, substitution: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Substitutions only allowed during live match');
    }

    // Check team has remaining substitutions (max 6 per set)
    // This would check against existing substitutions for this team/set
  }

  async validateTimeout(matchId: string, timeout: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Timeouts only allowed during live match');
    }

    // Check remaining timeouts for team (max 2 per set)
  }

  async validateChallenge(matchId: string, challenge: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Challenges only allowed during live match');
    }

    // Check team has challenges remaining (max 2 per set)
    const teamChallenges = await this.challengeModel.countDocuments({
      matchId: new Types.ObjectId(matchId),
      teamId: new Types.ObjectId(challenge.teamId),
      setNumber: challenge.setNumber,
      result: { $in: [ChallengeResult.PENDING, ChallengeResult.UPHELD] },
    }).exec();

    if (teamChallenges >= 2) {
      throw new BadRequestException('Team has reached maximum of 2 challenges per set');
    }
  }

  async validateSanction(matchId: string, sanction: any): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Sanctions only allowed during live match');
    }

    if (!Object.values(SanctionType).includes(sanction.type)) {
      throw new BadRequestException(`Invalid sanction type: ${sanction.type}`);
    }

    if (!Object.values(SanctionReason).includes(sanction.reason)) {
      throw new BadRequestException(`Invalid sanction reason: ${sanction.reason}`);
    }
  }

  private validateOfficialsAssignments(dto: any): void {
    const mandatoryRoles = [
      'firstReferee',
      'secondReferee',
      'scorer',
      'lineJudge_1',
      'lineJudge_2',
    ];

    for (const role of mandatoryRoles) {
      if (!dto[role]) {
        throw new BadRequestException(`Mandatory official role ${role} is required`);
      }
    }

    // Check for duplicate officials
    const assignedOfficials = [
      dto.firstReferee.officialId,
      dto.secondReferee?.officialId,
      dto.scorer?.officialId,
      dto.assistantScorer?.officialId,
      ...dto.lineJudges.map(lj => lj.officialId),
    ].filter(Boolean);

    const uniqueOfficials = new Set(assignedOfficials);
    if (uniqueOfficials.size !== assignedOfficials.length) {
      throw new BadRequestException('An official cannot be assigned to multiple roles');
    }
  }

  validateStatusTransition(from: MatchStatus, to: MatchStatus): void {
    const validTransitions: Record<MatchStatus, MatchStatus[]> = {
      [MatchStatus.DRAFT]: [MatchStatus.SCHEDULED, MatchStatus.CANCELLED],
      [MatchStatus.SCHEDULED]: [MatchStatus.CONFIRMED, MatchStatus.CANCELLED],
      [MatchStatus.CONFIRMED]: [MatchStatus.WARMUP, MatchStatus.CANCELLED, MatchStatus.POSTPONED],
      [MatchStatus.WARMUP]: [MatchStatus.IN_PROGRESS, MatchStatus.SUSPENDED, MatchStatus.CANCELLED],
      [MatchStatus.IN_PROGRESS]: [MatchStatus.SET_BREAK, MatchStatus.SUSPENDED, MatchStatus.COMPLETED],
      [MatchStatus.SET_BREAK]: [MatchStatus.IN_PROGRESS, MatchStatus.SUSPENDED, MatchStatus.CANCELLED],
      [MatchStatus.SUSPENDED]: [MatchStatus.IN_PROGRESS, MatchStatus.CANCELLED],
      [MatchStatus.COMPLETED]: [MatchStatus.ARCHIVED],
      [MatchStatus.ARCHIVED]: [],
      [MatchStatus.CANCELLED]: [],
      [MatchStatus.POSTPONED]: [MatchStatus.SCHEDULED, MatchStatus.CANCELLED],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }

  async validateLineup(matchId: string, teamId: string, setNumber: number, players: any[]): Promise<void> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.status !== MatchStatus.DRAFT && match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Lineups can only be submitted before match starts');
    }

    // Validate exactly 6 starters
    const starters = players.filter(p => p.isStarting);
    if (starters.length !== 6) {
      throw new BadRequestException('Exactly 6 starting players required');
    }

    // Max 1 libero
    const liberoCount = players.filter(p => p.isLibero).length;
    if (liberoCount > 1) {
      throw new BadRequestException('Maximum 1 libero allowed per team');
    }

    // Exactly 1 captain
    const captainCount = players.filter(p => p.isCaptain).length;
    if (captainCount !== 1) {
      throw new BadRequestException('Exactly 1 captain required');
    }

    // Unique jersey numbers
    const jerseyNumbers = players.map(p => p.jerseyNumber);
    if (new Set(jerseyNumbers).size !== jerseyNumbers.length) {
      throw new BadRequestException('Jersey numbers must be unique');
    }

    // Validate jersey number range
    for (const num of jerseyNumbers) {
      if (num < 1 || num > 99) {
        throw new BadRequestException('Jersey numbers must be between 1 and 99');
      }
    }

    // Validate captain is in starters
    if (lineup.captainId) {
      const captain = players.find(p => p.playerId === lineup.captainId);
      if (!captain || !captain.isStarting) {
        throw new BadRequestException('Captain must be a starting player');
      }
    }

    // Validate libero is in lineup
    if (lineup.liberoId) {
      const libero = players.find(p => p.playerId === lineup.liberoId);
      if (!libero) {
        throw new BadRequestException('Libero must be in the lineup');
      }
    }
  }
}