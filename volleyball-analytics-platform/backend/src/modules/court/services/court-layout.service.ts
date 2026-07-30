import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CourtLayout, CourtLayoutDocument } from '../schemas/court-layout.schema';
import { CreateCourtLayoutDTO, UpdateCourtLayoutDTO, CourtLayoutSearchDTO } from '../dto/court-layout.dto';
import { CourtLayoutRepository } from '../repositories/court-layout.repository';
import { CourtLayoutValidator } from '../validators/court-layout.validator';
import { CourtService } from './court.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CourtLayoutService {
  constructor(
    private readonly courtLayoutRepository: CourtLayoutRepository,
    private readonly courtLayoutValidator: CourtLayoutValidator,
    @Inject(forwardRef(() => CourtService))
    private readonly courtService: CourtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCourtLayoutDTO): Promise<any> {
    await this.courtLayoutValidator.validateCreateCourtLayout(dto);

    // Verify venue exists and is operational
    // This would call venue service

    // Check for duplicate name in same venue
    const existing = await this.courtLayoutRepository.findByNameAndVenue(dto.name, dto.venueId);
    if (existing) {
      throw new ConflictException(`Layout with name '${dto.name}' already exists in this venue`);
    }

    const layout = new this.courtLayoutModel({
      ...dto,
      venueId: new Types.ObjectId(dto.venueId),
      phaseId: dto.phaseId ? new Types.ObjectId(dto.phaseId) : undefined,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await layout.save();

    this.eventEmitter.emit('courtLayout.created', {
      layoutId: saved.layoutId,
      venueId: dto.venueId,
      phaseId: dto.phaseId,
      createdBy: dto.createdBy,
    });

    return this.toResponseDTO(saved);
  }

  async findById(id: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }
    return this.toResponseDTO(layout);
  }

  async findByLayoutId(layoutId: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findByLayoutId(layoutId);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${layoutId} not found`);
    }
    return this.toResponseDTO(layout);
  }

  async search(searchDto: CourtLayoutSearchDTO): Promise<any> {
    return this.courtLayoutRepository.search(searchDto);
  }

  async update(id: string, dto: UpdateCourtLayoutDTO): Promise<any> {
    await this.courtLayoutValidator.validateUpdateCourtLayout(id, dto);
    const updated = await this.courtLayoutRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }
    this.eventEmitter.emit('courtLayout.updated', {
      layoutId: updated.layoutId,
      changes: dto,
    });
    return this.toResponseDTO(updated);
  }

  async activate(id: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status !== 'draft') {
      throw new BadRequestException('Only draft layouts can be activated');
    }

    const updated = await this.courtLayoutRepository.update(id, { status: 'active' });
    this.eventEmitter.emit('courtLayout.activated', {
      layoutId: layout.layoutId,
    });
    return this.toResponseDTO(updated);
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<void> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status === 'archived') {
      throw new ConflictException('Layout is already archived');
    }

    await this.courtLayoutRepository.archive(id, archivedBy, reason);
    this.eventEmitter.emit('courtLayout.archived', {
      layoutId: layout.layoutId,
      archivedBy,
      reason,
    });
  }

  async restore(id: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status !== 'archived') {
      throw new ConflictException('Only archived layouts can be restored');
    }

    const restored = await this.courtLayoutRepository.restore(id);
    this.eventEmitter.emit('courtLayout.restored', {
      layoutId: layout.layoutId,
    });
    return this.toResponseDTO(restored);
  }

  async activateLayout(id: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status !== 'draft') {
      throw new BadRequestException('Only draft layouts can be activated');
    }

    const updated = await this.courtLayoutRepository.update(id, { status: 'active' });
    this.eventEmitter.emit('courtLayout.activated', {
      layoutId: layout.layoutId,
    });
    return this.toResponseDTO(updated);
  }

  async archiveLayout(id: string, archivedBy: string, reason?: string): Promise<void> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status === 'archived') {
      throw new ConflictException('Layout is already archived');
    }

    await this.courtLayoutRepository.archive(id, archivedBy, reason);
    this.eventEmitter.emit('courtLayout.archived', {
      layoutId: layout.layoutId,
      archivedBy,
      reason,
    });
  }

  async restoreLayout(id: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(id);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${id} not found`);
    }

    if (layout.status !== 'archived') {
      throw new ConflictException('Only archived layouts can be restored');
    }

    const restored = await this.courtLayoutRepository.restore(id);
    this.eventEmitter.emit('courtLayout.restored', {
      layoutId: layout.layoutId,
    });
    return this.toResponseDTO(restored);
  }

  async addTeam(layoutId: string, teamId: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(layoutId);
    if (!layout) {
      throw new NotFoundException(`Court layout with ID ${layoutId} not found`);
    }

    if (layout.teamIds.some(t => t.toString() === teamId)) {
      throw new ConflictException('Team already assigned to this layout');
    }

    const updated = await this.courtLayoutRepository.update(layoutId, {
      $addToSet: { teamIds: new Types.ObjectId(teamId) },
    });
    return this.toResponseDTO(updated);
  }

  async removeTeam(layoutId: string, teamId: string): Promise<any> {
    const updated = await this.courtLayoutRepository.update(layoutId, {
      $pull: { teamIds: new Types.ObjectId(teamId) },
    });
    if (!updated) throw new NotFoundException(`Layout or team not found`);
    return this.toResponseDTO(updated);
  }

  async addMatch(layoutId: string, matchId: string): Promise<any> {
    const updated = await this.courtLayoutRepository.update(layoutId, {
      $addToSet: { matchIds: new Types.ObjectId(matchId) },
    });
    if (!updated) throw new NotFoundException(`Layout not found`);
    return this.toResponseDTO(updated);
  }

  async removeMatch(layoutId: string, matchId: string): Promise<any> {
    const updated = await this.courtLayoutRepository.update(layoutId, {
      $pull: { matchIds: new Types.ObjectId(matchId) },
    });
    if (!updated) throw new NotFoundException(`Layout not found`);
    return this.toResponseDTO(updated);
  }

  async getTeams(layoutId: string): Promise<any[]> {
    const layout = await this.courtLayoutRepository.findById(layoutId);
    if (!layout) throw new NotFoundException(`Layout not found`);
    return layout.teamIds;
  }

  async getMatches(layoutId: string): Promise<any[]> {
    const layout = await this.courtLayoutRepository.findById(layoutId);
    if (!layout) throw new NotFoundException(`Layout not found`);
    return layout.matchIds;
  }

  async getLayoutStatistics(layoutId: string): Promise<any> {
    const layout = await this.courtLayoutRepository.findById(layoutId);
    if (!layout) throw new NotFoundException(`Layout not found`);

    return {
      layoutId: layout.layoutId,
      name: layout.name,
      teamCount: layout.teamIds?.length || 0,
      matchCount: layout.matchIds?.length || 0,
      status: layout.status,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
    };
  }

  private toResponseDTO(layout: any): any {
    return {
      id: layout._id.toString(),
      layoutId: layout.layoutId,
      name: layout.name,
      code: layout.code,
      venueId: layout.venueId?.toString(),
      phaseId: layout.phaseId?.toString(),
      type: layout.type,
      status: layout.status,
      dimensions: layout.dimensions,
      net: layout.net,
      equipment: layout.equipment,
      markings: layout.markings,
      teamIds: layout.teamIds?.map(t => t.toString()) || [],
      matchIds: layout.matchIds?.map(m => m.toString()) || [],
      status: layout.status,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
    };
  }
}