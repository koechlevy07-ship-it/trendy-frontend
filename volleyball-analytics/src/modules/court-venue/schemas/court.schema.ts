import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum CourtType { INDOOR_VOLLEYBALL = 'indoor_volleyball', BEACH_VOLLEYBALL = 'beach_volleyball', SITTING_VOLLEYBALL = 'sitting_volleyball', SNOW_VOLLEYBALL = 'snow_volleyball', GRASS_VOLLEYBALL = 'grass_volleyball', TRAINING = 'training', WARM_UP = 'warm_up' }
export enum SurfaceType { WOOD = 'wood', SYNTHETIC = 'synthetic', TARA = 'tara', CONCRETE = 'concrete', SAND = 'sand', GRASS = 'grass', SNOW = 'snow', MODULAR = 'modular', RUBBER = 'rubber' }
export enum CourtStatus { DRAFT = 'draft', REGISTERED = 'registered', ACTIVE = 'active', INACTIVE = 'inactive', MAINTENANCE = 'maintenance', SUSPENDED = 'suspended', ARCHIVED = 'archived' }
export enum CourtOrientation { NORTH_SOUTH = 'north_south', EAST_WEST = 'east_west', NORTHEAST_SOUTHWEST = 'northeast_southwest', NORTHWEST_SOUTHEAST = 'northwest_southeast' }
export enum MaintenanceStatus { NONE = 'none', SCHEDULED = 'scheduled', IN_PROGRESS = 'in_progress', COMPLETED = 'completed', OVERDUE = 'overdue' }

export interface ICourtDimensions { length: number; width: number; freeZoneLength: number; freeZoneWidth: number; netHeight: number; netHeightMen?: number; netHeightWomen?: number; poleDistance?: number; antennaHeight?: number; serviceZoneDepth?: number; substitutionZoneLength?: number; liberoZoneLength?: number; }
export interface ICourtEquipment { netSystem: { type: string; manufacturer: string; model: string; serialNumber?: string; lastInspection?: Date }; posts: { type: string; manufacturer: string; model: string; serialNumber?: string; lastInspection?: Date }[]; antennae: { manufacturer: string; model: string; serialNumber?: string }[]; scoreboard?: { type: string; manufacturer: string; model: string; serialNumber?: string }; lighting?: { type: string; luxLevel: number; manufacturer: string }; padding?: { type: string; manufacturer: string }; }
export interface ICourtAIConfiguration { enabled: boolean; trackingConfig?: Record<string, unknown>; detectionConfig?: Record<string, unknown>; actionRecognitionConfig?: Record<string, unknown>; }

export interface ICourt extends Document {
  venueId: Types.ObjectId; courtCode: string; courtName: string; courtType: CourtType; surfaceType: SurfaceType; dimensions: ICourtDimensions; orientation: CourtOrientation; status: CourtStatus; equipment: ICourtEquipment; cameraProfileId?: Types.ObjectId; calibrationProfileId?: Types.ObjectId; maintenanceStatus: { isUnderMaintenance: boolean; maintenanceStartDate?: Date; maintenanceEndDate?: Date; maintenanceReason?: string; scheduledMaintenance?: Date[]; }; availability: { isBookable: boolean; blockoutDates: Date[]; recurringBlockouts: { dayOfWeek: number; startTime: string; endTime: string }[]; }; aiConfiguration: ICourtAIConfiguration; metadata: Record<string, unknown>; activatedAt?: Date; activatedBy?: Types.ObjectId; suspendedAt?: Date; suspendedBy?: Types.ObjectId; archivedAt?: Date; archivedBy?: Types.ObjectId; createdAt: Date; updatedAt: Date;
}

export type CourtDocument = HydratedDocument<ICourt>;

const CourtDimensionsSchema = new Schema<ICourtDimensions>({ length: { type: Number, required: true, min: 10, max: 50 }, width: { type: Number, required: true, min: 10, max: 30 }, freeZoneLength: { type: Number, required: true, min: 2, max: 10 }, freeZoneWidth: { type: Number, required: true, min: 2, max: 10 }, netHeight: { type: Number, required: true, min: 1.5, max: 3 }, netHeightMen: { type: Number, min: 1.5, max: 3 }, netHeightWomen: { type: Number, min: 1.5, max: 3 }, poleDistance: { type: Number, min: 0.5, max: 5 }, antennaHeight: { type: Number, min: 0.5, max: 2 }, serviceZoneDepth: { type: Number, min: 1, max: 10 }, substitutionZoneLength: { type: Number, min: 1, max: 5 }, liberoZoneLength: { type: Number, min: 1, max: 5 } }, { _id: false });
const CourtEquipmentSchema = new Schema<ICourtEquipment>({ netSystem: { type: { type: String, required: true }, manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String }, lastInspection: { type: Date } }, posts: [{ type: { type: String, required: true }, manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String }, lastInspection: { type: Date } }], antennae: [{ manufacturer: { type: String, required: true }, model: { type: String, required: true }, serialNumber: { type: String } }], scoreboard: { type: { type: String }, manufacturer: { type: String }, model: { type: String }, serialNumber: { type: String } }, lighting: { type: { type: String }, luxLevel: { type: Number }, manufacturer: { type: String } }, padding: { type: { type: String }, manufacturer: { type: String } } }, { _id: false });

const CourtSchema = new Schema<ICourt>(
  {
    venueId: { type: Schema.Types.ObjectId, required: true, ref: 'Venue' }, courtCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 50 }, courtName: { type: String, required: true, trim: true, maxlength: 200 }, courtType: { type: String, enum: Object.values(CourtType), required: true }, surfaceType: { type: String, enum: Object.values(SurfaceType), required: true }, dimensions: { type: CourtDimensionsSchema, required: true }, orientation: { type: String, enum: Object.values(CourtOrientation), required: true }, status: { type: String, enum: Object.values(CourtStatus), default: CourtStatus.DRAFT }, equipment: { type: CourtEquipmentSchema, required: true }, cameraProfileId: { type: Schema.Types.ObjectId, ref: 'CameraProfile' }, calibrationProfileId: { type: Schema.Types.ObjectId, ref: 'CalibrationProfile' }, maintenanceStatus: { isUnderMaintenance: { type: Boolean, default: false }, maintenanceStartDate: { type: Date }, maintenanceEndDate: { type: Date }, maintenanceReason: { type: String }, scheduledMaintenance: [{ type: Date }] }, availability: { isBookable: { type: Boolean, default: true }, blockoutDates: [{ type: Date }], recurringBlockouts: [{ dayOfWeek: { type: Number, min: 0, max: 6 }, startTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }, endTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ } }] }, aiConfiguration: { enabled: { type: Boolean, default: false }, trackingConfig: { type: Schema.Types.Mixed }, detectionConfig: { type: Schema.Types.Mixed }, actionRecognitionConfig: { type: Schema.Types.Mixed } }, metadata: { type: Schema.Types.Mixed, default: {} }, activatedAt: { type: Date }, activatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, suspendedAt: { type: Date }, suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' }, archivedAt: { type: Date }, archivedBy: { type: Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true, collection: 'courts' }
);

CourtSchema.index({ venueId: 1, courtCode: 1 }, { unique: true });
CourtSchema.index({ venueId: 1, status: 1 });
CourtSchema.index({ courtType: 1, surfaceType: 1 });
CourtSchema.index({ status: 1 });
CourtSchema.index({ cameraProfileId: 1 });
CourtSchema.index({ calibrationProfileId: 1 });

CourtSchema.pre('validate', function (next) { if (this.maintenanceStatus.isUnderMaintenance) this.availability.isBookable = false; if (this.status === CourtStatus.MAINTENANCE) this.maintenanceStatus.isUnderMaintenance = true; next(); });

export const Court = models.Court || model<ICourt>('Court', CourtSchema);





