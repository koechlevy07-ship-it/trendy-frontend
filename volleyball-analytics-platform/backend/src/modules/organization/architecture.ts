/**
 * Team & Organization Management Module - Chapter 11 Part 1
 * 
 * This file documents the module architecture as specified in Chapter 11 Part 1
 * of the VOLUME 3 - BACKEND DEVELOPMENT MANUAL.
 * 
 * This module is the authoritative organizational management subsystem of the
 * AI-Powered Volleyball Analytics Platform.
 */

// Module Architecture Overview
export const MODULE_ARCHITECTURE = {
  moduleName: 'Team & Organization Management Module',
  chapter: 11,
  part: 1,
  version: '1.0.0',
  description: 'Authoritative organizational management subsystem for volleyball analytics platform',
  
  // Module boundaries
  boundedContext: 'Team & Organization Management',
  boundedContextDescription: 'Manages hierarchical organizational structures including federations, leagues, clubs, academies, schools, universities, national teams, and team structures.',
  
  // Dependencies on other modules
  dependencies: {
    required: [
      'Authentication Module',
      'Authorization Module',
      'Player & Staff Management Module (Chapter 10)',
    ],
    integrationPoints: [
      'Competition Management Module',
      'Match Scheduling Module',
      'Fixture Generation Module',
      'Statistics Engine',
      'AI Match Analysis Module',
      'Referee Assignment Module',
      'Training Management Module',
      'Facilities Module',
    ],
  },
  
  // Sub-modules
  subModules: {
    organization: {
      path: 'src/modules/organization',
      description: 'Core organization management - federations, leagues, clubs, academies, schools, universities',
      responsibilities: [
        'Organization CRUD operations',
        'Hierarchical parent-child relationships',
        'Organization lifecycle management',
        'Governance and compliance tracking',
        'Branding and identity management',
        'AI metadata for organizational recognition',
        'Multi-tenant data isolation',
      ],
    },
    team: {
      path: 'src/modules/team',
      description: 'Team management within organizations',
      responsibilities: [
        'Team CRUD operations',
        'Team categories and gender management',
        'Active and historical roster management',
        'Coaching staff assignments',
        'Team lifecycle and season participation',
        'AI metadata for team recognition (jerseys, logos, colors)',
        'Historical roster preservation',
      ],
    },
    season: {
      path: 'src/modules/season',
      description: 'Season management for teams and organizations',
      responsibilities: [
        'Season creation and lifecycle',
        'Season participation tracking',
        'Historical season records',
        'Standings and statistics integration',
      ],
    },
    branding: {
      path: 'src/modules/branding',
      description: 'Branding assets and AI color/profile management',
      responsibilities: [
        'Logo and color management',
        'Jersey template management',
        'AI color profile extraction',
        'Brand guidelines enforcement',
      ],
    },
    facilities: {
      path: 'src/modules/facilities',
      description: 'Facility management for organizations and teams',
      responsibilities: [
        'Facility CRUD operations',
        'Court specifications and AI camera positioning',
        'Facility scheduling and availability',
        'Maintenance tracking',
      ],
    },
    shared: {
      path: 'src/modules/shared',
      description: 'Shared utilities, constants, and cross-module types',
    },
    common: {
      path: 'src/modules/common',
      description: 'Common infrastructure, base classes, and utilities',
    },
  },
  
  // Layered Architecture (as specified in 11.6)
  layers: {
    httpRequest: 'Incoming HTTP request',
    apiRouter: 'API Router - routes to appropriate controller',
    authentication: 'Authentication Middleware - JWT validation',
    authorization: 'Authorization Middleware - RBAC permissions',
    validation: 'Validation Middleware - DTO validation',
    controller: 'Controller - receives requests, extracts params, calls services',
    service: 'Service - business logic, workflow orchestration, transaction management',
    repository: 'Repository - MongoDB operations, aggregation pipelines, pagination',
    mongodb: 'MongoDB - persistent storage',
    responseBuilder: 'Response Builder - standardized response format',
    httpResponse: 'Outgoing HTTP response',
  },
  
  // Responsibility boundaries
  layerResponsibilities: {
    controller: {
      allowed: [
        'Receive HTTP requests',
        'Parse request parameters',
        'Call services',
        'Return standardized responses',
      ],
      forbidden: [
        'Execute business rules',
        'Query MongoDB directly',
        'Perform complex validation',
        'Execute business logic',
      ],
    },
    service: {
      responsibilities: [
        'Enforce business rules',
        'Coordinate repositories',
        'Manage transactions',
        'Publish domain events',
        'Perform organizational workflows',
        'Enforce business rules',
        'Validate business constraints',
      ],
    },
    repository: {
      responsibilities: [
        'Execute MongoDB operations',
        'Build aggregation pipelines',
        'Implement pagination',
        'Perform indexed queries',
        'Handle persistence',
      ],
    },
    validator: {
      responsibilities: [
        'Validate DTOs',
        'Normalize data',
        'Enforce schema rules',
        'Reject malformed requests',
      ],
    },
  },
  
  // Domain Models
  domainModels: {
    organization: {
      description: 'Authoritative organizational entity',
      sections: [
        'Identity',
        'Registration',
        'Governance',
        'Address',
        'Contact Information',
        'Branding',
        'Teams',
        'Facilities',
        'Documents',
        'Licenses',
        'Competition Membership',
        'AI Metadata',
        'Audit Information',
        'Historical Records',
      ],
      keyProperties: [
        'id',
        'organizationId',
        'name',
        'shortName',
        'type',
        'status',
        'parentOrganizationId',
        'governingBodyId',
        'branding',
        'aiMetadata',
        'teamIds',
        'facilityIds',
        'auditInformation',
        'historicalRecords',
      ],
    },
    team: {
      description: 'Primary organizational unit for competitions and analytics',
      sections: [
        'Team Identity',
        'Organization Reference',
        'Team Category',
        'Gender',
        'Age Group',
        'Division',
        'League Membership',
        'Coaching Staff',
        'Active Roster',
        'Historical Roster',
        'AI Recognition Metadata',
        'Branding',
        'Statistics Reference',
        'Medical Reference',
        'Training Reference',
        'Schedule Reference',
        'Audit Information',
      ],
      keyProperties: [
        'id',
        'teamId',
        'name',
        'shortName',
        'organizationId',
        'category',
        'gender',
        'status',
        'activeRoster',
        'historicalRoster',
        'coachingStaff',
        'aiMetadata',
        'branding',
        'historicalRecords',
      ],
    },
  },
  
  // Lifecycle Workflows
  lifecycles: {
    organization: {
      stages: [
        'Registration',
        'Document Verification',
        'Approval',
        'Organization Creation',
        'Administrator Assignment',
        'Team Registration',
        'Competition Enrollment',
        'Operational Status',
        'Suspension / Archive',
      ],
      auditRequirement: 'Each transition shall generate immutable audit records.',
    },
    team: {
      stages: [
        'Team Registration',
        'Organization Validation',
        'Coach Assignment',
        'Player Registration',
        'Competition Enrollment',
        'Season Activation',
        'AI Recognition Initialization',
        'Active Competition',
        'Season Completion',
        'Archive Historical Data',
      ],
      auditRequirement: 'Historical team data shall never be overwritten.',
    },
  },
  
  // AI Integration Points
  aiIntegration: {
    organization: [
      'Organization embedding for recognition',
      'Team color profiles for computer vision',
      'Jersey templates for object detection',
      'Logo references for brand detection',
      'Court preferences for camera positioning',
    ],
    team: [
      'Team embedding for recognition',
      'Jersey recognition (home/away/alternate/goalkeeper)',
      'Logo and team photo references',
      'Court side preference',
      'Number font and color detection',
      'Goalkeeper jersey differentiation',
    ],
    aiMetadataSchema: {
      organizationEmbedding: 'number[]',
      teamColorProfile: {
        primary: 'number[]',
        secondary: 'number[]',
        accent: 'number[]',
      },
      jerseyTemplates: {
        home: { pattern: 'string', colors: 'string[]' },
        away: { pattern: 'string', colors: 'string[]' },
        alternate: { pattern: 'string', colors: 'string[]' },
      },
      logoReferences: 'string[]',
      courtPreferences: {
        defaultCourtType: 'string',
        preferredLighting: 'string',
        cameraPositions: 'number[][]',
      },
    },
  },
  
  // Multi-Tenant Architecture
  multiTenancy: {
    supportedEntityTypes: [
      'National federations',
      'Regional federations',
      'County associations',
      'Professional leagues',
      'Amateur leagues',
      'Clubs',
      'Schools',
      'Universities',
      'Private academies',
      'National teams',
      'Beach volleyball organizations',
      'Sitting volleyball organizations',
    ],
    isolationStrategy: 'tenantId field + dataRegion field + row-level security policies',
    dataResidency: 'Configurable per tenant (EU, US, APAC, etc.)',
    crossTenantAccess: 'Explicit grants only, default deny',
  },
  
  // Scalability Requirements
  scalability: {
    targets: {
      organizations: 'Millions',
      teams: 'Millions',
      countries: 'Multi-country',
      federations: 'Multi-federation',
    },
    architecture: [
      'Cloud-native',
      'Horizontal database partitioning (sharding by tenantId)',
      'Microservice-ready module boundaries',
      'Event-driven inter-module communication',
      'Caching layers for frequently accessed data',
    ],
  },
  
  // Security Requirements
  security: {
    principles: [
      'Confidentiality',
      'Integrity',
      'Availability',
      'Accountability',
      'Traceability',
      'Non-repudiation',
      'Least Privilege Access',
      'Zero Trust Principles',
    ],
    auditRequirements: [
      'Every data modification creates immutable audit log',
      'Audit logs never modified or deleted',
      'Audit records include: userId, action, entityType, entityId, oldValues, newValues, ipAddress, correlationId, timestamp',
    ],
    accessControl: 'RBAC with organization-scoped permissions',
  },
  
  // Integration Events
  domainEvents: {
    organization: [
      'OrganizationCreated',
      'OrganizationUpdated',
      'OrganizationStatusChanged',
      'OrganizationArchived',
      'OrganizationRestored',
      'ParentOrganizationChanged',
      'BrandingUpdated',
      'AIMetadataUpdated',
    ],
    team: [
      'TeamCreated',
      'TeamUpdated',
      'TeamStatusChanged',
      'TeamAssignedToOrganization',
      'TeamTransferred',
      'RosterUpdated',
      'CoachAssigned',
      'CoachRemoved',
      'PlayerAdded',
      'PlayerRemoved',
      'TeamArchived',
      'AIMetadataUpdated',
      'JerseyTemplateUpdated',
    ],
  },
};

export default MODULE_ARCHITECTURE;