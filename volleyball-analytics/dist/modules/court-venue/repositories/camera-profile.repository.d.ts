import { Model } from 'mongoose';
import { MongoRepository } from './base.repository';
import { ICameraProfile, CameraProfileType } from '../schemas/camera-profile.schema';
export declare class CameraProfileRepository extends MongoRepository<ICameraProfile> {
    constructor(model: Model<ICameraProfile>);
    findByProfileCode(profileCode: string): Promise<ICameraProfile | null>;
    findByType(profileType: CameraProfileType, pagination?: {
        page: number;
        limit: number;
    }): Promise<ICameraProfile[]>;
    findByManufacturer(manufacturer: string, model: string): Promise<ICameraProfile[]>;
    findDefault(): Promise<ICameraProfile | null>;
    findByInferenceDevice(device: 'cpu' | 'gpu' | 'tpu' | 'npu'): Promise<ICameraProfile[]>;
    findByModel(modelName: string): Promise<ICameraProfile[]>;
    setAsDefault(id: string): Promise<ICameraProfile | null>;
    activate(id: string): Promise<ICameraProfile | null>;
    deactivate(id: string): Promise<ICameraProfile | null>;
    updateAICConfiguration(id: string, config: Partial<ICameraProfile['aiConfiguration']>): Promise<ICameraProfile | null>;
    updateDefaultSettings(id: string, settings: Partial<ICameraProfile['defaultSettings']>): Promise<ICameraProfile | null>;
    incrementVersion(id: string): Promise<ICameraProfile | null>;
    getProfileStats(): Promise<{
        total: number;
        byType: Record<string, number>;
        active: number;
        inactive: number;
        withAI: number;
        byInferenceDevice: Record<string, number>;
    }>;
}
//# sourceMappingURL=camera-profile.repository.d.ts.map