import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { VenueAccessibility, VenueAccessibilityDocument } from '../schemas/venue-accessibility.schema';

export interface PaginatedResult<T> {
  data: any[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

@Injectable()
export class AccessibilityRepository {
  constructor(
    @InjectModel('VenueAccessibility') private readonly accessibilityModel: Model<any>,
  ) {}

  async create(accessibility: Partial<any>): Promise<any> {
    const doc = new this.accessibilityModel({
      ...accessibility,
      _id: new Types.ObjectId(),
      accessibilityId: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.accessibilityModel.findById(id).exec();
  }

  async findByAccessibilityId(id: string) {
    return this.accessibilityModel.findOne({ accessibilityId: id }).exec();
  }

  async findByVenue(venueId: string) {
    return this.accessibilityModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async update(id: string, update: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.accessibilityModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.accessibilityModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.accessibilityModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async addFeature(accessibilityId: string, feature: any): Promise<any> {
    const acc = await this.accessibilityModel.findById(accessibilityId);
    if (!acc) return null;
    acc.features.push({ ...feature, _id: new Types.ObjectId() });
    acc.updatedAt = new Date();
    return acc.save();
  }

  async updateFeature(accessibilityId: string, featureId: string, update: any): Promise<boolean> {
    const result = await this.accessibilityModel.updateOne(
      { _id: new Types.ObjectId(accessibilityId), 'features._id': new Types.ObjectId(featureId) },
      { $set: { 'features.$': { ...update, _id: new Types.ObjectId(featureId) }, updatedAt: new Date() } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async removeFeature(accessibilityId: string, featureId: string): Promise<boolean> {
    const result = await this.accessibilityModel.updateOne(
      { _id: new Types.ObjectId(accessibilityId) },
      { $pull: { features: { _id: new Types.ObjectId(featureId) } }, $inc: { 'audit.version': 1 } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async getComplianceReport(venueId: string) {
    const acc = await this.accessibilityModel.findOne({ venueId: new Types.ObjectId(venueId) }).exec();
    if (!acc) return null;

    const total = acc.features?.length || 0;
    const compliant = acc.features?.filter(f => f.condition === 'compliant' || f.condition === 'good').length || 0;
    const nonCompliant = acc.features?.filter(f => f.condition === 'non_compliant' || f.condition === 'poor').length || 0;

    return {
      totalFeatures: total,
      compliant,
      nonCompliant,
      complianceScore: total > 0 ? (compliant / total) * 100 : 0,
      byStandard: this.groupByStandard(acc.features || []),
      byType: this.groupByType(acc.features || []),
    };
  }

  private groupByStandard(features: any[]): any {
    const result: any = {};
    for (const feature of features) {
      for (const standard of feature.standards || []) {
        if (!result[standard]) result[standard] = { total: 0, compliant: 0 };
        result[standard].total++;
        if (feature.condition === 'compliant' || feature.condition === 'good') {
          result[standard].compliant++;
        }
      }
    }
    return result;
  }

  private groupByType(features: any[]): any {
    const result: any = {};
    for (const feature of features) {
      if (!result[feature.type]) result[feature.type] = { total: 0, compliant: 0 };
      result[feature.type].total++;
      if (feature.condition === 'compliant' || feature.condition === 'good') {
        result[feature.type].compliant++;
      }
    }
    return result;
  }

  async getComplianceScore(venueId: string): Promise<number> {
    const acc = await this.accessibilityModel.findOne({ venueId: new Types.ObjectId(venueId) }).exec();
    if (!acc || !acc.features?.length) return 0;
    const compliant = acc.features.filter(f => f.condition === 'compliant' || f.condition === 'good').length;
    return (compliant / acc.features.length) * 100;
  }
}