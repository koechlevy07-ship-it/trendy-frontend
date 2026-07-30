/**
 * Organization Scope Middleware - Chapter 11 Part 4
 * 
 * Validates organization-level access control for hierarchical organization structures.
 * Enforces parent-child governance and visibility rules.
 */

import { Injectable, NestMiddleware, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../schemas/organization.model';

interface OrganizationAccessContext {
  organization: OrganizationDocument;
  hasDirectAccess: boolean;
  hasFederationAccess: boolean;
  governancePath: string[];
}

@Injectable()
export class OrganizationScopeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationScopeMiddleware.name);

  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip for health endpoints
    if (this.isHealthEndpoint(req.path)) {
      return next();
    }

    // Skip for non-organization endpoints
    if (!this.isOrganizationEndpoint(req.path)) {
      return next();
    }

    const user = (req as any).user;
    const tenantContext = (req as any).tenantContext;
    const correlationId = (req as any).correlationId;

    if (!tenantContext) {
      throw new Error('Tenant context not found - TenantIsolationMiddleware must run first');
    }

    try {
      const orgId = this.extractOrganizationId(req);
      
      if (!orgId) {
        return next(); // No specific org in request
      }

      const organization = await this.organizationModel
        .findById(orgId)
        .select('type status parentOrganizationId governingBodyId tenantId isDeleted')
        .lean()
        .exec();

      if (!organization || organization.isDeleted) {
        throw new NotFoundException({
          success: false,
          statusCode: 404,
          error: {
            code: 'ORGANIZATION_NOT_FOUND',
            message: 'Organization not found',
            details: [],
            correlationId,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate tenant isolation
      if (organization.tenantId !== tenantContext.tenantId) {
        throw new ForbiddenException({
          success: false,
          statusCode: 403,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Organization belongs to different tenant',
            details: [],
            correlationId,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate organization status
      if (organization.status !== 'active' && organization.status !== 'pending_verification') {
        throw new ForbiddenException({
          success: false,
          statusCode: 403,
          error: {
            code: 'ORGANIZATION_INACTIVE',
            message: `Organization is ${organization.status}`,
            details: [],
            correlationId,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate access permissions
      const accessContext = await this.validateOrganizationAccess(
        user,
        tenantContext,
        organization
      );

      // Attach organization access context
      (req as any).organizationContext = {
        ...accessContext,
        organization,
      };

      this.logger.debug(`Organization scope validated`, {
        correlationId,
        organizationId: orgId,
        hasDirectAccess: accessContext.hasDirectAccess,
        hasFederationAccess: accessContext.hasFederationAccess,
      });

      next();
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Organization scope validation failed`, {
        correlationId,
        error: error.message,
        stack: error.stack,
      });
      
      throw new ForbiddenException({
        success: false,
        statusCode: 403,
        error: {
          code: 'ORGANIZATION_ACCESS_ERROR',
          message: 'Failed to validate organization access',
          details: [],
          correlationId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  private isHealthEndpoint(path: string): boolean {
    return path.startsWith('/health');
  }

  private isOrganizationEndpoint(path: string): boolean {
    return path.includes('/organizations/') || 
           path.includes('/teams/') ||
           path.includes('/facilities/') ||
           path.includes('/memberships/');
  }

  private extractOrganizationId(req: Request): string | null {
    // Check path params
    if (req.params.organizationId) return req.params.organizationId;
    if (req.params.orgId) return req.params.orgId;
    if (req.params.id && req.path.includes('/organizations/')) return req.params.id;

    // Check query params
    if (req.query.organizationId) return req.query.organizationId as string;
    if (req.query.orgId) return req.query.orgId as string;

    // Check body for POST/PUT
    if (req.body.organizationId) return req.body.organizationId;

    return null;
  }

  private async validateOrganizationAccess(
    user: any,
    tenantContext: any,
    organization: any,
  ): Promise<OrganizationAccessContext> {
    // Direct organization access
    const hasDirectAccess = organization.tenantId === tenantContext.tenantId &&
      (organization.governingBodyId === tenantContext.organizationId ||
       organization.id === tenantContext.organizationId);

    // Federation access check
    let hasFederationAccess = false;
    let governancePath: string[] = [];

    if (organization.type === 'federation' || organization.type === 'league') {
      // Build governance hierarchy
      governancePath = await this.buildGovernancePath(organization);
      
      // Check if user's org is in the governance path
      hasFederationAccess = governancePath.includes(tenantContext.organizationId) ||
        user.roles?.includes('federation_admin');
    }

    // Federation admin can access any organization in their federation
    if (user.roles?.includes('federation_admin')) {
      hasFederationAccess = true;
    }

    return {
      organization: null as any, // Will be set by caller
      hasDirectAccess,
      hasFederationAccess,
      governancePath,
    };
  }

  private async buildGovernancePath(organization: any): Promise<string[]> {
    const path: string[] = [organization.id];
    let current = organization;

    while (current.parentOrganizationId) {
      const parent = await this.organizationModel
        .findById(current.parentOrganizationId)
        .select('id parentOrganizationId')
        .lean()
        .exec();

      if (!parent) break;
      
      path.push(parent.id);
      current = parent;
    }

    return path;
  }
}