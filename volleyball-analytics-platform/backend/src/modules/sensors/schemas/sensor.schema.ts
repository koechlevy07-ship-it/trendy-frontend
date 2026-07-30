import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EnvironmentSensorDocument = EnvironmentSensor & Document;

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  AIR_QUALITY = 'air_quality',
  LIGHT_INTENSITY = 'light_intensity',
  NOISE_LEVEL = 'noise_level',
  MOTION_DETECTION = 'motion_detection',
  CO2 = 'co2',
  PM25 = 'pm25',
  PM10 = 'pm10',
  VOC = 'voc',
  PRESSURE = 'pressure',
  WIND_SPEED = 'wind_speed',
  WIND_DIRECTION = 'wind_direction',
  PRECIPITATION = 'precipitation',
  UV_INDEX = 'uv_index',
  SOIL_MOISTURE = 'soil_moisture',
  WATER_LEVEL = 'water_level',
  VIBRATION = 'vibration',
  SOUND_LEVEL = 'sound_level',
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CALIBRATION = 'calibration',
  ERROR = 'error',
  OFFLINE = 'offline',
  DECOMMISSIONED = 'decommissioned',
}

export enum MeasurementUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit',
  PERCENT = 'percent',
  LUX = 'lux',
  DECIBEL = 'decibel',
  PPM = 'ppm',
  MICROGRAMS_M3 = 'ug_m3',
  HPA = 'hpa',
  M_S = 'm_s',
  DEGREES = 'degrees',
  MM = 'mm',
  UV_INDEX = 'uv_index',
  PERCENT_VWC = 'percent_vwc',
  METERS = 'meters',
  HZ = 'hz',
  DB = 'db',
}

@Schema({ _id: false })
export class SensorCalibration {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  lastCalibration: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date })
  nextCalibration?: Date;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibrationStandard?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  calibratedBy?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  certificateNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  calibrationData?: Record<string, any>;
}

@Schema({ _id: false })
export class SensorLocation {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  zone?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  area?: string;

  @ApiProperty({ required: false })
  @Prop({ type: [Number] })
  coordinates?: [number, number, number];

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingHeight?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  mountingType?: string;
}

@Schema({ _id: false })
export class SensorThresholds {
  @ApiProperty({ required: false })
  @Prop({ type: Number })
  warningMin?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  warningMax?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  criticalMin?: number;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  criticalMax?: number;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  alertContacts: string[];
}

@Schema({ _id: false })
export class SensorMetadata {
  @ApiProperty({ required: false })
  @Prop({ type: String })
  model?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  manufacturer?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  serialNumber?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  firmwareVersion?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  hardwareVersion?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  communicationProtocol?: string;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  powerSource?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Number })
  samplingRate?: number;

  @ApiProperty({ required: false })
  @Prop({ type: String })
  powerConsumption?: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  customFields?: Record<string, any>;
}

@Schema({ _id: false })
export class SensorAuditInfo {
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
export class SensorArchive {
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
  collection: 'environment_sensors',
  timestamps: true,
  versionKey: 'version',
})
export class EnvironmentSensor {
  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  sensorId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true, index: true })
  venueId: Types.ObjectId;

  @ApiProperty({ required: false })
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, required: true, unique: true, index: true })
  sensorCode: string;

  @ApiProperty()
  @Prop({ type: String, required: true, index: true })
  name: string;

  @ApiProperty({ enum: [
    'temperature', 'humidity', 'air_quality', 'light_intensity', 'noise_level',
    'motion_detection', 'co2', 'pm25', 'pm10', 'voc', 'pressure',
    'wind_speed', 'wind_direction', 'precipitation', 'uv_index',
    'soil_moisture', 'water_level', 'vibration', 'sound_level'
  ] })
  @Prop({ type: String, enum: [
    'temperature', 'humidity', 'air_quality', 'light_intensity', 'noise_level',
    'motion_detection', 'co2', 'pm25', 'pm10', 'voc', 'pressure',
    'wind_speed', 'wind_direction', 'precipitation', 'uv_index',
    'soil_moisture', 'water_level', 'vibration', 'sound_level'
  ], required: true, index: true })
  type: string;

  @ApiProperty({ enum: ['active', 'inactive', 'maintenance', 'calibration', 'error', 'offline', 'decommissioned'] })
  @Prop({ type: String, enum: ['active', 'inactive', 'maintenance', 'calibration', 'error', 'offline', 'decommissioned'], required: true, default: 'active', index: true })
  status: string;

  @ApiProperty({ enum: ['celsius', 'fahrenheit', 'percent', 'lux', 'decibel', 'ppm', 'ug_m3', 'hpa', 'm_s', 'degrees', 'mm', 'uv_index', 'percent_vwc', 'meters', 'hz', 'db'] })
  @Prop({ type: String, enum: ['celsius', 'fahrenheit', 'percent', 'lux', 'decibel', 'ppm', 'ug_m3', 'hpa', 'm_s', 'degrees', 'mm', 'uv_index', 'percent_vwc', 'meters', 'hz', 'db'], required: true })
  unit: string;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  location?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  calibration?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  thresholds?: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  metadata?: any;

  @ApiProperty()
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @ApiProperty()
  @Prop({ type: Object, default: {} })
  audit: any;

  @ApiProperty({ required: false })
  @Prop({ type: Object })
  archive?: any;
}

export const EnvironmentSensorSchema = SchemaFactory.createForClass(EnvironmentSensor);

// Indexes
EnvironmentSensorSchema.index({ sensorId: 1 }, { unique: true });
EnvironmentSensorSchema.index({ sensorCode: 1 }, { unique: true });
EnvironmentSensorSchema.index({ venueId: 1, type: 1 });
EnvironmentSensorSchema.index({ venueId: 1, status: 1 });
EnvironmentSensorSchema.index({ courtId: 1 });
EnvironmentSensorSchema.index({ type: 1 });
EnvironmentSensorSchema.index({ status: 1 });

// Virtual for isActive
EnvironmentSensorSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for isOnline
EnvironmentSensorSchema.virtual('isOnline').get(function() {
  return this.status === 'active' || this.status === 'maintenance' || this.status === 'calibration';
});