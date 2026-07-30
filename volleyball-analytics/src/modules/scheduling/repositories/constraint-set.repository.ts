import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConstraintSet, ConstraintSetDocument } from '../schemas/constraint-set.schema';
import { TournamentConstraint } from '../schemas/constraint-set.schema';

@Injectable()
export class ConstraintSetRepository {
  constructor(
    @InjectModel('ConstraintSet') private readonly constraintSetModel: Model<ConstraintSetDocument>,
  ) {}

  async create(data: Partial<any>): Promise<any> {
    const constraintSet = new this.constraintSetModel({
      ...data,
      tournamentId: new Types.ObjectId(data.tournamentId),
      constraints: data.constraints?.map(c => ({
        ...c,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      })) || [],
      createdBy: new Types.ObjectId(data.createdBy),
    }) as any;

    return constraintSet.save();
  }

  async findById(id: string): Promise<any> {
    return this.constraintSetModel.findById(id).exec();
  }

  async findByConstraintSetId(constraintSetId: string): Promise<any> {
    return this.constraintSetModel.findOne({ constraintSetId }).exec();
  }

  async findByTournament(tournamentId: string, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.constraintSetModel.find({ tournamentId: new Types.ObjectId(tournamentId) }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findActiveByTournament(tournamentId: string): Promise<any[]> {
    return this.constraintSetModel.find({
      tournamentId: new Types.ObjectId(tournamentId),
      isActive: true
    }).sort({ createdAt: -1 }).exec();
  }

  async findByStatus(isActive: boolean, pagination?: { page: number; limit: number }): Promise<any[]> {
    const query = this.constraintSetModel.find({ isActive }).sort({ createdAt: -1 });
    if (pagination) {
      query.skip((pagination.page - 1) * pagination.limit).limit(pagination.limit);
    }
    return query.exec();
  }

  async findByConstraintType(tournamentId: string, type: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.type': type, 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findBySeverity(tournamentId: string, severity: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.severity': severity, 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findHardConstraints(tournamentId: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.severity': 'hard', 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findSoftConstraints(tournamentId: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.severity': 'soft', 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { weight: -1, priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findByMethod(tournamentId: string, method: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.method': method, 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findActiveConstraints(tournamentId: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, severity: 1, createdAt: 1 } }
    ]).exec();
  }

  async findConstraintsByScope(tournamentId: string, scope: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.scope': scope, 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { severity: 1, priority: -1 } }
    ]).exec();
  }

  async findConstraintsByEntity(tournamentId: string, entityType: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.applicableEntities': entityType, 'constraints.enabled': true } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { severity: 1, priority: -1 } }
    ]).exec();
  }

  async findByConstraintId(constraintSetId: string, constraintId: string): Promise<any> {
    const constraintSet = await this.constraintSetModel.findById(constraintSetId);
    if (!constraintSet) return null;
    return constraintSet.constraints.find(c => c.constraintId === constraintId);
  }

  async update(id: string, data: any): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      id,
      { $set: data, $inc: { version: 1 } },
      { new: true, runValidators: true }
    ).exec();
  }

  async updateConstraints(id: string, constraints: any[]): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      id,
      { $set: { constraints, updatedAt: new Date() }, $inc: { version: 1 } },
      { new: true, runValidators: true }
    ).exec();
  }

  async addConstraint(id: string, constraint: any): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      id,
      { $push: { constraints: constraint }, $inc: { version: 1 } },
      { new: true, runValidators: true }
    ).exec();
  }

  async removeConstraint(id: string, constraintId: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      id,
      { $pull: { constraints: { constraintId } }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async updateConstraint(id: string, constraintId: string, updates: any): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$': { ...updates, updatedAt: new Date() } }, $inc: { version: 1 } },
      { new: true, runValidators: true }
    ).exec();
  }

  async enableConstraint(id: string, constraintId: string): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$.enabled': true, 'constraints.$.updatedAt': new Date() }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async disableConstraint(id: string, constraintId: string): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$.enabled': false, 'constraints.$.updatedAt': new Date() }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async updateConstraintPriority(id: string, constraintId: string, priority: number): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$.priority': priority, 'constraints.$.updatedAt': new Date() }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async updateConstraintSeverity(id: string, constraintId: string, severity: string): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$.severity': severity, 'constraints.$.updatedAt': new Date() }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async updateConstraintExpression(id: string, constraintId: string, expression: any): Promise<any> {
    return this.constraintSetModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), 'constraints.constraintId': constraintId },
      { $set: { 'constraints.$.expression': expression, 'constraints.$.updatedAt': new Date() }, $inc: { version: 1 } },
      { new: true, runValidators: true }
    ).exec();
  }

  async activateConstraintSet(id: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
  }

  async deactivateConstraintSet(id: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  async archiveConstraintSet(id: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  async getConstraintSetStats(tournamentId: string): Promise<any> {
    const constraintSet = await this.constraintSetModel.findOne({ tournamentId: new Types.ObjectId(tournamentId) });
    if (!constraintSet) return { total: 0, byType: {}, bySeverity: {}, byStatus: {} };

    const total = constraintSet.constraints.length;
    const byType = constraintSet.constraints.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    const bySeverity = constraintSet.constraints.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {});
    const byStatus = constraintSet.constraints.reduce((acc, c) => {
      acc[c.enabled ? 'enabled' : 'disabled'] = (acc[c.enabled ? 'enabled' : 'disabled'] || 0) + 1;
      return acc;
    }, {});

    return { total, byType, bySeverity, byStatus };
  }

  async findConstraintsNeedingReview(tournamentId: string): Promise<any[]> {
    return this.constraintSetModel.aggregate([
      { $match: { tournamentId: new Types.ObjectId(tournamentId), isActive: true } },
      { $unwind: '$constraints' },
      { $match: { 'constraints.enabled': true, 'constraints.severity': 'hard' } },
      { $replaceRoot: { newRoot: '$constraints' } },
      { $sort: { priority: -1, createdAt: 1 } }
    ]).exec();
  }

  async findConflictingConstraints(tournamentId: string): Promise<any[]> {
    const constraintSet = await this.constraintSetModel.findOne({ tournamentId: new Types.ObjectId(tournamentId) });
    if (!constraintSet) return [];

    // Find constraints that might conflict with each other
    const hardConstraints = constraintSet.constraints.filter(c => c.severity === 'hard' && c.enabled);
    const conflicts: any[] = [];

    for (let i = 0; i < hardConstraints.length; i++) {
      for (let j = i + 1; j < hardConstraints.length; j++) {
        const c1 = hardConstraints[i];
        const c2 = hardConstraints[j];
        // Check if constraints could conflict (simplified check)
        if (this.constraintsConflict(c1, c2)) {
          conflicts.push({
            constraint1: c1.constraintId,
            constraint2: c2.constraintId,
            type: 'potential_conflict',
            description: `Constraints ${c1.constraintId} and ${c2.constraintId} may conflict`
          });
        }
      }
    }

    return conflicts;
  }

  private constraintsConflict(c1: any, c2: any): boolean {
    // Simplified conflict detection
    if (c1.scope !== c2.scope) return false;
    if (c1.type === 'temporal' && c2.type === 'temporal') {
      // Check temporal overlap
      return false; // Simplified
    }
    if (c1.type === 'spatial' && c2.type === 'spatial') {
      // Check spatial overlap
      return false; // Simplified
    }
    if (c1.type === 'resource' && c2.type === 'resource') {
      const r1 = c1.expression?.requiresResource || [];
      const r2 = c2.expression?.requiresResource || [];
      return r1.some(r => r2.includes(r));
    }
    return false;
  }

  async bulkCreateConstraints(constraintSetId: string, constraints: any[]): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      constraintSetId,
      { $push: { constraints: { $each: constraints } }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async deleteConstraint(constraintSetId: string, constraintId: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      constraintSetId,
      { $pull: { constraints: { constraintId } }, $inc: { version: 1 } },
      { new: true }
    ).exec();
  }

  async archiveConstraintSet(id: string): Promise<any> {
    return this.constraintSetModel.findByIdAndUpdate(
      id,
      { isActive: false, archivedAt: new Date() },
      { new: true }
    ).exec();
  }

  async getConstraintSetStats(tournamentId: string): Promise<any> {
    const constraintSet = await this.constraintSetModel.findOne({ tournamentId: new Types.ObjectId(tournamentId) });
    if (!constraintSet) return { total: 0, byType: {}, bySeverity: {}, byStatus: {} };

    const total = constraintSet.constraints.length;
    const byType = constraintSet.constraints.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    const bySeverity = constraintSet.constraints.reduce((acc, c) => {
      acc[c.severity] = (acc[c.severity] || 0) + 1;
      return acc;
    }, {});
    const byStatus = constraintSet.constraints.reduce((acc, c) => {
      acc[c.enabled ? 'enabled' : 'disabled'] = (acc[c.enabled ? 'enabled' : 'disabled'] || 0) + 1;
      return acc;
    }, {});

    return { total, byType, bySeverity, byStatus };
  }
}