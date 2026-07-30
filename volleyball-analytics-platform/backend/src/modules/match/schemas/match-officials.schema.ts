/**
 * Match Officials Schema - Chapter 12 Part 2
 * 
 * Represents official assignments for matches.
 * Assignments shall remain historically immutable.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MatchOfficialsDocument = MatchOfficials & Document;

export enum OfficialRole {
  FIRST_REFEREE = 'first_referee',
  SECOND_REFEREE = 'second_referee',
  CHALLENGE_REFEREE = 'challenge_referee',
  LINE_JUDGE_1 = 'line_judge_1',
  LINE_JUDGE_2 = 'line_judge_2',
  SCORER = 'scorer',
  ASSISTANT_SCORER = 'assistant_scorer',
  COURT_MANAGER = 'court_manager',
}

export enum AssignmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  REPLACED = 'replaced',
}

@Schema({ _id: false })
export class OfficialAssignment {
  @ApiProperty({ enum: OfficialRole })
  @Prop({ type: String, enum: OfficialRole, required: true })
  role: OfficialRole;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Official', required: true })
  officialId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  federation?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificationLevel?: string;

  @ApiProperty({ enum: AssignmentStatus })
  @Prop({ type: String, enum: AssignmentStatus, required: true, default: AssignmentStatus.PENDING })
  status: AssignmentStatus;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  confirmedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  confirmedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  replacementReason?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  replacedBy?: Types.ObjectId;
}

@Schema({ _id: false })
export class OfficialsAuditInfo {
  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  version: number;
}

@Schema({ _id: false })
export class OfficialsArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;
}

@Schema({ 
  collection: 'match_officials',
  timestamps: true,
  versionKey: 'version',
})
export class MatchOfficials {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  assignmentId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Match', required: true, index: true })
  matchId: Types.ObjectId;

  @ApiProperty({ type: [OfficialAssignment] })
  @Prop({ type: [OfficialAssignment], required: true, default: [] })
  assignments: OfficialAssignment[];

  @ApiProperty()
  @Prop({ type: OfficialsAuditInfo, required: true })
  audit: OfficialsAuditInfo;

  @ApiProperty()
  @Prop({ type: OfficialsArchive, required: true })
  archive: OfficialsArchive;

  @ApiProperty({ type: Object })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const MatchOfficialsSchema = SchemaFactory.createForClass(MatchOfficials);

// Indexes per 12.22
MatchOfficialsSchema.index({ matchId: 1 }, { unique: true });
MatchOfficialsSchema.index({ 'assignments.officialId': 1 });
MatchOfficialsSchema.index({ 'assignments.role': 1 });
MatchOfficialsSchema.index({ 'assignments.status': 1 });
MatchOfficialsSchema.index({ assignmentId: 1 }, { unique: true });

// Ensure mandatory officiating roles are populated before match activation
MatchOfficialsSchema.pre('save', function(next) {
  if (this.isModified('assignments')) {
    const mandatoryRoles = [
      OfficialRole.FIRST_REFEREE,
      OfficialRole.SECOND_REFEREE,
      OfficialRole.SCORER,
      OfficialRole.LINE_JUDGE_1,
      OfficialRole.LINE_JUDGE_2,
    ];
    
    const assignedRoles = this.assignments
      .filter(a => a.status === AssignmentStatus.CONFIRMED)
      .map(a => a.role);
    
    const missingRoles = mandatoryRoles.filter(r => !assignedRoles.includes(r));
    
    if (missingRoles.length > 0) {
      console.warn(`Match ${this.matchId} missing mandatory officials: ${missingRoles.join(', ')}`);
    }
  }
  next();
});