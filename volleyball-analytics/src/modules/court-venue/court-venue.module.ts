import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Venue, VenueSchema } from './schemas/venue.schema';
import { Court, CourtSchema } from './schemas/court.schema';
import { Camera, CameraSchema } from './schemas/camera.schema';
import { CalibrationProfile, CalibrationProfileSchema } from './schemas/calibration.schema';
import { Facility, FacilitySchema } from './schemas/facility.schema';

import { VenueRepository } from './repositories/venue.repository';
import { CourtRepository } from './repositories/court.repository';
import { CameraRepository } from './repositories/camera.repository';
import { CalibrationRepository } from './repositories/calibration.repository';
import { FacilityRepository } from './repositories/facility.repository';

import { VenueService } from './services/venue.service';
import { CourtService } from './services/court.service';
import { CameraService } from './services/camera.service';
import { CalibrationService } from './services/calibration.service';
import { FacilityService } from './services/facility.service';

import { VenueController } from './controllers/venue.controller';
import { CourtController } from './controllers/court.controller';
import { CameraController } from './controllers/camera.controller';
import { CalibrationController } from './controllers/calibration.controller';
import { FacilityController } from './controllers/facility.controller';

import { BusinessValidator } from './validators/business.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Venue.name, schema: VenueSchema },
      { name: Court.name, schema: CourtSchema },
      { name: Camera.name, schema: CameraSchema },
      { name: CalibrationProfile.name, schema: CalibrationProfileSchema },
      { name: Facility.name, schema: FacilitySchema },
    ]),
  ],
  controllers: [
    VenueController,
    CourtController,
    CameraController,
    CalibrationController,
    FacilityController,
  ],
  providers: [
    VenueRepository,
    CourtRepository,
    CameraRepository,
    CalibrationRepository,
    FacilityRepository,
    VenueService,
    CourtService,
    CameraService,
    CalibrationService,
    FacilityService,
    BusinessValidator,
  ],
  exports: [
    VenueService,
    CourtService,
    CameraService,
    CalibrationService,
    FacilityService,
    BusinessValidator,
  ],
})
export class CourtVenueModule {}