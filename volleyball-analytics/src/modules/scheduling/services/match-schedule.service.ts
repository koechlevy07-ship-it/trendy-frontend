import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchSchedule, MatchScheduleDocument } from '../schemas/match-schedule.schema';
import { ScheduleStatus } from '../schemas/match-schedule.schema';
import { MatchScheduleRepository } from '../repositories/match-schedule.repository';
import { BusinessValidator } from '../validators/business.validator';
import { EventPublisher } from '../../shared/events/event.publisher';

@Injectable()
export class MatchScheduleService {
  constructor(
    @InjectModel('MatchSchedule') private readonly matchScheduleModel: Model<any>,
    private readonly matchScheduleRepository: MatchScheduleRepository,
    private readonly businessValidator: BusinessValidator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(createMatchScheduleDto: any): Promise<any> {
    // Validate business rules
    await this.businessValidator.validateMatchScheduling(createMatchScheduleDto);

    const matchSchedule = new this.matchScheduleModel({
      ...createMatchScheduleDto,
      tournamentId: new Types.ObjectId(createMatchScheduleDto.tournamentId),
      venueId: new Types.ObjectId(createMatchScheduleDto.venueId),
      courtId: new Types.ObjectId(createMatchScheduleDto.courtId),
      homeTeam: {
        ...createMatchScheduleDto.homeTeam,
        teamId: new Types.ObjectId(createMatchScheduleDto.homeTeam.teamId),
        rosterId: createMatchScheduleDto.homeTeam.rosterId ? new Types.ObjectId(createMatchScheduleDto.homeTeam.rosterId) : undefined,
      },
      awayTeam: {
        ...createMatchScheduleDto.awayTeam,
        teamId: new Types.ObjectId(createMatchScheduleDto.awayTeam.teamId),
        rosterId: createMatchScheduleDto.awayTeam.rosterId ? new Types.ObjectId(createMatchScheduleDto.awayTeam.rosterId) : undefined,
      },
      assignedOfficials: createMatchScheduleDto.assignedOfficials?.map(off => ({
        ...off,
        officialId: new Types.ObjectId(off.officialId),
        confirmedBy: off.confirmedBy ? new Types.ObjectId(off.confirmedBy) : undefined,
      })) || [],
      assignedCameras: createMatchScheduleDto.assignedCameras?.map(cam => ({
        ...cam,
        cameraId: new Types.ObjectId(cam.cameraId),
        calibrationProfileId: cam.calibrationProfileId ? new Types.ObjectId(cam.calibrationProfileId) : undefined,
        assignedCoverageZones: cam.assignedCoverageZones?.map(id => new Types.ObjectId(id)) || [],
        assignedBy: new Types.ObjectId(cam.assignedBy),
      })) || [],
      assignedCoverageZones: createMatchScheduleDto.assignedCoverageZones?.map(z => ({
        ...z,
        zoneId: new Types.ObjectId(z.zoneId),
        assignedCameras: z.assignedCameras?.map(id => new Types.ObjectId(id)) || [],
      })) || [],
      constraints: createMatchScheduleDto.constraints || [],
      scheduledAt: new Date(createMatchScheduleDto.scheduledAt),
      duration: createMatchScheduleDto.duration,
      metadata: createMatchScheduleDto.metadata || {},
      createdBy: new Types.ObjectId(createMatchScheduleDto.createdBy),
    }) as any;

    const saved = await matchSchedule.save();

    await this.eventPublisher.publish('match.schedule.created', {
      scheduleId: saved._id.toString(),
      scheduleId: saved.scheduleId,
      tournamentId: saved.tournamentId.toString(),
      matchId: saved.matchId,
      scheduledAt: saved.scheduledAt,
      venueId: saved.venueId.toString(),
      courtId: saved.courtId.toString(),
    });

    return saved;
  }

  async findAll(searchDto: any): Promise<any> {
    return this.matchScheduleRepository.search(searchDto);
  }

  async findById(id: string): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }
    return schedule;
  }

  async findByScheduleId(scheduleId: string): Promise<any> {
    const schedule = await this.matchScheduleRepository.findByScheduleId(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }
    return schedule;
  }

  async findByTournament(tournamentId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByTournament(tournamentId, pagination);
  }

  async findByVenue(venueId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByVenue(venueId, pagination);
  }

  async findByCourt(courtId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByCourt(courtId, pagination);
  }

  async findByTeam(teamId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByTeam(teamId, pagination);
  }

  async findByStatus(status: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByStatus(status, pagination);
  }

  async findByDateRange(startDate: Date, endDate: Date, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.matchScheduleRepository.findByDateRange(startDate, endDate, pagination);
  }

  async update(id: string, updateMatchScheduleDto: any): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    // Validate updates
    if (updateMatchScheduleDto.scheduledAt || updateMatchScheduleDto.venueId || updateMatchScheduleDto.courtId) {
      await this.businessValidator.validateMatchScheduling({
        ...schedule.toObject(),
        ...updateMatchScheduleDto,
      });
    }

    const updated = await this.matchScheduleRepository.update(id, {
      ...updateMatchScheduleDto,
      scheduledAt: updateMatchScheduleDto.scheduledAt ? new Date(updateMatchScheduleDto.scheduledAt) : undefined,
      venueId: updateMatchScheduleDto.venueId ? new Types.ObjectId(updateMatchScheduleDto.venueId) : undefined,
      courtId: updateMatchScheduleDto.courtId ? new Types.ObjectId(updateMatchScheduleDto.courtId) : undefined,
      duration: updateMatchScheduleDto.duration,
      assignedOfficials: updateMatchScheduleDto.assignedOfficials?.map(off => ({
        ...off,
        officialId: new Types.ObjectId(off.officialId),
        confirmedBy: off.confirmedBy ? new Types.ObjectId(off.confirmedBy) : undefined,
      })) || [],
      assignedCameras: updateMatchScheduleDto.assignedCameras?.map(cam => ({
        ...cam,
        cameraId: new Types.ObjectId(cam.cameraId),
        calibrationProfileId: cam.calibrationProfileId ? new Types.ObjectId(cam.calibrationProfileId) : undefined,
        assignedCoverageZones: cam.assignedCoverageZones?.map(id => new Types.ObjectId(id)) || [],
      })) || [],
      assignedCoverageZones: updateMatchScheduleDto.assignedCoverageZones?.map(z => ({
        ...z,
        zoneId: new Types.ObjectId(z.zoneId),
        assignedCameras: z.assignedCameras?.map(id => new Types.ObjectId(id)) || [],
      })) || [],
      constraints: updateMatchScheduleDto.constraints || [],
    });

    await this.eventPublisher.publish('match.schedule.updated', {
      scheduleId: updated._id.toString(),
      scheduleId: updated.scheduleId,
      changes: updateMatchScheduleDto,
    });

    return updated;
  }

  async updateStatus(id: string, status: string, userId?: string): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    // Validate state transition
    this.validateStateTransition(schedule.status, status);

    const updateData: any = { status };
    if (status === 'in_progress') {
      updateData.actualStartAt = new Date();
    } else if (status === 'completed') {
      updateData.actualEndAt = new Date();
    }

    const updated = await this.matchScheduleRepository.updateStatus(id, status, userId);

    await this.eventPublisher.publish('match.schedule.status.changed', {
      scheduleId: updated._id.toString(),
      scheduleId: updated.scheduleId,
      oldStatus: schedule.status,
      newStatus: status,
    });

    return updated;
  }

  private validateStateTransition(from: string, to: string): void {
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_confirmation', 'archived', 'cancelled'],
      pending_confirmation: ['confirmed', 'draft', 'cancelled'],
      confirmed: ['scheduled', 'draft', 'cancelled'],
      scheduled: ['in_progress', 'confirmed', 'postponed', 'cancelled'],
      in_progress: ['completed', 'postponed'],
      completed: ['archived'],
      postponed: ['scheduled', 'cancelled'],
      rescheduled: ['scheduled', 'cancelled'],
      cancelled: ['draft', 'archived'],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid state transition from ${from} to ${to}`);
    }
  }

  async confirm(id: string): Promise<any> {
    return this.updateStatus(id, 'confirmed');
  }

  async schedule(id: string): Promise<any> {
    return this.updateStatus(id, 'scheduled');
  }

  async start(id: string): Promise<any> {
    return this.updateStatus(id, 'in_progress');
  }

  async complete(id: string, result: any): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    const updated = await this.matchScheduleRepository.update(id, {
      status: 'completed',
      actualEndAt: new Date(),
      actualDuration: Math.floor((Date.now() - new Date(schedule.actualStartAt || schedule.scheduledAt).getTime()) / 60000),
      result: result,
    });

    await this.eventPublisher.publish('match.schedule.completed', {
      scheduleId: schedule._id.toString(),
      scheduleId: schedule.scheduleId,
      result,
    });

    return updated;
  }

  async postpone(id: string, newDate: Date, reason: string): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    await this.businessValidator.validateMatchScheduling({
      ...schedule.toObject(),
      scheduledAt: newDate,
      postponeReason: reason,
    });

    const updated = await this.matchScheduleRepository.update(id, {
      status: 'postponed',
      scheduledAt: newDate,
      postponeReason: reason,
      postponeCount: (schedule.postponeCount || 0) + 1,
    });

    await this.eventPublisher.publish('match.schedule.postponed', {
      scheduleId: schedule._id.toString(),
      scheduleId: schedule.scheduleId,
      newDate,
      reason,
    });

    return updated;
  }

  async cancel(id: string, reason: string): Promise<any> {
    return this.updateStatus(id, 'cancelled');
  }

  async reschedule(id: string, newDate: Date, reason: string): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    await this.businessValidator.validateMatchScheduling({
      ...schedule.toObject(),
      scheduledAt: newDate,
    });

    const updated = await this.matchScheduleRepository.update(id, {
      status: 'rescheduled',
      scheduledAt: newDate,
      rescheduleReason: reason,
      rescheduleCount: (schedule.rescheduleCount || 0) + 1,
    });

    await this.eventPublisher.publish('match.schedule.rescheduled', {
      scheduleId: schedule._id.toString(),
      scheduleId: schedule.scheduleId,
      newDate,
      reason,
    });

    return updated;
  }

  async addOfficial(id: string, official: any): Promise<any> {
    const schedule = await this.matchScheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    const updated = await this.matchScheduleRepository.update(id, {
      $addToSet: {
        assignedOfficials: {
          ...official,
          officialId: new Types.ObjectId(official.officialId),
        },
      },
    });

    return updated;
  }

  async removeOfficial(id: string, officialId: string): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $pull: { assignedOfficials: { officialId: new Types.ObjectId(officialId) } },
    });
  }

  async assignCamera(id: string, cameraId: string, coverageZoneIds?: string[]): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $addToSet: {
        assignedCameras: new Types.ObjectId(cameraId),
        assignedCoverageZones: { $each: coverageZoneIds?.map(id => new Types.ObjectId(id)) || [] },
      },
    });
  }

  async removeCamera(id: string, cameraId: string): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $pull: { assignedCameras: { cameraId: new Types.ObjectId(cameraId) } },
    });
  }

  async assignCoverageZone(id: string, zoneId: string): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $addToSet: { assignedCoverageZones: new Types.ObjectId(zoneId) },
    });
  }

  async addConstraint(id: string, constraint: any): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $addToSet: { constraints: constraint },
    });
  }

  async removeConstraint(id: string, constraintId: string): Promise<any> {
    return this.matchScheduleRepository.update(id, {
      $pull: { constraints: { constraintId } },
    });
  }

  async findConflicts(scheduleId: string): Promise<any[]> {
    const schedule = await this.matchScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Match schedule not found');
    }

    const conflicts = await this.matchScheduleRepository.findConflictingMatches(
      schedule.courtId.toString(),
      schedule.scheduledAt,
      new Date(schedule.scheduledAt.getTime() + schedule.duration * 60000),
      scheduleId
    );

    return conflicts;
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<number> {
    return this.matchScheduleRepository.bulkUpdateStatus(ids, status);
  }

  async getScheduleStats(tournamentId?: string): Promise<any> {
    return this.matchScheduleRepository.getScheduleStats(tournamentId);
  }

  async findOverdueMatches(): Promise<any[]> {
    return this.matchScheduleRepository.findOverdueMatches();
  }

  async findUpcomingMatches(days: number = 7): Promise<any[]> {
    return this.matchScheduleRepository.findUpcomingMatches(days);
  }

  async findMatchesNeedingConfirmation(): Promise<any[]> {
    return this.matchScheduleRepository.findMatchesNeedingConfirmation();
  }
}