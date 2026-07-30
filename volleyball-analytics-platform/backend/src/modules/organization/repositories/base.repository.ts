/**
 * Base Repository - Chapter 11 Part 2
 * 
 * Abstract base repository with common CRUD operations.
 * All entity repositories should extend this class.
 */

import { Model, Types, FilterQuery, UpdateQuery, Document, PipelineStage } from 'mongoose';
import { Injectable } from '@nestjs/common';

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BaseRepositoryInterface<T extends Document> {
  createIndex(): Promise<void>;
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findMany(filter: FilterQuery<T>, pagination?: PaginationParams): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  softDelete(id: string, deletedBy: Types.ObjectId): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filter: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  bulkInsert(documents: Partial<T>[]): Promise<T[]>;
  bulkUpdate(updates: Array<{ id: string; data: UpdateQuery<T> }>): Promise<number>;
  paginate(filter: FilterQuery<T>, pagination: PaginationParams): Promise<PaginatedResult<T>>;
  aggregate(pipeline: PipelineStage[]): Promise<any[]>;
}

@Injectable()
export abstract class BaseRepository<T extends Document> implements BaseRepositoryInterface<T> {
  constructor(protected readonly model: Model<T>) {}

  abstract createIndex(): Promise<void>;

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model({
      ...data,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return document.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(filter: FilterQuery<T>, pagination?: PaginationParams): Promise<T[]> {
    let query = this.model.find(filter);
    
    if (pagination) {
      const { page = 1, perPage = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * perPage;
      query = query.skip(skip).limit(perPage).sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
    }
    
    return query.exec();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: Types.ObjectId): Promise<boolean> {
    const result = await this.model
      .findByIdAndUpdate(id, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      })
      .exec();
    return !!result;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.model
      .findByIdAndUpdate(id, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date(),
      })
      .exec();
    return !!result;
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async bulkInsert(documents: Partial<T>[]): Promise<T[]> {
    const docs = documents.map((doc) => ({
      ...doc,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    return this.model.insertMany(docs as any);
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateQuery<T> }>): Promise<number> {
    let count = 0;
    for (const update of updates) {
      if (!update.id) continue;
      const result = await this.model
        .findByIdAndUpdate(update.id, { ...update.data, updatedAt: new Date() })
        .exec();
      if (result) count++;
    }
    return count;
  }

  async paginate(
    filter: FilterQuery<T>,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<T>> {
    const { page = 1, perPage = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }
}