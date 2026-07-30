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
import { SeasonService } from '../services/season.service';
import { SeasonValidator } from '../validators/season.validator';
import {
  CreateSeasonDTO,
  UpdateSeasonDTO,
  SeasonSearchDTO,
  SeasonResponseDTO,
  SeasonSummaryDTO,
} from '../dto/season.dto';

@ApiTags('Seasons')
@Controller('api/v1/seasons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SeasonController {
  constructor(
    private readonly seasonService: SeasonService,
    private readonly seasonValidator: SeasonValidator,
  ) {}

  @Post()
  @Permissions('season:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new season' })
  @ApiResponse({ status: 201, description: 'Season created successfully', type: SeasonResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Season already exists' })
  async create(@Body() dto: CreateSeasonDTO): Promise<SeasonResponseDTO> {
    await this.seasonValidator.validateCreate(dto);
    return this.seasonService.create(dto);
  }

  @Get()
  @Permissions('season:read')
  @ApiOperation({ summary: 'List seasons with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Seasons retrieved successfully', type: [SeasonSummaryDTO] })
  async findAll(@Query() searchDto: SeasonSearchDTO) {
    return this.seasonService.search(searchDto);
  }

  @Get('active')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get active seasons' })
  @ApiResponse({ status: 200, description: 'Active seasons retrieved successfully', type: [SeasonSummaryDTO] })
  async getActive() {
    return this.seasonService.findActive();
  }

  @Get('upcoming')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get upcoming seasons' })
  @ApiResponse({ status: 200, description: 'Upcoming seasons retrieved successfully', type: [SeasonSummaryDTO] })
  async getUpcoming() {
    return this.seasonService.findUpcoming();
  }

  @Get('completed')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get completed seasons' })
  @ApiResponse({ status: 200, description: 'Completed seasons retrieved successfully', type: [SeasonSummaryDTO] })
  async getCompleted() {
    return this.seasonService.findCompleted();
  }

  @Get(':id')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get season by ID' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Season found', type: SeasonResponseDTO })
  @ApiResponse({ status: 404, description: 'Season not found' })
  async findById(@Param('id') id: string): Promise<SeasonResponseDTO> {
    return this.seasonService.findById(id);
  }

  @Get('code/:code')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get season by code' })
  @ApiParam({ name: 'code', description: 'Season code' })
  @ApiResponse({ status: 200, description: 'Season found', type: SeasonResponseDTO })
  @ApiResponse({ status: 404, description: 'Season not found' })
  async findByCode(@Param('code') code: string): Promise<SeasonResponseDTO> {
    return this.seasonService.findByCode(code);
  }

  @Get('year/:year')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get season by year' })
  @ApiParam({ name: 'year', description: 'Season year', type: Number })
  @ApiResponse({ status: 200, description: 'Season found', type: SeasonResponseDTO })
  @ApiResponse({ status: 404, description: 'Season not found' })
  async findByYear(@Param('year') year: number): Promise<SeasonResponseDTO> {
    return this.seasonService.findByYear(year);
  }

  @Put(':id')
  @Permissions('season:update')
  @ApiOperation({ summary: 'Update season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Season updated successfully', type: SeasonResponseDTO })
  @ApiResponse({ status: 404, description: 'Season not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSeasonDTO,
  ): Promise<SeasonResponseDTO> {
    await this.seasonValidator.validateUpdate(id, dto);
    return this.seasonService.update(id, dto);
  }

  @Patch(':id/activate')
  @Permissions('season:activate')
  @ApiOperation({ summary: 'Activate season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Season activated successfully', type: SeasonResponseDTO })
  @ApiResponse({ status: 400, description: 'Cannot activate season in current state' })
  async activate(@Param('id') id: string): Promise<SeasonResponseDTO> {
    await this.seasonValidator.validateStatusTransition(id, 'active');
    return this.seasonService.activate(id);
  }

  @Patch(':id/close')
  @Permissions('season:update')
  @ApiOperation({ summary: 'Close season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Season closed successfully', type: SeasonResponseDTO })
  @ApiResponse({ status: 400, description: 'Cannot close season in current state' })
  async close(@Param('id') id: string): Promise<SeasonResponseDTO> {
    return this.seasonService.close(id);
  }

  @Delete(':id')
  @Permissions('season:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive season (soft delete)' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 204, description: 'Season archived successfully' })
  @ApiResponse({ status: 404, description: 'Season not found' })
  @ApiResponse({ status: 409, description: 'Season already archived' })
  async archive(@Param('id') id: string): Promise<void> {
    await this.seasonService.archive(id);
  }

  @Post(':id/restore')
  @Permissions('season:update')
  @ApiOperation({ summary: 'Restore archived season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Season restored successfully', type: SeasonResponseDTO })
  @ApiResponse({ status: 400, description: 'Season not archived' })
  async restore(@Param('id') id: string): Promise<SeasonResponseDTO> {
    return this.seasonService.restore(id);
  }

  @Post(':id/competitions')
  @Permissions('season:manageCompetitions')
  @ApiOperation({ summary: 'Add competition to season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Competition added successfully' })
  async addCompetition(
    @Param('id') id: string,
    @Body() dto: { competitionId: string },
  ): Promise<any> {
    return this.seasonService.addCompetition(id, dto.competitionId);
  }

  @Delete(':id/competitions/:competitionId')
  @Permissions('season:manageCompetitions')
  @ApiOperation({ summary: 'Remove competition from season' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiParam({ name: 'competitionId', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Competition removed successfully' })
  async removeCompetition(
    @Param('id') id: string,
    @Param('competitionId') competitionId: string,
  ): Promise<any> {
    return this.seasonService.removeCompetition(id, competitionId);
  }

  @Get(':id/statistics')
  @Permissions('season:read')
  @ApiOperation({ summary: 'Get season statistics' })
  @ApiParam({ name: 'id', description: 'Season ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string) {
    return this.seasonService.getStatistics(id);
  }
}