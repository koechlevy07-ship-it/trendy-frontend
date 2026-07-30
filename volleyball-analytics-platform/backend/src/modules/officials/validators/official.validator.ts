import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Official, OfficialDocument, OfficialRole, OfficialLevel, OfficialStatus, AssignmentStatus } from '../schemas/official.schema';
import { CreateOfficialDTO, UpdateOfficialDTO, OfficialSearchDTO } from '../dto/official.dto';

@Injectable()
export class OfficialValidator {
  constructor(
    @InjectModel('Official') private readonly officialModel: Model<OfficialDocument>,
  ) {}

  async validateCreate(dto: any): Promise<void> {
    // Validate official ID uniqueness
    const existingById = await this.officialModel.findOne({ officialId: dto.officialId }).exec();
    if (existingById) {
      throw new ConflictException(`Official with ID '${dto.officialId}' already exists`);
    }

    // Check for duplicate email if provided
    if (dto.contact?.email) {
      const existingByEmail = await this.officialModel.findOne({ 'contact.email': dto.contact.email }).exec();
      if (existingByEmail) {
        throw new ConflictException(`Official with email '${dto.contact.email}' already exists`);
      }
    }

    // Validate required fields
    if (!dto.firstName || !dto.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    // Validate role
    if (!Object.values(OfficialRole).includes(dto.primaryRole)) {
      throw new BadRequestException(`Invalid primary role: ${dto.primaryRole}`);
    }

    // Validate level
    if (!Object.values(OfficialLevel).includes(dto.level)) {
      throw new BadRequestException(`Invalid level: ${dto.level}`);
    }

    // Validate status
    if (dto.status && !Object.values(OfficialStatus).includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    // Validate date of birth
    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      if (dob > new Date()) {
        throw new BadRequestException('Date of birth cannot be in the future');
      }
      const age = new Date().getFullYear() - new Date(dto.dateOfBirth).getFullYear();
      if (age < 16) {
        throw new BadRequestException('Official must be at least 16 years old');
      }
    }

    // Validate license expiry
    if (dto.licenseExpiryDate) {
      const expiry = new Date(dto.licenseExpiryDate);
      if (expiry < new Date()) {
        throw new BadRequestException('License expiry date cannot be in the past');
      }
    }

    // Validate certifications
    if (dto.certifications && dto.certifications.length > 0) {
      for (const cert of dto.certifications) {
        if (!cert.name || !cert.issuingBody || !cert.issuedDate) {
          throw new BadRequestException('Certification must have name, issuing body, and issued date');
        }
        if (cert.expiryDate && new Date(cert.expiryDate) < new Date()) {
          throw new BadRequestException(`Certification ${cert.name} has expired`);
        }
      }
    }
  }

  async validateUpdate(officialId: string, dto: any): Promise<void> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) {
      throw new NotFoundException(`Official with ID ${officialId} not found`);
    }

    // Check for duplicate official ID if being changed
    if (dto.officialId && dto.officialId !== official.officialId) {
      const existing = await this.officialModel.findOne({ officialId: dto.officialId }).exec();
      if (existing) {
        throw new ConflictException(`Official with ID ${dto.officialId} already exists`);
      }
    }

    // Check for duplicate email if being changed
    if (dto.contact?.email && dto.contact.email !== official.contact?.email) {
      const existing = await this.officialModel.findOne({ 'contact.email': dto.contact.email }).exec();
      if (existing) {
        throw new ConflictException(`Official with email '${dto.contact.email}' already exists`);
      }
    }

    // Validate role if being changed
    if (dto.primaryRole && !Object.values(OfficialRole).includes(dto.primaryRole)) {
      throw new BadRequestException(`Invalid primary role: ${dto.primaryRole}`);
    }

    // Validate level if being changed
    if (dto.level && !Object.values(OfficialLevel).includes(dto.level)) {
      throw new BadRequestException(`Invalid level: ${dto.level}`);
    }

    // Validate status if being changed
    if (dto.status && dto.status !== official.status) {
      this.validateStatusTransition(official.status, dto.status);
    }

    // Validate date of birth if being changed
    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      if (dob > new Date()) {
        throw new BadRequestException('Date of birth cannot be in the future');
      }
    }

    // Validate license expiry if being changed
    if (dto.licenseExpiryDate) {
      const expiry = new Date(dto.licenseExpiryDate);
      if (expiry < new Date()) {
        throw new BadRequestException('License expiry date cannot be in the past');
      }
    }

    // Validate certifications if being updated
    if (dto.certifications) {
      for (const cert of dto.certifications) {
        if (cert.expiryDate && new Date(cert.expiryDate) < new Date()) {
          throw new BadRequestException(`Certification ${cert.name} has expired`);
        }
      }
    }
  }

  async validateAssignment(officialId: string, matchId: string, role: string): Promise<void> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) {
      throw new NotFoundException(`Official with ID ${officialId} not found`);
    }

    if (official.status !== OfficialStatus.ACTIVE) {
      throw new BadRequestException('Official is not active');
    }

    // Check if official has the required role capability
    const canPerformRole = official.primaryRole === role || official.secondaryRoles?.includes(role);
    if (!canPerformRole) {
      throw new BadRequestException(`Official is not qualified for role: ${role}`);
    }

    // Check if official has required certification for the role
    const requiredCerts = this.getRequiredCertifications(role);
    for (const certName of requiredCerts) {
      const hasCert = official.certifications?.some(
        c => c.name === certName && (!c.expiryDate || new Date(c.expiryDate) > new Date())
      );
      if (!hasCert) {
        throw new BadRequestException(`Official lacks required certification: ${certName}`);
      }
    }

    // Check license expiry
    if (official.licenseExpiryDate && new Date(official.licenseExpiryDate) < new Date()) {
      throw new BadRequestException('Official license has expired');
    }
  }

  async validateAvailability(officialId: string, date: Date): Promise<boolean> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) {
      throw new NotFoundException(`Official with ID ${officialId} not found`);
    }

    if (official.status !== OfficialStatus.ACTIVE) {
      return false;
    }

    // Check availability records
    const availability = official.availability?.find(
      a => a.date.toDateString() === date.toDateString()
    );

    if (availability) {
      return availability.available;
    }

    // If no availability specified, check for conflicting assignments
    const assignments = official.assignments?.filter(
      a => new Date(a.date).toDateString() === date.toDateString() &&
           a.assignmentStatus === AssignmentStatus.CONFIRMED
    ) || [];

    return assignments.length === 0;
  }

  async validateAvailabilityRange(officialId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const official = await this.officialModel.findById(officialId).exec();
    if (!official) {
      throw new NotFoundException(`Official with ID ${officialId} not found`);
    }

    // Check availability records
    for (const avail of official.availability || []) {
      if (avail.date >= startDate && avail.date <= endDate && avail.available === false) {
        return false;
      }
    }

    // Check assignments
    const assignments = official.assignments?.filter(
      a => new Date(a.date) >= startDate && new Date(a.date) <= endDate &&
           a.assignmentStatus === AssignmentStatus.CONFIRMED
    ) || [];

    return assignments.length === 0;
  }

  private validateStatusTransition(from: OfficialStatus, to: OfficialStatus): void {
    const validTransitions: Record<OfficialStatus, OfficialStatus[]> = {
      [OfficialStatus.ACTIVE]: [OfficialStatus.INACTIVE, OfficialStatus.SUSPENDED, OfficialStatus.RETIRED],
      [OfficialStatus.INACTIVE]: [OfficialStatus.ACTIVE, OfficialStatus.RETIRED],
      [OfficialStatus.SUSPENDED]: [OfficialStatus.ACTIVE, OfficialStatus.RETIRED],
      [OfficialStatus.RETIRED]: [],
      [OfficialStatus.TRAINEE]: [OfficialStatus.ACTIVE, OfficialStatus.INACTIVE],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
  }

  private getRequiredCertifications(role: string): string[] {
    const certMap: Record<string, string[]> = {
      [OfficialRole.FIRST_REFEREE]: ['FIVB Referee License', 'National Referee License'],
      [OfficialRole.SECOND_REFEREE]: ['National Referee License'],
      [OfficialRole.CHALLENGE_REFEREE]: ['FIVB Referee License', 'Challenge System Certification'],
      [OfficialRole.SCORER]: ['Official Scorer Certification'],
      [OfficialRole.ASSISTANT_SCORER]: ['Assistant Scorer Certification'],
      [OfficialRole.LINE_JUDGE]: ['Line Judge Certification'],
      [OfficialRole.COURT_MANAGER]: ['Court Management Certification'],
      [OfficialRole.TECHNICAL_OFFICIAL]: ['Technical Official Certification'],
      [OfficialRole.MEDICAL_OFFICER]: ['Medical Officer Certification'],
      [OfficialRole.SUPERVISOR]: ['Supervisor Certification'],
    };
    return certMap[role] || [];
  }
}