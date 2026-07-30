import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Standings, StandingsDocument, StandingType, StandingEntry } from '../schemas/standings.schema';
import { CompetitionService } from '../../competition/services/competition.service';
import { MatchService } from '../../match/services/match.service';

@Injectable()
export class StandingsService {
  constructor(
    @InjectModel('Standings') private readonly standingsModel: Model<any>,
    @Inject(forwardRef(() => CompetitionService))
    private readonly competitionService: CompetitionService,
    @Inject(forwardRef(() => MatchService))
    private readonly matchService: MatchService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateStandingsDTO): Promise<StandingsDocument> {
    await this.standingsValidator.validateCreate(dto);

    const standings = new this.standingsModel({
      ...dto,
      _id: new Types.ObjectId(),
      standingsId: `std_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tiebreakRules: dto.tiebreakRules || [],
      isFinal: false,
      audit: { version: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await standings.save();

    this.eventEmitter.emit('standings.created', {
      standingsId: saved.standingsId,
      competitionId: dto.competitionId,
      type: dto.type,
    });

    return saved;
  }

  async findById(id: string): Promise<StandingsDocument> {
    const standings = await this.standingsModel.findById(id).exec();
    if (!standings) {
      throw new NotFoundException(`Standings with ID ${id} not found`);
    }
    return standings;
  }

  async findByStandingsId(standingsId: string): Promise<StandingsDocument> {
    return this.standingsModel.findOne({ standingsId }).exec();
  }

  async findByCompetition(competitionId: string, type?: StandingType): Promise<StandingsDocument[]> {
    const query: any = { competitionId: new Types.ObjectId(competitionId) };
    if (type) query.type = type;
    return this.standingsModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findByPhase(phaseId: string): Promise<StandingsDocument[]> {
    return this.standingsModel.find({ phaseId: new Types.ObjectId(phaseId) }).sort({ createdAt: -1 }).exec();
  }

  async findByGroup(groupId: string): Promise<StandingsDocument[]> {
    return this.standingsModel.find({ groupId: new Types.ObjectId(groupId) }).sort({ createdAt: -1 }).exec();
  }

  async search(searchDto: StandingsSearchDTO): Promise<any> {
    return this.standingsRepository.search(searchDto);
  }

  async updateEntries(standingsId: string, entries: StandingEntryDTO[], updatedBy: string): Promise<StandingsDocument> {
    const standings = await this.findById(standingsId);

    if (standings.isFinal) {
      throw new BadRequestException('Cannot modify finalized standings');
    }

    // Validate entries
    this.validateEntries(entries);

    standings.entries = entries.map((entry, index) => ({
      ...entry,
      teamId: new Types.ObjectId(entry.teamId),
      position: index + 1,
    }));

    standings.lastUpdated = new Date();
    standings.audit.updatedBy = new Types.ObjectId(updatedBy);
    standings.audit.version += 1;

    const saved = await standings.save();

    this.eventEmitter.emit('standings.updated', {
      standingsId: standings.standingsId,
      updatedBy,
      entriesCount: entries.length,
    });

    return saved;
  }

  async addEntry(standingsId: string, entry: StandingEntryDTO): Promise<StandingsDocument> {
    const standings = await this.findById(standingsId);

    if (standings.isFinal) {
      throw new BadRequestException('Cannot add entry to finalized standings');
    }

    // Check for duplicate team
    if (standings.entries.some(e => e.teamId.toString() === entry.teamId)) {
      throw new ConflictException('Team already exists in standings');
    }

    standings.entries.push({
      ...entry,
      teamId: new Types.ObjectId(entry.teamId),
      position: standings.entries.length + 1,
    });

    standings.lastUpdated = new Date();
    standings.audit.version += 1;

    return standings.save();
  }

  async removeEntry(standingsId: string, entryIndex: number): Promise<StandingsDocument> {
    const standings = await this.findById(standingsId);

    if (standings.isFinal) {
      throw new BadRequestException('Cannot remove entry from finalized standings');
    }

    if (entryIndex >= standings.entries.length) {
      throw new BadRequestException('Invalid entry index');
    }

    standings.entries.splice(entryIndex, 1);
    standings.lastUpdated = new Date();
    standings.audit.version += 1;

    // Renumber positions
    standings.entries.forEach((entry, index) => {
      entry.position = index + 1;
    });

    return standings.save();
  }

  async updateTiebreakRules(standingsId: string, rules: TiebreakRuleDTO[]): Promise<StandingsDocument> {
    const standings = await this.findById(standingsId);

    if (standings.isFinal) {
      throw new BadRequestException('Cannot modify tiebreak rules for finalized standings');
    }

    this.validateTiebreakRules(rules);

    standings.tiebreakRules = rules;
    standings.updatedAt = new Date();
    standings.audit.version += 1;

    return standings.save();
  }

  async finalizeStandings(standingsId: string, finalizedBy: string): Promise<StandingsDocument> {
    const standings = await this.findById(standingsId);

    if (standings.isFinal) {
      throw new ConflictException('Standings are already finalized');
    }

    // Recalculate positions based on points and tiebreak rules
    await this.recalculateStandings(standingsId);

    standings.isFinal = true;
    standings.lastUpdated = new Date();
    standings.audit.updatedBy = new Types.ObjectId(finalizedBy);
    standings.audit.version += 1;

    const saved = await standings.save();

    this.eventEmitter.emit('standings.finalized', {
      standingsId: standings.standingsId,
      competitionId: standings.competitionId,
      finalizedBy,
    });

    return saved;
  }

  async recalculateStandings(standingsId: string): Promise<void> {
    const standings = await this.findById(standingsId);

    // Sort by points, then tiebreak rules
    standings.entries.sort((a, b) => {
      // Primary: points
      if (b.points !== a.points) return b.points - a.points;

      // Secondary: set ratio
      if (b.setRatio !== a.setRatio) return b.setRatio - a.setRatio;

      // Tertiary: point ratio
      if (b.pointRatio !== a.pointRatio) return b.pointRatio - a.pointRatio;

      // Quaternary: head-to-head (simplified)
      return 0;
    });

    // Update positions
    standings.entries.forEach((entry, index) => {
      entry.position = index + 1;
    });

    standings.lastUpdated = new Date();
    await standings.save();
  }

  async getQualifiedTeams(standingsId: string, count: number): Promise<StandingEntry[]> {
    const standings = await this.findById(standingsId);
    if (!standings) return [];

    return standings.entries
      .filter(e => e.qualification && e.qualification.startsWith('Q'))
      .sort((a, b) => a.position - b.position)
      .slice(0, count);
  }

  async getEliminatedTeams(standingsId: string): Promise<StandingEntry[]> {
    const standings = await this.findById(standingsId);
    if (!standings) return [];

    return standings.entries
      .filter(e => e.qualification === 'EL')
      .sort((a, b) => b.position - a.position);
  }

  private validateEntries(entries: StandingEntryDTO[]): void {
    if (entries.length === 0) return;

    // Check for valid positions
    const positions = entries.map(e => e.position);
    if (new Set(positions).size !== positions.length) {
      throw new BadRequestException('Duplicate positions in standings entries');
    }

    // Validate each entry
    for (const entry of entries) {
      if (!entry.teamId || !entry.teamName || !entry.teamShortName) {
        throw new BadRequestException('Each entry must have teamId, teamName, and teamShortName');
      }
    }
  }

  private validateUniqueTeams(entries: StandingEntryDTO[]): void {
    const teamIds = entries.map(e => e.teamId.toString());
    if (new Set(teamIds).size !== teamIds.length) {
      throw new BadRequestException('Duplicate teams in standings entries');
    }
  }

  private validateTiebreakRules(rules: TiebreakRuleDTO[]): void {
    if (rules.length === 0) return;

    const priorities = rules.map(r => r.priority);
    if (new Set(priorities).size !== priorities.length) {
      throw new BadRequestException('Duplicate priorities in tiebreak rules');
    }

    const validCriteria = ['points', 'set_ratio', 'point_ratio', 'head_to_head', 'sets_won', 'matches_won'];
    for (const rule of rules) {
      if (!validCriteria.includes(rule.criteria)) {
        throw new BadRequestException(`Invalid tiebreak criteria: ${rule.criteria}`);
      }
      if (!['desc', 'asc'].includes(rule.direction)) {
        throw new BadRequestException('Tiebreak direction must be "desc" or "asc"');
      }
      if (rule.priority < 1) {
        throw new BadRequestException('Tiebreak priority must be >= 1');
      }
    }
  }
}