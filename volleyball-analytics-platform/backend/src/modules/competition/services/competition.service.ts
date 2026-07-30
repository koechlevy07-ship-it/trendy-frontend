import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CompetitionRepository } from '../repositories/competition.repository';
import { CompetitionValidator } from '../validators/competition.validator';
import { CompetitionEventService } from '../events/competition.event.service';
import { Competition, CompetitionDocument, CompetitionStatus, CompetitionType, CompetitionFormat } from '../schemas/competition.schema';
import { Fixture, FixtureDocument } from '../schemas/fixture.schema';
import { CompetitionPhase, CompetitionPhaseDocument } from '../schemas/competition-phase.schema';
import { CompetitionGroup, CompetitionGroupDocument } from '../schemas/competition-group.schema';
import { CreateCompetitionDTO, UpdateCompetitionDTO, CompetitionSearchDTO, CompetitionResponseDTO, CompetitionSummaryDTO } from '../dto/competition.dto';
import { FixtureRepository } from '../repositories/fixture.repository';
import { CompetitionPhaseRepository } from '../repositories/competition-phase.repository';
import { CompetitionGroupRepository } from '../repositories/competition-group.repository';
import { SeasonService } from '../../season/services/season.service';

@Injectable()
export class CompetitionService {
  constructor(
    private readonly competitionRepository: CompetitionRepository,
    private readonly fixtureRepository: FixtureRepository,
    private readonly phaseRepository: CompetitionPhaseRepository,
    private readonly groupRepository: CompetitionGroupRepository,
    private readonly competitionValidator: CompetitionValidator,
    private readonly competitionEventService: CompetitionEventService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => SeasonService))
    private readonly seasonService: SeasonService,
  ) {}

  async create(dto: CreateCompetitionDTO): Promise<CompetitionResponseDTO> {
    await this.competitionValidator.validateCreate(dto);

    const competition = await this.competitionRepository.create({
      ...dto,
      status: CompetitionStatus.DRAFT,
      participantIds: [],
      ranking: [],
      prizes: dto.prizes || [],
      phaseIds: [],
      groupIds: [],
      metadata: dto.metadata || {},
    });

    await this.competitionEventService.emitCreated(competition);

    return this.toResponseDTO(competition);
  }

  async findById(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    return this.toResponseDTO(competition);
  }

  async findByCompetitionId(competitionId: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findByCompetitionId(competitionId);
    if (!competition) {
      throw new NotFoundException(`Competition with code ${competitionId} not found`);
    }
    return this.toResponseDTO(competition);
  }

  async search(searchDto: CompetitionSearchDTO) {
    return this.competitionRepository.search(searchDto);
  }

  async update(id: string, dto: UpdateCompetitionDTO): Promise<CompetitionResponseDTO> {
    await this.competitionValidator.validateUpdate(id, dto);
    const updated = await this.competitionRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    return this.toResponseDTO(updated);
  }

  async activate(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.DRAFT) {
      throw new BadRequestException('Only draft competitions can be activated');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.REGISTRATION_OPEN });
    await this.emitEvent('competition.activated', { competitionId: id, competition: updated });
    return this.toResponseDTO(updated);
  }

  async suspend(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be suspended');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.REGISTRATION_CLOSED });
    await this.emitEvent('competition.suspended', { competitionId: id, competition: updated });
    return this.toResponseDTO(updated);
  }

  async approve(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be approved');
    }

    // Generate fixtures if format requires it
    if (competition.format === CompetitionFormat.ROUND_ROBIN || competition.format === CompetitionFormat.GROUP_STAGE) {
      await this.generateFixtures(id);
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.SCHEDULED });
    await this.emitEvent('competition.approved', { competitionId: id, competition: updated });
    return this.toResponseDTO(updated);
  }

  async reject(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be rejected');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.CANCELLED });
    await this.emitEvent('competition.rejected', { competitionId: id, competition: updated });
    return this.toResponseDTO(updated);
  }

  async archive(id: string): Promise<void> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status === CompetitionStatus.ARCHIVED) {
      throw new ConflictException('Competition is already archived');
    }

    if (![CompetitionStatus.DRAFT, CompetitionStatus.REGISTRATION_OPEN, CompetitionStatus.SCHEDULED, CompetitionStatus.COMPLETED, CompetitionStatus.CANCELLED].includes(competition.status)) {
      throw new BadRequestException(`Cannot archive competition in ${competition.status} status`);
    }

    await this.competitionRepository.archive(id);
    await this.emitEvent('competition.archived', { competitionId: id });
  }

  async restore(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.ARCHIVED) {
      throw new BadRequestException('Only archived competitions can be restored');
    }

    const restored = await this.competitionRepository.restore(id);
    await this.emitEvent('competition.restored', { competitionId: id });
    return this.toResponseDTO(restored);
  }

  async verifyRegistration(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.DRAFT) {
      throw new BadRequestException('Only draft competitions can be verified');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.REGISTRATION_OPEN });
    await this.emitEvent('competition.verified', { competitionId: id });
    return this.toResponseDTO(updated);
  }

  async approveRegistration(id: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be approved');
    }

    if ([CompetitionType.FEDERATION, CompetitionType.LEAGUE].includes(competition.type)) {
      throw new BadRequestException('Only federations and leagues can approve organization registrations');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.SCHEDULED });
    await this.emitEvent('competition.approved', { competitionId: id });
    return this.toResponseDTO(updated);
  }

  async rejectRegistration(id: string, reason: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(id);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be rejected');
    }

    const updated = await this.competitionRepository.update(id, { status: CompetitionStatus.CANCELLED });
    await this.emitEvent('competition.rejected', { competitionId: id, reason });
    return this.toResponseDTO(updated);
  }

  async registerTeam(competitionId: string, teamId: string): Promise<CompetitionResponseDTO> {
    const competition = await this.competitionRepository.findById(competitionId);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${competitionId} not found`);
    }

    if (competition.participantIds.some(t => t.toString() === teamId)) {
      throw new ConflictException('Team is already registered for this competition');
    }

    if (competition.participantIds.length >= competition.maxParticipants) {
      throw new BadRequestException('Competition has reached maximum number of participants');
    }

    const updated = await this.competitionRepository.addParticipant(competitionId, teamId);
    return this.toResponseDTO(updated);
  }

  async unregisterTeam(competitionId: string, teamId: string): Promise<CompetitionResponseDTO> {
    const updated = await this.competitionRepository.removeParticipant(competitionId, teamId);
    return this.toResponseDTO(updated);
  }

  async generateFixtures(competitionId: string): Promise<any[]> {
    const competition = await this.competitionRepository.findById(competitionId);
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${competitionId} not found`);
    }

    const participants = await this.getParticipantsWithDetails(competition.participantIds);
    
    if (participants.length < 2) {
      throw new BadRequestException('At least 2 teams are required to generate fixtures');
    }

    let fixtures;
    if (competition.format === CompetitionFormat.ROUND_ROBIN) {
      fixtures = await this.fixtureRepository.generateRoundRobinFixtures(
        competitionId,
        competition.seasonId.toString(),
        participants,
      );
    } else if (competition.format === CompetitionFormat.GROUP_STAGE) {
      // Group stage requires phases and groups to be set up first
      throw new BadRequestException('Group stage fixtures require phase and group setup');
    } else {
      throw new BadRequestException(`Automatic fixture generation not supported for format: ${competition.format}`);
    }

    await this.emitEvent('fixtures.generated', { competitionId, fixtureCount: fixtures.length });
    return fixtures;
  }

  private async getParticipantsWithDetails(teamIds: Types.ObjectId[]) {
    // This would typically call the Team service
    // For now, return minimal team info
    return teamIds.map(id => ({
      _id: id,
      teamId: id.toString(),
    }));
  }

  async getStatistics(id: string): Promise<any> {
    return this.competitionRepository.getStatistics(id);
  }

  async getHierarchy(id: string): Promise<any> {
    return this.competitionRepository.getHierarchy(id);
  }

  private toResponseDTO(competition: CompetitionDocument): CompetitionResponseDTO {
    return {
      competitionId: competition.competitionId,
      name: competition.name,
      shortName: competition.shortName,
      description: competition.description,
      type: competition.type,
      format: competition.format,
      status: competition.status,
      seasonId: competition.seasonId.toString(),
      organizerId: competition.organizerId.toString(),
      rules: competition.rules,
      schedule: competition.schedule,
      participantIds: competition.participantIds.map(id => id.toString()),
      maxParticipants: competition.maxParticipants,
      totalMatches: competition.totalMatches || 0,
      completedMatches: competition.completedMatches || 0,
      progress: competition.progress || 0,
      isActive: competition.isActive,
      createdAt: competition.createdAt,
      updatedAt: competition.updatedAt,
    };
  }

  private async emitEvent(eventName: string, payload: any): Promise<void> {
    this.eventEmitter.emit(eventName, {
      ...payload,
      timestamp: new Date(),
    });
  }
}