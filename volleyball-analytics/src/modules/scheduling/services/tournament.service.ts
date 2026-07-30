import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament, TournamentDocument } from '../schemas/tournament.schema';
import { CreateTournamentDto, UpdateTournamentDto, TournamentSearchDto } from '../dto/tournament.dto';
import { TournamentRepository } from '../repositories/tournament.repository';
import { BusinessValidator } from '../validators/business.validator';
import { EventPublisher } from '../../shared/events/event.publisher';

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel('Tournament') private readonly tournamentModel: Model<any>,
    private readonly tournamentRepository: TournamentRepository,
    private readonly businessValidator: BusinessValidator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<any> {
    await this.businessValidator.validateTournamentUniqueness(
      createTournamentDto.tournamentId,
      createTournamentDto.organizationId,
      createTournamentDto.name
    );

    const tournament = await this.tournamentRepository.create(createTournamentDto);

    await this.eventPublisher.publish('tournament.created', {
      tournamentId: tournament._id.toString(),
      tournamentId: tournament.tournamentId,
      name: tournament.name,
      organizationId: tournament.organizationId.toString(),
    });

    return tournament;
  }

  async findAll(searchDto: TournamentSearchDto): Promise<any> {
    return this.tournamentRepository.search(searchDto);
  }

  async findById(id: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async findByTournamentId(tournamentId: string): Promise<any> {
    const tournament = await this.tournamentRepository.findByTournamentId(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (updateTournamentDto.name && updateTournamentDto.name !== tournament.name) {
      await this.businessValidator.validateTournamentUniqueness(
        tournament.tournamentId,
        tournament.organizationId.toString(),
        updateTournamentDto.name,
        id
      );
    }

    const updated = await this.tournamentRepository.update(id, updateTournamentDto);

    await this.eventPublisher.publish('tournament.updated', {
      tournamentId: updated._id.toString(),
      tournamentId: updated.tournamentId,
      changes: updateTournamentDto,
    });

    return updated;
  }

  async activate(id: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status === 'active') {
      throw new BadRequestException('Tournament is already active');
    }

    // Validate tournament is ready for activation
    await this.businessValidator.validateTournamentEligibility(id);

    const updated = await this.tournamentRepository.updateStatus(id, 'active', 'system');

    await this.eventPublisher.publish('tournament.activated', {
      tournamentId: updated._id.toString(),
      tournamentId: updated.tournamentId,
      activatedAt: new Date(),
    });

    return updated;
  }

  async pause(id: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== 'active') {
      throw new BadRequestException('Tournament is not active');
    }

    const updated = await this.tournamentRepository.updateStatus(id, 'paused', 'system');

    await this.eventPublisher.publish('tournament.paused', {
      tournamentId: updated._id.toString(),
      tournamentId: updated.tournamentId,
    });

    return updated;
  }

  async archive(id: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status === 'active') {
      throw new BadRequestException('Cannot archive an active tournament');
    }

    await this.tournamentRepository.updateStatus(id, 'archived', 'system');

    await this.eventPublisher.publish('tournament.archived', {
      tournamentId: tournament._id.toString(),
      tournamentId: tournament.tournamentId,
    });

    return { success: true, message: 'Tournament archived successfully' };
  }

  async cancel(id: string, reason: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status === 'active') {
      throw new BadRequestException('Cannot cancel an active tournament');
    }

    const updated = await this.tournamentRepository.updateStatus(id, 'cancelled', 'system');

    await this.eventPublisher.publish('tournament.cancelled', {
      tournamentId: tournament._id.toString(),
      tournamentId: tournament.tournamentId,
      reason,
    });

    return updated;
  }

  async restore(id: string): Promise<any> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== 'archived' && tournament.status !== 'cancelled') {
      throw new BadRequestException('Tournament is not archived or cancelled');
    }

    const updated = await this.tournamentRepository.updateStatus(id, 'draft', 'system');

    await this.eventPublisher.publish('tournament.restored', {
      tournamentId: updated._id.toString(),
      tournamentId: updated.tournamentId,
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    await this.tournamentRepository.delete(id);
  }

  async getTournamentsByOrganization(organizationId: string, page = 1, limit = 20): Promise<any> {
    return this.tournamentRepository.findByOrganization(organizationId, { page, limit });
  }

  async getTournamentStats(organizationId: string): Promise<any> {
    return this.tournamentRepository.getTournamentStats(organizationId);
  }

  async addBracket(tournamentId: string, bracketId: string): Promise<any> {
    return this.tournamentRepository.addBracket(id, bracketId);
  }

  async removeBracket(tournamentId: string, bracketId: string): Promise<any> {
    return this.tournamentRepository.removeBracket(tournamentId, bracketId);
  }
}