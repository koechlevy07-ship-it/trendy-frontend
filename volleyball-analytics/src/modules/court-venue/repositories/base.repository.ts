import { Model, FilterQuery, UpdateQuery, Types, SortOrder, HydratedDocument, Document } from 'mongoose';
import { PaginationOptions, PaginatedResult, FilterOptions } from '@shared/repository';

export class MongoRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<HydratedDocument<T> | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }

  async findByIdOrThrow(id: string): Promise<HydratedDocument<T>> {
    const doc = await this.findById(id);
    if (!doc) throw new Error(`${this.model.modelName} not found: ${id}`);
    return doc;
  }

  async findOne(filter: FilterOptions): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter as FilterQuery<T>).exec();
  }

  async find(filter: FilterOptions = {}, pagination?: PaginationOptions): Promise<PaginatedResult<T>> {
    const page = pagination?.page ?? 1; const limit = pagination?.limit ?? 20; const skip = (page - 1) * limit;
    const sort: Record<string, SortOrder> = pagination?.sortBy ? { [pagination.sortBy]: pagination.sortOrder === 'asc' ? 1 : -1 } : { createdAt: -1 };
    const [data, total] = await Promise.all([
      this.model.find(filter as FilterQuery<T>).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter as FilterQuery<T>).exec(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAll(pagination?: PaginationOptions): Promise<PaginatedResult<T>> { return this.find({}, pagination); }

  async create(data: Partial<T>): Promise<HydratedDocument<T>> { const doc = new this.model(data); return doc.save(); }

  async update(id: string, data: Partial<T>): Promise<HydratedDocument<T> | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findByIdAndUpdate(id, data as UpdateQuery<T>, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<boolean> { if (!Types.ObjectId.isValid(id)) return false; const result = await this.model.findByIdAndDelete(id).exec(); return !!result; }
  async softDelete(id: string): Promise<boolean> { if (!Types.ObjectId.isValid(id)) return false; const result = await this.model.findByIdAndUpdate(id, { archivedAt: new Date(), status: 'archived' }, { new: true }).exec(); return !!result; }
  async restore(id: string): Promise<boolean> { if (!Types.ObjectId.isValid(id)) return false; const result = await this.model.findByIdAndUpdate(id, { archivedAt: null, status: 'active' }, { new: true }).exec(); return !!result; }

  async count(filter: FilterOptions = {}): Promise<number> { return this.model.countDocuments(filter as FilterQuery<T>).exec(); }
  async exists(filter: FilterOptions): Promise<boolean> { const doc = await this.model.findOne(filter as FilterQuery<T>).select('_id').lean().exec(); return !!doc; }
  async findByIds(ids: string[]): Promise<HydratedDocument<T>[]> { const validIds = ids.filter(id => Types.ObjectId.isValid(id)); if (validIds.length === 0) return []; return this.model.find({ _id: { $in: validIds } }).exec(); }
  async bulkCreate(docs: Partial<T>[]): Promise<HydratedDocument<T>[]> { return this.model.insertMany(docs); }
  async bulkUpdate(filter: FilterOptions, update: UpdateQuery<T>): Promise<{ matched: number; modified: number }> { const result = await this.model.updateMany(filter as FilterQuery<T>, update).exec(); return { matched: result.matchedCount, modified: result.modifiedCount }; }
  async aggregate(pipeline: any[]): Promise<any[]> { return this.model.aggregate(pipeline).exec(); }
  async distinct(field: string, filter: FilterOptions = {}): Promise<any[]> { return this.model.distinct(field, filter as FilterQuery<T>).exec(); }
}