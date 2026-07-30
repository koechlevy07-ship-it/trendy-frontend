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
import { FixtureService } from '../services/fixture.service';
import { FixtureValidator } from '../validators/fixture.validator';
import {
  CreateFixtureDTO,
  UpdateFixtureDTO,
  FixtureSearchDTO,
  FixtureResponseDTO,
  FixtureSummaryDTO,
  FixtureStatusUpdateDTO,
} from '../dto/fixture.dto';

@ApiTags('Fixtures')
@Controller('api/v1/fixtures')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FixtureController {
  constructor(
    private readonly fixtureService: FixtureService,
    private readonly fixtureValidator: FixtureValidator,
  ) {}

  @Post()
  @Permissions('fixture:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new fixture' })
  @ApiResponse({ status: 201, description: 'Fixture created successfully', type: FixtureResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Fixture already exists' })
  async create(@Body() dto: CreateFixtureDTO): Promise<FixtureResponseDTO> {
    await this.fixtureValidator.validateCreate(dto);
    return this.fixtureService.create(dto);
  }

  @Get()
  @Permissions('fixture:read')
  @ApiOperation({ summary: 'List fixtures with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Fixtures retrieved successfully' })
  async findAll(@Query() searchDto: FixtureSearchDTO) {
    return this.fixtureService.search(searchDto);
  }

  @Get('upcoming')
  @Permissions('fixture:read')
  @ApiOperation({ summary: 'Get upcoming fixtures' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Upcoming fixtures retrieved successfully' })
  async getUpcoming(@Query('days') days: number = 7) {
    return this.fixtureService.getUpcomingFixtures(days);
  }

  @Get('statistics/:competitionId')
  @Permissions('fixture:read')
  @ApiOperation({ summary: 'Get fixture statistics for a competition' })
  @ApiParam({ name: 'competitionId', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('competitionId') competitionId: string) {
    return this.fixtureService.getFixtureStatistics(competitionId);
  }

  @Get(':id')
  @Permissions('fixture:read')
  @ApiOperation({ summary: 'Get fixture by ID' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Fixture found', type: FixtureResponseDTO })
  @ApiResponse({ status: 404, description: 'Fixture not found' })
  async findById(@Param('id') id: string): Promise<FixtureResponseDTO> {
    return this.fixtureService.findById(id);
  }

  @Put(':id')
  @Permissions('fixture:update')
  @ApiOperation({ summary: 'Update fixture' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Fixture updated successfully', type: FixtureResponseDTO })
  @ApiResponse({ status: 404, description: 'Fixture not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFixtureDTO,
  ): Promise<FixtureResponseDTO> {
    await this.fixtureValidator.validateUpdate(id, dto);
    return this.fixtureService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions('fixture:update')
  @ApiOperation({ summary: 'Update fixture status' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: FixtureResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: FixtureStatusUpdateDTO,
  ): Promise<FixtureResponseDTO> {
    await this.fixtureValidator.validateStatusTransition(id, dto.status);
    return this.fixtureService.update(id, { status: dto.status });
  }

  @Patch(':id/assign-officials')
  @Permissions('fixture:assignOfficials')
  @ApiOperation({ summary: 'Assign officials to fixture' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Officials assigned successfully', type: FixtureResponseDTO })
  @ApiResponse({ status: 409, description: 'Official not available' })
  async assignOfficials(
    @Param('id') id: string,
    @Body() dto: { officialIds: string[] },
  ): Promise<FixtureResponseDTO> {
    return this.fixtureService.assignOfficials(id, dto.officialIds);
  }

  @Patch(':id/assign-venue')
  @Permissions('fixture:update')
  @ApiOperation({ summary: 'Assign venue to fixture' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Venue assigned successfully', type: FixtureResponseDTO })
  @ApiResponse({ status: 409, description: 'Venue not available' })
  async assignVenue(
    @Param('id') id: string,
    @Body() dto: { venueId: string },
  ): Promise<FixtureResponseDTO> {
    return this.fixtureService.assignVenue(id, dto.venueId);
  }

  @Delete(':id')
  @Permissions('fixture:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel/Archive fixture' })
  @ApiParam({ name: 'id', description: 'Fixture ID' })
  @ApiResponse({ status: 204, description: 'Fixture cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Fixture not found' })
  @ApiResponse({ status: 409, description: 'Fixture already cancelled or completed' })
  async cancel(@Param('id') id: string): Promise<FixtureResponseDTO> {
    return this.fixtureService.cancel(id);
  }

  @Post('generate/round-robin')
  @Permissions('fixture:create')
  @ApiOperation({ summary: 'Generate round-robin fixtures for competition' })
  @ApiResponse({ status: 201, description: 'Fixtures generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid competition or teams' })
  async generateRoundRobin(
    @Body() dto: {
      competitionId: string;
      seasonId: string;
      teams: any[];
      stageId?: string;
      groupId?: string;
    },
  ) {
    return this.fixtureService.generateRoundRobinFixtures(
      dto.competitionId,
      dto.seasonId,
      dto.teams,
      dto.stageId,
      dto.groupId,
    );
  }

  @Post('generate/knockout')
  @Permissions('fixture:create')
  @ApiOperation({ summary: 'Generate knockout fixtures for competition' })
  @ApiResponse({ status: 201, description: 'Fixtures generated successfully' })
  async generateKnockout(
    @Body() dto: {
      competitionId: string;
      seasonId: string;
      teams: any[];
      stageId?: string;
      startRound?: string;
    },
  ) {
    return this.fixtureService.generateKnockoutFixtures(
      dto.competitionId,
      dto.seasonId,
      dto.teams,
      dto.stageId,
      dto.startRound,
    );
  }

  @Post('regenerate/:competitionId')
  @Permissions('fixture:update')
  @ApiOperation({ summary: 'Regenerate all fixtures for competition' })
  @ApiParam({ name: 'competitionId', description: 'Competition ID' })
  @ApiResponse({ status: 200, description: 'Fixtures regenerated successfully' })
  async regenerateFixtures(@Param('competitionId') competitionId: string) {
    return this.fixtureService.regenerateFixtures(competitionId);
  }
}