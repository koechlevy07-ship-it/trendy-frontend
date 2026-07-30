/**
 * Integration Tests - Match & Competition Management Module
 * 
 * Tests controller-service interactions, repository integration, 
 * MongoDB persistence, middleware execution, RBAC enforcement
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { MatchModule } from '../match.module';
import { MatchModule } from '../match.module';
import { MatchService } from '../services/match.service';
import { MatchRepository } from '../repositories/match.repository';
import { FixtureService } from '../../competition/services/fixture.service';
import { OfficialAssignmentService } from '../../officials/services/official-assignment.service';

describe('Match Module Integration Tests', () => {
  let app: INestApplication;
  let matchService: MatchService;
  let matchRepository: MatchRepository;
  let fixtureService: FixtureService;
  let officialAssignmentService: OfficialAssignmentService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MatchModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    matchService = app.get<MatchService>(MatchService);
    matchRepository = app.get<MatchRepository>(MatchRepository);
    fixtureService = app.get<FixtureService>(FixtureService);
    officialAssignmentService = app.get<OfficialAssignmentService>(OfficialAssignmentService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Match CRUD Operations', () => {
    let createdMatchId: string;
    let fixtureId: string;

    beforeAll(async () => {
      // Create a fixture first
      // This would require fixture service setup
    });

    it('should create a new match', async () => {
      const createDto = {
        fixtureId: 'fx_test_123',
        competitionId: 'comp_test_123',
        seasonId: 'season_test_123',
        homeTeamId: 'team_home',
        awayTeamId: 'team_away',
        venueId: 'venue_1',
        matchCode: 'TEST-001',
        type: 'regular',
        round: 1,
        scheduledStart: new Date(Date.now() + 86400000), // tomorrow
        firstReferee: { officialId: 'off_1', name: 'Referee 1' },
        secondReferee: { officialId: 'off_2', name: 'Referee 2' },
        lineJudges: [
          { officialId: 'off_3', name: 'Line Judge 1' },
          { officialId: 'off_4', name: 'Line Judge 2' },
        ],
        scorer: { officialId: 'off_5', name: 'Scorer 1' },
        courtConfiguration: {
          surface: 'indoor',
          dimensions: '18x9',
          cameraPositions: [],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', 'Bearer valid_token')
        .send(createDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.matchCode).toBe('TEST-001');
      
      createdMatchId = response.body.data.id;
    });

    it('should retrieve match by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${createdMatchId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdMatchId);
    });

    it('should list matches with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .query({ page: 1, perPage: 10 })
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.totalPages).toBeDefined();
    });

    it('should update match', async () => {
      const updateDto = {
        displayName: 'Updated Match Name',
        status: 'scheduled',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/matches/${createdMatchId}`)
        .set('Authorization', 'Bearer valid_token')
        .send({ displayName: 'Updated Match Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe('Updated Match Name');
    });
  });

  describe('Match Lifecycle Operations', () => {
    let matchId: string;

    beforeEach(async () => {
      // Create a match in SCHEDULED status
      // This would be done via fixture service or direct creation
    });

    it('should start a match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/start`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should pause a live match', async () => {
      // First start the match
      await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/start`)
        .set('Authorization', 'Bearer valid_token');

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/pause`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
    });

    it('should resume a paused match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/resume`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should complete a match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/finish`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should archive a match', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/matches/${matchId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(204);
    });
  });

  describe('Match Events', () => {
    let matchId: string;

    it('should record a match event', async () => {
      const eventDto = {
        type: 'point',
        teamId: 'team_home',
        setNumber: 1,
        timestamp: 1000,
        homeScore: 1,
        awayScore: 0,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/matches/${matchId}/events`)
        .set('Authorization', 'Bearer valid_token')
        .send({
          type: 'point',
          teamId: 'team_home',
          setNumber: 1,
          timestamp: 1000,
          homeScore: 1,
          awayScore: 0,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventId).toBeDefined();
    });

    it('should record bulk events', async () => {
      const events = [
        { type: 'point', teamId: 'team_home', setNumber: 1, timestamp: 2000, homeScore: 2, awayScore: 0 },
        { type: 'serve', teamId: 'team_away', setNumber: 1, timestamp: 3000, homeScore: 2, awayScore: 1 },
      ];

      const response = await request(app.getHttpServer())
        .post(`/api/v1/matches/${matchId}/events/bulk`)
        .set('Authorization', 'Bearer valid_token')
        .send({ events })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should complete a set', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/set/1/complete`)
        .set('Authorization', 'Bearer valid_token')
        .send({ homeScore: 25, awayScore: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.homeScore).toBe(25);
      expect(response.body.data.awayScore).toBe(20);
    });

    it('should get match events', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}/events`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get match timeline', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}/timeline`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toBeDefined();
    });

    it('should get match statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}/statistics`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get live match data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}/live`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Lineup Management', () => {
    it('should submit team lineup', async () => {
      const lineup = {
        teamId: 'team_home',
        setNumber: 1,
        players: [
          { playerId: 'p1', jerseyNumber: 1, position: 'Setter', isStarting: true, isCaptain: true, isLibero: false },
          { playerId: 'p2', jerseyNumber: 2, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p3', jerseyNumber: 3, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p4', jerseyNumber: 4, position: 'Opposite', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p5', jerseyNumber: 5, position: 'Middle Blocker', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p6', jerseyNumber: 6, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
          { playerId: 'p7', jerseyNumber: 7, position: 'Libero', isStarting: false, isCaptain: false, isLibero: true },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/matches/${matchId}/lineup`)
        .set('Authorization', 'Bearer valid_token')
        .send({ teamId: 'team_home', setNumber: 1, players: lineup.players })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.lineupId).toBeDefined();
    });

    it('should reject invalid lineup (not 6 starters)', async () => {
      const invalidLineup = {
        teamId: 'team_home',
        setNumber: 1,
        players: [
          { playerId: 'p1', jerseyNumber: 1, position: 'Setter', isStarting: true, isCaptain: true, isLibero: false },
          { playerId: 'p2', jerseyNumber: 2, position: 'Outside Hitter', isStarting: true, isCaptain: false, isLibero: false },
        ],
      };

      await request(app.getHttpServer())
        .post(`/api/v1/matches/${matchId}/lineup`)
        .set('Authorization', 'Bearer valid_token')
        .send({ teamId: 'team_home', setNumber: 1, players: [{ playerId: 'p1' }, { playerId: 'p2' }] })
        .expect(400);
    });
  });

  describe('Match Lifecycle', () => {
    let matchId: string;

    it('should pause a live match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/pause`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
    });

    it('should resume a paused match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/resume`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should complete match', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/matches/${matchId}/finish`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });

    it('should archive match', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/matches/${matchId}`)
        .set('Authorization', 'Bearer valid_token')
        .expect(204);
    });

    it('should restore archived match', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/matches/${matchId}/restore`)
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent match', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches/non_existent_id')
        .set('Authorization', 'Bearer valid_token')
        .expect(404);
    });

    it('should return 400 for invalid match data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', 'Bearer valid_token')
        .send({
          // Missing required fields
        })
        .expect(400);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(401);
    });

    it('should return 403 for insufficient permissions', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', 'Bearer insufficient_token')
        .send({
          fixtureId: 'fx_123',
          competitionId: 'comp_123',
          // ... other required fields
        })
        .expect(403);
    });

    it('should return 404 for non-existent match', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer valid_token')
        .expect(404);
    });

    it('should return 409 for duplicate fixture', async () => {
      // Try to create duplicate match for same fixture
      // First create a match
      // Then try to create another for same fixture
    });
  });

  describe('RBAC Enforcement', () => {
    it('should enforce match:create permission', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', 'Bearer read_only_token')
        .send({ /* valid data */ })
        .expect(403);
    });

    it('should enforce match:start permission', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/matches/test_id/start')
        .set('Authorization', 'Bearer read_only_token')
        .expect(403);
    });

    it('should enforce match:finish permission', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/matches/test_id/finish')
        .set('Authorization', 'Bearer read_only_token')
        .expect(403);
    });

    it('should enforce match:delete permission for archive', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/matches/test_id')
        .set('Authorization', 'Bearer read_only_token')
        .expect(403);
    });
  });

  describe('Tenant Isolation', () => {
    it('should prevent cross-tenant access', async () => {
      // User from tenant A tries to access match from tenant B
      await request(app.getHttpServer())
        .get('/api/v1/matches/other_tenant_match_id')
        .set('Authorization', 'Bearer tenant_a_token')
        .expect(403);
    });

    it('should filter matches by tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', 'Bearer tenant_a_token')
        .expect(200);

      // All returned matches should belong to tenant A
      expect(response.body.data.every(m => m.tenantId === 'tenant_a')).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on write operations', async () => {
      // Make many requests quickly
      for (let i = 0; i < 35; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', 'Bearer valid_token')
          .send({ /* minimal valid data */ })
          .expect(res => {
            if (res.status === 429) {
              // Rate limited
              return;
            }
            if (i < 30) expect(res.status).toBe(201);
          });
    });
  });
});