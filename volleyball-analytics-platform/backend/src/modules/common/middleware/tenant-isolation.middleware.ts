import { Injectable, NestMiddleware, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantIsolationMiddleware.name);

  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = (req as any).user;
    if (!user) {
      return next();
    }

    // Extract tenant from authenticated user
    const userTenantId = user.tenantId;
    if (!userTenantId) {
      throw new BadRequestException('User tenant context not found');
    }

    // Validate tenant exists and is active
    const tenant = await this.tenantService.validateTenant(userTenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new ForbiddenException('Invalid or inactive tenant');
    }

    // Set tenant context on request
    (req as any).tenantId = userTenantId;
    (req as any).tenant = tenant;

    // Prevent cross-tenant header injection
    this.preventCrossTenantHeaders(req, userTenantId);

    // Validate organization membership if organization ID in path
    const orgId = req.params.organizationId || req.body.organizationId;
    if (orgId) {
      this.validateOrganizationAccess(user, orgId, tenant.id);
    }

    // Prevent cross-tenant query parameters
    this.preventCrossTenantQueryParams(req, userTenantId);

    next();
  }

  private preventCrossTenantHeaders(req: Request, tenantId: string): void {
    // Remove any tenant headers that could be used for injection
    const tenantHeaders = [
      'x-tenant-id',
      'x-organization-id',
      'x-org-id',
      'x-federation-id',
    ];

    tenantHeaders.forEach(header => {
      delete req.headers[header];
    });

    // Set the validated tenant header
    req.headers['x-tenant-id'] = tenantId;
  }

  private validateOrganizationAccess(user: any, organizationId: string, tenantId: string): void {
    // Federation admins can access organizations in their federation
    if (user.roles?.includes('federation_admin')) {
      return;
    }

    // League admins can access organizations in their league
    if (user.roles?.includes('league_admin')) {
      return;
    }

    // Regular users can only access their own organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException('Access to other organizations is not permitted');
    }
  }

  private preventCrossTenantQueryParams(req: Request, tenantId: string): void {
    // Remove any tenant-related query parameters that could be used for injection
    const tenantQueryParams = [
      'tenantId',
      'organizationId',
      'orgId',
      'federationId',
    ];

    tenantQueryParams.forEach(param => {
      delete req.query[param];
    });

    // Set validated tenant context
    req.query.tenantId = tenantId;
  }
}