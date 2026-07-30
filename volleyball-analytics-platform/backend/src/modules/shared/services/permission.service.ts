import { Injectable } from '@nestjs/common';

export interface UserPermissions {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
}

@Injectable()
export class PermissionService {
  private readonly permissionMatrix: Record<string, string[]> = {
    // Organization permissions
    'organization:create': ['organization_admin', 'system_admin'],
    'organization:read': ['organization_admin', 'organization_member', 'league_admin', 'club_admin'],
    'organization:update': ['organization_admin'],
    'organization:delete': ['organization_admin'],
    'organization:verify': ['federation_admin', 'league_admin'],
    'organization:approve': ['federation_admin', 'league_admin'],
    'organization:restore': ['organization_admin'],

    // Team permissions
    'team:create': ['organization_admin', 'club_admin', 'coach'],
    'team:read': ['organization_admin', 'organization_member', 'coach', 'player'],
    'team:update': ['organization_admin', 'club_admin', 'coach'],
    'team:delete': ['organization_admin', 'club_admin'],

    // Competition permissions
    'competition:create': ['federation_admin', 'league_admin'],
    'competition:read': ['organization_admin', 'organization_member', 'coach', 'player', 'referee'],
    'competition:update': ['federation_admin', 'league_admin', 'competition_manager'],
    'competition:delete': ['federation_admin', 'league_admin'],
    'competition:verify': ['federation_admin', 'league_admin'],
    'competition:approve': ['federation_admin', 'league_admin'],
    'competition:restore': ['federation_admin', 'league_admin'],

    // Fixture permissions
    'fixture:create': ['competition_manager', 'league_admin'],
    'fixture:read': ['organization_admin', 'organization_member', 'coach', 'player', 'referee'],
    'fixture:update': ['competition_manager', 'league_admin'],
    'fixture:delete': ['competition_manager', 'league_admin'],
    'fixture:assignOfficials': ['competition_manager', 'referee_coordinator'],
    'fixture:assignVenue': ['competition_manager', 'venue_coordinator'],

    // Match permissions
    'match:create': ['fixture_manager', 'competition_manager'],
    'match:read': ['organization_admin', 'organization_member', 'coach', 'player', 'referee', 'spectator'],
    'match:update': ['match_manager', 'competition_manager'],
    'match:delete': ['match_manager', 'competition_manager'],
    'match:start': ['match_manager', 'referee'],
    'match:pause': ['match_manager', 'referee'],
    'match:finish': ['match_manager', 'referee'],
    'match:restore': ['competition_manager'],
    'match:recordEvent': ['match_manager', 'scorer', 'referee'],
    'match:lineup': ['coach', 'match_manager'],
    'match:recordEvent': ['scorer', 'referee', 'match_manager'],

    // Officials permissions
    'official:create': ['referee_coordinator', 'federation_admin'],
    'official:read': ['referee_coordinator', 'federation_admin', 'league_admin'],
    'official:update': ['referee_coordinator', 'federation_admin'],
    'official:delete': ['referee_coordinator', 'federation_admin'],
    'official:assign': ['referee_coordinator', 'competition_manager'],
    'official:verify': ['referee_coordinator'],

    // Facility permissions
    'facility:create': ['venue_coordinator', 'federation_admin'],
    'facility:read': ['venue_coordinator', 'federation_admin', 'league_admin'],
    'facility:update': ['venue_coordinator', 'federation_admin'],
    'facility:delete': ['venue_coordinator', 'federation_admin'],
    'facility:schedule': ['venue_coordinator', 'competition_manager'],

    // Season permissions
    'season:create': ['federation_admin', 'league_admin'],
    'season:read': ['federation_admin', 'league_admin', 'club_admin'],
    'season:update': ['federation_admin', 'league_admin'],
    'season:delete': ['federation_admin', 'league_admin'],
    'season:activate': ['federation_admin', 'league_admin'],
    'season:close': ['federation_admin', 'league_admin'],

    // Standings permissions
    'standings:read': ['organization_admin', 'organization_member', 'coach', 'player', 'referee'],
    'standings:update': ['competition_manager', 'league_admin'],
    'standings:finalize': ['competition_manager', 'league_admin'],

    // AI permissions
    'ai:metadata:manage': ['ai_admin', 'match_manager'],
    'ai:processing:manage': ['ai_admin'],
    'ai:analytics:read': ['coach', 'analyst', 'organization_admin'],

    // System permissions
    'system:manage': ['system_admin'],
    'system:monitor': ['system_admin', 'devops'],
  };

  hasPermissions(user: UserPermissions, requiredPermissions: string[]): boolean {
    const userPermissions = new Set(user.permissions);

    // Check if user has any of the required permissions directly
    for (const perm of requiredPermissions) {
      if (userPermissions.has(perm)) {
        return true;
      }

      // Check if user has any role that grants this permission
      for (const role of user.roles) {
        if (this.permissionMatrix[perm]?.includes(role)) {
          return true;
        }
      }
    }

    return false;
  }

  hasAnyPermission(user: UserPermissions, requiredPermissions: string[]): boolean {
    return this.hasPermissions(user, requiredPermissions);
  }

  hasAllPermissions(user: UserPermissions, requiredPermissions: string[]): boolean {
    for (const perm of requiredPermissions) {
      if (!this.hasSinglePermission(user, perm)) {
        return false;
      }
    }
    return true;
  }

  private hasSinglePermission(user: UserPermissions, permission: string): boolean {
    const userPermissions = new Set(user.permissions);
    if (userPermissions.has(permission)) {
      return true;
    }

    for (const role of user.roles) {
      if (this.permissionMatrix[permission]?.includes(role)) {
        return true;
      }
    }

    return false;
  }

  getRolePermissions(role: string): string[] {
    const permissions: string[] = [];
    for (const [perm, roles] of Object.entries(this.permissionMatrix)) {
      if (roles.includes(role)) {
        permissions.push(perm);
      }
    }
    return permissions;
  }

  getPermissionsForRoles(roles: string[]): string[] {
    const permissions = new Set<string>();
    for (const role of roles) {
      for (const perm of this.getRolePermissions(role)) {
        permissions.add(perm);
      }
    }
    return Array.from(permissions);
  }
}