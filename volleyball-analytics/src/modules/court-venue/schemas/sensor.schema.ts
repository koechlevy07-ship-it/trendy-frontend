import { Schema, model, models, Types, HydratedDocument, Document } from 'mongoose';

export enum SensorType { TEMPERATURE = 'temperature', HUMIDITY = 'humidity', AIR_QUALITY = 'air_quality', CO2 = 'co2', VOC = 'voc', PARTICULATE_MATTER = 'particulate_matter', LIGHT = 'light', NOISE = 'noise', PRESSURE = 'pressure', AIR_FLOW = 'air_flow', SURFACE_TEMPERATURE = 'surface_temperature', BALL_SPEED = 'ball_speed', PLAYER_TRACKING = 'player_tracking', NET_TENSION = 'net_tension', FLOOR_VIBRATION = 'floor_vibration', CAMERA_HEALTH = 'camera_health', CUSTOM = 'custom' }
export enum SensorStatus { ACTIVE = 'active', INACTIVE = 'inactive', CALIBRATING = 'calibrating', ERROR = 'error', MAINTENANCE = 'maintenance', OFFLINE = 'offline', DECOMMISSIONED = 'decommissioned' }
export enum SensorUnit { CELSIUS = 'celsius', FAHRENHEIT = 'fahrenheit', KELVIN = 'kelvin', PERCENT = 'percent', PPM = 'ppm', PPB = 'ppb', UG_M3 = 'ug_m3', LUX = 'lux', DECIBEL = 'decibel', HPA = 'hpa', PA = 'pa', M_S = 'm_s', RPM = 'rpm', NEWTON = 'newton', VOLT = 'volt', AMPERE = 'ampere', WATT = 'watt', UNITLESS = 'unitless' }

export interface ISensorThresholds { criticalMin?: number; warningMin?: number; optimalMin?: number; optimalMax?: number; warningMax?: number; criticalMax?: number; }
export interface ISensorCalibration { calibratedAt: Date; calibratedBy: Types.ObjectId; calibrationMethod: string; referenceValue: number; measuredValue: number; offset: number; scaleFactor: number; nextCalibrationDue: Date; calibrationCertificate?: string; status: 'passed' | 'failed' | 'conditional'; notes?: string; }
export interface ISensorReading { timestamp: Date; value: number; unit: SensorUnit; quality: 'good' | 'uncertain' | 'bad'; metadata?: Record<string, unknown>; }

export interface ISensor extends Document {
  venueId?: Types.ObjectId; courtId?: Types.ObjectId; facilityId?: Types.ObjectId; equipmentId?: Types.ObjectId;
  sensorId: string; name: string; sensorType: SensorType; manufacturer: string; model: string; serialNumber: string;
  firmwareVersion?: string; unit: SensorUnit; measurementRange: { min: number; max: number }; accuracy: { value: number; unit: SensorUnit }; resolution: number; samplingRate: number;
  status: SensorStatus; location: { description: string; coordinates?: { x: number; y: number; z: number }; zone?: string };
  thresholds: ISensorThresholds; calibration: ISensorCalibration; connectivity: { protocol: 'wired' | 'wireless' | 'bluetooth' | 'zigbee' | 'lorawan' | 'nb_iot' | 'wifi' | 'ethernet'; networkId?: string; ipAddress?: string; macAddress?: string; gatewayId?: Types.ObjectId; };
  powerSource: { type: 'battery' | 'mains' | 'solar' | 'poe' | 'usb'; batteryLevel?: number; lastBatteryChange?: Date; };
  dataRetention: { rawDataDays: number; aggregatedDataDays: number; archiveEnabled: boolean; };
  alertConfig: { enabled: boolean; channels: ('email' | 'sms' | 'push' | 'webhook' | 'slack')[]; recipients: Types.ObjectId[]; cooldownMinutes: number; };
  healthMetrics: { lastReading?: Date; uptimePercentage: number; readingCount: number; errorCount: number; lastError?: string; driftDetected: boolean; driftMagnitude?: number; };
  metadata: Record<string, unknown>;
  installedAt?: Date; activatedAt?: Date; decommissionedAt?: Date;
  createdAt: Date; updatedAt: Date;
}

export type SensorDocument = HydratedDocument<ISensor>;

const SensorThresholdsSchema = new Schema<ISensorThresholds>({ criticalMin: { type: Number }, warningMin: { type: Number }, optimalMin: { type: Number }, optimalMax: { type: Number }, warningMax: { type: Number }, criticalMax: { type: Number } }, { _id: false });
const SensorCalibrationSchema = new Schema<ISensorCalibration>({ calibratedAt: { type: Date, required: true }, calibratedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, calibrationMethod: { type: String, required: true, trim: true }, referenceValue: { type: Number, required: true }, measuredValue: { type: Number, required: true }, offset: { type: Number, required: true }, scaleFactor: { type: Number, required: true, default: 1 }, nextCalibrationDue: { type: Date, required: true }, calibrationCertificate: { type: String }, status: { type: String, enum: ['passed', 'failed', 'conditional'], required: true }, notes: { type: String, trim: true } }, { _id: false });
const SensorReadingSchema = new Schema<ISensorReading>({ timestamp: { type: Date, required: true }, value: { type: Number, required: true }, unit: { type: String, enum: Object.values(SensorUnit), required: true }, quality: { type: String, enum: ['good', 'uncertain', 'bad'], default: 'good' }, metadata: { type: Schema.Types.Mixed } }, { _id: false });
const SensorConnectivitySchema = new Schema({ protocol: { type: String, enum: ['wired', 'wireless', 'bluetooth', 'zigbee', 'lorawan', 'nb_iot', 'wifi', 'ethernet'], required: true }, networkId: { type: String, trim: true }, ipAddress: { type: String, trim: true }, macAddress: { type: String, trim: true }, gatewayId: { type: Schema.Types.ObjectId, ref: 'Gateway' } }, { _id: false });
const SensorPowerSourceSchema = new Schema({ type: { type: String, enum: ['battery', 'mains', 'solar', 'poe', 'usb'], required: true }, batteryLevel: { type: Number, min: 0, max: 100 }, lastBatteryChange: { type: Date } }, { _id: false });
const SensorDataRetentionSchema = new Schema({ rawDataDays: { type: Number, default: 30, min: 1 }, aggregatedDataDays: { type: Number, default: 365, min: 1 }, archiveEnabled: { type: Boolean, default: true } }, { _id: false });
const SensorAlertConfigSchema = new Schema({ enabled: { type: Boolean, default: true }, channels: [{ type: String, enum: ['email', 'sms', 'push', 'webhook', 'slack'] }], recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }], cooldownMinutes: { type: Number, default: 60, min: 0 } }, { _id: false });
const SensorHealthMetricsSchema = new Schema({ lastReading: { type: Date }, uptimePercentage: { type: Number, default: 100, min: 0, max: 100 }, readingCount: { type: Number, default: 0, min: 0 }, errorCount: { type: Number, default: 0, min: 0 }, lastError: { type: String }, driftDetected: { type: Boolean, default: false }, driftMagnitude: { type: Number } }, { _id: false });
const SensorLocationSchema = new Schema({ description: { type: String, required: true, trim: true }, coordinates: { x: { type: Number }, y: { type: Number }, z: { type: Number } }, zone: { type: String, trim: true } }, { _id: false });

const SensorSchema = new Schema<ISensor>({
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue' }, courtId: { type: Schema.Types.ObjectId, ref: 'Court' }, facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' }, equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  sensorId: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 50 }, name: { type: String, required: true, trim: true, maxlength: 200 },
  sensorType: { type: String, enum: Object.values(SensorType), required: true }, manufacturer: { type: String, required: true, trim: true }, model: { type: String, required: true, trim: true }, serialNumber: { type: String, required: true, trim: true, unique: true },
  firmwareVersion: { type: String, trim: true }, unit: { type: String, enum: Object.values(SensorUnit), required: true },
  measurementRange: { min: { type: Number, required: true }, max: { type: Number, required: true } }, accuracy: { value: { type: Number, required: true }, unit: { type: String, enum: Object.values(SensorUnit), required: true } }, resolution: { type: Number, required: true, min: 0 }, samplingRate: { type: Number, required: true, min: 0.001 },
  status: { type: String, enum: Object.values(SensorStatus), default: SensorStatus.INACTIVE },
  location: { type: SensorLocationSchema, required: true },
  thresholds: { type: SensorThresholdsSchema, required: true },
  calibration: { type: SensorCalibrationSchema, required: true },
  connectivity: { type: SensorConnectivitySchema, required: true },
  powerSource: { type: SensorPowerSourceSchema, required: true },
  dataRetention: { type: SensorDataRetentionSchema, required: true },
  alertConfig: { type: SensorAlertConfigSchema, required: true },
  healthMetrics: { type: SensorHealthMetricsSchema, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  installedAt: { type: Date }, activatedAt: { type: Date }, decommissionedAt: { type: Date },
}, { timestamps: true, collection: 'sensors' });

SensorSchema.index({ venueId: 1, sensorType: 1 });
SensorSchema.index({ courtId: 1, sensorType: 1 });
SensorSchema.index({ facilityId: 1, sensorType: 1 });
SensorSchema.index({ equipmentId: 1, sensorType: 1 });
SensorSchema.index({ sensorId: 1 });
SensorSchema.index({ serialNumber: 1 });
SensorSchema.index({ status: 1 });
SensorSchema.index({ 'calibration.nextCalibrationDue': 1 });
SensorSchema.index({ 'healthMetrics.lastReading': 1 });

SensorSchema.virtual('isCalibrationDue').get(function () { return this.calibration.nextCalibrationDue < new Date(); });
SensorSchema.virtual('isCalibrationOverdue').get(function () { const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); return this.calibration.nextCalibrationDue < sevenDaysAgo; });
SensorSchema.virtual('isOnline').get(function () { if (!this.healthMetrics.lastReading) return false; const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); return this.healthMetrics.lastReading > fiveMinutesAgo; });

SensorSchema.pre('validate', function (next) {
  if (this.calibration.nextCalibrationDue <= this.calibration.calibratedAt) next(new Error('Next calibration due date must be after calibration date'));
  if (this.measurementRange.min >= this.measurementRange.max) next(new Error('Measurement range min must be less than max'));
  if (this.thresholds.criticalMin !== undefined && this.thresholds.warningMin !== undefined && this.thresholds.criticalMin > this.thresholds.warningMin) next(new Error('Critical min threshold must be <= warning min'));
  if (this.thresholds.criticalMax !== undefined && this.thresholds.warningMax !== undefined && this.thresholds.criticalMax < this.thresholds.warningMax) next(new Error('Critical max threshold must be >= warning max'));
  next();
});

export const SensorSchema = SensorSchema;
export const Sensor = models.Sensor || model<ISensor>('Sensor', SensorSchema);








