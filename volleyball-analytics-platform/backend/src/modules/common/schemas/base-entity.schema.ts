/**
 * Base Entity Schema - Chapter 12 Part 1
 * 
 * Base entity with common fields for all domain entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BaseEntityDocument = BaseEntity & Document;

@Schema({ _id: false, timestamps: true })
export class BaseEntity {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  entityId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  deletedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  deletedBy?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BaseEntitySchema = SchemaFactory.createForClass(BaseEntity);

// Indexes
BaseEntitySchema.index({ entityId: 1 }, { unique: true });
BaseEntitySchema.index({ organizationId: 1, tenantId: 1 });
BaseEntitySchema.index({ tenantId: 1, isDeleted: 1 });
BaseEntitySchema.index({ name: 'text', description: 'text' });

// Soft delete middleware
BaseEntitySchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});

BaseEntitySchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});