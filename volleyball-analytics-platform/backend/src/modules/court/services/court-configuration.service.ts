import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CourtConfiguration, CourtConfigurationDocument } from '../schemas/court-configuration.schema';
import { CreateCourtConfigurationDTO, UpdateCourtConfigurationDTO, CourtConfigurationSearchDTO } from '../dto/court-configuration.dto';
import { CourtConfigurationRepository } from '../repositories/court-configuration.repository';
import { CourtValidator } from '../validators/court.validator';
import { CompetitionService } from '../../competition/services/competition.service';
import { CourtService } from './court.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CourtConfigurationService {
  constructor(
    private readonly courtConfigRepository: CourtConfigurationRepository,
    private readonly courtValidator: CourtValidator,
    @Inject(forwardRef(() => CompetitionService))
    private readonly competitionService: CompetitionService,
    @Inject(forwardRef(() => CourtService))
    private readonly courtService: CourtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCourtConfigurationDTO): Promise<any> {
    await this.courtValidator.validateCreateCourtConfiguration(dto);

    const competition = await this.competitionService.findById(dto.competitionId);
    if (!competition.isActive) {
      throw new BadRequestException('Competition is not active');
    }

    // Check for duplicate name in same competition
    const existing = await this.courtConfigRepository.findByNameAndCompetition(dto.name, dto.competitionId);
    if (existing) {
      throw new ConflictException(`Configuration with name '${dto.name}' already exists in this competition`);
    }

    const config = new this.courtConfigModel({
      ...dto,
      competitionId: new Types.ObjectId(dto.competitionId),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await config.save();

    this.eventEmitter.emit('courtConfiguration.created', {
      configurationId: saved.configurationId,
      competitionId: dto.competitionId,
      createdBy: dto.createdBy,
    });

    return this.toResponseDTO(saved);
  }

  async findById(id: string): Promise<any> {
    const config = await this.courtConfigRepository.findById(id);
    if (!config) {
      throw new NotFoundException(`Court configuration with ID ${id} not found`);
    }
    return this.toResponseDTO(config);
  }

  async findByConfigId(configId: string): Promise<any> {
    const config = await this.courtConfigRepository.findByConfigId(configId);
    if (!config) {
      throw new NotFoundException(`Court configuration with ID ${configId} not found`);
    }
    return this.toResponseDTO(config);
  }

  async search(searchDto: CourtConfigurationSearchDTO): Promise<any> {
    return this.courtConfigRepository.search(searchDto);
  }

  async update(id: string, dto: UpdateCourtConfigurationDTO): Promise<any> {
    await this.courtValidator.validateUpdateCourtConfiguration(id, dto);
    const updated = await this.courtConfigRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Court configuration with ID ${id} not found`);
    }
    this.eventEmitter.emit('courtConfiguration.updated', {
      configurationId: id,
      changes: dto,
    });
    return this.toResponseDTO(updated);
  }

  async activate(id: string): Promise<any> {
    const config = await this.courtConfigRepository.findById(id);
    if (!config) {
      throw new NotFoundException(`Court configuration with ID ${id} not found`);
    }

    if (config.status !== 'draft') {
      throw new BadRequestException('Only draft configurations can be activated');
    }

    // Validate configuration before activation
    await this.validateConfiguration(config);

    const updated = await this.courtConfigRepository.update(id, { status: 'active' });
    this.eventEmitter.emit('courtConfiguration.activated', {
      configurationId: config.configurationId,
    });
    return this.toResponseDTO(updated);
  }

  async archive(id: string, archivedBy: string, reason?: string): Promise<void> {
    const config = await this.courtConfigRepository.findById(id);
    if (!config) {
      throw new NotFoundException(`Court configuration with ID ${id} not found`);
    }

    if (config.status === 'archived') {
      throw new ConflictException('Configuration is already archived');
    }

    await this.courtConfigRepository.archive(id, archivedBy, reason);
    this.eventEmitter.emit('courtConfiguration.archived', {
      configurationId: id,
      archivedBy,
      reason,
    });
  }

  async restore(id: string): Promise<any> {
    const config = await this.courtConfigRepository.findById(id);
    if (!config) {
      throw new NotFoundException(`Court configuration with ID ${id} not found`);
    }

    if (config.status !== 'archived') {
      throw new BadRequestException('Only archived configurations can be restored');
    }

    const restored = await this.courtConfigRepository.restore(id);
    this.eventEmitter.emit('courtConfiguration.restored', {
      configurationId: id,
    });
    return this.toResponseDTO(restored);
  }

  async validateConfiguration(config: any): Promise<void> {
    // Validate dimensions
    if (config.dimensions.length < 18 || config.dimensions.length > 20) {
      throw new BadRequestException('Court length must be between 18 and 20 meters');
    }
    if (config.dimensions.width < 9 || config.dimensions.width > 10) {
      throw new BadRequestException('Court width must be between 9 and 10 meters');
    }

    // Validate net height
    if (config.net.height < 2.0 || config.net.height > 3.0) {
      throw new BadRequestException('Net height must be between 2.0 and 3.0 meters');
    }

    // Validate team sizes
    if (config.teamSize && (config.teamSize < 2 || config.teamSize > 6)) {
      throw new BadRequestException('Team size must be between 2 and 6 players');
    }

    // Validate set rules
    if (config.setsToWin && (config.setsToWin < 1 || config.setsToWin > 5)) {
      throw new BadRequestException('Sets to win must be between 1 and 5');
    }
  }

  async cloneConfiguration(configId: string, newName: string, newCompetitionId: string): Promise<any> {
    const original = await this.courtConfigRepository.findById(configId);
    if (!original) {
      throw new NotFoundException(`Court configuration with ID ${configId} not found`);
    }

    const clone = new this.courtConfigModel({
      ...original.toObject(),
      _id: new Types.ObjectId(),
      configurationId: `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      competitionId: new Types.ObjectId(newCompetitionId),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.courtConfigModel.save();
    this.eventEmitter.emit('courtConfiguration.cloned', {
      originalId: configId,
      clonedId: saved.configurationId,
    });

    return this.toResponseDTO(saved);
  }

  private toResponseDTO(config: any): any {
    return {
      id: config._id.toString(),
      configurationId: config.configurationId,
      name: config.name,
      description: config.description,
      type: config.type,
      format: config.format,
      status: config.status,
      competitionId: config.competitionId?.toString(),
      rules: config.rules,
      schedule: config.schedule,
      metadata: config.metadata,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}