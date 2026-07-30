export enum Permission {
  VENUE_CREATE = 'venue:create',
  VENUE_READ = 'venue:read',
  VENUE_UPDATE = 'venue:update',
  VENUE_DELETE = 'venue:delete',
  VENUE_ACTIVATE = 'venue:activate',
  VENUE_SUSPEND = 'venue:suspend',
  COURT_CREATE = 'court:create',
  COURT_READ = 'court:read',
  COURT_UPDATE = 'court:update',
  COURT_DELETE = 'court:delete',
  COURT_ACTIVATE = 'court:activate',
  COURT_MAINTENANCE = 'court:maintenance',
  CAMERA_CREATE = 'camera:create',
  CAMERA_READ = 'camera:read',
  CAMERA_UPDATE = 'camera:update',
  CAMERA_ACTIVATE = 'camera:activate',
  CAMERA_CALIBRATE = 'camera:calibrate',
  CALIBRATION_CREATE = 'calibration:create',
  CALIBRATION_READ = 'calibration:read',
  CALIBRATION_UPDATE = 'calibration:update',
  CALIBRATION_ACTIVATE = 'calibration:activate',
  CALIBRATION_DELETE = 'calibration:delete',
  FACILITY_CREATE = 'facility:create',
  FACILITY_READ = 'facility:read',
  FACILITY_UPDATE = 'facility:update',
  FACILITY_DELETE = 'facility:delete',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  VENUE_MANAGER = 'venue_manager',
  COURT_MANAGER = 'court_manager',
  OPERATIONS_STAFF = 'operations_staff',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ADMIN]: [
    Permission.VENUE_CREATE, Permission.VENUE_READ, Permission.VENUE_UPDATE, Permission.VENUE_DELETE, Permission.VENUE_ACTIVATE, Permission.VENUE_SUSPEND,
    Permission.COURT_CREATE, Permission.COURT_READ, Permission.COURT_UPDATE, Permission.COURT_DELETE, Permission.COURT_ACTIVATE, Permission.COURT_MAINTENANCE,
    Permission.CAMERA_CREATE, Permission.CAMERA_READ, Permission.CAMERA_UPDATE, Permission.CAMERA_ACTIVATE, Permission.CAMERA_CALIBRATE,
    Permission.CALIBRATION_CREATE, Permission.CALIBRATION_READ, Permission.CALIBRATION_UPDATE, Permission.CALIBRATION_ACTIVATE, Permission.CALIBRATION_DELETE,
    Permission.FACILITY_CREATE, Permission.FACILITY_READ, Permission.FACILITY_UPDATE, Permission.FACILITY_DELETE,
  ],
  [Role.VENUE_MANAGER]: [
    Permission.VENUE_READ, Permission.VENUE_UPDATE, Permission.VENUE_ACTIVATE, Permission.VENUE_SUSPEND,
    Permission.COURT_CREATE, Permission.COURT_READ, Permission.COURT_UPDATE, Permission.COURT_DELETE, Permission.COURT_ACTIVATE, Permission.COURT_MAINTENANCE,
    Permission.CAMERA_READ, Permission.CAMERA_UPDATE, Permission.FACILITY_READ, Permission.FACILITY_UPDATE,
  ],
  [Role.COURT_MANAGER]: [
    Permission.COURT_READ, Permission.COURT_UPDATE, Permission.COURT_ACTIVATE, Permission.COURT_MAINTENANCE,
    Permission.CAMERA_READ, Permission.CAMERA_UPDATE, Permission.CAMERA_CALIBRATE, Permission.CALIBRATION_READ, Permission.CALIBRATION_UPDATE,
    Permission.FACILITY_READ,
  ],
  [Role.OPERATIONS_STAFF]: [
    Permission.VENUE_READ, Permission.COURT_READ, Permission.CAMERA_READ, Permission.FACILITY_READ, Permission.MAINTENANCE_READ, Permission.MAINTENANCE_UPDATE,
  ],
  [Role.TECHNICIAN]: [
    Permission.COURT_READ, Permission.CAMERA_READ, Permission.CAMERA_UPDATE, Permission.CAMERA_CALIBRATE, Permission.CALIBRATION_CREATE, Permission.CALIBRATION_READ,
    Permission.CALIBRATION_UPDATE, Permission.CALIBRATION_ACTIVATE,
  ],
  [Role.VIEWER]: [
    Permission.VENUE_READ, Permission.COURT_READ, Permission.CAMERA_READ, Permission.FACILITY_READ,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export interface UserContext {
  userId: string;
  roles: Role[];
  organizationId?: string;
  permissions?: Permission[];
}

export function hasAnyPermission(user: UserContext, permissions: Permission[]): boolean {
  const userPerms = user.permissions ?? user.roles.flatMap(getPermissionsForRole);
  return permissions.some(p => userPerms.includes(p));
}

export function requirePermission(user: UserContext, permission: Permission): void {
  if (!hasAnyPermission(user, [permission])) {
    throw new AuthorizationError(`Missing required permission: ${permission}`);
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthorizationError'; }
}