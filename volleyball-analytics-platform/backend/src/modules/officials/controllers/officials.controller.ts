import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { OfficialAssignmentService } from '../services/official-assignment.service';
import { OfficialValidator } from '../validators/official.validator';
import {
  CreateOfficialDTO,
  UpdateOfficialDTO,
  OfficialSearchDTO,
  OfficialResponseDTO,
  OfficialSummaryDTO,
  OfficialAssignmentDTO,
  OfficialAvailabilityDTO,
} from '../dto/official.dto';

@ApiTags('Officials')
@Controller('api/v1/officials')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OfficialController {
  constructor(
    private readonly officialAssignmentService: OfficialAssignmentService,
    private readonly officialValidator: OfficialValidator,
  ) {}

  @Post()
  @Permissions('official:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new official' })
  @ApiResponse({ status: 201, description: 'Official registered successfully', type: OfficialResponseDTO })
  async create(@Body() dto: CreateOfficialDTO): Promise<OfficialResponseDTO> {
    await this.officialValidator.validateCreate(dto);
    return this.officialAssignmentService.createOfficial(dto);
  }

  @Get()
  @Permissions('official:read')
  @ApiOperation({ summary: 'List officials with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Officials retrieved successfully', type: [OfficialSummaryDTO] })
  async findAll(@Query() searchDto: OfficialSearchDTO): Promise<OfficialSummaryDTO[]> {
    return this.officialAssignmentService.search(searchDto);
  }

  @Get('available')
  @Permissions('official:read')
  @ApiOperation({ summary: 'Get available officials for a date' })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'federation', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Available officials retrieved successfully' })
  async getAvailable(
    @Query('date') date: string,
    @Query('role') role?: string,
    @Query('federation') federation?: string,
  ) {
    return this.officialAssignmentService.getAvailableOfficials(new Date(date), role, federation);
  }

  @Get(':id')
  @Permissions('official:read')
  @ApiOperation({ summary: 'Get official by ID' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official found', type: OfficialResponseDTO })
  @ApiResponse({ status: 404, description: 'Official not found' })
  async findById(@Param('id') id: string): Promise<OfficialResponseDTO> {
    return this.officialAssignmentService.findById(id);
  }

  @Put(':id')
  @Permissions('official:update')
  @ApiOperation({ summary: 'Update official' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official updated successfully', type: OfficialResponseDTO })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOfficialDTO,
  ): Promise<OfficialResponseDTO> {
    await this.officialValidator.validateUpdate(id, dto);
    return this.officialAssignmentService.updateOfficial(id, dto);
  }

  @Patch(':id/activate')
  @Permissions('official:update')
  @ApiOperation({ summary: 'Activate official' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official activated successfully' })
  async activate(@Param('id') id: string): Promise<OfficialResponseDTO> {
    return this.officialAssignmentService.updateStatus(id, 'active');
  }

  @Patch(':id/suspend')
  @Permissions('official:update')
  @ApiOperation({ summary: 'Suspend official' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official suspended successfully' })
  async suspend(@Param('id') id: string): Promise<OfficialResponseDTO> {
    return this.officialAssignmentService.updateStatus(id, 'suspended');
  }

  @Patch(':id/retire')
  @Permissions('official:update')
  @ApiOperation({ summary: 'Retire official' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official retired successfully' })
  async retire(@Param('id') id: string): Promise<OfficialResponseDTO> {
    return this.officialAssignmentService.updateStatus(id, 'retired');
  }

  @Delete(':id')
  @Permissions('official:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive official (soft delete)' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 204, description: 'Official archived successfully' })
  async archive(@Param('id') id: string): Promise<void> {
    await this.officialAssignmentService.archive(id);
  }

  @Post(':id/restore')
  @Permissions('official:update')
  @ApiOperation({ summary: 'Restore archived official' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Official restored successfully' })
  async restore(@Param('id') id: string): Promise<OfficialResponseDTO> {
    return this.officialAssignmentService.restore(id);
  }

  // Assignments
  @Post(':id/assignments')
  @Permissions('official:assign')
  @ApiOperation({ summary: 'Assign official to match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Official assigned successfully' })
  async assignToMatch(
    @Param('id') matchId: string,
    @Body() dto: { officialId: string; role: string; assignedBy: string },
  ) {
    return this.officialAssignmentService.assignOfficial(matchId, dto);
  }

  @Patch('assignments/:assignmentId/confirm')
  @Permissions('official:assign')
  @ApiOperation({ summary: 'Confirm official assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment confirmed successfully' })
  async confirmAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: { confirmedBy: string },
  ) {
    return this.officialAssignmentService.confirmAssignment(assignmentId, dto.confirmedBy);
  }

  @Patch('assignments/:assignmentId/replace')
  @Permissions('official:assign')
  @ApiOperation({ summary: 'Replace official in assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Official replaced successfully' })
  async replaceOfficial(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: { newOfficialId: string; replacedBy: string; reason?: string },
  ) {
    return this.officialAssignmentService.replaceOfficial(assignmentId, dto.newOfficialId, dto.replacedBy, dto.reason);
  }

  @Get(':id/assignments')
  @Permissions('official:read')
  @ApiOperation({ summary: 'Get official assignments' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async getAssignments(@Param('id') id: string) {
    return this.officialAssignmentService.getAssignmentsByOfficial(id);
  }

  @Get(':id/availability')
  @Permissions('official:read')
  @ApiOperation({ summary: 'Check official availability' })
  @ApiParam({ name: 'id', description: 'Official ID' })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(@Param('id') id: string, @Query('date') date: string) {
    return { available: await this.officialAssignmentService.checkAvailability(id, new Date(date)) };
  }
}