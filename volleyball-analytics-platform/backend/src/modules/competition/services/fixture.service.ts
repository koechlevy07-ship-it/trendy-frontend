import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { FixtureRepository } from '../repositories/fixture.repository';
import { Fixture, FixtureDocument, FixtureStatus, FixtureGenerationMethod } from '../schemas/fixture.schema';
import { FixtureValidator } from '../validators/fixture.validator';
import { CreateFixtureDTO, UpdateFixtureDTO, FixtureSearchDTO, FixtureResponseDTO, FixtureSummaryDTO } from '../dto/fixture.dto';
import { CompetitionService } from './competition.service';
import { SeasonService } from '../../season/services/season.service';
import { OfficialAssignmentService } from '../../officials/services/official-assignment.service';

@Injectable()
export class FixtureService {
  constructor(
    private readonly fixtureRepository: FixtureRepository,
    private readonly fixtureValidator: FixtureValidator,
    private readonly competitionService: CompetitionService,
    private readonly seasonService: SeasonService,
    private readonly officialAssignmentService: OfficialAssignmentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateFixtureDTO): Promise<FixtureResponseDTO> {
    await this.fixtureValidator.validateCreate(dto);

    // Check if competition exists and can have fixtures
    const competition = await this.competitionService.findById(dto.competitionId);
    if (![FixtureStatus.SCHEDULED, FixtureStatus.IN_PROGRESS].includes(competition.status as any)) {
      throw new BadRequestException(`Cannot create fixtures for competition in ${competition.status} status`);
    }

    // Check if teams are different
    if (dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Check for duplicate fixture
    const existing = await this.fixtureRepository.findDuplicateFixture(
      dto.competitionId,
      dto.homeTeamId,
      dto.awayTeamId,
    );
    if (existing) {
      throw new ConflictException('Fixture between these teams already exists in this competition');
    }

    const fixture = await this.fixtureRepository.create({
      ...dto,
      status: FixtureStatus.DRAFT,
      assignedOfficials: [],
      schedulingConstraints: dto.schedulingConstraints,
      broadcast: dto.broadcast,
    });

    this.eventEmitter.emit('fixture.created', {
      fixtureId: fixture.fixtureId,
      competitionId: dto.competitionId,
      homeTeamId: dto.homeTeamId,
      awayTeamId: dto.awayTeamId,
      scheduledDate: dto.scheduledDate,
    });

    return this.toResponseDTO(fixture);
  }

  async findById(id: string) {
    const fixture = await this.fixtureRepository.findById(id);
    if (!fixture) {
      throw new NotFoundException(`Fixture with ID ${id} not found`);
    }
    return fixture;
  }

  async findByFixtureId(fixtureId: string) {
    return this.fixtureRepository.findByFixtureId(fixtureId);
  }

  async search(searchDto: FixtureSearchDTO) {
    return this.fixtureRepository.search(searchDto);
  }

  async update(id: string, dto: UpdateFixtureDTO): Promise<FixtureResponseDTO> {
    const fixture = await this.findById(id);

    // Validate update
    if (dto.homeTeamId && dto.awayTeamId && dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Check venue availability if date or venue changed
    if (dto.venue || dto.scheduledDate) {
      const venueId = dto.venue?.facilityId || fixture.venue.facilityId;
      const scheduledDate = dto.scheduledDate || fixture.scheduledDate;
      
      if (!await this.fixtureRepository.checkVenueAvailability(
        venueId,
        scheduledDate,
        fixture.fixtureId,
      )) {
        throw new ConflictException('Venue is not available at the scheduled time');
      }
    }

    // Prevent confirmation without teams
    if (dto.status === FixtureStatus.CONFIRMED) {
      if (!fixture.homeTeamId || !fixture.awayTeamId) {
        throw new BadRequestException('Cannot confirm fixture without both teams assigned');
      }
      if (!fixture.venue.facilityId) {
        throw new BadRequestException('Confirmed fixtures must have a venue assigned');
      }
    }

    const updated = await this.fixtureRepository.update(fixture._id.toString(), dto);
    
    this.emitEvent('fixture.updated', {
      fixtureId: fixture.fixtureId,
      changes: dto,
    });

    return this.toResponseDTO(updated);
  }

  async cancel(id: string): Promise<FixtureResponseDTO> {
    const fixture = await this.findById(id);
    
    if (fixture.status === FixtureStatus.CANCELLED) {
      throw new ConflictException('Fixture is already cancelled');
    }

    if (fixture.status === FixtureStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed fixture');
    }

    const updated = await this.fixtureRepository.update(fixture._id.toString(), {
      status: FixtureStatus.CANCELLED,
    });

    this.emitEvent('fixture.cancelled', {
      fixtureId: fixture.fixtureId,
      cancelledAt: new Date(),
    });

    return this.toResponseDTO(updated);
  }

  async assignOfficials(fixtureId: string, officialIds: string[]): Promise<FixtureResponseDTO> {
    const fixture = await this.findById(fixtureId);

    // Validate officials are available
    for (const officialId of officialIds) {
      const available = await this.officialAssignmentService.checkAvailability(
        officialId,
        fixture.scheduledDate,
      );
      if (!available) {
        throw new ConflictException(`Official ${officialId} is not available on ${fixture.scheduledDate}`);
      }
    }

    const updated = await this.fixtureRepository.update(fixture._id.toString(), {
      assignedOfficials: officialIds.map(id => new Types.ObjectId(id)),
    });

    this.emitEvent('fixture.officials.assigned', {
      fixtureId: fixture.fixtureId,
      officialIds,
    });

    return this.toResponseDTO(updated);
  }

  async assignVenue(fixtureId: string, venueId: string): Promise<FixtureResponseDTO> {
    const fixture = await this.findById(fixtureId);

    // Check venue availability
    const available = await this.fixtureRepository.checkVenueAvailability(
      venueId,
      fixture.scheduledDate,
      fixture.fixtureId,
    );

    if (!available) {
      throw new ConflictException('Venue is not available at the scheduled time');
    }

    const updated = await this.fixtureRepository.update(fixture._id.toString(), {
      'venue.facilityId': new Types.ObjectId(venueId),
    });

    this.emitEvent('fixture.venue.assigned', {
      fixtureId: fixture.fixtureId,
      venueId,
    });

    return this.toResponseDTO(updated);
  }

  async generateRoundRobinFixtures(
    competitionId: string,
    seasonId: string,
    teams: any[],
    stageId?: string,
    groupId?: string,
  ) {
    return this.fixtureRepository.generateRoundRobinFixtures(
      competitionId,
      seasonId,
      teams,
      stageId,
      groupId,
    );
  }

  async generateKnockoutFixtures(
    competitionId: string,
    seasonId: string,
    teams: any[],
    stageId?: string,
    startRound: string = 'round_of_16',
  ) {
    return this.fixtureRepository.generateKnockoutFixtures(
      competitionId,
      seasonId,
      teams,
      stageId,
      startRound,
    );
  }

  async regenerateFixtures(competitionId: string): Promise<any[]> {
    // Get existing fixtures and regenerate
    const fixtures = await this.fixtureRepository.findByCompetition(competitionId);
    
    // Archive existing fixtures
    await this.fixtureRepository.bulkUpdateStatus(
      fixtures.map(f => f.fixtureId),
      FixtureStatus.ARCHIVED,
    );

    // Get teams and regenerate
    const competition = await this.competitionService.findById(competitionId);
    const teams = await this.getParticipantsWithDetails(competition.participantIds);
    
    return this.generateRoundRobinFixtures(competitionId, competition.seasonId, teams);
  }

  async getUpcomingFixtures(days: number = 7) {
    return this.fixtureRepository.findUpcomingFixtures(days);
  }

  async getTeamSchedule(teamId: string, competitionId?: string, days: number = 30) {
    return this.fixtureRepository.getTeamSchedule(teamId, competitionId, days);
  }

  async checkVenueAvailability(venueId: string, date: Date, excludeFixtureId?: string): Promise<boolean> {
    return this.fixtureRepository.checkVenueAvailability(venueId, date, excludeFixtureId);
  }

  async getFixtureStatistics(competitionId: string) {
    return this.fixtureRepository.getFixtureStatistics(competitionId);
  }

  private async emitEvent(eventName: string, payload: any): Promise<void> {
    this.eventEmitter.emit(eventName, {
      ...payload,
      timestamp: new Date(),
    });
  }

  private toResponseDTO(fixture: FixtureDocument) {
    return {
      id: fixture._id.toString(),
      fixtureId: fixture.fixtureId,
      competitionId: fixture.competitionId.toString(),
      seasonId: fixture.seasonId.toString(),
      stageId: fixture.stageId?.toString(),
      groupId: fixture.groupId?.toString(),
      round: fixture.round,
      roundNumber: fixture.roundNumber,
      matchNumber: fixture.matchNumber,
      homeTeamId: fixture.homeTeamId.toString(),
      awayTeamId: fixture.awayTeamId.toString(),
      venue: {
        facilityId: fixture.venue.facilityId.toString(),
        courtId: fixture.venue.courtId?.toString(),
        preferredStartTime: fixture.venue.preferredStartTime,
        backupVenueId: fixture.venue.backupVenueId?.toString(),
      },
      scheduledDate: fixture.scheduledDate,
      actualStartTime: fixture.actualStartTime,
      actualEndTime: fixture.actualEndTime,
      status: fixture.status,
      generationMethod: fixture.generationMethod,
      assignedOfficials: fixture.assignedOfficials.map(id => id.toString()),
      schedulingConstraints: fixture.schedulingConstraints,
      broadcast: fixture.broadcast,
      createdAt: fixture.createdAt,
      updatedAt: fixture.updatedAt,
    };
  }

  private async emitEvent(eventName: string, payload: any): Promise<void> {
    this.eventEmitter.emit(eventName, {
      ...payload,
      timestamp: new Date(),
    });
  }
}