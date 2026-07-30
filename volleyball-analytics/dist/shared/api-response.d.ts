export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: Record<string, unknown>;
    timestamp: string;
    errors?: ApiError[];
}
export interface ApiError {
    field?: string;
    code: string;
    message: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    meta: PaginationMeta;
    timestamp: string;
}
export declare class ApiResponseBuilder {
    static success<T>(data: T, message?: string, meta?: Record<string, unknown>): ApiResponse<T>;
    static error(message: string, errors?: ApiError[], meta?: Record<string, unknown>): ApiResponse;
    static paginated<T>(data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }, message?: string, meta?: Record<string, unknown>): PaginatedResponse<T>;
}
//# sourceMappingURL=api-response.d.ts.map