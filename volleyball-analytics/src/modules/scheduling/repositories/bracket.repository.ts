import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bracket, BracketDocument } from '../schemas/bracket.schema';

@Injectable()
export class BracketRepository {
  constructor(
    @InjectModel('Bracket') private readonly bracketModel: Model<BracketDocument>,
  ) {}

  async create(data: Partial<any>): Promise<any> {
    const bracket = new this.bracketModel({
      ...data,
      tournamentId: new Types.ObjectId(data.tournamentId),
      settings: {
        ...data.settings,
        seeding: data.settings.seeding?.map(s => ({
          ...s,
          teamId: new Types.ObjectId(s.teamId)
        })) || [],
    });
    return bracket.save();
  }

  async findById(id: string): Promise<any> {
    return this.bracketModel.findById(id).populate('tournamentId').exec();
  }

  async findByBracketId(bracketId: string): Promise<any> {
    return this.bracketModel.findOne({ bracketId }).populate('tournamentId').exec();
  }

  async findByTournament(tournamentId: string): Promise<any[]> {
    return this.bracketModel.find({ tournamentId: new Types.ObjectId(tournamentId) }).sort({ createdAt: -1 }).exec();
  }

  async findByType(type: string, tournamentId?: string): Promise<any[]> {
    const filter: any = { type };
    if (tournamentId) filter.tournamentId = new Types.ObjectId(tournamentId);
    return this.bracketModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByStatus(status: string, tournamentId?: string): Promise<any[]> {
    const filter: any = { status };
    if (tournamentId) filter.tournamentId = new Types.ObjectId(tournamentId);
    return this.bracketModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByChampion(championId: string): Promise<any[]> {
    return this.bracketModel.find({ championId: new Types.ObjectId(championId) }).exec();
  }

  async findActiveByTournament(tournamentId: string): Promise<any[]> {
    return this.bracketModel.find({
      tournamentId: new Types.ObjectId(tournamentId),
      status: { $in: ['ready', 'in_progress'] }
    }).exec();
  }

  async findByChampion(championId: string): Promise<any[]> {
    return this.bracketModel.find({ championId: new Types.ObjectId(championId) }).exec();
  }

  async findByRunnerUp(runnerUpId: string): Promise<any[]> {
    return this.bracketModel.find({ runnerUpId: new Types.ObjectId(runnerUpId) }).exec();
  }

  async update(id: string, data: any): Promise<any> {
    return this.bracketModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  async updateNode(bracketId: string, nodeId: string, updates: any): Promise<any> {
    return this.bracketModel.findOneAndUpdate(
      { _id: bracketId, 'nodes.nodeId': nodeId },
      { $set: { 'nodes.$': { ...updates, nodeId } } },
      { new: true }
    ).exec();
  }

  async updateNodeStatus(bracketId: string, nodeId: string, status: string, winnerId?: string, loserId?: string): Promise<any> {
    const update: any = { $set: { 'nodes.$.status': status } };
    if (winnerId) update.$set['nodes.$.winnerId'] = new Types.ObjectId(winnerId);
    if (loserId) update.$set['nodes.$.loserId'] = new Types.ObjectId(loserId);
    
    return this.bracketModel.findOneAndUpdate(
      { _id: bracketId, 'nodes.nodeId': nodeId },
      { $set: { 'nodes.$.status': status, ...(winnerId && { 'nodes.$.winnerId': new Types.ObjectId(winnerId) }), ...(loserId && { 'nodes.$.loserId': new Types.ObjectId(loserId) }) } },
      { new: true }
    ).exec();
  }

  async updateNodeMatch(bracketId: string, nodeId: string, matchId: string): Promise<any> {
    return this.bracketModel.findOneAndUpdate(
      { _id: bracketId, 'nodes.nodeId': nodeId },
      { $set: { 'nodes.$.matchId': new Types.ObjectId(matchId) } },
      { new: true }
    ).exec();
  }

  async updateNodeTeams(bracketId: string, nodeId: string, homeSource: any, awaySource: any): Promise<any> {
    return this.bracketModel.findOneAndUpdate(
      { _id: bracketId, 'nodes.nodeId': nodeId },
      { $set: { 'nodes.$.homeTeamSource': homeSource, 'nodes.$.awayTeamSource': awaySource } },
      { new: true }
    ).exec();
  }

  async updateRound(bracketId: string, round: number, nodes: any[]): Promise<any> {
    return this.bracketModel.findByIdAndUpdate(
      bracketId,
      { $set: { 'nodes': nodes }, $inc: { currentRound: 1 } },
      { new: true }
    ).exec();
  }

  async advanceRound(bracketId: string): Promise<any> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return null;
    
    bracket.currentRound += 1;
    return bracket.save();
  }

  async completeBracket(bracketId: string, championId: string, runnerUpId: string, thirdPlaceId?: string): Promise<any> {
    return this.bracketModel.findByIdAndUpdate(
      bracketId,
      { 
        status: 'completed', 
        championId: new Types.ObjectId(championId),
        runnerUpId: new Types.ObjectId(runnerUpId),
        thirdPlaceId: thirdPlaceId ? new Types.ObjectId(thirdPlaceId) : undefined,
        completedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async getBracketStats(bracketId: string): Promise<any> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return null;

    const totalMatches = bracket.nodes.length;
    const completedMatches = bracket.nodes.filter(n => n.status === 'completed').length;
    const pendingMatches = bracket.nodes.filter(n => n.status === 'pending').length;
    const inProgressMatches = bracket.nodes.filter(n => n.status === 'in_progress').length;
    const completedMatchesCount = bracket.nodes.filter(n => n.status === 'completed').length;

    return {
      totalMatches,
      completedMatches,
      pendingMatches,
      inProgressMatches,
      completedMatchesCount,
      completionPercentage: totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0,
      currentRound: bracket.currentRound,
      totalRounds: bracket.settings.totalRounds,
    };
  }

  async getBracketNodes(bracketId: string, round?: number): Promise<any[]> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return [];
    
    if (round) {
      return bracket.nodes.filter(n => n.round === round);
    }
    return bracket.nodes;
  }

  async getNodesByTeam(bracketId: string, teamId: string): Promise<any[]> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return [];
    
    return bracket.nodes.filter(n => 
      (n.homeTeamSource?.sourceId === teamId || n.homeTeamSource?.matchId?.toString() === teamId) ||
      (n.awayTeamSource?.sourceId === teamId || n.awayTeamSource?.matchId?.toString() === teamId)
    );
  }

  async findByMatch(bracketId: string, matchId: string): Promise<any> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return null;
    
    return bracket.nodes.find(n => n.matchId?.toString() === matchId);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.bracketModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async archive(id: string): Promise<any> {
    return this.bracketModel.findByIdAndUpdate(id, { status: 'archived' }, { new: true }).exec();
  }

  async getBracketStats(tournamentId: string): Promise<any> {
    const [total, byType, byStatus, totalMatches, completedMatches, champions] = await Promise.all([
      this.bracketModel.countDocuments({ tournamentId: new Types.ObjectId(tournamentId) }),
      this.bracketModel.aggregate([
        { $match: { tournamentId: new Types.ObjectId(tournamentId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      this.bracketModel.aggregate([
        { $match: { tournamentId: new Types.ObjectId(tournamentId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.bracketModel.aggregate([
        { $match: { tournamentId: new Types.ObjectId(tournamentId) } },
        { $group: { _id: null, total: { $sum: '$totalMatches' }, completed: { $sum: '$completedMatches' } } }
      ]),
      this.bracketModel.aggregate([
        { $match: { tournamentId: new Types.ObjectId(tournamentId), status: 'completed' } },
        { $group: { _id: '$championId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      totalMatches: totalMatches[0]?.total || 0,
      completedMatches: totalMatches[0]?.completed || 0,
      champions: champions.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {}),
    };
  }

  async duplicateBracket(bracketId: string, newName: string, newTournamentId: string): Promise<any> {
    const bracket = await this.bracketModel.findById(bracketId);
    if (!bracket) return null;

    const duplicated = new this.bracketModel({
      ...bracket.toObject(),
      _id: new Types.ObjectId(),
      bracketId: new Types.ObjectId().toString(),
      name: newName,
      tournamentId: new Types.ObjectId(newTournamentId),
      status: 'draft',
      currentRound: 1,
      totalMatches: 0,
      completedMatches: 0,
      championId: undefined,
      runnerUpId: undefined,
      thirdPlaceId: undefined,
      metadata: { ...bracket.metadata, duplicatedFrom: bracketId },
      version: 1,
    });

    return duplicated.save();
  }

  async getTournamentBracketProgress(tournamentId: string): Promise<any> {
    const brackets = await this.bracketModel.find({ tournamentId: new Types.ObjectId(tournamentId) });
    
    const stats = {
      totalBrackets: brackets.length,
      byStatus: brackets.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {}),
      totalMatches: brackets.reduce((sum, b) => sum + b.totalMatches, 0),
      completedMatches: brackets.reduce((sum, b) => sum + b.completedMatches, 0),
      overallProgress: 0,
    };
    
    const totalMatches = stats.totalMatches;
    const completedMatches = stats.completedMatches;
    stats.overallProgress = totalMatches > 0 ? Math.round((stats.completedMatches / totalMatches) * 100) : 0;
    
    return stats;
  }
}