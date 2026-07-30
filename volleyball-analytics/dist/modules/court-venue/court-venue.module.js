"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtVenueModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const venue_schema_1 = require("./schemas/venue.schema");
const court_schema_1 = require("./schemas/court.schema");
const camera_schema_1 = require("./schemas/camera.schema");
const calibration_schema_1 = require("./schemas/calibration.schema");
const facility_schema_1 = require("./schemas/facility.schema");
const venue_repository_1 = require("./repositories/venue.repository");
const court_repository_1 = require("./repositories/court.repository");
const camera_repository_1 = require("./repositories/camera.repository");
const calibration_repository_1 = require("./repositories/calibration.repository");
const facility_repository_1 = require("./repositories/facility.repository");
const venue_service_1 = require("./services/venue.service");
const court_service_1 = require("./services/court.service");
const camera_service_1 = require("./services/camera.service");
const calibration_service_1 = require("./services/calibration.service");
const facility_service_1 = require("./services/facility.service");
const venue_controller_1 = require("./controllers/venue.controller");
const court_controller_1 = require("./controllers/court.controller");
const camera_controller_1 = require("./controllers/camera.controller");
const calibration_controller_1 = require("./controllers/calibration.controller");
const facility_controller_1 = require("./controllers/facility.controller");
const business_validator_1 = require("./validators/business.validator");
let CourtVenueModule = class CourtVenueModule {
};
exports.CourtVenueModule = CourtVenueModule;
exports.CourtVenueModule = CourtVenueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: venue_schema_1.Venue.name, schema: venue_schema_1.VenueSchema },
                { name: court_schema_1.Court.name, schema: court_schema_1.CourtSchema },
                { name: camera_schema_1.Camera.name, schema: camera_schema_1.CameraSchema },
                { name: calibration_schema_1.CalibrationProfile.name, schema: calibration_schema_1.CalibrationProfileSchema },
                { name: facility_schema_1.Facility.name, schema: facility_schema_1.FacilitySchema },
            ]),
        ],
        controllers: [
            venue_controller_1.VenueController,
            court_controller_1.CourtController,
            camera_controller_1.CameraController,
            calibration_controller_1.CalibrationController,
            facility_controller_1.FacilityController,
        ],
        providers: [
            venue_repository_1.VenueRepository,
            court_repository_1.CourtRepository,
            camera_repository_1.CameraRepository,
            calibration_repository_1.CalibrationRepository,
            facility_repository_1.FacilityRepository,
            venue_service_1.VenueService,
            court_service_1.CourtService,
            camera_service_1.CameraService,
            calibration_service_1.CalibrationService,
            facility_service_1.FacilityService,
            business_validator_1.BusinessValidator,
        ],
        exports: [
            venue_service_1.VenueService,
            court_service_1.CourtService,
            camera_service_1.CameraService,
            calibration_service_1.CalibrationService,
            facility_service_1.FacilityService,
            business_validator_1.BusinessValidator,
        ],
    })
], CourtVenueModule);
//# sourceMappingURL=court-venue.module.js.map