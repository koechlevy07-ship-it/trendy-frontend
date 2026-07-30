export declare enum Permission {
    VENUE_CREATE = "venue:create",
    VENUE_READ = "venue:read",
    VENUE_UPDATE = "venue:update",
    VENUE_DELETE = "venue:delete",
    VENUE_ACTIVATE = "venue:activate",
    VENUE_SUSPEND = "venue:suspend",
    COURT_CREATE = "court:create",
    COURT_READ = "court:read",
    COURT_UPDATE = "court:update",
    COURT_DELETE = "court:delete",
    COURT_ACTIVATE = "court:activate",
    COURT_MAINTENANCE = "court:maintenance",
    CAMERA_CREATE = "camera:create",
    CAMERA_READ = "camera:read",
    CAMERA_UPDATE = "camera:update",
    CAMERA_ACTIVATE = "camera:activate",
    CAMERA_CALIBRATE = "camera:calibrate",
    CALIBRATION_CREATE = "calibration:create",
    CALIBRATION_READ = "calibration:read",
    CALIBRATION_UPDATE = "calibration:update",
    CALIBRATION_ACTIVATE = "calibration:activate",
    CALIBRATION_DELETE = "calibration:delete",
    FACILITY_CREATE = "facility:create",
    FACILITY_READ = "facility:read",
    FACILITY_UPDATE = "facility:update",
    FACILITY_DELETE = "facility:delete"
}
export declare enum Role {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    VENUE_MANAGER = "venue_manager",
    COURT_MANAGER = "court_manager",
    OPERATIONS_STAFF = "operations_staff",
    TECHNICIAN = "technician",
    VIEWER = "viewer"
}
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare function hasPermission(role: Role, permission: Permission): boolean;
export declare function getPermissionsForRole(role: Role): Permission[];
export interface UserContext {
    userId: string;
    roles: Role[];
    organizationId?: string;
    permissions?: Permission[];
}
export declare function hasAnyPermission(user: UserContext, permissions: Permission[]): boolean;
export declare function requirePermission(user: UserContext, permission: Permission): void;
export declare class AuthorizationError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=rbac.d.ts.map