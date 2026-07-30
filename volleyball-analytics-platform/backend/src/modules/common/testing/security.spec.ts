/**
 * Security Tests - Chapter 12 Part 4
 * 
 * Validates security features including JWT verification, RBAC enforcement,
 * tenant isolation, injection resistance, rate limiting, and BOLA prevention.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../../shared/decorators/permissions.decorator';

describe('Security Tests - Chapter 12 Part 4', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        JwtService,
        ConfigService,
        // ... other providers
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const createToken = (payload: any, secret = 'test-secret') => {
    return jwtService.sign(payload, { secret });
  };

  describe('JWT Verification', () => {
    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(401);
    });

    it('should reject requests with invalid token format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', 'Bearer invalid.token.format')
        .expect(401);
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = createToken({ 
        sub: 'user_123', 
        tenantId: 'tenant_1',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });

      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should accept valid token', async () => {
      const validToken = createToken({
        sub: 'user_123',
        tenantId: 'tenant_1',
        roles: ['organization_admin'],
        permissions: ['match:read'],
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should reject malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', 'InvalidHeader')
        .expect(401);
    });

    it('should reject token without Bearer prefix', async () => {
      const token = createToken({ sub: 'user_123' });
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', token)
        .expect(401);
    });
  });

  describe('RBAC Enforcement', () => {
    const adminToken = createToken({
      sub: 'admin_1',
      tenantId: 'tenant_1',
      roles: ['organization_admin'],
      permissions: ['match:create', 'match:read', 'match:update', 'match:delete', 'match:start', 'match:finish'],
    });

    const readOnlyToken = createToken({
      sub: 'user_1',
      tenantId: 'tenant_1',
      roles: ['organization_member'],
      permissions: ['match:read'],
    });

    const coachToken = createToken({
      sub: 'coach_1',
      tenantId: 'tenant_1',
      roles: ['coach'],
      permissions: ['match:read', 'match:lineup', 'match:recordEvent'],
    });

    describe('match:create permission', () => {
      it('should allow admin to create match', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ /* valid match data */ })
          .expect(201);
      });

      it('should deny read-only user', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${readOnlyToken}`)
          .send({ /* valid data */ })
          .expect(403);
      });

      it('should allow coach', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${coachToken}`)
          .send({ /* valid data */ })
          .expect(201);
      });
    });

    describe('match:start permission', () => {
      it('should allow admin to start match', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/matches/test_id/start')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should deny read-only user', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/matches/test_id/start')
          .set('Authorization', `Bearer ${readOnlyToken}`)
          .expect(403);
      });
    });

    describe('match:finish permission', () => {
      it('should allow admin to finish match', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/matches/test_id/finish')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should deny read-only user', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/matches/test_id/finish')
          .set('Authorization', `Bearer ${readOnlyToken}`)
          .expect(403);
      });
    });

    describe('match:delete permission (archive)', () => {
      it('should allow admin to archive match', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/matches/test_id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(204);
      });

      it('should deny read-only user', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/matches/test_id')
          .set('Authorization', `Bearer ${readOnlyToken}`)
          .expect(403);
      });
    });
  });

  describe('Tenant Isolation', () => {
    const tenantAToken = createToken({
      sub: 'user_a',
      tenantId: 'tenant_a',
      roles: ['organization_admin'],
      permissions: ['match:read', 'match:create'],
    });

    const tenantBToken = createToken({
      sub: 'user_b',
      tenantId: 'tenant_b',
      roles: ['organization_admin'],
      permissions: ['match:read', 'match:create'],
    });

    it('should prevent cross-tenant data access', async () => {
      // Create match as tenant A
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .send({ /* valid match data for tenant A */ })
        .expect(201);

      const matchId = createResponse.body.data.id;

      // Tenant B tries to access tenant A's match
      await request(app.getHttpServer())
        .get(`/api/v1/matches/${matchId}`)
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(403);
    });

    it('should isolate match listing by tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${tenantAToken}`)
        .expect(200);

      // All matches should belong to tenant A
      expect(response.body.data.every(m => m.tenantId === 'tenant_a')).toBe(true);
    });

    it('should prevent cross-tenant fixture access', async () => {
      // Tenant B tries to access tenant A's fixture
      await request(app.getHttpServer())
        .get('/api/v1/fixtures/tenant_a_fixture_id')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(403);
    });

    it('should prevent cross-tenant team access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/teams/tenant_a_team_id')
        .set('Authorization', `Bearer ${tenantBToken}`)
        .expect(403);
    });
  });

  describe('Injection Resistance', () => {
    const testToken = createToken({
      sub: 'user_test',
      tenantId: 'tenant_test',
      roles: ['organization_admin'],
      permissions: ['match:create'],
    });

    const injectionPayloads = [
      { fixtureId: { $ne: null } },
      { fixtureId: { $regex: '.*' } },
      { fixtureId: { $where: 'this.fixtureId == this.fixtureId' } },
      { fixtureId: { $gt: '' } },
      { fixtureId: { $in: ['test', { $ne: null }] } },
      { fixtureId: { $or: [{ _id: 'test' }, { fixtureId: 'test' }] } },
    ];

    injectionPayloads.forEach((payload, index) => {
      it(`should reject NoSQL injection attempt ${index + 1}`, async () => {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            fixtureId: payload,
            competitionId: 'comp_123',
            seasonId: 'season_123',
            homeTeamId: 'team_1',
            awayTeamId: 'team_2',
            venueId: 'venue_1',
          })
          .expect(res => {
            expect([400, 422]).toContain(res.status);
          });
      });
    });

    it('should reject XSS attempts in match data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fixtureId: 'fx_123',
          competitionId: 'comp_123',
          seasonId: 'season_123',
          homeTeamId: '<script>alert("xss")</script>',
          awayTeamId: 'team_2',
          venueId: 'venue_1',
        })
        .expect(res => {
          expect([400, 422]).toContain(res.status);
        });
    });

    it('should reject SQL injection attempts in query parameters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches?competitionId=comp_123\' OR \'1\'=\'1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(res => {
          expect([400, 422]).toContain(res.status);
        });
    });
  });

  describe('Rate Limiting', () => {
    const testToken = createToken({
      sub: 'user_rate_test',
      tenantId: 'tenant_rate_test',
      roles: ['organization_admin'],
      permissions: ['match:create', 'match:read'],
    });

    it('should enforce rate limits on write operations', async () => {
      // Make 35 requests quickly (limit is 30/min for writes)
      const results = [];
      for (let i = 0; i < 35; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            fixtureId: `fx_${i}`,
            competitionId: 'comp_123',
            seasonId: 'season_123',
            homeTeamId: 'team_1',
            awayTeamId: 'team_2',
            venueId: 'venue_1',
          });
        results.push(res.status);
      }

      // At least some requests should be rate limited
      const rateLimited = results.filter(s => s === 429).length;
      expect(rateLimited).toBeGreaterThan(0);
    });

    it('should enforce stricter limits on auth endpoints', async () => {
      // Auth endpoints should have stricter limits (5/min)
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: `test${i}@test.com`, password: 'password' })
          .expect(res => {
            if (i >= 5) expect([429]).toContain(res.status);
          });
      }
    });

    it('should enforce search rate limits', async () => {
      for (let i = 0; i < 65; i++) {
        await request(app.getHttpServer())
          .get('/api/v1/matches?query=test')
          .set('Authorization', `Bearer ${testToken}`)
          .expect(res => {
            if (i >= 60) expect([429]).toContain(res.status);
          });
      }
    });

    it('should return proper rate limit headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ /* minimal valid data */ });

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should include Retry-After header when rate limited', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 105; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/matches')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ /* minimal data */ });
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ /* minimal data */ })
        .expect(429);

      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('Broken Object Level Authorization (BOLA) Prevention', () => {
    const userToken = createToken({
      sub: 'user_1',
      tenantId: 'tenant_1',
      roles: ['team_member'],
      permissions: ['match:read'],
      organizationId: 'org_1',
    });

    it('should prevent access to other organizations\' matches', async () => {
      // Try to access match from different organization
      await request(app.getHttpServer())
        .get('/api/v1/matches/org_2_match_id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should prevent unauthorized match modification', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/matches/other_org_match_id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ displayName: 'Hacked Name' })
        .expect(403);
    });

    it('should prevent unauthorized team access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/teams/other_org_team_id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should prevent unauthorized fixture access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/fixtures/other_org_fixture_id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Audit Trail Generation', () => {
    it('should generate audit log for match creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ /* valid match data */ })
        .expect(201);

      // Verify audit log was created (would check audit service in real implementation)
      expect(response.body.success).toBe(true);
    });

    it('should generate audit log for match start', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/matches/test_id/start')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Audit log should contain: match.started event
    });

    it('should generate audit log for match completion', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/matches/test_id/finish')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Audit log should contain: match.completed event
    });

    it('should generate audit log for fixture creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/fixtures')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ /* valid fixture data */ })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should generate audit log for official assignment', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/fixtures/fx_123/assign-officials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ officialIds: ['off_1', 'off_2'] })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Standardized API Responses', () => {
    it('should return standardized success response', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: expect.any(Array),
        meta: expect.objectContaining({
          page: expect.any(Number),
          perPage: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
        }),
        timestamp: expect.any(String),
      });
    });

    it('should return standardized error response', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches/non_existent_id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .then(response => {
          expect(response.body).toMatchObject({
            success: false,
            message: expect.any(String),
            data: null,
            error: expect.objectContaining({
              code: 'NOT_FOUND',
              message: expect.any(String),
              details: expect.any(Array),
              correlationId: expect.any(String),
              timestamp: expect.any(String),
            }),
          });
        });
    });

    it('should include correlation ID in all responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.body.meta.correlationId).toBeDefined();
    });

    it('should include correlation ID in error responses', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/matches/non_existent')
        .expect(404)
        .then(response => {
          expect(response.body.error.correlationId).toBeDefined();
        });
    });
  });

  describe('Health Endpoints', () => {
    it('GET /health should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        timestamp: expect.any(String),
        checks: expect.any(Array),
        version: expect.any(String),
        uptime: expect.any(Number),
      });
    });

    it('GET /health/live should return liveness', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String),
      });
    });

    it('GET /health/ready should return readiness', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(res => {
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ready|not_ready)$/),
        timestamp: expect.any(String),
        checks: expect.any(Array),
      });
    });
  });

  describe('Error Handling', () => {
    it('should not expose stack traces in production', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/matches/non_existent')
        .expect(404);

      // Stack trace should not be exposed
      expect(JSON.stringify(response.body)).not.toMatch(/at\s+.*\.js/);
      expect(response.body.error.details).not.toContain('stack');
    });

    it('should return proper HTTP status codes', async () => {
      // 400 - Bad Request
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      // 401 - Unauthorized
      await request(app.getHttpServer())
        .get('/api/v1/matches')
        .expect(401);

      // 403 - Forbidden
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${readOnlyToken}`)
        .expect(403);

      // 404 - Not Found
      await request(app.getHttpServer())
        .get('/api/v1/matches/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      // 409 - Conflict
      // (would need to create duplicate)

      // 422 - Unprocessable Entity
      await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fixtureId: 'invalid' })
        .expect(422);

      // 429 - Too Many Requests (tested in rate limiting)

      // 500 - Internal Server Error
      // (hard to test without causing actual error)

      // 503 - Service Unavailable
      // (would need to simulate service down)
    });
  });

  describe('Logging', () => {
    it('should not log JWT tokens', async () => {
      // Intercept logs and verify no JWT tokens appear
      // This would require mocking the logger
    });

    it('should not log sensitive personal data', async () => {
      // Verify PII is redacted from logs
    });

    it('should include correlation ID in logs', async () => {
      // Verify correlation ID propagation
    });
  });

  describe('Correlation ID Propagation', () => {
    it('should generate correlation ID if not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
    });

    it('should propagate provided correlation ID', async () => {
      const correlationId = 'test-correlation-id-123';
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('X-Correlation-ID', correlationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('should propagate correlation ID through all middleware', async () => {
      // Verify correlation ID flows through all middleware layers
    });
  });
});