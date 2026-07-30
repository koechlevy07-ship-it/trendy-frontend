import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchStatistics, MatchStatisticsDocument, StatisticsStatus } from '../schemas/match-statistics.schema';
import { Match, MatchDocument } from '../schemas/match.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel('MatchStatistics') private readonly statsModel: Model<MatchStatisticsDocument>,
  ) {}

  async finalizeStatistics(matchId: string): Promise<MatchStatisticsDocument> {
    const match = await this.matchModel.findById(matchId).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    let stats = await this.statsModel.findOne({ matchId: new Types.ObjectId(matchId) }).exec();
    
    if (!stats) {
      stats = new this.statsModel({
        _id: new Types.ObjectId(),
        statisticsId: `stats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchId: new Types.ObjectId(matchId),
        homeTeam: {
          teamId: match.homeTeam.teamId,
          teamName: match.homeTeam.teamName,
          teamCode: match.homeTeam.teamCode,
        },
        awayTeam: {
          teamId: match.awayTeam.teamId,
          teamName: match.awayTeam.teamName,
          teamCode: match.awayTeam.teamCode,
        },
        players: [],
        sets: [],
      });
    }

    // Calculate team statistics from sets
    await this.calculateTeamStatistics(stats, match);

    // Calculate player statistics from events
    await this.calculatePlayerStatistics(stats, match);

    // Calculate set statistics
    await this.calculateSetStatistics(stats, match);

    // Finalize
    stats.status = StatisticsStatus.FINALIZED;
    stats.audit.finalizedBy = 'system';
    stats.audit.finalizedAt = new Date();

    await stats.save();
    return stats;
  }

  private async calculateTeamStatistics(stats: MatchStatisticsDocument, match: MatchDocument): Promise<void> {
    // Aggregate from set results
    const homeSetsWon = match.sets.filter(s => s.winningTeamSide === 'home').length;
    const awaySetsWon = match.sets.filter(s => s.winningTeamSide === 'away').length;

    stats.homeTeam.setsWon = homeSetsWon;
    stats.homeTeam.setsLost = awaySetsWon;
    stats.awayTeam.setsWon = awaySetsWon;
    stats.awayTeam.setsLost = homeSetsWon;

    stats.homeTeam.setScores = match.sets.map(s => s.homeScore);
    stats.awayTeam.setScores = match.sets.map(s => s.awayScore);

    // Calculate from events
    const events = await this.eventModel.find({ matchId: match._id }).exec();
    
    // Home team stats
    const homeEvents = events.filter(e => e.teamId.toString() === match.homeTeam.teamId.toString());
    const awayEvents = events.filter(e => e.teamId.toString() === match.awayTeam.teamId.toString());

    stats.homeTeam = this.aggregateTeamStats(stats.homeTeam, homeEvents);
    stats.awayTeam = this.aggregateTeamStats(stats.awayTeam, awayEvents);
  }

  private aggregateTeamStats(teamStats: any, events: any[]): any {
    // This would aggregate from individual events
    // For now, return the existing stats
    return teamStats;
  }

  private async calculatePlayerStatistics(stats: MatchStatisticsDocument, match: MatchDocument): Promise<void> {
    const events = await this.eventModel.find({ matchId: match._id }).exec();
    
    // Get unique players from events
    const playerIds = [...new Set(events.map(e => e.playerId).filter(Boolean))];
    
    for (const playerId of playerIds) {
      const playerEvents = events.filter(e => e.playerId?.toString() === playerId.toString());
      const teamId = playerEvents[0]?.teamId;
      
      // Get player info from lineup
      const lineup = await this.lineupModel.findOne({
        matchId: match._id,
        teamId: teamId,
        'players.playerId': playerId,
      }).exec();

      const player = lineup?.players?.find(p => p.playerId.toString() === playerId.toString());
      
      if (player) {
        stats.players.push({
          playerId: playerId,
          teamId,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          isStarter: player.isStarting,
          isCaptain: player.isCaptain,
          isLibero: player.isLibero,
          ...this.calculatePlayerStatsFromEvents(playerEvents),
        });
      }
    }
  }

  private calculatePlayerStatsFromEvents(events: any[]): any {
    const stats = {
      totalPoints: 0,
      attacks: 0,
      attackPoints: 0,
      attackErrors: 0,
      attackBlocked: 0,
      blocks: 0,
      blockPoints: 0,
      blockErrors: 0,
      serves: 0,
      aces: 0,
      serveErrors: 0,
      receptions: 0,
      perfectReceptions: 0,
      receptionErrors: 0,
      digs: 0,
      excellentDigs: 0,
      sets: 0,
      perfectSets: 0,
      setErrors: 0,
    };

    for (const event of events) {
      switch (event.type) {
        case 'point':
        case 'kill':
        case 'ace':
        case 'block_point':
          stats.totalPoints++;
          break;
        case 'attack':
          stats.attacks++;
          break;
        case 'kill':
          stats.attackPoints++;
          break;
        case 'attack_error':
          stats.attackErrors++;
          break;
        case 'attack_blocked':
          stats.attackBlocked++;
          break;
        case 'block':
          stats.blocks++;
          break;
        case 'block_point':
          stats.blockPoints++;
          break;
        case 'block_error':
          stats.blockErrors++;
          break;
        case 'serve':
          stats.serves++;
          break;
        case 'ace':
          stats.aces++;
          break;
        case 'service_error':
          stats.serveErrors++;
          break;
        case 'reception':
          stats.receptions++;
          break;
        case 'perfect_reception':
          stats.perfectReceptions++;
          break;
        case 'reception_error':
          stats.receptionErrors++;
          break;
        case 'dig':
          stats.digs++;
          break;
        case 'excellent_dig':
          stats.excellentDigs++;
          break;
        case 'set':
          stats.sets++;
          break;
        case 'perfect_set':
          stats.perfectSets++;
          break;
        case 'set_error':
          stats.setErrors++;
          break;
      }
    }

    // Calculate efficiencies
    if (stats.attacks > 0) {
      stats.attackEfficiency = ((stats.attackPoints - stats.attackErrors - stats.attackBlocked) / stats.attacks * 100).toFixed(1);
    }
    if (stats.serves > 0) {
      stats.serveEfficiency = ((stats.aces - stats.serveErrors) / stats.serves * 100).toFixed(1);
    }
    if (stats.receptions > 0) {
      stats.receptionEfficiency = ((stats.perfectReceptions - stats.receptionErrors) / stats.receptions * 100).toFixed(1);
    }
    if (stats.digs > 0) {
      stats.digEfficiency = (stats.excellentDigs / stats.digs * 100).toFixed(1);
    }

    return stats;
  }

  private async calculateSetStatistics(stats: MatchStatisticsDocument, match: MatchDocument): Promise<void> {
    for (const set of match.sets) {
      if (set.status === 'completed') {
        const setEvents = await this.eventModel.find({
          matchId: match._id,
          setNumber: set.setNumber,
        }).exec();

        const homeSetEvents = setEvents.filter(e => e.teamId.toString() === match.homeTeam.teamId.toString());
        const awaySetEvents = setEvents.filter(e => e.teamId.toString() === match.awayTeam.teamId.toString());

        stats.sets.push({
          setNumber: set.setNumber,
          homeScore: set.homeScore,
          awayScore: set.awayScore,
          durationMinutes: set.durationMinutes,
          startTime: set.startTime,
          endTime: set.endTime,
          homeTeamStats: this.aggregateSetTeamStats(homeSetEvents),
          awayTeamStats: this.aggregateSetTeamStats(awaySetEvents),
        });
      }
    }
  }

  private aggregateSetTeamStats(events: any[]): any {
    return {
      attacks: events.filter(e => e.type === 'attack').length,
      blocks: events.filter(e => e.type === 'block').length,
      serves: events.filter(e => e.type === 'serve').length,
    };
  }
}