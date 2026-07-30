"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseBuilder = void 0;
class ApiResponseBuilder {
    static success(data, message = 'Operation successful', meta) {
        return { success: true, message, data, meta, timestamp: new Date().toISOString() };
    }
    static error(message, errors, meta) {
        return { success: false, message, errors, meta, timestamp: new Date().toISOString() };
    }
    static paginated(data, pagination, message = 'Operation successful', meta) {
        return { success: true, message, data, meta: { ...pagination, ...meta }, timestamp: new Date().toISOString() };
    }
}
exports.ApiResponseBuilder = ApiResponseBuilder;
//# sourceMappingURL=api-response.js.map