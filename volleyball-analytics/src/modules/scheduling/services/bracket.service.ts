import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bracket, BracketDocument } from '../schemas/bracket.schema';
import { BracketRepository } from '../repositories/bracket.repository';
import { EventPublisher } from '../../shared/events/event.publisher';

@Injectable()
export class BracketService {
  constructor(
    @InjectModel('Bracket') private readonly bracketModel: Model<any>,
    private readonly bracketRepository: BracketRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(createBracketDto: any): Promise<any> {
    const bracket = await this.bracketRepository.create(createBracketDto);

    await this.eventPublisher.publish('bracket.created', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      tournamentId: bracket.tournamentId.toString(),
      type: bracket.type,
    });

    return bracket;
  }

  async findById(id: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }
    return bracket;
  }

  async findByTournament(tournamentId: string): Promise<any[]> {
    return this.bracketRepository.findByTournament(tournamentId);
  }

  async findByType(type: string, tournamentId?: string): Promise<any[]> {
    if (tournamentId) {
      return this.bracketRepository.findByType(type, tournamentId);
    }
    return this.bracketRepository.findByType(type);
  }

  async findByStatus(status: string, tournamentId?: string): Promise<any[]> {
    if (tournamentId) {
      return this.bracketRepository.findByStatus(status, tournamentId);
    }
    return this.bracketRepository.findByStatus(status);
  }

  async update(id: string, updateBracketDto: any): Promise<any> {
    const bracket = await this.bracketRepository.findById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    const updated = await this.bracketRepository.update(id, updateBracketDto);

    await this.eventPublisher.publish('bracket.updated', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      changes: updateBracketDto,
    });

    return updated;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    const validTransitions: Record<string, string[]> = {
      draft: ['generating', 'ready', 'archived'],
      generating: ['ready', 'draft'],
      ready: ['in_progress', 'archived'],
      in_progress: ['completed', 'paused'],
      completed: ['archived'],
      paused: ['in_progress', 'archived'],
    };

    if (!validTransitions[bracket.status]?.includes(status)) {
      throw new BadRequestException(`Invalid status transition from ${bracket.status} to ${status}`);
    }

    const updated = await this.bracketRepository.update(id, { status });

    await this.eventPublisher.publish('bracket.status.changed', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      oldStatus: bracket.status,
      newStatus: status,
    });

    return updated;
  }

  async generate(bracketId: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    if (bracket.status !== 'draft') {
      throw new BadRequestException('Bracket must be in draft status to generate');
    }

    const updated = await this.bracketRepository.update(bracketId, { status: 'generating' });

    // Generate bracket based on type
    await this.generateBracket(bracketId);

    const generated = await this.bracketRepository.update(bracketId, {
      status: 'ready',
      currentRound: 1,
    });

    await this.eventPublisher.publish('bracket.generated', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
    });

    return generated;
  }

  private async generateBracket(bracketId: string): Promise<void> {
    const bracket = await this.bracketRepository.findById(bracketId);
    // Implementation would depend on bracket type
    // This is a placeholder for the actual bracket generation logic
  }

  async advanceRound(bracketId: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    if (bracket.status !== 'in_progress') {
      throw new BadRequestException('Bracket is not in progress');
    }

    if (bracket.currentRound >= bracket.settings.totalRounds) {
      throw new BadRequestException('All rounds completed');
    }

    const advanced = await this.bracketRepository.advanceRound(bracketId);

    await this.eventPublisher.publish('bracket.round.advanced', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      newRound: advanced.currentRound,
    });

    // Check if bracket is complete
    if (advanced.currentRound > bracket.settings.totalRounds) {
      await this.completeBracket(bracketId);
    }

    return advanced;
  }

  async completeBracket(bracketId: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    // Find champion and runner-up
    const finalNode = bracket.nodes.find(n => n.round === bracket.settings.totalRounds && n.status === 'completed');
    if (!finalNode) {
      throw new BadRequestException('Final match not completed');
    }

    const championId = finalNode.winnerId;
    const runnerUpId = finalNode.loserId;
    const thirdPlaceId = null; // Would need to determine from consolation bracket

    const completed = await this.bracketRepository.completeBracket(
      bracketId,
      championId.toString(),
      runnerUpId.toString()
    );

    await this.eventPublisher.publish('bracket.completed', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      championId: championId.toString(),
      runnerUpId: runnerUpId.toString(),
    });

    return completed;
  }

  async updateNodeStatus(
    bracketId: string,
    nodeId: string,
    status: string,
    winnerId?: string,
    loserId?: string
  ): Promise<any> {
    const bracket = await this.bracketRepository.findById(bracketId);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    const updated = await this.bracketRepository.updateNodeStatus(bracketId, nodeId, status, winnerId, loserId);

    // If match completed, advance to next round if needed
    if (status === 'completed' && winnerId) {
      await this.propagateWinner(bracketId, nodeId, winnerId);
    }

    await this.eventPublisher.publish('bracket.node.updated', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
      nodeId,
      status,
      winnerId,
      loserId,
    });

    return updated;
  }

  private async propagateWinner(bracketId: string, nodeId: string, winnerId: string): Promise<void> {
    const bracket = await this.bracketRepository.findById(bracketId);
    const node = bracket.nodes.find(n => n.nodeId === nodeId);

    if (!node) return;

    // Find next node where this node's winner feeds
    const nextNode = bracket.nodes.find(n =>
      (n.homeTeamSource?.sourceType === 'winner' && n.homeTeamSource.matchId?.toString() === nodeId) ||
      (n.awayTeamSource?.sourceType === 'winner' && n.awayTeamSource.matchId?.toString() === nodeId)
    );

    if (nextNode) {
      await this.bracketRepository.updateNodeTeams(
        bracketId,
        nextNode.nodeId,
        nextNode.homeTeamSource.sourceType === 'winner' && nextNode.homeTeamSource.matchId?.toString() === nodeId
          ? { sourceType: 'fixed', sourceId: winnerId }
          : nextNode.homeTeamSource,
        nextNode.awayTeamSource.sourceType === 'winner' && nextNode.awayTeamSource.matchId?.toString() === nodeId
          ? { sourceType: 'fixed', sourceId: winnerId }
          : nextNode.awayTeamSource
      );
    }
  }

  async findByTournament(tournamentId: string): Promise<any[]> {
    return this.bracketRepository.findByTournament(tournamentId);
  }

  async getBracketStats(bracketId: string): Promise<any> {
    return this.bracketRepository.getBracketStats(bracketId);
  }

  async getBracketNodes(bracketId: string, round?: number): Promise<any[]> {
    return this.bracketRepository.getBracketNodes(bracketId, round);
  }

  async getNodesByTeam(bracketId: string, teamId: string): Promise<any[]> {
    return this.bracketRepository.getNodesByTeam(bracketId, teamId);
  }

  async findByMatch(bracketId: string, matchId: string): Promise<any> {
    return this.bracketRepository.findByMatch(bracketId, matchId);
  }

  async duplicateBracket(bracketId: string, newName: string, newTournamentId: string): Promise<any> {
    return this.bracketRepository.duplicateBracket(bracketId, newName, newTournamentId);
  }

  async getTournamentBracketProgress(tournamentId: string): Promise<any> {
    return this.bracketRepository.getTournamentBracketProgress(tournamentId);
  }

  async archive(id: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    const archived = await this.bracketRepository.archive(id);

    await this.eventPublisher.publish('bracket.archived', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
    });

    return archived;
  }

  async restore(id: string): Promise<any> {
    const bracket = await this.bracketRepository.findById(id);
    if (!bracket) {
      throw new NotFoundException('Bracket not found');
    }

    if (bracket.status !== 'archived') {
      throw new BadRequestException('Bracket is not archived');
    }

    const restored = await this.bracketRepository.updateStatus(id, 'draft');

    await this.eventPublisher.publish('bracket.restored', {
      bracketId: bracket._id.toString(),
      bracketId: bracket.bracketId,
    });

    return restored;
  }
}