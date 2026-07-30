import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Standings, StandingsDocument, StandingType, StandingEntry } from '../schemas/standings.schema';

@Injectable()
export class StandingsValidator {
  constructor(
    @InjectModel('Standings') private readonly standingsModel: Model<StandingsDocument>,
  ) {}

  async validateCreate(dto: any): Promise<void> {
    // Validate competition exists
    // This would call CompetitionService

    // Validate entries
    if (!dto.entries || !Array.isArray(dto.entries) || dto.entries.length === 0) {
      throw new BadRequestException('Standings must have at least one entry');
    }

    // Validate each entry
    for (const entry of dto.entries) {
      if (!entry.teamId || !entry.teamName || !entry.teamShortName) {
        throw new BadRequestException('Each entry must have teamId, teamName, and teamShortName');
      }
    }

    // Validate tiebreak rules
    if (dto.tiebreakRules && dto.tiebreakRules.length > 0) {
      for (const rule of dto.tiebreakRules) {
        if (!rule.criteria || !rule.direction) {
          throw new BadRequestException('Each tiebreak rule must have criteria and direction');
        }
      }
    }
  }

  async validateUpdate(standingsId: string, dto: any): Promise<void> {
    const standings = await this.standingsModel.findById(standingsId).exec();
    if (!standings) {
      throw new NotFoundException(`Standings with ID ${standingsId} not found`);
    }

    if (standings.isFinal) {
      throw new BadRequestException('Cannot update finalized standings');
    }

    // Validate entries if being updated
    if (dto.entries) {
      for (const entry of dto.entries) {
        if (!entry.teamId || !entry.teamName || !entry.teamShortName) {
          throw new BadRequestException('Each entry must have teamId, teamName, and teamShortName');
        }
      }

      // Check for duplicate teams
      const teamIds = dto.entries.map((e: any) => e.teamId);
      if (new Set(teamIds).size !== teamIds.length) {
        throw new BadRequestException('Duplicate teams in standings entries');
      }
    }
  }

  async validateFinalize(standingsId: string): Promise<void> {
    const standings = await this.standingsModel.findById(standingsId).exec();
    if (!standings) {
      throw new NotFoundException(`Standings with ID ${standingsId} not found`);
    }

    if (standings.isFinal) {
      throw new ConflictException('Standings are already finalized');
    }
  }
}