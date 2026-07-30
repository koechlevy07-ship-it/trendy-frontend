import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConstraintSet, ConstraintSetDocument } from '../schemas/constraint-set.schema';
import { ConstraintSetRepository } from '../repositories/constraint-set.repository';
import { BusinessValidator } from '../validators/business.validator';
import { EventPublisher } from '../../shared/events/event.publisher';

@Injectable()
export class ConstraintService {
  constructor(
    @InjectModel('ConstraintSet') private readonly constraintSetModel: Model<any>,
    private readonly constraintSetRepository: ConstraintSetRepository,
    private readonly businessValidator: BusinessValidator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(createConstraintSetDto: any): Promise<any> {
    await this.businessValidator.validateConstraintSetUniqueness(
      createConstraintSetDto.constraintSetId,
      createConstraintSetDto.tournamentId,
      createConstraintSetDto.name
    );

    const constraintSet = await this.constraintSetRepository.create(createConstraintSetDto);

    await this.eventPublisher.publish('constraint.set.created', {
      constraintSetId: constraintSet._id.toString(),
      constraintSetCode: constraintSet.constraintSetId,
      tournamentId: constraintSet.tournamentId.toString(),
    });

    return constraintSet;
  }

  async findAll(tournamentId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    return this.constraintSetRepository.findByTournament(tournamentId);
  }

  async findById(id: string): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }
    return constraintSet;
  }

  async findByConstraintSetId(constraintSetId: string): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findByConstraintSetId(constraintSetId);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }
    return constraintSet;
  }

  async findActiveByTournament(tournamentId: string): Promise<any[]> {
    return this.constraintSetRepository.findActiveByTournament(tournamentId);
  }

  async update(id: string, updateConstraintSetDto: any): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    if (updateConstraintSetDto.name && updateConstraintSetDto.name !== constraintSet.name) {
      await this.businessValidator.validateConstraintSetUniqueness(
        constraintSet.constraintSetId,
        constraintSet.tournamentId.toString(),
        updateConstraintSetDto.name,
        id
      );
    }

    const updated = await this.constraintSetRepository.update(id, updateConstraintSetDto);

    await this.eventPublisher.publish('constraint.set.updated', {
      constraintSetId: updated._id.toString(),
      constraintSetCode: updated.constraintSetId,
      changes: updateConstraintSetDto,
    });

    return updated;
  }

  async updateStatus(id: string, isActive: boolean): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    const updated = await this.constraintSetRepository.updateStatus(id, isActive);

    await this.eventPublisher.publish('constraint.set.status.changed', {
      constraintSetId: constraintSet._id.toString(),
      constraintSetCode: constraintSet.constraintSetId,
      isActive,
    });

    return updated;
  }

  async activate(id: string): Promise<any> {
    return this.updateStatus(id, true);
  }

  async deactivate(id: string): Promise<any> {
    return this.updateStatus(id, false);
  }

  async archive(id: string): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    if (!constraintSet.isActive) {
      throw new BadRequestException('Constraint set is already inactive');
    }

    await this.constraintSetRepository.archiveConstraintSet(id);

    await this.eventPublisher.publish('constraint.set.archived', {
      constraintSetId: constraintSet._id.toString(),
      constraintSetCode: constraintSet.constraintSetId,
    });

    return { success: true, message: 'Constraint set archived successfully' };
  }

  async addConstraint(id: string, constraint: any): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    if (!constraintSet.isActive) {
      throw new BadRequestException('Cannot add constraints to inactive constraint set');
    }

    const newConstraint = {
      ...constraint,
      constraintId: constraint.constraintId || new Types.ObjectId().toString(),
      priority: constraint.priority || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = await this.constraintSetRepository.addConstraint(id, newConstraint);

    await this.eventPublisher.publish('constraint.added', {
      constraintSetId: constraintSet._id.toString(),
      constraintId: newConstraint.constraintId,
      constraintType: newConstraint.type,
    });

    return updated;
  }

  async removeConstraint(id: string, constraintId: string): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    const constraint = constraintSet.constraints.find(c => c.constraintId === constraintId);
    if (!constraint) {
      throw new NotFoundException('Constraint not found');
    }

    const updated = await this.constraintSetRepository.removeConstraint(id, constraintId);

    await this.eventPublisher.publish('constraint.removed', {
      constraintSetId: constraintSet._id.toString(),
      constraintId,
    });

    return updated;
  }

  async updateConstraint(id: string, constraintId: string, updates: any): Promise<any> {
    const constraintSet = await this.constraintSetRepository.findById(id);
    if (!constraintSet) {
      throw new NotFoundException('Constraint set not found');
    }

    const constraint = constraintSet.constraints.find(c => c.constraintId === constraintId);
    if (!constraint) {
      throw new NotFoundException('Constraint not found');
    }

    // Don't allow changing constraint ID
    delete updates.constraintId;

    const updated = await this.constraintSetRepository.updateConstraint(id, constraintId, updates);

    await this.eventPublisher.publish('constraint.updated', {
      constraintSetId: constraintSet._id.toString(),
      constraintId,
      changes: updates,
    });

    return updated;
  }

  async enableConstraint(id: string, constraintId: string): Promise<any> {
    return this.constraintSetRepository.enableConstraint(id, constraintId);
  }

  async disableConstraint(id: string, constraintId: string): Promise<any> {
    return this.constraintSetRepository.disableConstraint(id, constraintId);
  }

  async updateConstraintPriority(id: string, constraintId: string, priority: number): Promise<any> {
    return this.constraintSetRepository.updateConstraintPriority(id, constraintId, priority);
  }

  async updateConstraintSeverity(id: string, constraintId: string, severity: string): Promise<any> {
    if (!['hard', 'soft', 'advisory'].includes(severity)) {
      throw new BadRequestException('Invalid severity. Must be hard, soft, or advisory');
    }
    return this.constraintSetRepository.updateConstraintSeverity(id, constraintId, severity);
  }

  async updateConstraintExpression(id: string, constraintId: string, expression: any): Promise<any> {
    return this.constraintSetRepository.updateConstraintExpression(id, constraintId, expression);
  }

  async validateConstraints(tournamentId: string): Promise<any> {
    // Get all active constraints for the tournament
    const hardConstraints = await this.constraintSetRepository.findHardConstraints(tournamentId);
    const softConstraints = await this.constraintSetRepository.findSoftConstraints(tournamentId);

    // Basic validation - check for conflicts between hard constraints
    const conflicts = await this.detectConflicts(tournamentId);

    return {
      valid: conflicts.length === 0,
      constraints: {
        hard: hardConstraints.length,
        soft: softConstraints.length,
        total: 0,
      },
      conflicts,
      recommendations: this.generateRecommendations(conflicts),
    };
  }

  private async detectConflicts(tournamentId: string): Promise<any[]> {
    const constraintSet = await this.constraintSetRepository.findActiveByTournament(tournamentId);
    if (!constraintSet || constraintSet.length === 0) return [];

    const constraints = constraintSet.flatMap(cs => cs.constraints.filter(c => c.enabled));
    const conflicts: any[] = [];

    // Check for conflicting hard constraints
    const hardConstraints = constraints.filter(c => c.severity === 'hard' && c.enabled);

    for (let i = 0; i < hardConstraints.length; i++) {
      for (let j = i + 1; j < hardConstraints.length; j++) {
        const c1 = hardConstraints[i];
        const c2 = hardConstraints[j];

        // Check for temporal conflicts
        if (c1.type === 'temporal' && c2.type === 'temporal') {
          if (this.checkTemporalConflict(c1.expression, c2.expression)) {
            conflicts.push({
              type: 'temporal_conflict',
              constraint1: c1.constraintId,
              constraint2: c2.constraintId,
              message: `Temporal conflict between ${c1.name} and ${c2.name}`,
              severity: 'high',
            });
          }
        }

        // Check for spatial conflicts
        if (c1.type === 'spatial' && c2.type === 'spatial') {
          if (this.checkSpatialConflict(c1.expression, c2.expression)) {
            conflicts.push({
              type: 'spatial_conflict',
              constraint1: c1.constraintId,
              constraint2: c2.constraintId,
              message: `Spatial conflict between ${c1.name} and ${c2.name}`,
              severity: 'high',
            });
          }
        }

        // Check for resource conflicts
        if (c1.type === 'resource' && c2.type === 'resource') {
          const r1 = c1.expression.requiresResource || [];
          const r2 = c2.expression.requiresResource || [];
          const conflict = r1.some(r => r2.includes(r));
          if (conflict) {
            conflicts.push({
              type: 'resource_conflict',
              constraint1: c1.constraintId,
              constraint2: c2.constraintId,
              message: `Resource conflict between ${c1.name} and ${c2.name}`,
              severity: 'high',
            });
          }
        }
      }
    }

    return conflicts;
  }

  private checkTemporalConflict(expr1: any, expr2: any): boolean {
    // Simplified temporal conflict check
    const getTimeRange = (expr: any) => {
      if (expr.before && expr.after) return { start: expr.after, end: expr.before };
      if (expr.between) return { start: expr.between[0], end: expr.between[1] };
      return null;
    };

    const range1 = getTimeRange(expression);
    const range2 = getTimeRange(expression);

    if (!range1 || !range2) return false;

    return range1.start < range2.end && range2.start < range1.end;
  }

  private checkSpatialConflict(expr1: any, expr2: any): boolean {
    // Simplified spatial conflict check
    const venues1 = expr1.withinVenue || [];
    const venues2 = expr2.withinVenue || [];
    return venues1.some(v => venues2.some(v2 => v.equals(v2)));
  }

  private generateRecommendations(conflicts: any[]): string[] {
    const recommendations: string[] = [];

    if (conflicts.some(c => c.type === 'temporal_conflict')) {
      recommendations.push('Consider adjusting match times or extending the tournament window to resolve temporal conflicts');
    }
    if (conflicts.some(c => c.type === 'spatial_conflict')) {
      recommendations.push('Consider using different venues or courts to resolve spatial conflicts');
    }
    if (conflicts.some(c => c.type === 'resource_conflict')) {
      recommendations.push('Consider adding more resources or staggering match times to resolve resource conflicts');
    }

    return recommendations;
  }

  async getConstraintSetStats(tournamentId: string): Promise<any> {
    return this.constraintSetRepository.getConstraintSetStats(tournamentId);
  }

  async getActiveConstraintsForTournament(tournamentId: string): Promise<any[]> {
    return this.constraintSetRepository.getActiveConstraintsForTournament(tournamentId);
  }

  async findConflictingConstraints(tournamentId: string): Promise<any[]> {
    return this.constraintSetRepository.findConflictingConstraints(tournamentId);
  }
}