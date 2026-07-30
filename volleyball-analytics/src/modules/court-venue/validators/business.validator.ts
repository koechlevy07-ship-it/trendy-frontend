import { Injectable, BadRequestException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Venue, IVenue } from '../schemas/venue.schema';
import { Court, ICourt, CourtStatus, MaintenanceStatus } from '../schemas/court.schema';
import { Camera, ICamera } from '../schemas/camera.schema';
import { CalibrationProfile, ICalibrationProfile } from '../schemas/calibration.schema';
import { Facility, IFacility } from '../schemas/facility.schema';
import { Equipment, IEquipment } from '../schemas/equipment.schema';
import { Sensor, ISensor } from '../schemas/sensor.schema';
import { CoverageZone, ICoverageZone } from '../schemas/coverage-zone.schema';
import { Certification, ICertification } from '../schemas/certification.schema';

export interface BusinessValidationResult {
  valid: boolean;
  errors: BusinessValidationError[];
}

export interface BusinessValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

@Injectable()
export class BusinessValidator {
  constructor(
    @InjectModel(Venue.name) private venueModel: Model<IVenue>,
    @InjectModel(Court.name) private courtModel: Model<ICourt>,
    @InjectModel(Camera.name) private cameraModel: Model<ICamera>,
    @InjectModel(CalibrationProfile.name) private calibrationModel: Model<ICalibrationProfile>,
    @InjectModel(Facility.name) private facilityModel: Model<IFacility>,
    @InjectModel(Equipment.name) private equipmentModel: Model<IEquipment>,
    @InjectModel(Sensor.name) private sensorModel: Model<ISensor>,
    @InjectModel(CoverageZone.name) private coverageZoneModel: Model<ICoverageZone>,
    @InjectModel(Certification.name) private certificationModel: Model<ICertification>,
  ) {}

  async validateVenueUniqueness(venueCode: string, organizationId: string, venueName: string, excludeId?: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];

    const codeQuery: any = { venueCode: venueCode.toUpperCase() };
    if (excludeId) codeQuery._id = { $ne: new Types.ObjectId(excludeId) };
    const existingCode = await this.venueModel.findOne(codeQuery).exec();
    if (existingCode) errors.push({ field: 'venueCode', message: `Venue code ${venueCode} already exists`, code: 'DUPLICATE_VENUE_CODE', value: venueCode });

    const nameQuery: any = { organizationId: new Types.ObjectId(organizationId), venueName };
    if (excludeId) nameQuery._id = { $ne: new Types.ObjectId(excludeId) };
    const existingName = await this.venueModel.findOne(nameQuery).exec();
    if (existingName) errors.push({ field: 'venueName', message: `Venue name ${venueName} already exists in this organization`, code: 'DUPLICATE_VENUE_NAME', value: venueName });

    return { valid: errors.length === 0, errors };
  }

  async validateCourtUniqueness(venueId: string, courtCode: string, excludeId?: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const query: any = { venueId: new Types.ObjectId(venueId), courtCode: courtCode.toUpperCase() };
    if (excludeId) query._id = { $ne: new Types.ObjectId(excludeId) };
    const existing = await this.courtModel.findOne(query).exec();
    if (existing) errors.push({ field: 'courtCode', message: `Court code ${courtCode} already exists in this venue`, code: 'DUPLICATE_COURT_CODE', value: courtCode });
    return { valid: errors.length === 0, errors };
  }

  async validateCourtDimensions(courtType: string, dimensions: any): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const regulations: Record<string, { minLength: number; maxLength: number; minWidth: number; maxWidth: number; netHeight: { min: number; max: number } }> = {
      indoor_volleyball: { minLength: 18, maxLength: 18, minWidth: 9, maxWidth: 9, netHeight: { min: 2.24, max: 2.43 } },
      beach_volleyball: { minLength: 16, maxLength: 16, minWidth: 8, maxWidth: 8, netHeight: { min: 2.24, max: 2.43 } },
      sitting_volleyball: { minLength: 10, maxLength: 10, minWidth: 6, maxWidth: 6, netHeight: { min: 1.05, max: 1.15 } },
    };
    const regulation = regulations[courtType];
    if (!regulation) return { valid: true, errors };

    if (dimensions.length < regulation.minLength || dimensions.length > regulation.maxLength) errors.push({ field: 'dimensions.length', message: `Court length must be between ${regulation.minLength}m and ${regulation.maxLength}m for ${courtType}`, code: 'INVALID_COURT_LENGTH', value: dimensions.length });
    if (dimensions.width < regulation.minWidth || dimensions.width > regulation.maxWidth) errors.push({ field: 'dimensions.width', message: `Court width must be between ${regulation.minWidth}m and ${regulation.maxWidth}m for ${courtType}`, code: 'INVALID_COURT_WIDTH', value: dimensions.width });
    if (dimensions.netHeight < regulation.netHeight.min || dimensions.netHeight > regulation.netHeight.max) errors.push({ field: 'dimensions.netHeight', message: `Net height must be between ${regulation.netHeight.min}m and ${regulation.netHeight.max}m for ${courtType}`, code: 'INVALID_NET_HEIGHT', value: dimensions.netHeight });
    return { valid: errors.length === 0, errors };
  }

  async validateCourtAvailability(courtId: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const court = await this.courtModel.findById(courtId).exec();
    if (!court) { errors.push({ field: 'courtId', message: 'Court not found', code: 'COURT_NOT_FOUND' }); return { valid: false, errors }; }
    if (court.maintenanceStatus === MaintenanceStatus.IN_PROGRESS) errors.push({ field: 'maintenanceStatus', message: 'Court is under maintenance and cannot be scheduled', code: 'COURT_UNDER_MAINTENANCE' });
    if (court.status === CourtStatus.SUSPENDED || court.status === CourtStatus.ARCHIVED) errors.push({ field: 'status', message: 'Court is not available for scheduling', code: 'COURT_NOT_AVAILABLE' });
    return { valid: errors.length === 0, errors };
  }

  async validateCameraPositioning(courtId: string, position: any, excludeId?: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const existingCameras = await this.cameraModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
    for (const camera of existingCameras) {
      if (excludeId && camera._id.toString() === excludeId) continue;
      const distance = Math.sqrt(Math.pow(camera.position.x - position.x, 2) + Math.pow(camera.position.y - position.y, 2) + Math.pow(camera.position.z - position.z, 2));
      if (distance < 0.5) errors.push({ field: 'position', message: `Camera position conflicts with existing camera ${camera.cameraId}`, code: 'CAMERA_POSITION_CONFLICT', value: { existingCameraId: camera.cameraId, distance } });
    }
    return { valid: errors.length === 0, errors };
  }

  async validateCameraCoverage(courtId: string, cameraId: string, fieldOfView: any): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const court = await this.courtModel.findById(courtId);
    if (!court) { errors.push({ field: 'courtId', message: 'Court not found', code: 'COURT_NOT_FOUND' }); return { valid: false, errors }; }
    if (court.assignedCameraIds.includes(new Types.ObjectId(cameraId))) errors.push({ field: 'cameraId', message: 'Camera is already assigned to this court', code: 'CAMERA_ALREADY_ASSIGNED' });
    return { valid: errors.length === 0, errors };
  }

  async validateCalibrationAccuracy(calibrationId: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const calibration = await this.calibrationModel.findById(calibrationId).exec();
    if (!calibration) { errors.push({ field: 'calibrationId', message: 'Calibration not found', code: 'CALIBRATION_NOT_FOUND' }); return { valid: false, errors }; }
    const maxReprojectionError = 1.0;
    if (calibration.metrics.reprojectionError > maxReprojectionError) errors.push({ field: 'metrics.reprojectionError', message: `Reprojection error (${calibration.metrics.reprojectionError}) exceeds maximum allowed (${maxReprojectionError})`, code: 'CALIBRATION_ACCURACY_FAILED', value: calibration.metrics.reprojectionError });
    const existing = await this.calibrationModel.findOne({ cameraInstallationId: calibration.cameraInstallationId, status: 'active' }).exec();
    if (existing) errors.push({ field: 'calibration', message: 'Active calibration already exists for this camera', code: 'ACTIVE_CALIBRATION_EXISTS', value: existing._id });
    return { valid: errors.length === 0, errors };
  }

  async validateEquipmentAvailability(equipmentId: string, startDate: Date, endDate: Date): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const equipment = await this.equipmentModel.findById(equipmentId).exec();
    if (!equipment) { errors.push({ field: 'equipmentId', message: 'Equipment not found', code: 'EQUIPMENT_NOT_FOUND' }); return { valid: false, errors }; }
    if (equipment.status !== 'available') errors.push({ field: 'status', message: `Equipment status is ${equipment.status}`, code: 'EQUIPMENT_NOT_AVAILABLE' });
    const maintenanceConflicts = equipment.maintenanceHistory.some(m => m.status === 'scheduled' && m.scheduledDate >= startDate && m.scheduledDate <= endDate);
    if (maintenanceConflicts) errors.push({ field: 'equipmentId', message: 'Equipment has scheduled maintenance during this period', code: 'MAINTENANCE_CONFLICT' });
    return { valid: errors.length === 0, errors };
  }

  async validateFacilityAvailability(facilityId: string, startTime: Date, endTime: Date): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const facility = await this.facilityModel.findById(facilityId).exec();
    if (!facility) { errors.push({ field: 'facilityId', message: 'Facility not found', code: 'FACILITY_NOT_FOUND' }); return { valid: false, errors }; }
    if (facility.status !== 'available') errors.push({ field: 'status', message: `Facility status is ${facility.status}`, code: 'FACILITY_NOT_AVAILABLE' });
    const conflictingBooking = facility.bookings.find(b => b.date >= startTime && b.date <= endTime);
    if (conflictingBooking) errors.push({ field: 'booking', message: 'Facility is already booked for this time period', code: 'FACILITY_BOOKING_CONFLICT', value: conflictingBooking });
    return { valid: errors.length === 0, errors };
  }

  async validateSensorCalibration(sensorId: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const sensor = await this.sensorModel.findById(sensorId).exec();
    if (!sensor) { errors.push({ field: 'sensorId', message: 'Sensor not found', code: 'SENSOR_NOT_FOUND' }); return { valid: false, errors }; }
    if (sensor.calibration.nextCalibrationDue < new Date()) errors.push({ field: 'calibration', message: 'Sensor calibration is overdue', code: 'CALIBRATION_OVERDUE', value: sensor.calibration.nextCalibrationDue });
    if (sensor.status === 'error' || sensor.status === 'offline') errors.push({ field: 'status', message: 'Sensor is not operational', code: 'SENSOR_NOT_OPERATIONAL' });
    return { valid: errors.length === 0, errors };
  }

  async validateCoverageZoneRequirements(zoneId: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const zone = await this.coverageZoneModel.findById(zoneId).exec();
    if (!zone) { errors.push({ field: 'zoneId', message: 'Zone not found', code: 'ZONE_NOT_FOUND' }); return { valid: false, errors }; }
    if (zone.assignedCameras.length < zone.requiredCameras) errors.push({ field: 'assignedCameras', message: `Zone requires ${zone.requiredCameras} cameras but has ${zone.assignedCameras.length}`, code: 'INSUFFICIENT_CAMERAS', value: { required: zone.requiredCameras, assigned: zone.assignedCameras.length } });
    return { valid: errors.length === 0, errors };
  }

  async validateCertificationValidity(venueId?: string, courtId?: string, equipmentId?: string, facilityId?: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const query: any = { status: { $in: ['approved', 'expiring_soon'] } };
    if (venueId) query.venueId = new Types.ObjectId(venueId);
    if (courtId) query.courtId = new Types.ObjectId(courtId);
    if (equipmentId) query.equipmentId = new Types.ObjectId(equipmentId);
    if (facilityId) query.facilityId = new Types.ObjectId(facilityId);
    const certifications = await this.certificationModel.find(query).exec();
    for (const cert of certifications) {
      if (cert.isExpired) errors.push({ field: 'certification', message: `Certification ${cert.name} has expired`, code: 'CERTIFICATION_EXPIRED', value: cert.certificateNumber });
      else if (cert.isExpiringSoon) errors.push({ field: 'certification', message: `Certification ${cert.name} expires in ${cert.daysUntilExpiry} days`, code: 'CERTIFICATION_EXPIRING_SOON', value: { certificateNumber: cert.certificateNumber, daysUntilExpiry: cert.daysUntilExpiry } });
    }
    return { valid: errors.length === 0, errors };
  }

  async validateVenueEligibility(venueId: string): Promise<BusinessValidationResult> {
    const errors: BusinessValidationError[] = [];
    const venue = await this.venueModel.findById(venueId).exec();
    if (!venue) { errors.push({ field: 'venueId', message: 'Venue not found', code: 'VENUE_NOT_FOUND' }); return { valid: false, errors }; }
    if (venue.status !== 'active') errors.push({ field: 'status', message: 'Venue must be active for competition', code: 'VENUE_NOT_ACTIVE' });
    if (venue.certificationRequired) {
      const cert = await this.certificationModel.findOne({ venueId: new Types.ObjectId(venueId), status: 'approved', expiryDate: { $gt: new Date() } }).exec();
      if (!cert) errors.push({ field: 'certification', message: 'Valid competition certification required', code: 'COMPETITION_CERTIFICATION_REQUIRED' });
    }
    const courts = await this.courtModel.find({ venueId: new Types.ObjectId(venueId), status: CourtStatus.ACTIVE, maintenanceStatus: MaintenanceStatus.NONE }).exec();
    if (courts.length < 1) errors.push({ field: 'courts', message: 'At least one active court required for competition', code: 'INSUFFICIENT_COURTS' });
    const criticalZones = await this.coverageZoneModel.find({ courtId: { $in: courts.map(c => c._id) }, priority: 'critical', status: { $ne: 'active' } }).exec();
    if (criticalZones.length > 0) errors.push({ field: 'coverageZones', message: `${criticalZones.length} critical coverage zone(s) not active`, code: 'CRITICAL_ZONES_INACTIVE', value: criticalZones.map(z => z.name) });
    return { valid: errors.length === 0, errors };
  }
}