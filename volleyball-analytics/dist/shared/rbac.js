"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = exports.ROLE_PERMISSIONS = exports.Role = exports.Permission = void 0;
exports.hasPermission = hasPermission;
exports.getPermissionsForRole = getPermissionsForRole;
exports.hasAnyPermission = hasAnyPermission;
exports.requirePermission = requirePermission;
var Permission;
(function (Permission) {
    Permission["VENUE_CREATE"] = "venue:create";
    Permission["VENUE_READ"] = "venue:read";
    Permission["VENUE_UPDATE"] = "venue:update";
    Permission["VENUE_DELETE"] = "venue:delete";
    Permission["VENUE_ACTIVATE"] = "venue:activate";
    Permission["VENUE_SUSPEND"] = "venue:suspend";
    Permission["COURT_CREATE"] = "court:create";
    Permission["COURT_READ"] = "court:read";
    Permission["COURT_UPDATE"] = "court:update";
    Permission["COURT_DELETE"] = "court:delete";
    Permission["COURT_ACTIVATE"] = "court:activate";
    Permission["COURT_MAINTENANCE"] = "court:maintenance";
    Permission["CAMERA_CREATE"] = "camera:create";
    Permission["CAMERA_READ"] = "camera:read";
    Permission["CAMERA_UPDATE"] = "camera:update";
    Permission["CAMERA_ACTIVATE"] = "camera:activate";
    Permission["CAMERA_CALIBRATE"] = "camera:calibrate";
    Permission["CALIBRATION_CREATE"] = "calibration:create";
    Permission["CALIBRATION_READ"] = "calibration:read";
    Permission["CALIBRATION_UPDATE"] = "calibration:update";
    Permission["CALIBRATION_ACTIVATE"] = "calibration:activate";
    Permission["CALIBRATION_DELETE"] = "calibration:delete";
    Permission["FACILITY_CREATE"] = "facility:create";
    Permission["FACILITY_READ"] = "facility:read";
    Permission["FACILITY_UPDATE"] = "facility:update";
    Permission["FACILITY_DELETE"] = "facility:delete";
})(Permission || (exports.Permission = Permission = {}));
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "super_admin";
    Role["ADMIN"] = "admin";
    Role["VENUE_MANAGER"] = "venue_manager";
    Role["COURT_MANAGER"] = "court_manager";
    Role["OPERATIONS_STAFF"] = "operations_staff";
    Role["TECHNICIAN"] = "technician";
    Role["VIEWER"] = "viewer";
})(Role || (exports.Role = Role = {}));
exports.ROLE_PERMISSIONS = {
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
function hasPermission(role, permission) {
    return exports.ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
function getPermissionsForRole(role) {
    return exports.ROLE_PERMISSIONS[role] ?? [];
}
function hasAnyPermission(user, permissions) {
    const userPerms = user.permissions ?? user.roles.flatMap(getPermissionsForRole);
    return permissions.some(p => userPerms.includes(p));
}
function requirePermission(user, permission) {
    if (!hasAnyPermission(user, [permission])) {
        throw new AuthorizationError(`Missing required permission: ${permission}`);
    }
}
class AuthorizationError extends Error {
    constructor(message) { super(message); this.name = 'AuthorizationError'; }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=rbac.js.map