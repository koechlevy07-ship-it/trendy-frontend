import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('Court & Venue Management API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/volleyball_test'),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Venue API', () => {
    let createdVenueId: string;

    it('POST /venues - should create a venue', () => {
      return request(app.getHttpServer())
        .post('/venues')
        .send({
          venueName: 'Test Arena',
          venueCode: 'TEST001',
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
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          capacity: 5000,
          contacts: [
            { name: 'John Doe', role: 'Manager', email: 'john@test.com', phone: '+1-555-1234', isPrimary: true },
          ],
          operatingHours: [
            { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
          ],
          certificationRequired: false,
          mediaAssets: [],
          documents: [],
          metadata: {},
          timezone: 'America/New_York',
        })
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.venueName).toBe('Test Arena');
          expect(res.body.data.venueCode).toBe('TEST001');
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

    it('PATCH /venues/:id/suspend - should suspend venue', () => {
      return request(app.getHttpServer())
        .patch(`/venues/${createdVenueId}/suspend`)
        .send({ suspendedBy: 'user123', reason: 'Maintenance' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('suspended');
        });
    });
  });

  describe('Court API', () => {
    let createdCourtId: string;

    it('POST /courts - should create a court', () => {
      return request(app.getHttpServer())
        .post('/courts')
        .send({
          venueId: createdVenueId,
          courtCode: 'C001',
          courtName: 'Main Court',
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
            netSystem: 'Professional Net System',
            posts: 'Carbon Fiber Posts',
            antennas: 'Official Antennas',
            scoreboard: 'LED Scoreboard',
            refereeStand: 'Adjustable Stand',
            lighting: 'LED Lighting System',
            flooring: 'Professional Wood Flooring',
          },
          aiConfiguration: {
            cameraProfileId: 'profile123',
            calibrationProfileId: 'calib123',
            trackingEnabled: true,
            actionRecognitionEnabled: true,
            poseEstimationEnabled: true,
            ballTrackingEnabled: true,
            jerseyDetectionEnabled: true,
            customModelConfig: {},
          },
          assignedCameraIds: [],
          metadata: {},
        })
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.courtCode).toBe('C001');
          createdCourtId = res.body.data._id;
        });
    });

    it('GET /courts - should list courts', () => {
      return request(app.getHttpServer())
        .get('/courts')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('PATCH /courts/:id/activate - should activate court', () => {
      return request(app.getHttpServer())
        .patch(`/courts/${createdCourtId}/activate`)
        .send({ activatedBy: 'user123' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('active');
        });
    });

    it('PATCH /courts/:id/maintenance - should set maintenance mode', () => {
      return request(app.getHttpServer())
        .patch(`/courts/${createdCourtId}/maintenance`)
        .send({ isUnderMaintenance: true, maintenanceReason: 'Floor repair' })
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.maintenanceStatus).toBe('in_progress');
        });
    });
  });

  describe('Camera API', () => {
    it('POST /cameras - should register a camera', () => {
      return request(app.getHttpServer())
        .post('/cameras')
        .send({
          courtId: createdCourtId,
          cameraId: 'CAM001',
          name: 'Main Camera',
          manufacturer: 'sony',
          model: 'A7R IV',
          serialNumber: 'SN123456',
          firmwareVersion: '1.0',
          mountType: 'ceiling',
          position: { x: 0, y: 0, z: 10, roll: 0, pitch: -45, yaw: 0 },
          fieldOfView: { horizontal: 90, vertical: 60 },
          resolution: { width: 6100, height: 4050 },
          frameRate: 60,
          bitrate: 50000000,
          codec: 'h265',
          streamConfig: {
            protocol: 'rtsp',
            url: 'rtsp://camera.local/stream',
            username: 'admin',
            password: 'password',
            streamPath: '/stream1',
            transport: 'tcp',
          },
          specs: {
            sensorType: 'CMOS',
            sensorSize: 'Full Frame',
            focalLength: 24,
            aperture: 'f/2.8',
            isoRange: '100-32000',
            shutterSpeedRange: '1/8000-30s',
            whiteBalance: ['Auto', 'Daylight', 'Tungsten', 'Custom'],
            focusMode: ['AF-S', 'AF-C', 'MF'],
          },
          status: 'registered',
          assignedCoverageZones: [],
          calibrationProfileId: 'calib123',
          metadata: {},
        })
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.cameraId).toBe('CAM001');
        });
    });

    it('GET /cameras - should list cameras', () => {
      return request(app.getHttpServer())
        .get('/cameras')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('PATCH /cameras/:id/activate - should activate camera', () => {
      return request(app.getHttpServer())
        .patch('/cameras/cam123/activate')
        .expect(200)
        .then(res => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('Calibration API', () => {
    it('POST /calibrations - should create calibration profile', () => {
      return request(app.getHttpServer())
        .post('/calibrations')
        .send({
          cameraInstallationId: 'cam123',
          profileName: 'Test Calibration',
          method: 'checkerboard',
          intrinsicParameters: {
            focalLengthX: 5000,
            focalLengthY: 5000,
            principalPointX: 3050,
            principalPointY: 2025,
            skew: 0,
            distortionCoefficients: [0.1, -0.05, 0.01, -0.001, 0.0001],
          },
          extrinsicParameters: {
            rotationMatrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            translationVector: [0, 0, 10],
            cameraHeight: 10,
            cameraTilt: -45,
            cameraPan: 0,
            cameraRoll: 0,
          },
          referencePoints: [
            { id: 'rp1', name: 'Ref 1', worldCoordinates: { x: 0, y: 0, z: 0 }, imageCoordinates: { x: 3000, y: 2000 }, confidence: 0.99 },
            { id: 'rp2', name: 'Ref 2', worldCoordinates: { x: 9, y: 0, z: 0 }, imageCoordinates: { x: 5000, y: 2000 }, confidence: 0.98 },
          ],
          homographyMatrix: {
            matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
            sourcePoints: [{ x: 0, y: 0 }, { x: 9, y: 0 }],
            destinationPoints: [{ x: 0, y: 0 }, { x: 6000, y: 0 }],
          },
          metrics: {
            reprojectionError: 0.5,
            rmsError: 0.4,
            maxError: 1.2,
            standardDeviation: 0.2,
            pointCount: 8,
            validPointCount: 8,
          },
        })
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profileName).toBe('Test Calibration');
        });
    });
  });

  describe('Facility API', () => {
    it('POST /facilities - should create a facility', () => {
      return request(app.getHttpServer())
        .post('/facilities')
        .send({
          venueId: createdVenueId,
          facilityCode: 'F001',
          name: 'Main Lobby',
          facilityType: 'lobby',
          description: 'Main entrance lobby',
          location: {
            floor: '1',
            section: 'A',
            roomNumber: '101',
            coordinates: { x: 0, y: 0, z: 0 },
            nearestCourt: createdCourtId,
          },
          capacity: { seated: 100, standing: 200, wheelchairAccessible: 5, maxOccupancy: 300 },
          dimensions: { length: 20, width: 15, height: 5, area: 300, volume: 1500 },
          features: {
            hasHVAC: true,
            hasWiFi: true,
            hasPowerOutlets: true,
            hasWaterSupply: true,
            hasDrainage: true,
            hasNaturalLight: true,
            hasEmergencyLighting: true,
            hasFireExtinguisher: true,
            hasFirstAidKit: true,
            hasSecurityCamera: true,
            hasAccessControl: true,
            isWheelchairAccessible: true,
            hasAudioSystem: true,
            hasVideoDisplay: true,
            hasClimateControl: true,
            customFeatures: {},
          },
          status: 'available',
          operatingHours: [
            { dayOfWeek: 1, openTime: '06:00', closeTime: '23:00', isClosed: false },
          ],
          assignedStaff: [],
          equipment: [],
          maintenanceSchedule: {
            frequency: 'daily',
            maintenanceWindow: { startTime: '02:00', endTime: '04:00' },
          },
          cleaningSchedule: {
            frequency: 'daily',
            cleaningProtocol: 'Standard cleaning protocol',
          },
          accessControl: {
            requiredAccessLevel: ['staff', 'admin'],
            requiresKeyCard: true,
            requiresBiometric: false,
            accessHours: [{ start: '06:00', end: '23:00' }],
          },
        })
        .expect(201)
        .then(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Main Lobby');
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid venue data', () => {
      return request(app.getHttpServer())
        .post('/venues')
        .send({
          venueCode: 'INVALID@CODE',
        })
        .expect(400)
        .then(res => {
          expect(res.body.success).toBe(false);
          expect(res.body.errors).toBeDefined();
        });
    });

    it('should return 404 for non-existent venue', () => {
      return request(app.getHttpServer())
        .get('/venues/507f1f77bcf86cd799439011')
        .expect(404)
        .then(res => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should return 401 for missing authentication', () => {
      return request(app.getHttpServer())
        .get('/venues')
        .set('Authorization', '')
        .expect(401)
        .then(res => {
          expect(res.body.success).toBe(false);
        });
    });
  });
});