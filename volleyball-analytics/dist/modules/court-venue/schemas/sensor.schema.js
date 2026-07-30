"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sensor = exports.SensorSchema = exports.SensorUnit = exports.SensorStatus = exports.SensorType = void 0;
const mongoose_1 = require("mongoose");
var SensorType;
(function (SensorType) {
    SensorType["TEMPERATURE"] = "temperature";
    SensorType["HUMIDITY"] = "humidity";
    SensorType["AIR_QUALITY"] = "air_quality";
    SensorType["CO2"] = "co2";
    SensorType["VOC"] = "voc";
    SensorType["PARTICULATE_MATTER"] = "particulate_matter";
    SensorType["LIGHT"] = "light";
    SensorType["NOISE"] = "noise";
    SensorType["PRESSURE"] = "pressure";
    SensorType["AIR_FLOW"] = "air_flow";
    SensorType["SURFACE_TEMPERATURE"] = "surface_temperature";
    SensorType["BALL_SPEED"] = "ball_speed";
    SensorType["PLAYER_TRACKING"] = "player_tracking";
    SensorType["NET_TENSION"] = "net_tension";
    SensorType["FLOOR_VIBRATION"] = "floor_vibration";
    SensorType["CAMERA_HEALTH"] = "camera_health";
    SensorType["CUSTOM"] = "custom";
})(SensorType || (exports.SensorType = SensorType = {}));
var SensorStatus;
(function (SensorStatus) {
    SensorStatus["ACTIVE"] = "active";
    SensorStatus["INACTIVE"] = "inactive";
    SensorStatus["CALIBRATING"] = "calibrating";
    SensorStatus["ERROR"] = "error";
    SensorStatus["MAINTENANCE"] = "maintenance";
    SensorStatus["OFFLINE"] = "offline";
    SensorStatus["DECOMMISSIONED"] = "decommissioned";
})(SensorStatus || (exports.SensorStatus = SensorStatus = {}));
var SensorUnit;
(function (SensorUnit) {
    SensorUnit["CELSIUS"] = "celsius";
    SensorUnit["FAHRENHEIT"] = "fahrenheit";
    SensorUnit["KELVIN"] = "kelvin";
    SensorUnit["PERCENT"] = "percent";
    SensorUnit["PPM"] = "ppm";
    SensorUnit["PPB"] = "ppb";
    SensorUnit["UG_M3"] = "ug_m3";
    SensorUnit["LUX"] = "lux";
    SensorUnit["DECIBEL"] = "decibel";
    SensorUnit["HPA"] = "hpa";
    SensorUnit["PA"] = "pa";
    SensorUnit["M_S"] = "m_s";
    SensorUnit["RPM"] = "rpm";
    SensorUnit["NEWTON"] = "newton";
    SensorUnit["VOLT"] = "volt";
    SensorUnit["AMPERE"] = "ampere";
    SensorUnit["WATT"] = "watt";
    SensorUnit["UNITLESS"] = "unitless";
})(SensorUnit || (exports.SensorUnit = SensorUnit = {}));
const SensorThresholdsSchema = new mongoose_1.Schema({ criticalMin: { type: Number }, warningMin: { type: Number }, optimalMin: { type: Number }, optimalMax: { type: Number }, warningMax: { type: Number }, criticalMax: { type: Number } }, { _id: false });
const SensorCalibrationSchema = new mongoose_1.Schema({ calibratedAt: { type: Date, required: true }, calibratedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }, calibrationMethod: { type: String, required: true, trim: true }, referenceValue: { type: Number, required: true }, measuredValue: { type: Number, required: true }, offset: { type: Number, required: true }, scaleFactor: { type: Number, required: true, default: 1 }, nextCalibrationDue: { type: Date, required: true }, calibrationCertificate: { type: String }, status: { type: String, enum: ['passed', 'failed', 'conditional'], required: true }, notes: { type: String, trim: true } }, { _id: false });
const SensorReadingSchema = new mongoose_1.Schema({ timestamp: { type: Date, required: true }, value: { type: Number, required: true }, unit: { type: String, enum: Object.values(SensorUnit), required: true }, quality: { type: String, enum: ['good', 'uncertain', 'bad'], default: 'good' }, metadata: { type: mongoose_1.Schema.Types.Mixed } }, { _id: false });
const SensorConnectivitySchema = new mongoose_1.Schema({ protocol: { type: String, enum: ['wired', 'wireless', 'bluetooth', 'zigbee', 'lorawan', 'nb_iot', 'wifi', 'ethernet'], required: true }, networkId: { type: String, trim: true }, ipAddress: { type: String, trim: true }, macAddress: { type: String, trim: true }, gatewayId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Gateway' } }, { _id: false });
const SensorPowerSourceSchema = new mongoose_1.Schema({ type: { type: String, enum: ['battery', 'mains', 'solar', 'poe', 'usb'], required: true }, batteryLevel: { type: Number, min: 0, max: 100 }, lastBatteryChange: { type: Date } }, { _id: false });
const SensorDataRetentionSchema = new mongoose_1.Schema({ rawDataDays: { type: Number, default: 30, min: 1 }, aggregatedDataDays: { type: Number, default: 365, min: 1 }, archiveEnabled: { type: Boolean, default: true } }, { _id: false });
const SensorAlertConfigSchema = new mongoose_1.Schema({ enabled: { type: Boolean, default: true }, channels: [{ type: String, enum: ['email', 'sms', 'push', 'webhook', 'slack'] }], recipients: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }], cooldownMinutes: { type: Number, default: 60, min: 0 } }, { _id: false });
const SensorHealthMetricsSchema = new mongoose_1.Schema({ lastReading: { type: Date }, uptimePercentage: { type: Number, default: 100, min: 0, max: 100 }, readingCount: { type: Number, default: 0, min: 0 }, errorCount: { type: Number, default: 0, min: 0 }, lastError: { type: String }, driftDetected: { type: Boolean, default: false }, driftMagnitude: { type: Number } }, { _id: false });
const SensorLocationSchema = new mongoose_1.Schema({ description: { type: String, required: true, trim: true }, coordinates: { x: { type: Number }, y: { type: Number }, z: { type: Number } }, zone: { type: String, trim: true } }, { _id: false });
const SensorSchema = new mongoose_1.Schema({
    venueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Venue' }, courtId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Court' }, facilityId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Facility' }, equipmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Equipment' },
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
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
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
SensorSchema.virtual('isOnline').get(function () { if (!this.healthMetrics.lastReading)
    return false; const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); return this.healthMetrics.lastReading > fiveMinutesAgo; });
SensorSchema.pre('validate', function (next) {
    if (this.calibration.nextCalibrationDue <= this.calibration.calibratedAt)
        next(new Error('Next calibration due date must be after calibration date'));
    if (this.measurementRange.min >= this.measurementRange.max)
        next(new Error('Measurement range min must be less than max'));
    if (this.thresholds.criticalMin !== undefined && this.thresholds.warningMin !== undefined && this.thresholds.criticalMin > this.thresholds.warningMin)
        next(new Error('Critical min threshold must be <= warning min'));
    if (this.thresholds.criticalMax !== undefined && this.thresholds.warningMax !== undefined && this.thresholds.criticalMax < this.thresholds.warningMax)
        next(new Error('Critical max threshold must be >= warning max'));
    next();
});
exports.SensorSchema = SensorSchema;
exports.Sensor = mongoose_1.models.Sensor || (0, mongoose_1.model)('Sensor', SensorSchema);
//# sourceMappingURL=sensor.schema.js.map