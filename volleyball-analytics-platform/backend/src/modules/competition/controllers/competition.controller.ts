/**
 * Competition Controller - Chapter 12 Part 1
 * 
 * REST API endpoints for Competition management
 */

import { 
  Controller, Get, Post, Put, Delete, Patch, 
  Body, Param, Query, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { CompetitionService } from '../services/competition.service';
import { CompetitionValidator } from '../validators/competition.validator';
import { 
  CreateCompetitionDTO, UpdateCompetitionDTO, CompetitionSearchDTO,
  CompetitionResponseDTO, CompetitionSummaryDTO
} from '../dto/competition.dto';

@ApiTags('Competitions')
@Controller('api/v1/competitions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompetitionController {
  constructor(
    private readonly competitionService: CompetitionService,
    private readonly competitionValidator: CompetitionValidator,
  ) {}

  @Post()
  @Permissions('competition:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new competition' })
  @ApiResponse({ status: 201, description: 'Competition created successfully', type: CompetitionResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Competition already exists' })
  async create(@Body() dto: CreateCompetitionDTO): Promise<CompetitionResponseDTO> {
    await this.competitionValidator.validateCreate(dto);
    return this.competitionService.create(dto);
  }

  @Get()
  @Permissions('competition:read')
  @ApiOperation({ summary: 'List competitions with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Competitions retrieved successfully', type: [CompetitionSummaryDTO] })
  async findAll(@Query() search: CompetitionSearchDTO) {
    return this.competitionService.search(search);
  }

  @Get(':id')
  @Permissions('competition:read')
  @ApiOperation({ summary: 'Get competition by ID' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition found', type: CompetitionResponseDTO })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  async findById(@Param('id') id: string): Promise<CompetitionResponseDTO> {
    return this.competitionService.findById(id);
  }

  @Put(':id')
  @Permissions('competition:update')
  @ApiOperation({ summary: 'Update competition' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition updated successfully', type: CompetitionResponseDTO })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompetitionDTO,
  ): Promise<CompetitionResponseDTO> {
    await this.competitionValidator.validateUpdate(id, dto);
    return this.competitionService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('competition:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive competition (soft delete)' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 204, description: 'Competition archived successfully' })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  @ApiResponse({ status: 409, description: 'Competition already archived' })
  async archive(@Param('id') id: string): Promise<void> {
    return this.competitionService.archive(id);
  }

  @Patch(':id/restore')
  @Permissions('competition:restore')
  @ApiOperation({ summary: 'Restore archived competition' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition restored successfully', type: CompetitionResponseDTO })
  @ApiResponse({ status: 404, description: 'Competition not found' })
  async restore(@Param('id') id: string): Promise<CompetitionResponseDTO> {
    return this.competitionService.restore(id);
  }

  @Patch(':id/verify')
  @Permissions('competition:verify')
  @ApiOperation({ summary: 'Verify competition registration' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition verified successfully' })
  async verify(@Param('id') id: string): Promise<CompetitionResponseDTO> {
    return this.competitionService.verify(id);
  }

  @Patch(':id/approve')
  @Permissions('competition:approve')
  @ApiOperation({ summary: 'Approve competition registration' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition approved successfully' })
  async approve(@Param('id') id: string): Promise<CompetitionResponseDTO> {
    return this.competitionService.approve(id);
  }

  @Patch(':id/reject')
  @Permissions('competition:reject')
  @ApiOperation({ summary: 'Reject competition registration' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition rejected successfully' })
  async reject(@Param('id') id: string): Promise<CompetitionResponseDTO> {
    return this.competitionService.reject(id);
  }

  @Get(':id/hierarchy')
  @Permissions('competition:read')
  @ApiOperation({ summary: 'Get competition hierarchy tree' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Hierarchy tree retrieved successfully' })
  async getHierarchy(@Param('id') id: string) {
    return this.competitionService.getHierarchy(id);
  }

  @Get(':id/statistics')
  @Permissions('competition:read')
  @ApiOperation({ summary: 'Get competition statistics' })
  @ApiParam({ name: 'id', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string) {
    return this.competitionService.getStatistics(id);
  }
}