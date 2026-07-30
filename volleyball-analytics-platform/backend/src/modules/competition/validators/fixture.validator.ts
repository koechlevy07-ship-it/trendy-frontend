import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fixture, FixtureDocument, FixtureStatus } from '../schemas/fixture.schema';
import { FixtureRepository } from '../repositories/fixture.repository';
import { CreateFixtureDTO, UpdateFixtureDTO, FixtureSearchDTO } from '../dto/fixture.dto';
import { CompetitionService } from '../services/competition.service';
import { SeasonService } from '../../season/services/season.service';

@Injectable()
export class FixtureValidator {
  constructor(
    @InjectModel('Fixture') private readonly fixtureModel: Model<FixtureDocument>,
  ) {}

  async validateCreate(dto: CreateFixtureDTO): Promise<void> {
    // Check if fixture already exists between these teams in this competition
    const existing = await this.fixtureModel.findOne({
      competitionId: new Types.ObjectId(dto.competitionId),
      homeTeamId: new Types.ObjectId(dto.homeTeamId),
      awayTeamId: new Types.ObjectId(dto.awayTeamId),
      status: { $nin: ['cancelled', 'archived'] },
    }).exec();

    if (existing) {
      throw new ConflictException('Fixture between these teams already exists in this competition');
    }

    // Validate teams are different
    if (dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // Validate dates
    if (dto.scheduledDate && new Date(dto.scheduledDate) < new Date()) {
      throw new BadRequestException('Scheduled date cannot be in the past');
    }

    // Validate scheduling constraints
    if (dto.schedulingConstraints.minRestHours < 0 || dto.schedulingConstraints.minRestHours > 168) {
      throw new BadRequestException('Minimum rest hours must be between 0 and 168');
    }

    // Validate fixture generation method
    if (!Object.values(FixtureGenerationMethod).includes(dto.generationMethod)) {
      throw new BadRequestException(`Invalid generation method: ${dto.generationMethod}`);
    }
  }

  async validateUpdate(fixtureId: string, dto: UpdateFixtureDTO): Promise<void> {
    const fixture = await this.fixtureModel.findById(fixtureId).exec();
    if (!fixture) {
      throw new NotFoundException(`Fixture with ID ${fixtureId} not found`);
    }

    // Cannot update archived/cancelled/completed fixtures
    if (['archived', 'cancelled', 'completed'].includes(fixture.status)) {
      throw new BadRequestException(`Cannot update fixture in ${fixture.status} status`);
    }

    // If teams are being updated, check they're different
    if (dto.homeTeamId && dto.awayTeamId && dto.homeTeamId === dto.awayTeamId) {
      throw new BadRequestException('Home and away teams must be different');
    }

    // If status is being updated to confirmed, validate prerequisites
    if (dto.status === FixtureStatus.CONFIRMED) {
      if (!dto.homeTeamId && !fixture.homeTeamId) {
        throw new BadRequestException('Cannot confirm fixture without home team');
      }
      if (!dto.awayTeamId && !fixture.awayTeamId) {
        throw new BadRequestException('Cannot confirm fixture without away team');
      }
      if (!fixture.venue?.facilityId && !dto.venue?.facilityId) {
        throw new BadRequestException('Confirmed fixtures must have a venue assigned');
      }
    }

    // If scheduledDate is being updated, ensure it's in the future
    if (dto.scheduledDate && new Date(dto.scheduledDate) < new Date()) {
      throw new BadRequestException('Scheduled date cannot be in the past');
    }
  }

  async validateStatusTransition(fixtureId: string, newStatus: string): Promise<void> {
    const fixture = await this.fixtureModel.findById(fixtureId).exec();
    if (!fixture) {
      throw new NotFoundException(`Fixture not found`);
    }

    const validTransitions: Record<string, string[]> = {
      [FixtureStatus.DRAFT]: [FixtureStatus.SCHEDULED, FixtureStatus.CANCELLED],
      [FixtureStatus.SCHEDULED]: [FixtureStatus.CONFIRMED, FixtureStatus.CANCELLED, FixtureStatus.POSTPONED],
      [FixtureStatus.CONFIRMED]: [FixtureStatus.IN_PROGRESS, FixtureStatus.CANCELLED, FixtureStatus.POSTPONED],
      [FixtureStatus.IN_PROGRESS]: [FixtureStatus.COMPLETED, FixtureStatus.SUSPENDED, FixtureStatus.POSTPONED],
      [FixtureStatus.SUSPENDED]: [FixtureStatus.IN_PROGRESS, FixtureStatus.CANCELLED],
      [FixtureStatus.POSTPONED]: [FixtureStatus.SCHEDULED, FixtureStatus.CANCELLED],
      [FixtureStatus.COMPLETED]: [FixtureStatus.ARCHIVED],
      [FixtureStatus.ARCHIVED]: [],
      [FixtureStatus.CANCELLED]: [],
    };

    const currentStatus = fixture.status;
    const validTargets = [FixtureStatus.DRAFT, FixtureStatus.SCHEDULED, FixtureStatus.CONFIRMED,
      FixtureStatus.IN_PROGRESS, FixtureStatus.SUSPENDED, FixtureStatus.POSTPONED,
      FixtureStatus.COMPLETED, FixtureStatus.CANCELLED, FixtureStatus.ARCHIVED];

    if (!validTargets.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  async validateOfficialAssignment(
    fixtureId: string,
    officialId: string,
    role: string,
  ): Promise<void> {
    // Check if official is already assigned to another fixture at the same time
    // This would query the official's assignments
  }
}