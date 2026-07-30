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

export class ApiResponseBuilder {
  static success<T>(data: T, message = 'Operation successful', meta?: Record<string, unknown>): ApiResponse<T> {
    return { success: true, message, data, meta, timestamp: new Date().toISOString() };
  }

  static error(message: string, errors?: ApiError[], meta?: Record<string, unknown>): ApiResponse {
    return { success: false, message, errors, meta, timestamp: new Date().toISOString() };
  }

  static paginated<T>(data: T[], pagination: { page: number; limit: number; total: number; totalPages: number }, message = 'Operation successful', meta?: Record<string, unknown>): PaginatedResponse<T> {
    return { success: true, message, data, meta: { ...pagination, ...meta }, timestamp: new Date().toISOString() };
  }
}