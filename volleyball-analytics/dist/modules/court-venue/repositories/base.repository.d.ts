import { Model, UpdateQuery, HydratedDocument, Document } from 'mongoose';
import { PaginationOptions, PaginatedResult, FilterOptions } from '@shared/repository';
export declare class MongoRepository<T extends Document> {
    protected readonly model: Model<T>;
    constructor(model: Model<T>);
    findById(id: string): Promise<HydratedDocument<T> | null>;
    findByIdOrThrow(id: string): Promise<HydratedDocument<T>>;
    findOne(filter: FilterOptions): Promise<HydratedDocument<T> | null>;
    find(filter?: FilterOptions, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
    findAll(pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
    create(data: Partial<T>): Promise<HydratedDocument<T>>;
    update(id: string, data: Partial<T>): Promise<HydratedDocument<T> | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    count(filter?: FilterOptions): Promise<number>;
    exists(filter: FilterOptions): Promise<boolean>;
    findByIds(ids: string[]): Promise<HydratedDocument<T>[]>;
    bulkCreate(docs: Partial<T>[]): Promise<HydratedDocument<T>[]>;
    bulkUpdate(filter: FilterOptions, update: UpdateQuery<T>): Promise<{
        matched: number;
        modified: number;
    }>;
    aggregate(pipeline: any[]): Promise<any[]>;
    distinct(field: string, filter?: FilterOptions): Promise<any[]>;
}
//# sourceMappingURL=base.repository.d.ts.map