import { Injectable, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Competition, CompetitionDocument, CompetitionStatus, CompetitionFormat } from '../schemas/competition.schema';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { CreateCompetitionDTO, UpdateCompetitionDTO, CompetitionSearchDTO } from '../dto/competition.dto';
import { Fixture, FixtureSearchDTO } from '../dto/fixture.dto';
import { CompetitionEventService } from '../events/competition.event.service';
import { SeasonService } from '../../season/services/season.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { MatchService } from '../../match/services/match.service';
import { FixtureRepository } from '../repositories/fixture.repository';

@Injectable()
export class CompetitionValidator {
  constructor(
    @InjectModel(Competition.name) private readonly competitionModel: Model<CompetitionDocument>,
    @InjectModel(Fixture.name) private readonly fixtureModel: Model<FixtureDocument>,
  ) {}

  async validateCreate(dto: CreateCompetitionDTO): Promise<void> {
    // Validate unique competition name in season
    const existingByName = await this.competitionModel.findOne({
      name: dto.name,
      seasonId: new Types.ObjectId(dto.seasonId),
    }).exec();
    if (existingByName) {
      throw new ConflictException(`Competition with name '${dto.name}' already exists in this season`);
    }

    // Validate unique competition code
    const existingByCode = await this.competitionModel.findOne({ shortName: dto.shortName }).exec();
    if (existingByCode) {
      throw new ConflictException(`Competition code '${dto.shortName}' is already in use`);
    }

    // Validate season exists and is active
    // This would call season service

    // Validate organizer exists
    // This would call organization service

    // Validate dates
    if (dto.schedule.endDate <= dto.schedule.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (dto.schedule.registrationCloseDate && dto.schedule.registrationOpenDate) {
      if (dto.schedule.registrationCloseDate <= dto.schedule.registrationOpenDate) {
        throw new BadRequestException('Registration close date must be after registration open date');
      }
    }

    // Validate season dates
    if (dto.schedule.startDate < new Date()) {
      throw new BadRequestException('Competition start date cannot be in the past');
    }

    // Validate max participants
    if (dto.maxParticipants < 2) {
      throw new BadRequestException('Maximum participants must be at least 2');
    }

    // Validate rules
    if (dto.rules.pointsPerSet < 15 || dto.rules.pointsPerSet > 50) {
      throw new BadRequestException('Points per set must be between 15 and 50');
    }
  }

  async validateUpdate(id: string, dto: UpdateCompetitionDTO): Promise<void> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    // Check if competition can be updated based on status
    if (!this.canUpdate(competition.status)) {
      throw new BadRequestException(`Cannot update competition in ${competition.status} status`);
    }

    // If name is being updated, check for duplicates
    if (dto.name && dto.name !== competition.name) {
      const existingByName = await this.competitionModel.findOne({
        name: dto.name,
        seasonId: competition.seasonId,
        _id: { $ne: id },
      }).exec();
      if (existingByName) {
        throw new ConflictException(`Competition with name '${dto.name}' already exists in this season`);
      }
    }

    // If shortName is being updated, check for duplicates
    if (dto.shortName && dto.shortName !== competition.shortName) {
      const existingByCode = await this.competitionModel.findOne({
        shortName: dto.shortName,
        _id: { $ne: id },
      }).exec();
      if (existingByCode) {
        throw new ConflictException(`Competition code '${dto.shortName}' is already in use`);
      }
    }

    // If status is being updated, validate transition
    if (dto.status && dto.status !== competition.status) {
      this.validateStatusTransition(competition.status, dto.status);
    }
  }

  async validateVerification(dto: any, competition: CompetitionDocument): Promise<void> {
    if (competition.status !== CompetitionStatus.DRAFT) {
      throw new BadRequestException('Only draft competitions can be verified');
    }
  }

  async validateApproval(id: string): Promise<void> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be approved');
    }
  }

  async validateRejection(id: string): Promise<void> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    if (competition.status !== CompetitionStatus.REGISTRATION_OPEN) {
      throw new BadRequestException('Only competitions with open registration can be rejected');
    }
  }

  async validateArchive(id: string): Promise<void> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    if (competition.status === 'archived') {
      throw new ConflictException('Competition is already archived');
    }
    if (!['draft', 'registration_open', 'scheduled', 'completed', 'cancelled'].includes(competition.status)) {
      throw new BadRequestException(`Cannot archive competition in ${competition.status} status`);
    }
  }

  async validateRestore(id: string): Promise<void> {
    const competition = await this.competitionModel.findById(id).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }
    if (competition.status !== CompetitionStatus.ARCHIVED) {
      throw new ConflictException('Only archived competitions can be restored');
    }
  }

  async validateFixtureCreation(competitionId: string, fixture: any): Promise<void> {
    const competition = await this.competitionModel.findById(competitionId).exec();
    if (!competition) {
      throw new NotFoundException(`Competition with ID ${competitionId} not found`);
    }

    if (competition.status !== CompetitionStatus.SCHEDULED && competition.status !== CompetitionStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot create fixtures for competition in ${competition.status} status`);
    }

    // Check if home and away teams are different
    if (fixture.homeTeamId === fixture.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Check if teams are participants
    const homeTeam = competition.participantIds.find(t => t.toString() === fixture.homeTeamId);
    const awayTeam = competition.participantIds.find(t => t.toString() === fixture.awayTeamId);
    if (!homeTeam || !awayTeam) {
      throw new BadRequestException('Both teams must be participants in the competition');
    }

    // Check for duplicate fixture
    const existing = await this.fixtureModel.findOne({
      competitionId: new Types.ObjectId(competitionId),
      homeTeamId: new Types.ObjectId(fixture.homeTeamId),
      awayTeamId: new Types.ObjectId(fixture.awayTeamId),
      status: { $nin: ['cancelled', 'archived'] },
    }).exec();

    if (existing) {
      throw new ConflictException('Fixture between these teams already exists in this competition');
    }
  }

  private canUpdate(status: CompetitionStatus): boolean {
    return [CompetitionStatus.DRAFT, CompetitionStatus.REGISTRATION_OPEN].includes(status);
  }

  private validateStatusTransition(from: CompetitionStatus, to: CompetitionStatus): void {
    const validTransitions: Record<CompetitionStatus, CompetitionStatus[]> = {
      [CompetitionStatus.DRAFT]: [CompetitionStatus.REGISTRATION_OPEN, CompetitionStatus.CANCELLED],
      [CompetitionStatus.REGISTRATION_OPEN]: [CompetitionStatus.SCHEDULED, CompetitionStatus.REGISTRATION_CLOSED, CompetitionStatus.CANCELLED],
      [CompetitionStatus.REGISTRATION_CLOSED]: [CompetitionStatus.SCHEDULED, CompetitionStatus.CANCELLED],
      [CompetitionStatus.SCHEDULED]: [CompetitionStatus.IN_PROGRESS, CompetitionStatus.CANCELLED],
      [CompetitionStatus.IN_PROGRESS]: [CompetitionStatus.PAUSED, CompetitionStatus.COMPLETED],
      [CompetitionStatus.PAUSED]: [CompetitionStatus.IN_PROGRESS, CompetitionStatus.CANCELLED],
      [CompetitionStatus.COMPLETED]: [CompetitionStatus.ARCHIVED],
      [CompetitionStatus.CANCELLED]: [CompetitionStatus.ARCHIVED],
      [CompetitionStatus.ARCHIVED]: [],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }
}