import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { Venue } from '../court-venue/schemas/venue.schema';
import { Court } from '../court-venue/schemas/court.schema';
import { Camera } from '../court-venue/schemas/camera.schema';
import { CalibrationProfile } from '../court-venue/schemas/calibration.schema';
import { Facility } from '../court-venue/schemas/facility.schema';
import { Equipment } from '../court-venue/schemas/equipment.schema';
import { Sensor } from '../court-venue/schemas/sensor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Venue', schema: VenueSchema },
      { name: 'Court', schema: CourtSchema },
      { name: 'Camera', schema: CameraSchema },
      { name: 'CalibrationProfile', schema: CalibrationProfileSchema },
      { name: 'Facility', schema: FacilitySchema },
      { name: 'Equipment', schema: EquipmentSchema },
      { name: 'Sensor', schema: SensorSchema },
    ]),
  ],
  controllers: [HealthController],
  exports: [],
})
export class MonitoringModule {}