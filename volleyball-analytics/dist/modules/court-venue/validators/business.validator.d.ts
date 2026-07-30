import { Model } from 'mongoose';
import { IVenue } from '../schemas/venue.schema';
import { ICourt } from '../schemas/court.schema';
import { ICamera } from '../schemas/camera.schema';
import { ICalibrationProfile } from '../schemas/calibration.schema';
import { IFacility } from '../schemas/facility.schema';
import { IEquipment } from '../schemas/equipment.schema';
import { ISensor } from '../schemas/sensor.schema';
import { ICoverageZone } from '../schemas/coverage-zone.schema';
import { ICertification } from '../schemas/certification.schema';
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
export declare class BusinessValidator {
    private venueModel;
    private courtModel;
    private cameraModel;
    private calibrationModel;
    private facilityModel;
    private equipmentModel;
    private sensorModel;
    private coverageZoneModel;
    private certificationModel;
    constructor(venueModel: Model<IVenue>, courtModel: Model<ICourt>, cameraModel: Model<ICamera>, calibrationModel: Model<ICalibrationProfile>, facilityModel: Model<IFacility>, equipmentModel: Model<IEquipment>, sensorModel: Model<ISensor>, coverageZoneModel: Model<ICoverageZone>, certificationModel: Model<ICertification>);
    validateVenueUniqueness(venueCode: string, organizationId: string, venueName: string, excludeId?: string): Promise<BusinessValidationResult>;
    validateCourtUniqueness(venueId: string, courtCode: string, excludeId?: string): Promise<BusinessValidationResult>;
    validateCourtDimensions(courtType: string, dimensions: any): Promise<BusinessValidationResult>;
    validateCourtAvailability(courtId: string): Promise<BusinessValidationResult>;
    validateCameraPositioning(courtId: string, position: any, excludeId?: string): Promise<BusinessValidationResult>;
    validateCameraCoverage(courtId: string, cameraId: string, fieldOfView: any): Promise<BusinessValidationResult>;
    validateCalibrationAccuracy(calibrationId: string): Promise<BusinessValidationResult>;
    validateEquipmentAvailability(equipmentId: string, startDate: Date, endDate: Date): Promise<BusinessValidationResult>;
    validateFacilityAvailability(facilityId: string, startTime: Date, endTime: Date): Promise<BusinessValidationResult>;
    validateSensorCalibration(sensorId: string): Promise<BusinessValidationResult>;
    validateCoverageZoneRequirements(zoneId: string): Promise<BusinessValidationResult>;
    validateCertificationValidity(venueId?: string, courtId?: string, equipmentId?: string, facilityId?: string): Promise<BusinessValidationResult>;
    validateVenueEligibility(venueId: string): Promise<BusinessValidationResult>;
}
//# sourceMappingURL=business.validator.d.ts.map