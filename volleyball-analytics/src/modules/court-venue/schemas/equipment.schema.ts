import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum EquipmentCategory { NET_SYSTEM = 'net_system', POSTS = 'posts', ANTENNAS = 'antennas', SCOREBOARD = 'scoreboard', REFEREE_STAND = 'referee_stand', LIGHTING = 'lighting', FLOORING = 'flooring', BALLS = 'balls', BALL_CART = 'ball_cart', NET_HEIGHT_GAUGE = 'net_height_gauge', MEASURING_TAPE = 'measuring_tape', COURT_LINE_MARKER = 'court_line_marker', SAND_RAKE = 'sand_rake', WATER_REMOVAL = 'water_removal', FIRST_AID = 'first_aid', AED = 'aed', ICE_MACHINE = 'ice_machine', TRAINING_AIDS = 'training_aids', VIDEO_REPLAY = 'video_replay', COMMUNICATION = 'communication', TIMING_SYSTEM = 'timing_system', STATISTICS_SYSTEM = 'statistics_system', CAMERA_SYSTEM = 'camera_system', CALIBRATION_TOOLS = 'calibration_tools', MAINTENANCE_TOOLS = 'maintenance_tools', CLEANING_EQUIPMENT = 'cleaning_equipment', SAFETY_EQUIPMENT = 'safety_equipment', OTHER = 'other' }
export enum EquipmentStatus { AVAILABLE = 'available', IN_USE = 'in_use', MAINTENANCE = 'maintenance', REPAIR = 'repair', CALIBRATION = 'calibration', INSPECTION = 'inspection', RETIRED = 'retired', LOST = 'lost', DAMAGED = 'damaged', RESERVED = 'reserved' }
export enum EquipmentCondition { NEW = 'new', EXCELLENT = 'excellent', GOOD = 'good', FAIR = 'fair', POOR = 'poor', UNUSABLE = 'unusable' }

export interface IEquipmentSpecifications { dimensions?: { length: number; width: number; height: number; unit: string }; weight?: { value: number; unit: string }; material?: string[]; color?: string; powerRequirements?: { voltage: number; amperage: number; phase: string; connectorType: string }; operatingTemperature?: { min: number; max: number; unit: string }; certifications?: string[]; customSpecs?: Record<string, unknown>; }
export interface IEquipmentMaintenance { scheduledDate: Date; completedDate?: Date; type: 'preventive' | 'corrective' | 'calibration' | 'inspection' | 'cleaning'; description: string; performedBy?: Types.ObjectId; cost?: number; partsReplaced?: string[]; notes?: string; nextMaintenanceDate?: Date; status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'; }
export interface IEquipmentCertification { name: string; issuingBody: string; certificateNumber: string; issuedDate: Date; expiryDate: Date; status: 'valid' | 'expired' | 'expiring_soon' | 'revoked'; documentUrl?: string; verifiedBy?: Types.ObjectId; verifiedAt?: Date; }

export interface IEquipment extends Document {
  venueId: Types.ObjectId;
  courtId?: Types.ObjectId;
  facilityId?: Types.ObjectId;
  equipmentCode: string;
  name: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assetTag?: string;
  specifications: IEquipmentSpecifications;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiry?: Date;
  expectedLifespanMonths?: number;
  assignedTo?: Types.ObjectId;
  location?: string;
  maintenanceHistory: IEquipmentMaintenance[];
  certifications: IEquipmentCertification[];
  calibrationRecords: { calibrationProfileId: Types.ObjectId; calibratedAt: Date; calibratedBy: Types.ObjectId; nextCalibrationDue: Date; status: 'passed' | 'failed' | 'conditional'; notes?: string; }[];
  metadata: Record<string, unknown>;
  retiredAt?: Date;
  retiredReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentDocument = HydratedDocument<IEquipment>;

const EquipmentSpecificationsSchema = new Schema<IEquipmentSpecifications>({ dimensions: { length: { type: Number }, width: { type: Number }, height: { type: Number }, unit: { type: String, default: 'cm' } }, weight: { value: { type: Number }, unit: { type: String, default: 'kg' } }, material: [{ type: String }], color: { type: String }, powerRequirements: { voltage: { type: Number }, amperage: { type: Number }, phase: { type: String }, connectorType: { type: String } }, operatingTemperature: { min: { type: Number }, max: { type: Number }, unit: { type: String, default: 'celsius' } }, certifications: [{ type: String }], customSpecs: { type: Schema.Types.Mixed } }, { _id: false });

const EquipmentMaintenanceSchema = new Schema<IEquipmentMaintenance>({ scheduledDate: { type: Date, required: true }, completedDate: { type: Date }, type: { type: String, enum: ['preventive', 'corrective', 'calibration', 'inspection', 'cleaning'], required: true }, description: { type: String, required: true, trim: true }, performedBy: { type: Schema.Types.ObjectId, ref: 'User' }, cost: { type: Number, min: 0 }, partsReplaced: [{ type: String }], notes: { type: String, trim: true }, nextMaintenanceDate: { type: Date }, status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'], default: 'scheduled' } }, { _id: false });

const EquipmentCertificationSchema = new Schema<IEquipmentCertification>({ name: { type: String, required: true, trim: true }, issuingBody: { type: String, required: true, trim: true }, certificateNumber: { type: String, required: true, trim: true }, issuedDate: { type: Date, required: true }, expiryDate: { type: Date, required: true }, status: { type: String, enum: ['valid', 'expired', 'expiring_soon', 'revoked'], default: 'valid' }, documentUrl: { type: String }, verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }, verifiedAt: { type: Date } }, { _id: false });

const EquipmentSchema = new Schema<IEquipment>({
  venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' },
  courtId: { type: Schema.Types.ObjectId, ref: 'Court' },
  facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
  equipmentCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  category: { type: String, enum: Object.values(EquipmentCategory), required: true },
  manufacturer: { type: String, required: true, trim: true, maxlength: 100 },
  model: { type: String, required: true, trim: true, maxlength: 100 },
  serialNumber: { type: String, required: true, trim: true },
  assetTag: { type: String, trim: true, unique: true, sparse: true },
  specifications: { type: EquipmentSpecificationsSchema, default: {} },
  status: { type: String, enum: Object.values(EquipmentStatus), default: EquipmentStatus.AVAILABLE },
  condition: { type: String, enum: Object.values(EquipmentCondition), default: EquipmentCondition.GOOD },
  purchaseDate: { type: Date }, purchaseCost: { type: Number, min: 0 }, warrantyExpiry: { type: Date },
  expectedLifespanMonths: { type: Number, min: 1 },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, trim: true, maxlength: 200 },
  maintenanceHistory: { type: [EquipmentMaintenanceSchema], default: [] },
  certifications: { type: [EquipmentCertificationSchema], default: [] },
  calibrationRecords: [{ calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' }, calibratedAt: { type: Date, required: true }, calibratedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, nextCalibrationDue: { type: Date, required: true }, status: { type: String, enum: ['passed', 'failed', 'conditional'], required: true }, notes: { type: String } }],
  metadata: { type: Schema.Types.Mixed, default: {} },
  retiredAt: { type: Date }, retiredReason: { type: String, trim: true },
}, { timestamps: true, collection: 'equipment' });

EquipmentSchema.index({ venueId: 1, equipmentCode: 1 }, { unique: true });
EquipmentSchema.index({ venueId: 1, category: 1 });
EquipmentSchema.index({ venueId: 1, status: 1 });
EquipmentSchema.index({ serialNumber: 1 });
EquipmentSchema.index({ assetTag: 1 });
EquipmentSchema.index({ courtId: 1 });
EquipmentSchema.index({ facilityId: 1 });
EquipmentSchema.index({ assignedTo: 1 });
EquipmentSchema.index({ 'certifications.expiryDate': 1 });

EquipmentSchema.virtual('isUnderMaintenance').get(function () { return this.status === EquipmentStatus.MAINTENANCE || this.status === EquipmentStatus.REPAIR; });
EquipmentSchema.virtual('isAvailable').get(function () { return this.status === EquipmentStatus.AVAILABLE; });
EquipmentSchema.virtual('certificationsExpiringSoon').get(function () { const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); return this.certifications.filter((cert) => cert.status === 'valid' && cert.expiryDate <= thirtyDaysFromNow); });

export const EquipmentSchema = EquipmentSchema;
export const Equipment = models.Equipment || model<IEquipment>('Equipment', EquipmentSchema);








