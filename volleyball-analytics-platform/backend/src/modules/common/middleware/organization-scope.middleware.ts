import { Injectable, NestMiddleware, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Organization, OrganizationDocument, OrganizationStatus } from '../../organization/schemas/organization.schema';

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

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (organization.isDeleted) {
        throw new NotFoundException('Organization not found');
      }

      // Validate tenant isolation
      if (organization.tenantId !== (req as any).tenantId) {
        throw new ForbiddenException({
          success: false,
          statusCode: 403,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Organization belongs to different tenant',
            details: [],
            correlationId: (req as any).correlationId,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate organization status
      if (organization.status !== OrganizationStatus.ACTIVE && organization.status !== OrganizationStatus.PENDING_VERIFICATION) {
        throw new ForbiddenException({
          success: false,
          statusCode: 403,
          error: {
            code: 'ORGANIZATION_INACTIVE',
            message: `Organization is ${organization.status}`,
            details: [],
            correlationId: (req as any).correlationId,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate hierarchy integrity
      if (organization.parentOrganizationId) {
        await this.validateHierarchyIntegrity(organization.parentOrganizationId, (req as any).user?.id);
      }

      // Attach organization context
      (req as any).organizationContext = {
        organization,
        hasDirectAccess: organization.tenantId === (req as any).tenantId,
        hasFederationAccess: !!organization.governingBodyId,
        governancePath: await this.buildGovernancePath(organization),
      };

      this.logger.debug(`Organization scope validated`, {
        correlationId: (req as any).correlationId,
        organizationId: orgId,
        hasDirectAccess: organization.tenantId === (req as any).tenantId,
      });

      next();
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Organization scope validation failed`, {
        correlationId: (req as any).correlationId,
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
          correlationId: (req as any).correlationId,
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

  private async validateHierarchyIntegrity(parentOrganizationId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    // Check if child is already an ancestor of parent (cycle detection)
    let current = parentOrganizationId;
    const visited = new Set<string>();
    
    while (current && !visited.has(current.toString())) {
      if (current.toString() === userId) {
        throw new BadRequestException('Hierarchy would create a cycle');
      }
      visited.add(current.toString());
      
      const parent = await this.organizationModel
        .findById(current)
        .select('parentOrganizationId')
        .lean()
        .exec();
      
      if (!parent) break;
      current = parent.parentOrganizationId;
    }
  }

  private async buildHierarchyTree(orgId: Types.ObjectId, maxDepth: number = 5): Promise<any> {
    const org = await this.organizationModel.findById(orgId).lean().exec();
    if (!org || maxDepth <= 0) return null;

    const children = await this.organizationModel
      .find({ parentOrganizationId: orgId })
      .lean()
      .exec();

    const childNodes = await Promise.all(
      children.map(child => this.buildHierarchyTree(child._id, maxDepth - 1))
    );

    return { organization: org, children: childNodes };
  }
}