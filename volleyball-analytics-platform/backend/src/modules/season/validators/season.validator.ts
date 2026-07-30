import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Season, SeasonDocument, SeasonStatus } from '../schemas/season.schema';
import { CreateSeasonDTO, UpdateSeasonDTO, SeasonSearchDTO } from '../dto/season.dto';
import { CompetitionService } from '../../competition/services/competition.service';

@Injectable()
export class SeasonValidator {
  constructor(
    @InjectModel(Season.name) private readonly seasonModel: Model<SeasonDocument>,
  ) {}

  async validateCreate(dto: CreateSeasonDTO): Promise<void> {
    // Validate unique season code
    const existingByCode = await this.seasonModel.findOne({ code: dto.code }).exec();
    if (existingByCode) {
      throw new ConflictException(`Season code '${dto.code}' is already in use`);
    }

    // Validate unique year
    const existingByYear = await this.seasonModel.findOne({ year: dto.year }).exec();
    if (existingByYear) {
      throw new ConflictException(`Season for year ${dto.year} already exists`);
    }

    // Validate dates
    if (dto.schedule.endDate <= dto.schedule.startDate) {
      throw new BadRequestException('Season end date must be after start date');
    }

    // Validate registration dates
    if (dto.schedule.registrationCloseDate && dto.schedule.registrationOpenDate) {
      if (dto.schedule.registrationCloseDate <= dto.schedule.registrationOpenDate) {
        throw new BadRequestException('Registration close date must be after registration open date');
      }
    }

    // Validate transfer window
    if (dto.rules.allowTransfers && dto.rules.transferWindowStart && dto.rules.transferWindowEnd) {
      if (dto.rules.transferWindowEnd <= dto.rules.transferWindowStart) {
        throw new BadRequestException('Transfer window end must be after start');
      }
    }

    // Validate season dates don't overlap with other seasons
    const overlappingSeason = await this.seasonModel.findOne({
      status: { $in: ['upcoming', 'registration_open', 'registration_closed', 'active', 'in_progress'] },
      'schedule.startDate': { $lt: dto.schedule.endDate },
      'schedule.endDate': { $gt: dto.schedule.startDate },
    }).exec();

    if (overlappingSeason) {
      throw new ConflictException('Season dates overlap with existing season');
    }

    // Validate season dates are not in the past
    if (dto.schedule.startDate < new Date() && dto.status === 'upcoming') {
      throw new BadRequestException('Season start date cannot be in the past for upcoming season');
    }

    // Validate rules
    if (dto.rules.minTeamsPerCompetition < 2) {
      throw new BadRequestException('Minimum teams per competition must be at least 2');
    }

    if (dto.rules.maxTeamsPerCompetition < dto.rules.minTeamsPerCompetition) {
      throw new BadRequestException('Max teams per competition must be >= min teams');
    }
  }

  async validateUpdate(id: string, dto: UpdateSeasonDTO): Promise<void> {
    const season = await this.seasonModel.findById(id).exec();
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    // Check if season can be updated
    if (season.archive.isArchived && !this.isArchival(dto)) {
      throw new BadRequestException('Archived seasons cannot be modified');
    }

    // If code is being updated, check for duplicates
    if (dto.code && dto.code !== season.code) {
      const existing = await this.seasonModel.findOne({ code: dto.code }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(`Season code '${dto.code}' is already in use`);
      }
    }

    // If name is being updated, check for duplicates
    if (dto.name && dto.name !== season.name) {
      const existing = await this.seasonModel.findOne({ name: dto.name }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new ConflictException(`Season with name '${dto.name}' already exists`);
      }
    }

    // If status is being updated, validate transition
    if (dto.status && dto.status !== season.status) {
      this.validateStatusTransition(season.status, dto.status);
    }

    // Validate dates if being updated
    if (dto.schedule) {
      if (dto.schedule.endDate && dto.schedule.startDate) {
        if (dto.schedule.endDate <= dto.schedule.startDate) {
          throw new BadRequestException('Season end date must be after start date');
        }
      }
    }
  }

  async validateStatusTransition(id: string, newStatus: string): Promise<void> {
    const season = await this.seasonModel.findById(id).exec();
    if (!season) {
      throw new NotFoundException(`Season not found`);
    }

    const validTransitions: Record<SeasonStatus, SeasonStatus[]> = {
      [SeasonStatus.UPCOMING]: [SeasonStatus.REGISTRATION_OPEN, SeasonStatus.ARCHIVED],
      [SeasonStatus.REGISTRATION_OPEN]: [SeasonStatus.REGISTRATION_CLOSED, SeasonStatus.ACTIVE, SeasonStatus.ARCHIVED],
      [SeasonStatus.REGISTRATION_CLOSED]: [SeasonStatus.ACTIVE, SeasonStatus.ARCHIVED],
      [SeasonStatus.ACTIVE]: [SeasonStatus.IN_PROGRESS, SeasonStatus.ARCHIVED],
      [SeasonStatus.IN_PROGRESS]: [SeasonStatus.COMPLETED, SeasonStatus.ARCHIVED],
      [SeasonStatus.COMPLETED]: [SeasonStatus.ARCHIVED],
      [SeasonStatus.ARCHIVED]: [],
    };

    const currentStatus = season.status;
    if (!validTransitions[currentStatus]?.includes(newStatus as SeasonStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private isArchival(dto: UpdateSeasonDTO): boolean {
    return dto && dto.$set && dto.$set['archive.isArchived'] === true;
  }
}