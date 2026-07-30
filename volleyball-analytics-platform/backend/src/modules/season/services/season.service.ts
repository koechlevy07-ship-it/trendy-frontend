import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Season, SeasonDocument, SeasonStatus } from '../schemas/season.schema';
import { SeasonRepository } from '../repositories/season.repository';
import { SeasonValidator } from '../validators/season.validator';
import { CreateSeasonDTO, UpdateSeasonDTO, SeasonSearchDTO, SeasonResponseDTO, SeasonSummaryDTO } from '../dto/season.dto';

@Injectable()
export class SeasonService {
  constructor(
    private readonly seasonRepository: SeasonRepository,
    private readonly seasonValidator: SeasonValidator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateSeasonDTO): Promise<SeasonResponseDTO> {
    await this.seasonValidator.validateCreate(dto);

    const season = await this.seasonRepository.create({
      ...dto,
      status: dto.status || SeasonStatus.UPCOMING,
      competitionIds: [],
      statistics: {
        totalCompetitions: 0,
        totalMatches: 0,
        totalTeams: 0,
        totalPlayers: 0,
        totalGoals: 0,
        averageAttendance: 0,
      },
      metadata: dto.metadata || {
        sponsors: [],
        broadcastPartners: [],
        customFields: {},
      },
      audit: { version: 0 },
      archive: { isArchived: false },
    });

    this.emitEvent('season.created', { seasonId: season.seasonId });

    return this.toResponseDTO(season);
  }

  async findById(id: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findById(id);
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }
    return this.toResponseDTO(season);
  }

  async findBySeasonId(seasonId: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findBySeasonId(seasonId);
    if (!season) {
      throw new NotFoundException(`Season with ID ${seasonId} not found`);
    }
    return this.toResponseDTO(season);
  }

  async findByCode(code: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findByCode(code);
    if (!season) {
      throw new NotFoundException(`Season with code ${code} not found`);
    }
    return this.toResponseDTO(season);
  }

  async findByYear(year: number): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findByYear(year);
    if (!season) {
      throw new NotFoundException(`Season for year ${year} not found`);
    }
    return this.toResponseDTO(season);
  }

  async search(searchDto: SeasonSearchDTO) {
    return this.seasonRepository.search(searchDto);
  }

  async update(id: string, dto: UpdateSeasonDTO): Promise<SeasonResponseDTO> {
    await this.seasonValidator.validateUpdate(id, dto);
    const updated = await this.seasonRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }
    this.emitEvent('season.updated', { seasonId: id, changes: dto });
    return this.toResponseDTO(updated);
  }

  async activate(id: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findById(id);
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    if (season.status !== SeasonStatus.UPCOMING && season.status !== SeasonStatus.REGISTRATION_OPEN) {
      throw new BadRequestException(`Cannot activate season in ${season.status} status`);
    }

    const updated = await this.seasonRepository.update(id, { status: SeasonStatus.ACTIVE });
    this.emitEvent('season.activated', { seasonId: season.seasonId });
    return this.toResponseDTO(updated);
  }

  async close(id: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findById(id);
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    if (season.status !== SeasonStatus.ACTIVE && season.status !== SeasonStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot close season in ${season.status} status`);
    }

    const updated = await this.seasonRepository.update(id, { status: SeasonStatus.COMPLETED });
    this.emitEvent('season.closed', { seasonId: season.seasonId });
    return this.toResponseDTO(updated);
  }

  async archive(id: string): Promise<void> {
    const season = await this.seasonRepository.findById(id);
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    if (season.status === SeasonStatus.ARCHIVED) {
      throw new ConflictException('Season is already archived');
    }

    await this.seasonRepository.archive(id);
    this.emitEvent('season.archived', { seasonId: season.seasonId });
  }

  async restore(id: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findById(id);
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    if (season.status !== SeasonStatus.ARCHIVED) {
      throw new BadRequestException('Only archived seasons can be restored');
    }

    const restored = await this.seasonRepository.restore(id);
    this.emitEvent('season.restored', { seasonId: season.seasonId });
    return this.toResponseDTO(restored);
  }

  async addCompetition(seasonId: string, competitionId: string): Promise<SeasonResponseDTO> {
    const season = await this.seasonRepository.findById(seasonId);
    if (!season) {
      throw new NotFoundException(`Season with ID ${seasonId} not found`);
    }

    if (season.competitionIds.some(c => c.toString() === competitionId)) {
      throw new ConflictException('Competition already added to this season');
    }

    const updated = await this.seasonRepository.addCompetition(seasonId, competitionId);
    this.emitEvent('season.competition.added', { seasonId, competitionId });
    return this.toResponseDTO(updated);
  }

  async removeCompetition(seasonId: string, competitionId: string): Promise<SeasonResponseDTO> {
    const updated = await this.seasonRepository.removeCompetition(seasonId, competitionId);
    this.emitEvent('season.competition.removed', { seasonId, competitionId });
    return this.toResponseDTO(updated);
  }

  async getStatistics(id: string): Promise<any> {
    return this.seasonRepository.getStatistics(id);
  }

  async findActive(): Promise<SeasonResponseDTO[]> {
    const seasons = await this.seasonRepository.findActive();
    return seasons.map(s => this.toResponseDTO(s));
  }

  async findUpcoming(): Promise<SeasonResponseDTO[]> {
    const seasons = await this.seasonRepository.findUpcoming();
    return seasons.map(s => this.toResponseDTO(s));
  }

  async findCompleted(): Promise<SeasonResponseDTO[]> {
    const seasons = await this.seasonRepository.findCompleted();
    return seasons.map(s => this.toResponseDTO(s));
  }

  private toResponseDTO(season: SeasonDocument): SeasonResponseDTO {
    return {
      id: season._id.toString(),
      seasonId: season.seasonId,
      name: season.name,
      code: season.code,
      year: season.year,
      displayName: season.displayName,
      description: season.description,
      status: season.status,
      rules: season.rules,
      schedule: season.schedule,
      competitionIds: season.competitionIds.map(id => id.toString()),
      statistics: season.statistics,
      metadata: season.metadata,
      createdAt: season.createdAt,
      updatedAt: season.updatedAt,
    };
  }

  private toSummaryDTO(season: SeasonDocument): SeasonSummaryDTO {
    return {
      id: season._id.toString(),
      seasonId: season.seasonId,
      name: season.name,
      code: season.code,
      year: season.year,
      status: season.status,
      schedule: season.schedule,
      competitionCount: season.competitionIds.length,
      durationDays: season.durationDays,
    };
  }

  private emitEvent(eventName: string, payload: any): void {
    this.eventEmitter.emit(eventName, {
      ...payload,
      timestamp: new Date(),
    });
  }
}