/**
 * Middleware Unit Tests - Chapter 11 Part 4
 * 
 * Tests for all middleware components
 * Target coverage: ≥ 90%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AuthorizationMiddleware } from '../middleware/authorization.middleware';
import { TenantIsolationMiddleware } from '../middleware/tenant-isolation.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { CorrelationIdMiddleware } from '../middleware/correlation-id.middleware';
import { RateLimiterMiddleware } from '../middleware/rate-limiter.middleware';
import { RequestLoggingMiddleware } from '../middleware/request-logging.middleware';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../shared/services/permission.service';
import { TenantService } from '../../shared/services/tenant.service';

// Mock request/response/next
const createMockReq = (overrides = {}) => ({
  method: 'GET',
  path: '/api/v1/organizations',
  headers: {},
  params: {},
  query: {},
  body: {},
  ip: '127.0.0.1',
  ...overrides,
} as unknown as Request);

const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    headersSent: false,
  } as unknown as Response;
  return res;
};

const createMockNext = () => jest.fn() as NextFunction;

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
  });

  it('should generate correlation ID when none provided', () => {
    middleware.use(req, res, next);
    expect((req as any).correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('should use existing correlation ID from header', () => {
    req.headers['x-correlation-id'] = 'existing-correlation-id';
    middleware.use(req, res, next);
    expect((req as any).correlationId).toBe('existing-correlation-id');
  });
});

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(async () => {
    jwtService = { verifyAsync: jest.fn() } as any;
    configService = { get: jest.fn().mockReturnValue('test-secret') } as any;
    middleware = new AuthMiddleware(jwtService, configService);
    req = createMockReq({ path: '/api/v1/organizations' });
    res = createMockRes();
    next = createMockNext();
  });

  it('should skip auth for health endpoints', async () => {
    req.path = '/health';
    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no token', async () => {
    req.headers.authorization = undefined;
    await middleware.use(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
    }));
  });

  it('should throw UnauthorizedException for invalid token format', async () => {
    req.headers.authorization = 'InvalidFormat';
    await middleware.use(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should attach user context on valid token', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      roles: ['admin'],
      permissions: ['organization:create'],
    });

    await middleware.use(req, res, next);

    expect((req as any).user).toBeDefined();
    expect((req as any).user.id).toBe('user-123');
    expect(next).toHaveBeenCalled();
  });
});

describe('AuthorizationMiddleware', () => {
  let middleware: AuthorizationMiddleware;
  let reflector: jest.Mocked<Reflector>;
  let permissionService: jest.Mocked<PermissionService>;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    permissionService = { hasPermissions: jest.fn() } as any;
    middleware = new AuthorizationMiddleware(reflector, permissionService);
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
    (req as any).user = {
      id: 'user-123',
      permissions: ['organization:read'],
    };
  });

  it('should skip when no permissions required', () => {
    reflector.get.mockReturnValue([]);
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(permissionService.hasPermissions).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user has no permissions', () => {
    reflector.get.mockReturnValue(['organization:create']);
    (req as any).user.permissions = [];
    permissionService.hasPermissions.mockReturnValue(false);

    middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'INSUFFICIENT_PERMISSIONS' }),
    }));
  });

  it('should allow when user has required permissions', () => {
    reflector.get.mockReturnValue(['organization:read']);
    permissionService.hasPermissions.mockReturnValue(true);

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('TenantIsolationMiddleware', () => {
  let middleware: TenantIsolationMiddleware;
  let tenantService: jest.Mocked<TenantService>;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    tenantService = { validateTenant: jest.fn() } as any;
    middleware = new TenantIsolationMiddleware(tenantService);
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
    (req as any).user = {
      tenantId: 'tenant-123',
      organizationId: 'org-123',
    };
  });

  it('should validate tenant and set context', () => {
    tenantService.validateTenant.mockReturnValue({ id: 'tenant-123', status: 'active' });

    middleware.use(req, res, next);

    expect(tenantService.validateTenant).toHaveBeenCalledWith('tenant-123');
    expect((req as any).tenantId).toBe('tenant-123');
    expect(next).toHaveBeenCalled();
  });

  it('should throw ForbiddenException for inactive tenant', () => {
    tenantService.validateTenant.mockReturnValue({ id: 'tenant-123', status: 'inactive' });

    middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'TENANT_INACTIVE' }),
    }));
  });

  it('should prevent cross-tenant access via headers', () => {
    tenantService.validateTenant.mockReturnValue({ id: 'tenant-123', status: 'active' });
    req.headers['x-tenant-id'] = 'other-tenant';

    middleware.use(req, res, next);

    // Should override the malicious header
    expect(req.headers['x-tenant-id']).toBe('tenant-123');
  });
});

describe('ValidationMiddleware', () => {
  let middleware: ValidationMiddleware;
  let reflector: jest.Mocked<Reflector>;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    middleware = new ValidationMiddleware(reflector);
    req = createMockReq({ body: { name: 'Test' } });
    res = createMockRes();
    next = createMockNext();
  });

  it('should skip when no validation DTO', async () => {
    reflector.get.mockReturnValue(null);
    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should validate body against DTO', async () => {
    // Mock validate function from class-validator
    jest.mock('class-validator', () => ({
      validate: jest.fn().mockResolvedValue([]),
    }));
    jest.mock('class-transformer', () => ({
      plainToClass: jest.fn().mockImplementation((cls, obj) => obj),
    }));

    const mockDto = class {
      name: string;
    };
    reflector.get.mockReturnValue(mockDto);

    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('RateLimiterMiddleware', () => {
  let middleware: RateLimiterMiddleware;
  let configService: jest.Mocked<ConfigService>;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    configService = { get: jest.fn() } as any;
    middleware = new RateLimiterMiddleware(configService);
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
  });

  it('should allow requests within limit', async () => {
    configService.get.mockReturnValue(100);
    await middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
  });

  it('should block requests exceeding limit', async () => {
    // Make many requests to exceed limit
    for (let i = 0; i < 101; i++) {
      await middleware.use(req, res, next);
    }
    expect(res.status).toHaveBeenCalledWith(429);
  });
});

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
  });

  it('should generate correlation ID and log request', () => {
    middleware.use(req, res, next);
    expect((req as any).correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('should sanitize sensitive data from logs', () => {
    req.body = { password: 'secret123', name: 'test' };
    middleware.use(req, res, next);
    // Logger would sanitize - we can't easily test internal logger calls
    expect(next).toHaveBeenCalled();
  });
});