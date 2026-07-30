import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CourtVenueModule } from '../court-venue.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('Court & Venue Module Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/volleyball_analytics_test'),
        CourtVenueModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Venue CRUD Operations', () => {
    const createVenueDto = {
      venueName: 'Integration Test Venue',
      venueCode: 'ITV001',
      organizationId: 'org123',
      venueType: 'indoor',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345',
        formattedAddress: '123 Test St, Test City, TS 12345, USA',
      },
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 1000,
      contacts: [],
      operatingHours: [],
      certificationRequired: false,
      timezone: 'UTC',
      createdBy: 'user123',
    };

    let createdVenueId: string;

    it('POST /venues - should create a venue', () => {
      return request(app.getHttpServer())
        .post('/venues')
        .send(createVenueDto)
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.venueCode).toBe('ITV001');
          createdVenueId = res.body.data._id;
        });
    });

    it('GET /venues - should list venues', () => {
      return request(app.getHttpServer())
        .get('/venues')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /venues/:id - should get venue by ID', () => {
      return request(app.getHttpServer())
        .get(`/venues/${createdVenueId}`)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data._id).toBe(createdVenueId);
        });
    });

    it('PUT /venues/:id - should update venue', () => {
      return request(app.getHttpServer())
        .put(`/venues/${createdVenueId}`)
        .send({ capacity: 2000 })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.capacity).toBe(2000);
        });
    });

    it('PATCH /venues/:id/activate - should activate venue', () => {
      return request(app.getHttpServer())
        .patch(`/venues/${createdVenueId}/activate`)
        .send({ activatedBy: 'user123' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('active');
        });
    });

    it('DELETE /venues/:id - should archive venue', () => {
      return request(app.getHttpServer())
        .delete(`/venues/${createdVenueId}`)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Court CRUD Operations', () => {
    const createCourtDto = {
      venueId: 'venue123',
      courtCode: 'IC001',
      courtName: 'Integration Test Court',
      courtType: 'indoor_volleyball',
      surfaceType: 'wood',
      dimensions: {
        length: 18,
        width: 9,
        freeZoneLength: 3,
        freeZoneWidth: 3,
        ceilingHeight: 12.5,
        netHeight: 2.43,
        attackLineDistance: 3,
        serviceZoneWidth: 9,
      },
      orientation: 'north_south',
      equipment: {
        netSystem: 'Test Net',
        posts: 'Test Posts',
        antennas: 'Test Antennas',
        scoreboard: 'Test Scoreboard',
        refereeStand: 'Test Stand',
        lighting: 'Test Lighting',
        flooring: 'Test Flooring',
      },
      aiConfiguration: {
        cameraProfileId: 'profile123',
        calibrationProfileId: 'calib123',
        trackingEnabled: true,
        actionRecognitionEnabled: true,
        poseEstimationEnabled: true,
        ballTrackingEnabled: true,
        jerseyDetectionEnabled: true,
      },
      assignedCameraIds: [],
      createdBy: 'user123',
    };

    let createdCourtId: string;

    it('POST /courts - should create a court', () => {
      return request(app.getHttpServer())
        .post('/courts')
        .send(createCourtDto)
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.courtCode).toBe('IC001');
          createdCourtId = res.body.data._id;
        });
    });

    it('GET /courts - should list courts', () => {
      return request(app.getHttpServer())
        .get('/courts')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });

    it('GET /courts/:id - should get court by ID', () => {
      return request(app.getHttpServer())
        .get(`/courts/${createdCourtId}`)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data._id).toBe(createdCourtId);
        });
    });

    it('PATCH /courts/:id/maintenance - should set maintenance mode', () => {
      return request(app.getHttpServer())
        .patch(`/courts/${createdCourtId}/maintenance`)
        .send({ isUnderMaintenance: true, maintenanceReason: 'Floor resurfacing' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.maintenanceStatus.isUnderMaintenance).toBe(true);
        });
    });
  });

  describe('Camera CRUD Operations', () => {
    const createCameraDto = {
      courtId: 'court123',
      cameraId: 'CAM001',
      name: 'Integration Test Camera',
      manufacturer: 'sony',
      model: 'A7S III',
      serialNumber: 'SN123456',
      firmwareVersion: '1.0',
      mountType: 'ceiling',
      position: { x: 10, y: 20, z: 15, roll: 0, pitch: -45, yaw: 0 },
      fieldOfView: { horizontal: 90, vertical: 60 },
      resolution: { width: 3840, height: 2160 },
      frameRate: 60,
      streamConfig: {
        protocol: 'rtsp',
        url: 'rtsp://camera1:554/stream',
        username: 'admin',
        password: 'password',
      },
      specs: {
        sensorType: 'CMOS',
        sensorSize: 'Full Frame',
        focalLength: 24,
        aperture: 'f/1.8',
        isoRange: '100-102400',
        shutterSpeedRange: '1/8000-30s',
        whiteBalance: ['auto', 'daylight', 'cloudy', 'tungsten'],
        focusMode: ['auto', 'manual', 'continuous'],
      },
      specs: {
        sensorType: 'CMOS',
        sensorSize: 'Full Frame',
        focalLength: 24,
        aperture: 'f/1.8',
        isoRange: '100-102400',
        shutterSpeedRange: '1/8000-30s',
        whiteBalance: ['auto', 'daylight', 'cloudy', 'tungsten'],
        focusMode: ['auto', 'manual', 'continuous'],
      },
      assignedCoverageZones: [],
      createdBy: 'user123',
    };

    let createdCameraId: string;

    it('POST /cameras - should create a camera', () => {
      return request(app.getHttpServer())
        .post('/cameras')
        .send(createCameraDto)
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.cameraId).toBe('CAM001');
          createdCameraId = res.body.data._id;
        });
    });

    it('GET /cameras - should list cameras', () => {
      return request(app.getHttpServer())
        .get('/cameras')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });

    it('PATCH /cameras/:id/activate - should activate camera', () => {
      return request(app.getHttpServer())
        .patch(`/cameras/${createdCameraId}/activate`)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('active');
        });
    });

    it('PATCH /cameras/:id/calibrate - should assign calibration profile', () => {
      return request(app.getHttpServer())
        .patch(`/cameras/${createdCameraId}/calibrate`)
        .send({ calibrationProfileId: 'calib123' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.calibrationProfileId).toBe('calib123');
        });
    });
  });

  describe('Calibration Operations', () => {
    const createCalibrationDto = {
      cameraInstallationId: 'camera123',
      profileName: 'Integration Test Calibration',
      method: 'checkerboard',
      intrinsicParameters: {
        focalLengthX: 1200,
        focalLengthY: 1200,
        principalPointX: 960,
        principalPointY: 540,
        skew: 0,
        distortionCoefficients: [0.1, -0.05, 0, 0, 0],
      },
      extrinsicParameters: {
        rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        translationVector: [0, 0, 0],
        cameraHeight: 10,
        cameraTilt: -45,
        cameraPan: 0,
        cameraRoll: 0,
      },
      referencePoints: [
        { id: 'rp1', name: 'Corner 1', worldCoordinates: { x: 0, y: 0, z: 0 }, imageCoordinates: { x: 100, y: 100 }, confidence: 0.99 },
        { id: 'rp2', name: 'Corner 2', worldCoordinates: { x: 18, y: 0, z: 0 }, imageCoordinates: { x: 1800, y: 100 }, confidence: 0.98 },
      ],
      homographyMatrix: {
        matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        sourcePoints: [{ x: 100, y: 100 }, { x: 1800, y: 100 }, { x: 1800, y: 1000 }, { x: 100, y: 1000 }],
        destinationPoints: [{ x: 0, y: 0 }, { x: 18, y: 0 }, { x: 18, y: 9 }, { x: 0, y: 9 }],
      },
      metrics: {
        reprojectionError: 0.5,
        rmsError: 0.4,
        maxError: 0.8,
        standardDeviation: 0.2,
        pointCount: 8,
        validPointCount: 8,
      },
      notes: 'Test calibration',
      createdBy: 'user123',
    };

    let createdCalibrationId: string;

    it('POST /calibrations - should create calibration profile', () => {
      return request(app.getHttpServer())
        .post('/calibrations')
        .send(createCalibrationDto)
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profileName).toBe('Integration Test Calibration');
          createdCalibrationId = res.body.data._id;
        });
    });

    it('GET /calibrations/camera/:cameraInstallationId/active - should get active calibration', () => {
      return request(app.getHttpServer())
        .get(`/calibrations/camera/camera123/active`)
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });

    it('PATCH /calibrations/:id/activate - should activate calibration', () => {
      return request(app.getHttpServer())
        .patch(`/calibrations/${createdCalibrationId}/activate`)
        .send({ activatedBy: 'user123' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('active');
        });
    });

    it('POST /calibrations/:id/validate - should validate calibration', () => {
      return request(app.getHttpServer())
        .post(`/calibrations/${createdCalibrationId}/validate`)
        .send({ passed: true, details: { accuracy: 0.95 }, validatedBy: 'user123' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});