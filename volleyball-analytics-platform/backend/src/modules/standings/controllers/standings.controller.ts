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
import { StandingsService } from '../services/standings.service';
import { StandingsValidator } from '../validators/standings.validator';
import {
  CreateStandingsDTO,
  UpdateStandingsDTO,
  StandingsSearchDTO,
  StandingEntryDTO,
  StandingsResponseDTO,
  StandingsSummaryDTO,
} from '../dto/standings.dto';

@ApiTags('Standings')
@Controller('api/v1/standings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StandingsController {
  constructor(
    private readonly standingsService: StandingsService,
    private readonly standingsValidator: StandingsValidator,
  ) {}

  @Post()
  @Permissions('standings:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create standings' })
  @ApiResponse({ status: 201, description: 'Standings created successfully', type: StandingsResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Standings already exist' })
  async create(@Body() dto: CreateStandingsDTO): Promise<StandingsResponseDTO> {
    await this.standingsValidator.validateCreate(dto);
    return this.standingsService.create(dto);
  }

  @Get()
  @Permissions('standings:read')
  @ApiOperation({ summary: 'List standings with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Standings retrieved successfully', type: [StandingsSummaryDTO] })
  async findAll(@Query() searchDto: StandingsSearchDTO) {
    return this.standingsService.search(searchDto);
  }

  @Get(':id')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get standings by ID' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Standings found', type: StandingsResponseDTO })
  @ApiResponse({ status: 404, description: 'Standings not found' })
  async findById(@Param('id') id: string): Promise<StandingsResponseDTO> {
    return this.standingsService.findById(id);
  }

  @Get('competition/:competitionId')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get standings by competition' })
  @ApiParam({ name: 'competitionId', description: 'Competition ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['overall', 'home', 'away', 'group', 'phase'] })
  @ApiResponse({ status: 200, description: 'Standings retrieved successfully', type: [StandingsSummaryDTO] })
  async findByCompetition(
    @Param('competitionId') competitionId: string,
    @Query('type') type?: string,
  ) {
    return this.standingsService.findByCompetition(competitionId, type as any);
  }

  @Get('phase/:phaseId')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get standings by phase' })
  @ApiParam({ name: 'phaseId', description: 'Phase ID' })
  @ApiResponse({ status: 200, description: 'Standings retrieved successfully', type: [StandingsSummaryDTO] })
  async findByPhase(@Param('phaseId') phaseId: string) {
    return this.standingsService.findByPhase(phaseId);
  }

  @Get('group/:groupId')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get standings by group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Standings retrieved successfully', type: [StandingsSummaryDTO] })
  async findByGroup(@Param('groupId') groupId: string) {
    return this.standingsService.findByGroup(groupId);
  }

  @Put(':id')
  @Permissions('standings:update')
  @ApiOperation({ summary: 'Update standings' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Standings updated successfully', type: StandingsResponseDTO })
  @ApiResponse({ status: 404, description: 'Standings not found' })
  @ApiResponse({ status: 409, description: 'Standings are finalized' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStandingsDTO,
  ): Promise<StandingsResponseDTO> {
    await this.standingsValidator.validateUpdate(id, dto);
    return this.standingsService.update(id, dto);
  }

  @Patch(':id/entries')
  @Permissions('standings:update')
  @ApiOperation({ summary: 'Update standings entries' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Entries updated successfully', type: StandingsResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid entries or standings finalized' })
  async updateEntries(
    @Param('id') id: string,
    @Body() dto: { entries: any[]; updatedBy: string },
  ) {
    await this.standingsValidator.validateUpdate(id, dto);
    return this.standingsService.updateEntries(id, dto.entries, dto.updatedBy);
  }

  @Patch(':id/tiebreak-rules')
  @Permissions('standings:update')
  @ApiOperation({ summary: 'Update tiebreak rules' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Tiebreak rules updated successfully' })
  async updateTiebreakRules(
    @Param('id') id: string,
    @Body() dto: { tiebreakRules: any[] },
  ) {
    await this.standingsValidator.validateUpdate(id, { tiebreakRules: dto.tiebreakRules });
    return this.standingsService.updateTiebreakRules(id, dto.tiebreakRules);
  }

  @Post(':id/finalize')
  @Permissions('standings:finalize')
  @ApiOperation({ summary: 'Finalize standings' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Standings finalized successfully' })
  @ApiResponse({ status: 409, description: 'Already finalized' })
  async finalize(@Param('id') id: string, @Body() dto: { finalizedBy: string }) {
    await this.standingsValidator.validateFinalize(id);
    return this.standingsService.finalizeStandings(id, dto.finalizedBy);
  }

  @Get(':id/qualified-teams')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get qualified teams from standings' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiQuery({ name: 'count', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Qualified teams retrieved successfully' })
  async getQualifiedTeams(@Param('id') id: string, @Query('count') count?: number) {
    return this.standingsService.getQualifiedTeams(id, count || 4);
  }

  @Get(':id/eliminated-teams')
  @Permissions('standings:read')
  @ApiOperation({ summary: 'Get eliminated teams from standings' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Eliminated teams retrieved successfully' })
  async getEliminatedTeams(@Param('id') id: string) {
    return this.standingsService.getEliminatedTeams(id);
  }

  @Post(':id/recalculate')
  @Permissions('standings:update')
  @ApiOperation({ summary: 'Recalculate standings based on match results' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 200, description: 'Standings recalculated successfully' })
  async recalculate(@Param('id') id: string) {
    return this.standingsService.recalculateStandings(id);
  }

  @Delete(':id')
  @Permissions('standings:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete standings (soft delete)' })
  @ApiParam({ name: 'id', description: 'Standings ID' })
  @ApiResponse({ status: 204, description: 'Standings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Standings not found' })
  @ApiResponse({ status: 409, description: 'Standings are finalized' })
  async delete(@Param('id') id: string): Promise<void> {
    const standings = await this.standingsService.findById(id);
    if (standings.isFinal) {
      throw new ConflictException('Cannot delete finalized standings');
    }
    await this.standingsService.delete(id);
  }
}