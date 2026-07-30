export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  [key: string]: unknown;
}

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findByIdOrThrow(id: string): Promise<T>;
  findOne(filter: FilterOptions): Promise<T | null>;
  find(filter: FilterOptions, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  findAll(pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filter: FilterOptions): Promise<number>;
  exists(filter: FilterOptions): Promise<boolean>;
}

export abstract class BaseRepository<T> implements Repository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findByIdOrThrow(id: string): Promise<T>;
  abstract findOne(filter: FilterOptions): Promise<T | null>;
  abstract find(filter: FilterOptions, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  abstract findAll(pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract softDelete(id: string): Promise<boolean>;
  abstract restore(id: string): Promise<boolean>;
  abstract count(filter: FilterOptions): Promise<number>;
  abstract exists(filter: FilterOptions): Promise<boolean>;

  protected buildPagination(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}