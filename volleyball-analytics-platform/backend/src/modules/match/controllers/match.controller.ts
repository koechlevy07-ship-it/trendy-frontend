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
import { MatchService } from '../services/match.service';
import { MatchValidator } from '../validators/match.validator';
import {
  CreateMatchDTO,
  UpdateMatchDTO,
  MatchStatusUpdateDTO,
  MatchSearchDTO,
  MatchResponseDTO,
  MatchSummaryDTO,
  MatchEventDTO,
  SetResultDTO,
} from '../dto/match.dto';

@ApiTags('Matches')
@Controller('api/v1/matches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly matchValidator: MatchValidator,
  ) {}

  @Post()
  @Permissions('match:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new match' })
  @ApiResponse({ status: 201, description: 'Match created successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Match already exists for fixture' })
  async create(@Body() dto: CreateMatchDTO): Promise<MatchResponseDTO> {
    await this.matchValidator.validateCreateMatch(dto);
    return this.matchService.createMatch(dto);
  }

  @Get()
  @Permissions('match:read')
  @ApiOperation({ summary: 'List matches with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async findAll(@Query() searchDto: MatchSearchDTO) {
    return this.matchService.search(searchDto);
  }

  @Get('live')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get live matches' })
  @ApiResponse({ status: 200, description: 'Live matches retrieved successfully' })
  async getLiveMatches(): Promise<MatchSummaryDTO[]> {
    return this.matchService.getLiveMatches();
  }

  @Get('upcoming')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get upcoming matches' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Upcoming matches retrieved successfully' })
  async getUpcoming(@Query('limit') limit: number = 10): Promise<MatchSummaryDTO[]> {
    return this.matchService.getUpcomingMatches(limit);
  }

  @Get(':id')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match found', type: MatchResponseDTO })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async findById(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.findById(id);
  }

  @Put(':id')
  @Permissions('match:update')
  @ApiOperation({ summary: 'Update match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match updated successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMatchDTO,
  ): Promise<MatchResponseDTO> {
    await this.matchValidator.validateUpdateMatch(id, dto);
    return this.matchService.updateMatch(id, dto);
  }

  @Patch(':id/start')
  @Permissions('match:start')
  @ApiOperation({ summary: 'Start match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match started successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 400, description: 'Match not ready to start' })
  async start(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.startMatch(id);
  }

  @Patch(':id/pause')
  @Permissions('match:pause')
  @ApiOperation({ summary: 'Pause match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match paused successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 400, description: 'Match not in progress' })
  async pause(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.pauseMatch(id);
  }

  @Patch(':id/resume')
  @Permissions('match:resume')
  @ApiOperation({ summary: 'Resume paused match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match resumed successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 400, description: 'Match not paused' })
  async resume(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.resumeMatch(id);
  }

  @Patch(':id/finish')
  @Permissions('match:finish')
  @ApiOperation({ summary: 'Complete match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match completed successfully', type: MatchResponseDTO })
  @ApiResponse({ status: 400, description: 'Match not ready for completion' })
  async finish(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.completeMatch(id);
  }

  @Delete(':id')
  @Permissions('match:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 204, description: 'Match archived successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 409, description: 'Match already archived or live' })
  async archive(@Param('id') id: string): Promise<void> {
    await this.matchService.archiveMatch(id);
  }

  @Post(':id/restore')
  @Permissions('match:restore')
  @ApiOperation({ summary: 'Restore archived match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Match restored successfully' })
  @ApiResponse({ status: 400, description: 'Match not archived' })
  async restore(@Param('id') id: string): Promise<MatchResponseDTO> {
    return this.matchService.restoreMatch(id);
  }

  @Post(':id/lineup')
  @Permissions('match:lineup')
  @ApiOperation({ summary: 'Submit team lineup' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Lineup submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid lineup or match already started' })
  async submitLineup(
    @Param('id') id: string,
    @Body() dto: { teamId: string; setNumber: number; players: any[] },
  ) {
    return this.matchService.submitLineup(id, dto.teamId, dto.setNumber, dto.players);
  }

  @Post(':id/events')
  @Permissions('match:recordEvent')
  @ApiOperation({ summary: 'Record match event' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Event recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event or match not live' })
  async recordEvent(
    @Param('id') id: string,
    @Body() dto: MatchEventDTO,
  ) {
    return this.matchService.recordEvent(id, dto);
  }

  @Post(':id/events/bulk')
  @Permissions('match:recordEvent')
  @ApiOperation({ summary: 'Record multiple match events' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Events recorded successfully' })
  async recordBulkEvents(
    @Param('id') id: string,
    @Body() events: MatchEventDTO[],
  ) {
    return this.matchService.bulkRecordEvents(id, events);
  }

  @Patch(':id/set/:setNumber/complete')
  @Permissions('match:finish')
  @ApiOperation({ summary: 'Complete a set' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiParam({ name: 'setNumber', description: 'Set number' })
  @ApiResponse({ status: 200, description: 'Set completed successfully' })
  async completeSet(
    @Param('id') id: string,
    @Param('setNumber') setNumber: number,
    @Body() dto: { homeScore: number; awayScore: number },
  ) {
    return this.matchService.completeSet(id, setNumber, dto.homeScore, dto.awayScore);
  }

  @Get(':id/statistics')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get match statistics' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string) {
    return this.matchService.getMatchStatistics(id);
  }

  @Get(':id/health')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get match health/status' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealth(@Param('id') id: string) {
    return this.matchService.getMatchHealth(id);
  }

  // Lineup management
  @Post(':id/lineup')
  @Permissions('match:lineup')
  @ApiOperation({ summary: 'Submit team lineup' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Lineup submitted successfully' })
  async submitLineup(
    @Param('id') id: string,
    @Body() dto: { teamId: string; setNumber: number; players: any[] },
  ) {
    return this.matchService.submitLineup(id, dto.teamId, dto.setNumber, dto.players);
  }

  // Event recording
  @Post(':id/events')
  @Permissions('match:recordEvent')
  @ApiOperation({ summary: 'Record match event' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Event recorded successfully' })
  async recordEvent(
    @Param('id') id: string,
    @Body() dto: MatchEventDTO,
  ) {
    return this.matchService.recordEvent(id, dto);
  }

  @Post(':id/events/bulk')
  @Permissions('match:recordEvent')
  @ApiOperation({ summary: 'Record multiple match events' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 201, description: 'Events recorded successfully' })
  async bulkRecordEvents(
    @Param('id') id: string,
    @Body() events: MatchEventDTO[],
  ) {
    return this.matchService.bulkRecordEvents(id, events);
  }

  @Get(':id/events')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get match events' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEvents(@Param('id') id: string) {
    return this.matchService.getEvents(id);
  }

  @Get(':id/timeline')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get match timeline' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  async getTimeline(@Param('id') id: string) {
    return this.matchService.getTimeline(id);
  }

  @Get(':id/set/:setNumber')
  @Permissions('match:read')
  @ApiOperation({ summary: 'Get set result' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiParam({ name: 'setNumber', description: 'Set number' })
  @ApiResponse({ status: 200, description: 'Set result retrieved successfully' })
  async getSetResult(
    @Param('id') id: string,
    @Param('setNumber') setNumber: number,
  ) {
    return this.matchService.getSetResult(id, setNumber);
  }
}