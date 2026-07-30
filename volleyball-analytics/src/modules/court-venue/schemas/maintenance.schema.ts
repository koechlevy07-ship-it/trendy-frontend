import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum MaintenanceType { PREVENTIVE = 'preventive', CORRECTIVE = 'corrective', PREDICTIVE = 'predictive', CALIBRATION = 'calibration', INSPECTION = 'inspection', CLEANING = 'cleaning', UPGRADE = 'upgrade', REPLACEMENT = 'replacement', EMERGENCY = 'emergency', WARRANTY = 'warranty' }
export enum MaintenanceStatus { SCHEDULED = 'scheduled', ASSIGNED = 'assigned', IN_PROGRESS = 'in_progress', ON_HOLD = 'on_hold', COMPLETED = 'completed', CANCELLED = 'cancelled', OVERDUE = 'overdue', REQUIRES_FOLLOWUP = 'requires_followup' }
export enum MaintenancePriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', CRITICAL = 'critical', EMERGENCY = 'emergency' }

export interface IMaintenanceChecklistItem { itemId: string; description: string; isRequired: boolean; status: 'pending' | 'completed' | 'skipped' | 'failed'; completedAt?: Date; completedBy?: Types.ObjectId; notes?: string; evidence?: { type: string; url: string }[]; }
export interface IMaintenancePart { partId: string; name: string; partNumber: string; quantity: number; unitCost: number; totalCost: number; supplier?: string; warrantyExpiry?: Date; notes?: string; }
export interface IMaintenanceLabor { technicianId: Types.ObjectId; technicianName: string; role: string; hoursWorked: number; hourlyRate: number; totalCost: number; tasksPerformed: string[]; }

export interface IMaintenanceRecord extends Document {
  maintenanceCode: string; title: string; description: string;
  maintenanceType: MaintenanceType; status: MaintenanceStatus; priority: MaintenancePriority;
  venueId?: Types.ObjectId; courtId?: Types.ObjectId; facilityId?: Types.ObjectId; equipmentId?: Types.ObjectId; sensorId?: Types.ObjectId; cameraId?: Types.ObjectId; calibrationProfileId?: Types.ObjectId;
  scheduledDate: Date; estimatedDurationMinutes: number;
  actualStartDate?: Date; actualEndDate?: Date; actualDurationMinutes?: number;
  assignedTechnicianId?: Types.ObjectId; assignedTechnicianName?: string; supervisingEngineerId?: Types.ObjectId;
  checklist: IMaintenanceChecklistItem[]; partsUsed: IMaintenancePart[]; labor: IMaintenanceLabor[];
  totalCost: number; costBreakdown: { partsCost: number; laborCost: number; externalServiceCost: number; otherCost: number };
  findings: string; recommendations: string[];
  followUpRequired: boolean; followUpDate?: Date; followUpDescription?: string;
  documents: Types.ObjectId[]; photos: string[];
  signatures: { technicianId: Types.ObjectId; technicianName: string; signedAt: Date; signatureData?: string }[];
  approvals: { approvedBy: Types.ObjectId; approvedAt: Date; version: number; comments?: string }[];
  metadata: Record<string, unknown>;
  createdBy: Types.ObjectId; updatedBy?: Types.ObjectId;
  createdAt: Date; updatedAt: Date;
}

const MaintenanceChecklistItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    isRequired: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'completed', 'skipped', 'failed'], default: 'pending' },
    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    evidence: [{ type: { type: String }, url: { type: String } }],
  },
  { _id: false }
);
const MaintenancePartSchema = new Schema({ partId: { type: String, required: true }, name: { type: String, required: true, trim: true }, partNumber: { type: String, required: true, trim: true }, quantity: { type: Number, required: true, min: 1 }, unitCost: { type: Number, required: true, min: 0 }, totalCost: { type: Number, required: true, min: 0 }, supplier: { type: String, trim: true }, warrantyExpiry: { type: Date }, notes: { type: String, trim: true } }, { _id: false });
const MaintenanceLaborSchema = new Schema({ technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, role: { type: String, required: true, trim: true }, hoursWorked: { type: Number, required: true, min: 0 }, hourlyRate: { type: Number, required: true, min: 0 }, totalCost: { type: Number, required: true, min: 0 }, tasksPerformed: [{ type: String, trim: true }] }, { _id: false });
const MaintenanceCostBreakdownSchema = new Schema({ partsCost: { type: Number, default: 0, min: 0 }, laborCost: { type: Number, default: 0, min: 0 }, externalServiceCost: { type: Number, default: 0, min: 0 }, otherCost: { type: Number, default: 0, min: 0 } }, { _id: false });
const MaintenanceSignatureSchema = new Schema({ technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, signedAt: { type: Date, required: true, default: Date.now }, signatureData: { type: String } }, { _id: false });
const MaintenanceApprovalSchema = new Schema({ approvedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, approvedAt: { type: Date, required: true, default: Date.now }, version: { type: Number, required: true, min: 1 }, comments: { type: String, trim: true } }, { _id: false });

const MaintenanceRecordSchema = new Schema(
  {
    maintenanceCode: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    maintenanceType: { type: String, enum: Object.values(MaintenanceType), required: true },
    status: { type: String, enum: Object.values(MaintenanceStatus), default: MaintenanceStatus.SCHEDULED },
    priority: { type: String, enum: Object.values(MaintenancePriority), default: MaintenancePriority.MEDIUM },
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue' },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court' },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
    equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    sensorId: { type: Schema.Types.ObjectId, ref: 'Sensor' },
    cameraId: { type: Schema.Types.ObjectId, ref: 'Camera' },
    calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' },
    scheduledDate: { type: Date, required: true },
    estimatedDurationMinutes: { type: Number, required: true, min: 1 },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    actualDurationMinutes: { type: Number, min: 0 },
    assignedTechnicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTechnicianName: { type: String, trim: true },
    supervisingEngineerId: { type: Schema.Types.ObjectId, ref: 'User' },
    checklist: { type: [MaintenanceChecklistItemSchema], default: [] },
    partsUsed: { type: [MaintenancePartSchema], default: [] },
    labor: { type: [MaintenanceLaborSchema], default: [] },
    totalCost: { type: Number, default: 0, min: 0 },
    costBreakdown: { type: MaintenanceCostBreakdownSchema, default: {} },
    findings: { type: String, trim: true, maxlength: 10000 },
    recommendations: [{ type: String, trim: true }],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpDescription: { type: String, trim: true },
    documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    photos: [{ type: String }],
    signatures: { technicianId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, technicianName: { type: String, required: true, trim: true }, signedAt: { type: Date, required: true, default: Date.now }, signatureData: { type: String } },
    approvals: { approvedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, approvedAt: { type: Date, required: true, default: Date.now }, version: { type: Number, required: true, min: 1 }, comments: { type: String, trim: true } },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'maintenance_records' }
);

MaintenanceRecordSchema.index({ venueId: 1, status: 1 });
MaintenanceRecordSchema.index({ courtId: 1, status: 1 });
MaintenanceRecordSchema.index({ facilityId: 1, status: 1 });
MaintenanceRecordSchema.index({ equipmentId: 1, status: 1 });
MaintenanceRecordSchema.index({ sensorId: 1, status: 1 });
MaintenanceRecordSchema.index({ cameraId: 1, status: 1 });
MaintenanceRecordSchema.index({ calibrationProfileId: 1, status: 1 });
MaintenanceRecordSchema.index({ scheduledDate: 1, status: 1 });
MaintenanceRecordSchema.index({ assignedTechnicianId: 1, status: 1 });
MaintenanceRecordSchema.index({ maintenanceType: 1, status: 1 });
MaintenanceRecordSchema.index({ priority: 1, status: 1 });
MaintenanceRecordSchema.index({ followUpDate: 1 });
MaintenanceRecordSchema.index({ maintenanceCode: 1 }, { unique: true });

MaintenanceRecordSchema.virtual('isOverdue').get(function () { return this.status === MaintenanceStatus.SCHEDULED && this.scheduledDate < new Date(); });
MaintenanceRecordSchema.virtual('isCompleted').get(function () { return this.status === MaintenanceStatus.COMPLETED; });
MaintenanceRecordSchema.virtual('completionPercentage').get(function () { if (this.checklist.length === 0) return 100; const completed = this.checklist.filter((item) => item.status === 'completed').length; return Math.round((completed / this.checklist.length) * 100); });
MaintenanceRecordSchema.virtual('durationVariance').get(function () { if (!this.actualDurationMinutes) return null; return this.actualDurationMinutes - this.estimatedDurationMinutes; });

MaintenanceRecordSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === MaintenanceStatus.IN_PROGRESS && !this.actualStartDate) this.actualStartDate = new Date();
  if (this.isModified('status') && this.status === MaintenanceStatus.COMPLETED && !this.actualEndDate) { this.actualEndDate = new Date(); if (this.actualStartDate) this.actualDurationMinutes = Math.round((this.actualEndDate.getTime() - this.actualStartDate.getTime()) / (1000 * 60)); }
  if (this.isModified('partsUsed') || this.isModified('labor')) {
    const partsCost = this.partsUsed.reduce((sum, p) => sum + p.totalCost, 0);
    const laborCost = this.labor.reduce((sum, l) => sum + l.totalCost, 0);
    this.costBreakdown = { partsCost, laborCost, externalServiceCost: this.costBreakdown?.externalServiceCost || 0, otherCost: this.costBreakdown?.otherCost || 0 };
    this.totalCost = partsCost + laborCost + (this.costBreakdown.externalServiceCost || 0) + (this.costBreakdown.otherCost || 0);
  }
  next();
});

MaintenanceRecordSchema.methods.startWork = function (technicianId: Types.ObjectId, technicianName: string) { this.status = MaintenanceStatus.IN_PROGRESS; this.actualStartDate = new Date(); this.assignedTechnicianId = technicianId; this.assignedTechnicianName = technicianName; return this.save(); };
MaintenanceRecordSchema.methods.completeWork = function (findings: string, recommendations: string[]) { this.status = MaintenanceStatus.COMPLETED; this.actualEndDate = new Date(); if (this.actualStartDate) this.actualDurationMinutes = Math.round((this.actualEndDate.getTime() - this.actualStartDate.getTime()) / (1000 * 60)); this.findings = findings; this.recommendations = recommendations; return this.save(); };
MaintenanceRecordSchema.methods.cancelWork = function (reason: string) { this.status = MaintenanceStatus.CANCELLED; this.findings = reason; return this.save(); };
MaintenanceRecordSchema.methods.addChecklistItem = function (item: Partial<IMaintenanceChecklistItem>) { this.checklist.push({ itemId: item.itemId || `ITEM_${Date.now()}`, description: item.description || '', isRequired: item.isRequired !== false, status: 'pending' }); return this.save(); };
MaintenanceRecordSchema.methods.completeChecklistItem = function (itemId: string, completedBy: Types.ObjectId, status: 'completed' | 'skipped' | 'failed', notes?: string, evidence?: { type: string; url: string }[]) { const item = this.checklist.find((i) => i.itemId === itemId); if (item) { item.status = status; item.completedAt = new Date(); item.completedBy = completedBy; item.notes = notes; item.evidence = evidence; } return this.save(); };
MaintenanceRecordSchema.methods.addPart = function (part: Omit<IMaintenancePart, 'totalCost'>) { this.partsUsed.push({ ...part, totalCost: part.quantity * part.unitCost }); return this.save(); };
MaintenanceRecordSchema.methods.addLabor = function (labor: Omit<IMaintenanceLabor, 'totalCost'>) { this.labor.push({ ...labor, totalCost: labor.hoursWorked * labor.hourlyRate }); return this.save(); };
MaintenanceRecordSchema.methods.signOff = function (technicianId: Types.ObjectId, technicianName: string, signatureData?: string) { this.signatures.push({ technicianId, technicianName, signedAt: new Date(), signatureData }); return this.save(); };
MaintenanceRecordSchema.methods.requestApproval = function (approvedBy: Types.ObjectId, comments?: string) { this.approvals.push({ approvedBy, approvedAt: new Date(), version: this.approvals.length + 1, comments }); return this.save(); };

export const MaintenanceRecordSchema = MaintenanceRecordSchema;
export const MaintenanceRecord = models.MaintenanceRecord || model('MaintenanceRecord', MaintenanceRecordSchema);








