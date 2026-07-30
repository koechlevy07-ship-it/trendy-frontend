import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CourtLighting, CourtLightingDocument } from '../schemas/court-lighting.schema';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

export interface LightingSearchFilters {
  query?: string;
  courtId?: string;
  venueId?: string;
  status?: string;
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

@Injectable()
export class CourtLightingRepository {
  constructor(
    @InjectModel('CourtLighting') private readonly lightingModel: Model<any>,
  ) {}

  async create(lighting: Partial<any>): Promise<any> {
    const doc = new this.lightingModel({
      ...lighting,
      _id: new Types.ObjectId(),
      lightingId: `lit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc.save();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.lightingModel.findById(id).exec();
  }

  async findByLightingId(lightingId: string) {
    return this.lightingModel.findOne({ lightingId }).exec();
  }

  async update(id: string, update: Partial<any>) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.lightingModel
      .findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async softDelete(id: string, deletedBy: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.lightingModel.findByIdAndUpdate(id, {
      'archive.isArchived': true,
      'archive.archivedAt': new Date(),
      'archive.archivedBy': new Types.ObjectId(deletedBy),
      updatedAt: new Date(),
    }).exec();
    return !!result;
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.lightingModel.findByIdAndUpdate(id, {
      'archive.isArchived': false,
      'archive.archivedAt': null,
      'archive.archivedBy': null,
      updatedAt: new Date(),
    }, { new: true }).exec();
  }

  async search(filters: any) {
    const filter: any = {};

    if (filters.query) {
      filter.$text = { $search: filters.query };
    }
    if (filters.courtId) filter.courtId = new Types.ObjectId(filters.courtId);
    if (filters.venueId) filter.venueId = new Types.ObjectId(filters.venueId);
    if (filters.status) filter['fixtures.status'] = filters.status;

    const page = filters.page || 1;
    const perPage = filters.perPage || 20;
    const skip = (filters.page - 1) * filters.perPage;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.lightingModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(perPage)
        .exec(),
      this.lightingModel.countDocuments(filter).exec(),
    );

    return {
      data,
      total,
      page: filters.page || 1,
      perPage: filters.perPage || 20,
      totalPages: Math.ceil(total / (filters.perPage || 20)),
    };
  }

  async findByCourt(courtId: string) {
    return this.lightingModel.find({ courtId: new Types.ObjectId(courtId) }).exec();
  }

  async findByVenue(venueId: string) {
    return this.lightingModel.find({ venueId: new Types.ObjectId(venueId) }).exec();
  }

  async findByZone(zoneType: string, courtId?: string) {
    const filter: any = { 'zones.zoneType': zoneType };
    if (courtId) filter.courtId = new Types.ObjectId(courtId);
    return this.lightingModel.find(filter).exec();
  }

  async findByFixture(fixtureId: string) {
    return this.lightingModel.find({ 'fixtures.fixtureId': fixtureId }).exec();
  }

  async getLightingStatistics(venueId?: string, courtId?: string): Promise<any> {
    const filter: any = {};
    if (venueId) filter.venueId = new Types.ObjectId(venueId);
    if (courtId) filter.courtId = new Types.ObjectId(courtId);

    const lightings = await this.lightingModel.find(venueId ? { venueId: new Types.ObjectId(venueId) } : {}).exec();

    const stats = {
      totalFixtures: 0,
      activeFixtures: 0,
      inactiveFixtures: 0,
      byType: {},
      byZone: {},
      totalPowerConsumption: 0,
      byControlType: {},
      scenes: 0,
      activeScenes: 0,
    };

    for (const lighting of await this.lightingModel.find(venueId ? { venueId: new Types.ObjectId(venueId) } : {}).exec()) {
      stats.totalFixtures += lighting.fixtures?.length || 0;
      stats.activeFixtures += lighting.fixtures?.filter(f => f.status === 'active').length || 0;
      stats.inactiveFixtures += lighting.fixtures?.filter(f => f.status === 'inactive').length || 0;
      stats.totalPowerConsumption += lighting.fixtures?.reduce((sum, f) => sum + (f.wattage || 0), 0) || 0;
      stats.scenes += lighting.scenes?.length || 0;
      stats.activeScenes += lighting.scenes?.filter(s => s.isDefault).length || 0;

      for (const fixture of lighting.fixtures || []) {
        stats.byType[fixture.type] = (stats.byType[fixture.type] || 0) + 1;
        stats.byControlType[fixture.controlType] = (stats.byControlType[fixture.controlType] || 0) + 1;
      }

      for (const zone of lighting.zones || []) {
        stats.byZone[zone.zoneType] = (stats.byZone[zone.zoneType] || 0) + 1;
      }
    }

    return stats;
  }

  async findByFixture(fixtureId: string) {
    return this.lightingModel.findOne({ 'fixtures.fixtureId': fixtureId }).exec();
  }

  async findByZone(zoneId: string) {
    return this.lightingModel.findOne({ 'zones.zoneId': zoneId }).exec();
  }

  async findByScene(sceneId: string) {
    return this.lightingModel.findOne({ 'scenes.sceneId': sceneId }).exec();
  }

  async findByZoneType(zoneType: string) {
    return this.lightingModel.find({ 'zones.zoneType': zoneType }).exec();
  }

  async updateFixture(lightingId: string, fixtureId: string, update: any): Promise<any | null> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    const fixture = lighting.fixtures.id(fixtureId);
    if (!fixture) return null;

    Object.assign(fixture, update);
    lighting.updatedAt = new Date();
    return lighting.save();
  }

  async addFixture(lightingId: string, fixture: any): Promise<any> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    lighting.fixtures.push({ ...fixture, _id: new Types.ObjectId() });
    lighting.updatedAt = new Date();
    return lighting.save();
  }

  async removeFixture(lightingId: string, fixtureId: string): Promise<boolean> {
    const result = await this.lightingModel.updateOne(
      { _id: new Types.ObjectId(lightingId) },
      { $pull: { fixtures: { fixtureId } }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async addZone(lightingId: string, zone: any): Promise<any> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    lighting.zones.push({ ...zone, _id: new Types.ObjectId() });
    lighting.updatedAt = new Date();
    return lighting.save();
  }

  async removeZone(lightingId: string, zoneId: string): Promise<boolean> {
    const result = await this.lightingModel.updateOne(
      { _id: new Types.ObjectId(lightingId) },
      { $pull: { zones: { zoneId } }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async addScene(lightingId: string, scene: any): Promise<any> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    lighting.scenes.push({ ...scene, _id: new Types.ObjectId() });
    lighting.updatedAt = new Date();
    return lighting.save();
  }

  async updateScene(lightingId: string, sceneId: string, update: any): Promise<boolean> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return false;

    const scene = lighting.scenes.id(sceneId);
    if (!scene) return false;

    Object.assign(scene, update);
    lighting.updatedAt = new Date();
    await lighting.save();
    return true;
  }

  async removeScene(lightingId: string, sceneId: string): Promise<boolean> {
    const result = await this.lightingModel.updateOne(
      { _id: new Types.ObjectId(lightingId) },
      { $pull: { scenes: { sceneId } }, $set: { updatedAt: new Date() } },
    ).exec();
    return true;
  }

  async activateScene(lightingId: string, sceneId: string): Promise<any> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    const scene = lighting.scenes.id(sceneId);
    if (!scene) return null;

    // Apply scene settings to zones and fixtures
    // This would typically involve setting zone intensities, colors, etc.
    lighting.updatedAt = new Date();
    return lighting.save();
  }

  async getActiveScene(lightingId: string) {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return null;

    return lighting.scenes.find(s => s.isDefault) || lighting.scenes[0] || null;
  }

  async setFixtureIntensity(lightingId: string, fixtureId: string, intensity: number): Promise<boolean> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return false;

    const fixture = lighting.fixtures.id(fixtureId);
    if (!fixture) return false;

    fixture.intensity = Math.max(0, Math.min(100, intensity));
    lighting.updatedAt = new Date();
    await lighting.save();
    return true;
  }

  async setZoneMode(lightingId: string, zoneId: string, mode: string): Promise<boolean> {
    const lighting = await this.lightingModel.findById(lightingId);
    if (!lighting) return false;

    const zone = lighting.zones.id(zoneId);
    if (!zone) return false;

    zone.defaultMode = mode;
    lighting.updatedAt = new Date();
    await lighting.save();
    return true;
  }
}