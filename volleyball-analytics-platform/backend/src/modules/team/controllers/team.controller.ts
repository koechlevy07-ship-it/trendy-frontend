/**
 * Team Controller - Chapter 11 Part 3
 * 
 * REST API controller for team operations exposing all team endpoints
 * according to Chapter 11 Part 3 specification.
 */

import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { CreateTeamDTO, UpdateTeamDTO, TeamSearchQuery } from '../dto/team.dto';
import { TeamService } from '../services/team.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { Permissions } from '../../shared/types/permissions';
import { RequestWithUser } from '../../shared/types/request';

@ApiTags('teams')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // ============================================================================
  // TEAM REGISTRATION SERVICE RESPONSIBILITIES
  // ============================================================================

  @Post()
  @ApiOperation({ summary: 'Register team', description: 'Create a new team' })
  @ApiBody({ type: CreateTeamDTO })
  @ApiResponse({ status: 201, description: 'Team registered successfully' })
  async create(
    @Body() createDto: CreateTeamDTO,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.registerTeam(createDto, req.user.tenantId, req.user.id);
  }

  // ============================================================================
  // TEAM QUERY SERVICE RESPONSIBILITIES
  // ============================================================================

  @Get()
  @ApiOperation({ summary: 'List teams', description: 'Get all teams with pagination' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.teamService.getAllTeams(tenantId, page, perPage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID', description: 'Retrieve a specific team' })
  @ApiResponse({ status: 200, description: 'Team retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    return this.teamService.findOneOrFail(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search teams', description: 'Search teams with filters' })
  @ApiResponse({ status: 200, description: 'Teams found' })
  async search(@Query() searchQuery: TeamSearchQuery) {
    return this.teamService.searchTeams(searchQuery);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get team roster', description: 'Retrieve team roster' })
  @ApiResponse({ status: 200, description: 'Roster retrieved successfully' })
  async getRoster(@Param('id') teamId: string) {
    return this.teamService.getTeamRoster(teamId);
  }

  // ============================================================================
  // TEAM OPERATIONS SERVICE RESPONSIBILITIES
  // ============================================================================

  @Put(':id')
  @ApiOperation({ summary: 'Update team', description: 'Update team information' })
  @ApiBody({ type: UpdateTeamDTO })
  @ApiResponse({ status: 200, description: 'Team updated successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTeamDTO,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.updateTeam(id, updateDto, req.user.id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate team', description: 'Activate a team' })
  @ApiResponse({ status: 200, description: 'Team activated successfully' })
  async activate(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.activateTeam(id, req.user.id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend team', description: 'Suspend a team' })
  @ApiResponse({ status: 200, description: 'Team suspended successfully' })
  async suspend(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.suspendTeam(id, req.user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive team', description: 'Archive a team' })
  @ApiResponse({ status: 200, description: 'Team archived successfully' })
  async archive(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.archiveTeam(id, req.user.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore team', description: 'Restore an archived team' })
  @ApiResponse({ status: 200, description: 'Team restored successfully' })
  async restore(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.restoreTeam(id, req.user.id);
  }

  // ============================================================================
  // TEAM SPECIFIC OPERATIONS
  // ============================================================================

  @Post(':id/players')
  @ApiOperation({ summary: 'Add player to roster', description: 'Add a player to team roster' })
  @ApiResponse({ status: 200, description: 'Player added successfully' })
  async addPlayer(
    @Param('id') id: string,
    @Body() playerData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.addPlayerToRoster(id, playerData, req.user.id);
  }

  @Put(':id/players/:playerId')
  @ApiOperation({ summary: 'Remove player from roster', description: 'Remove a player from team roster' })
  @ApiResponse({ status: 200, description: 'Player removed successfully' })
  async removePlayer(
    @Param('id') id: string,
    @Param('playerId') playerId: string,
  ) {
    return this.teamService.removePlayerFromRoster(id, playerId);
  }

  @Post(':id/coaches')
  @ApiOperation({ summary: 'Add coaching staff', description: 'Add coaching staff to team' })
  @ApiResponse({ status: 200, description: 'Coaching staff added successfully' })
  async addCoachingStaff(
    @Param('id') id: string,
    @Body() staffData: any,
  ) {
    return this.teamService.addCoachingStaff(id, staffData);
  }

  @Post(':id/season-records')
  @ApiOperation({ summary: 'Add season record', description: 'Add season record to team' })
  @ApiResponse({ status: 200, description: 'Season record added successfully' })
  async addSeasonRecord(
    @Param('id') id: string,
    @Body() seasonData: any,
  ) {
    return this.teamService.addSeasonRecord(id, seasonData);
  }

  @Patch(':id/branding')
  @ApiOperation({ summary: 'Update branding', description: 'Update team branding' })
  @ApiResponse({ status: 200, description: 'Team branding updated successfully' })
  async updateBranding(
    @Param('id') id: string,
    @Body() brandingData: any,
  ) {
    return this.teamService.updateBranding(id, brandingData);
  }

  @Patch(':id/ai-metadata')
  @ApiOperation({ summary: 'Update AI metadata', description: 'Update team AI metadata' })
  @ApiResponse({ status: 200, description: 'AI metadata updated successfully' })
  async updateAIMetadata(
    @Param('id') id: string,
    @Body() aiMetadataData: any,
  ) {
    return this.teamService.updateAIMetadata(id, aiMetadataData);
  }

  // ============================================================================
  // TEAM SPECIFIC QUERIES
  // ============================================================================

  @Get(':id/jersey-number/:number')
  @ApiOperation({ summary: 'Get player by jersey number', description: 'Retrieve player by jersey number' })
  @ApiResponse({ status: 200, description: 'Player found' })
  async getPlayerByJerseyNumber(
    @Param('id') teamId: string,
    @Param('number') jerseyNumber: number,
  ) {
    return this.teamService.getPlayerByJerseyNumber(teamId, jerseyNumber);
  }

  @Get(':id/position/:position')
  @ApiOperation({ summary: 'Get players by position', description: 'Retrieve players by position' })
  @ApiResponse({ status: 200, description: 'Players found' })
  async getPlayersByPosition(
    @Param('id') teamId: string,
    @Param('position') position: string,
  ) {
    return this.teamService.getPlayersByPosition(teamId, position);
  }

  @Get(':id/starters')
  @ApiOperation({ summary: 'Get starting lineup', description: 'Retrieve starting players (excluding libero)' })
  @ApiResponse({ status: 200, description: 'Starting lineup retrieved' })
  async getStarters(@Param('id') teamId: string) {
    return this.teamService.getStarters(teamId);
  }

  @Get(':id/email/:email')
  @ApiOperation({ summary: 'Get player by email', description: 'Retrieve player by email' })
  @ApiResponse({ status: 200, description: 'Player found' })
  async getPlayerByEmail(
    @Param('id') teamId: string,
    @Param('email') email: string,
  ) {
    return this.teamService.getPlayerByEmail(teamId, email);
  }

  // ============================================================================
  // TEAM STATISTICS AND OPERATIONS
  // ============================================================================

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get team statistics', description: 'Get comprehensive team statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Param('id') id: string) {
    return this.teamService.getTeamStatistics(id);
  }

  @Get(':id/start-of-season/:seasonId')
  @ApiOperation({ summary: 'Initialize start of season', description: 'Set up team for a new season' })
  @ApiResponse({ status: 200, description: 'Season started successfully' })
  async startOfSeason(
    @Param('id') id: string,
    @Param('seasonId') seasonId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.initializeSeason(id, seasonId, req.user.id);
  }

  @Post(':id/archive-season/:seasonId')
  @ApiOperation({ summary: 'Archive season', description: 'Archive a completed season' })
  @ApiResponse({ status: 200, description: 'Season archived successfully' })
  async archiveSeason(
    @Param('id') id: string,
    @Param('seasonId') seasonId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.archiveSeason(id, seasonId, req.user.id);
  }

  @Post(':id/restore-season/:seasonId')
  @ApiOperation({ summary: 'Restore season', description: 'Restore an archived season' })
  @ApiResponse({ status: 200, description: 'Season restored successfully' })
  async restoreSeason(
    @Param('id') id: string,
    @Param('seasonId') seasonId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.restoreSeason(id, seasonId, req.user.id);
  }

  @Post(':id/close-season/:seasonId')
  @ApiOperation({ summary: 'Close season', description: 'Finalize a season' })
  @ApiResponse({ status: 200, description: 'Season closed successfully' })
  async closeSeason(
    @Param('id') id: string,
    @Param('seasonId') seasonId: string,
    @Body() closingData: any,
    @Request() req: RequestWithUser,
  ) {
    return this.teamService.closeSeason(id, seasonId, closingData, req.user.id);
  }
}