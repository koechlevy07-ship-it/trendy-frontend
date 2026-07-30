import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VenueAccessibilityDocument = VenueAccessibility & Document;

export enum AccessibilityFeatureType {
  RAMP = 'ramp',
  ELEVATOR = 'elevator',
  ESCALATOR = 'escalator',
  HANDRAIL = 'handrail',
  TACTILE_PAVING = 'tactile_paving',
  BRAILLE_SIGNAGE = 'braille_signage',
  AUDIO_ANNOUNCEMENTS = 'audio_announcements',
  VISUAL_ALARMS = 'visual_alarms',
  ACCESSIBLE_RESTROOM = 'accessible_restroom',
  ACCESSIBLE_SEATING = 'accessible_seating',
  ACCESSIBLE_PARKING = 'accessible_parking',
  ACCESSIBLE_ENTRANCE = 'accessible_entrance',
  ACCESSIBLE_ROUTE = 'accessible_route',
  HEARING_LOOP = 'hearing_loop',
  SIGN_LANGUAGE_INTERPRETER = 'sign_language_interpreter',
  CAPTIONING_SERVICE = 'captioning_service',
  ASSISTIVE_LISTENING = 'assistive_listening',
  SERVICE_ANIMAL_RELIEF = 'service_animal_relief',
  FAMILY_RESTROOM = 'family_restroom',
  CHANGING_TABLE = 'changing_table',
  ADULT_CHANGING_TABLE = 'adult_changing_table',
  NURSING_ROOM = 'nursing_room',
  SENSORY_ROOM = 'sensory_room',
  QUIET_AREA = 'quiet_area',
  OTHER = 'other',
}

export enum AccessibilityStandard {
  ADA = 'ada',
  EN_301_549 = 'en_301_549',
  ISO_21542 = 'iso_21542',
  ISO_17049 = 'iso_17049',
  LOCAL_LAW = 'local_law',
  CUSTOM = 'custom',
}

@Schema({ _id: false })
export class AccessibilityFeature {
  @ApiProperty({ enum: [
    'ramp', 'elevator', 'escalator', 'handrail', 'tactile_paving', 'braille_signage',
    'audio_announcements', 'visual_alarms', 'accessible_restroom', 'accessible_seating',
    'accessible_parking', 'accessible_entrance', 'accessible_route', 'hearing_loop',
    'sign_language_interpreter', 'captioning_service', 'assistive_listening',
    'service_animal_relief', 'family_restroom', 'changing_table', 'adult_changing_table',
    'nursing_room', 'sensory_room', 'quiet_area', 'other'
  ] })
  @Prop({ type: String, enum: [
    'ramp', 'elevator', 'escalator', 'handrail', 'tactile_paving', 'braille_signage',
    'audio_announcements', 'visual_alarms', 'accessible_restroom', 'accessible_seating',
    'accessible_parking', 'accessible_entrance', 'accessible_route', 'hearing_loop',
    'sign_language_interpreter', 'captioning_service', 'assistive_listening',
    'service_animal_relief', 'family_restroom', 'changing_table', 'adult_changing_table',
    'nursing_room', 'sensory_room', 'quiet_area', 'other'
  ], required: true })
  type: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  location?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  description?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  locationId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: [String], enum: [
    'ada', 'en_301_549', 'iso_21542', 'iso_17049', 'local_law', 'custom'
  ], default: [] })
  @Prop({ type: [String], enum: ['ada', 'en_301_549', 'iso_21542', 'iso_17049', 'local_law', 'custom'], default: [] })
  standards: string[];

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  installedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  lastInspectedDate?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  inspectedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  condition?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  notes?: string;
}

@Schema({ _id: false })
export class AccessibilityAudit {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  conductedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  conductedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  standard?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  result?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  findings?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  recommendations?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextAuditDue?: Date;
}

@Schema({ _id: false })
export class AccessibilityAuditInfo {
  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @ApiProperty({ default: 0 })
  @Prop({ type: Number, default: 0 })
  version: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  auditReference?: string;
}

@Schema({ _id: false })
export class AccessibilityArchive {
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false, index: true })
  isArchived: boolean;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  archivedAt?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId })
  archivedBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  archiveReason?: string;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  snapshot?: Record<string, any>;
}

@Schema({
  collection: 'venue_accessibility',
  timestamps: true,
  versionKey: 'version',
})
export class VenueAccessibility {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  accessibilityId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  features: any[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [Object], default: [] })
  standards: any[];

  @ApiProperty({ required: false, type: Object })
  @Prop({ type: Object })
  audit?: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  auditInfo: any;

  @ApiProperty({ type: Object })
  @Prop({ type: Object })
  archive: any;

  @ApiProperty({ type: Object, default: {} })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const VenueAccessibilitySchema = SchemaFactory.createForClass(VenueAccessibility);

// Indexes
VenueAccessibilitySchema.index({ accessibilityId: 1 }, { unique: true });
VenueAccessibilitySchema.index({ venueId: 1 });
VenueAccessibilitySchema.index({ 'features.type': 1 });
VenueAccessibilitySchema.index({ 'features.standards': 1 });

// Virtual for complianceScore
VenueAccessibilitySchema.virtual('complianceScore').get(function() {
  if (!this.features || this.features.length === 0) return 0;
  const compliant = this.features.filter(f => f.condition === 'compliant' || f.condition === 'good').length;
  return (compliant / this.features.length) * 100;
});

// Virtual for nonCompliantCount
VenueAccessibilitySchema.virtual('nonCompliantCount').get(function() {
  if (!this.features) return 0;
  return this.features.filter(f => f.condition === 'non_compliant' || f.condition === 'poor').length;
});