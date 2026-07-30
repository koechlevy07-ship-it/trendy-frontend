import { Injectable, Inject, forwardRef, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { Official, OfficialDocument, OfficialRole, OfficialLevel, OfficialStatus, AssignmentStatus } from '../schemas/official.schema';
import { Match, MatchDocument, MatchStatus } from '../../match/schemas/match.schema';
import { CreateOfficialDTO, UpdateOfficialDTO, OfficialSearchDTO } from '../dto/official.dto';
import { OfficialsRepository } from '../repositories/officials.repository';

@Injectable()
export class OfficialAssignmentService {
  constructor(
    private readonly officialsRepository: OfficialsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkAvailability(officialId: string, date: Date): Promise<boolean> {
    const official = await this.officialsRepository.findById(officialId);
    if (!official) {
      throw new NotFoundException(`Official with ID ${officialId} not found`);
    }

    if (official.status !== OfficialStatus.ACTIVE) {
      return false;
    }

    // Check if official has availability for this date
    const availability = official.availability?.find(
      a => a.date.toDateString() === date.toDateString() && a.available === true,
    );

    if (!availability) {
      // If no availability specified, assume available unless there's a conflict
      return !this.hasConflictingAssignment(officialId, date);
    }

    return availability.available && !this.hasConflictingAssignment(officialId, date);
  }

  private async hasConflictingAssignment(officialId: string, date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const assignments = await this.getAssignmentsByDateRange(officialId, startOfDay, endOfDay);
    
    // Check if any assignment overlaps with the given date
    return assignments.some(a => 
      a.assignmentStatus === AssignmentStatus.CONFIRMED &&
      new Date(a.date).toDateString() === date.toDateString()
    );
  }

  async assignOfficial(matchId: string, assignment: {
    officialId: string;
    role: string;
    assignedBy: string;
  }): Promise<any> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Check official availability
    const available = await this.checkAvailability(assignment.officialId, match.schedule.scheduledStart);
    if (!available) {
      throw new ConflictException('Official is not available for this match');
    }

    // Check if official is already assigned to this match
    const existingAssignment = match.officials?.assignments?.find(
      a => a.officialId.toString() === assignment.officialId && a.assignmentStatus === AssignmentStatus.CONFIRMED,
    );

    if (existingAssignment) {
      throw new ConflictException('Official already assigned to this match');
    }

    // Check for role conflicts (same official can't have multiple roles)
    const existingRoles = match.officials?.assignments?.map(a => a.role) || [];
    const newRole = this.getRoleFromAssignment(assignment);
    if (existingRoles.includes(newRole)) {
      throw new ConflictException(`Role ${newRole} is already assigned`);
    }

    // Add assignment
    const newAssignment = {
      ...assignment,
      officialId: new Types.ObjectId(assignment.officialId),
      matchId: new Types.ObjectId(matchId),
      role: newRole,
      status: AssignmentStatus.PENDING,
      assignedAt: new Date(),
    };

    await this.matchModel.findByIdAndUpdate(matchId, {
      $push: { 'officials.assignments': newAssignment },
    });

    this.eventEmitter.emit('official.assigned', {
      matchId,
      officialId: assignment.officialId,
      role: newRole,
    });

    return newAssignment;
  }

  private getRoleFromAssignment(assignment: any): string {
    // Map assignment to role
    return assignment.role || 'official';
  }

  async confirmAssignment(matchId: string, assignmentId: string, confirmedBy: string): Promise<any> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    const assignment = match.officials.assignments.id(assignmentId);
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    if (assignment.assignmentStatus === AssignmentStatus.CONFIRMED) {
      throw new ConflictException('Assignment already confirmed');
    }

    assignment.assignmentStatus = AssignmentStatus.CONFIRMED;
    assignment.confirmedAt = new Date();
    assignment.confirmedBy = new Types.ObjectId(confirmedBy);

    await match.save();

    this.eventEmitter.emit('official.assignment.confirmed', {
      matchId,
      assignmentId,
      officialId: assignment.officialId,
      confirmedBy,
    });

    return assignment;
  }

  async replaceOfficial(matchId: string, oldOfficialId: string, newOfficialId: string, replacedBy: string, reason?: string): Promise<any> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Check new official availability
    const available = await this.checkAvailability(newOfficialId, match.schedule.scheduledStart);
    if (!available) {
      throw new ConflictException('New official is not available for this match');
    }

    // Find and update assignment
    const assignment = match.officials.assignments.find(
      a => a.officialId.toString() === oldOfficialId && a.assignmentStatus === AssignmentStatus.CONFIRMED,
    );

    if (!assignment) {
      throw new NotFoundException('Official assignment not found');
    }

    assignment.officialId = new Types.ObjectId(newOfficialId);
    assignment.assignmentStatus = AssignmentStatus.REPLACED;
    assignment.replacementReason = reason;
    assignment.replacedAt = new Date();
    assignment.replacedBy = new Types.ObjectId(replacedBy);

    await match.save();

    // Assign new official
    await this.assignOfficial(matchId, {
      officialId: newOfficialId,
      role: assignment.role,
      assignedBy: replacedBy,
    });

    this.eventEmitter.emit('official.replaced', {
      matchId,
      oldOfficialId,
      newOfficialId,
      replacedBy,
      reason,
    });

    return match;
  }

  async getAssignmentsByOfficial(officialId: string): Promise<any[]> {
    return this.officialsRepository.findAssignmentsByOfficial(officialId);
  }

  async getAssignmentsByDateRange(officialId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return this.officialsRepository.findAssignmentsByDateRange(officialId, startDate, endDate);
  }

  async getAssignmentsByMatch(matchId: string): Promise<any[]> {
    return this.officialsRepository.findAssignmentsByMatch(matchId);
  }

  async validateAssignments(matchId: string): Promise<{ valid: boolean; errors: string[] }> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    const errors: string[] = [];

    const mandatoryRoles = [
      'firstReferee',
      'secondReferee',
      'scorer',
      'lineJudge_1',
      'lineJudge_2',
    ];

    for (const role of mandatoryRoles) {
      const assignment = match.officials?.assignments?.find(
        a => a.role === role && a.assignmentStatus === 'confirmed',
      );
      if (!assignment) {
        errors.push(`Mandatory official role ${role} is not confirmed`);
      }
    }

    // Check for conflicts
    for (const assignment of match.officials?.assignments || []) {
      if (assignment.assignmentStatus === 'confirmed') {
        const hasConflict = await this.hasConflictingAssignment(
          assignment.officialId.toString(),
          match.schedule.scheduledStart,
        );
        if (hasConflict) {
          errors.push(`Official ${assignment.name} has a conflicting assignment`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getAvailableOfficials(
    date: Date,
    role?: string,
    federation?: string,
  ): Promise<any[]> {
    return this.officialsRepository.findAvailableOfficials(date, role, federation);
  }

  async getOfficialsByRole(role: string): Promise<any[]> {
    return this.officialsRepository.findByRole(role);
  }

  async getOfficialsByLevel(level: string): Promise<any[]> {
    return this.officialsRepository.findByLevel(level);
  }

  async getOfficialsByFederation(federation: string): Promise<any[]> {
    return this.officialsRepository.findByFederation(federation);
  }
}