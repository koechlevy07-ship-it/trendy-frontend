import { Schema, Types, HydratedDocument, Document } from 'mongoose';
export declare enum SensorType {
    TEMPERATURE = "temperature",
    HUMIDITY = "humidity",
    AIR_QUALITY = "air_quality",
    CO2 = "co2",
    VOC = "voc",
    PARTICULATE_MATTER = "particulate_matter",
    LIGHT = "light",
    NOISE = "noise",
    PRESSURE = "pressure",
    AIR_FLOW = "air_flow",
    SURFACE_TEMPERATURE = "surface_temperature",
    BALL_SPEED = "ball_speed",
    PLAYER_TRACKING = "player_tracking",
    NET_TENSION = "net_tension",
    FLOOR_VIBRATION = "floor_vibration",
    CAMERA_HEALTH = "camera_health",
    CUSTOM = "custom"
}
export declare enum SensorStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    CALIBRATING = "calibrating",
    ERROR = "error",
    MAINTENANCE = "maintenance",
    OFFLINE = "offline",
    DECOMMISSIONED = "decommissioned"
}
export declare enum SensorUnit {
    CELSIUS = "celsius",
    FAHRENHEIT = "fahrenheit",
    KELVIN = "kelvin",
    PERCENT = "percent",
    PPM = "ppm",
    PPB = "ppb",
    UG_M3 = "ug_m3",
    LUX = "lux",
    DECIBEL = "decibel",
    HPA = "hpa",
    PA = "pa",
    M_S = "m_s",
    RPM = "rpm",
    NEWTON = "newton",
    VOLT = "volt",
    AMPERE = "ampere",
    WATT = "watt",
    UNITLESS = "unitless"
}
export interface ISensorThresholds {
    criticalMin?: number;
    warningMin?: number;
    optimalMin?: number;
    optimalMax?: number;
    warningMax?: number;
    criticalMax?: number;
}
export interface ISensorCalibration {
    calibratedAt: Date;
    calibratedBy: Types.ObjectId;
    calibrationMethod: string;
    referenceValue: number;
    measuredValue: number;
    offset: number;
    scaleFactor: number;
    nextCalibrationDue: Date;
    calibrationCertificate?: string;
    status: 'passed' | 'failed' | 'conditional';
    notes?: string;
}
export interface ISensorReading {
    timestamp: Date;
    value: number;
    unit: SensorUnit;
    quality: 'good' | 'uncertain' | 'bad';
    metadata?: Record<string, unknown>;
}
export interface ISensor extends Document {
    venueId?: Types.ObjectId;
    courtId?: Types.ObjectId;
    facilityId?: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    sensorId: string;
    name: string;
    sensorType: SensorType;
    manufacturer: string;
    model: string;
    serialNumber: string;
    firmwareVersion?: string;
    unit: SensorUnit;
    measurementRange: {
        min: number;
        max: number;
    };
    accuracy: {
        value: number;
        unit: SensorUnit;
    };
    resolution: number;
    samplingRate: number;
    status: SensorStatus;
    location: {
        description: string;
        coordinates?: {
            x: number;
            y: number;
            z: number;
        };
        zone?: string;
    };
    thresholds: ISensorThresholds;
    calibration: ISensorCalibration;
    connectivity: {
        protocol: 'wired' | 'wireless' | 'bluetooth' | 'zigbee' | 'lorawan' | 'nb_iot' | 'wifi' | 'ethernet';
        networkId?: string;
        ipAddress?: string;
        macAddress?: string;
        gatewayId?: Types.ObjectId;
    };
    powerSource: {
        type: 'battery' | 'mains' | 'solar' | 'poe' | 'usb';
        batteryLevel?: number;
        lastBatteryChange?: Date;
    };
    dataRetention: {
        rawDataDays: number;
        aggregatedDataDays: number;
        archiveEnabled: boolean;
    };
    alertConfig: {
        enabled: boolean;
        channels: ('email' | 'sms' | 'push' | 'webhook' | 'slack')[];
        recipients: Types.ObjectId[];
        cooldownMinutes: number;
    };
    healthMetrics: {
        lastReading?: Date;
        uptimePercentage: number;
        readingCount: number;
        errorCount: number;
        lastError?: string;
        driftDetected: boolean;
        driftMagnitude?: number;
    };
    metadata: Record<string, unknown>;
    installedAt?: Date;
    activatedAt?: Date;
    decommissionedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export type SensorDocument = HydratedDocument<ISensor>;
export declare const SensorSchema: Schema<ISensor, import("mongoose").Model<ISensor, any, any, any, Document<unknown, any, ISensor, any, {}> & ISensor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ISensor, Document<unknown, {}, import("mongoose").FlatRecord<ISensor>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ISensor> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const Sensor: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<ISensor, {}, {}, {}, Document<unknown, {}, ISensor, {}, {}> & ISensor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=sensor.schema.d.ts.map