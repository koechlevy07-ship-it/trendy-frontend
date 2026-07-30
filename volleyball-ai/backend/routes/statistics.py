from flask import Blueprint, request, jsonify
from backend.server import db
from backend.models.statistics import PlayerStatistic
from backend.models.player import Player
from backend.models.match import Match

statistics_bp = Blueprint('statistics', __name__)


@statistics_bp.route('/', methods=['GET'])
def get_all_statistics():
    match_id = request.args.get('match_id')
    player_id = request.args.get('player_id')

    query = PlayerStatistic.query
    if match_id:
        query = query.filter_by(match_id=match_id)
    if player_id:
        query = query.filter_by(player_id=player_id)

    stats = query.all()
    return jsonify([s.to_dict() for s in stats])


@statistics_bp.route('/<int:stat_id>', methods=['GET'])
def get_statistic(stat_id):
    stat = PlayerStatistic.query.get_or_404(stat_id)
    return jsonify(stat.to_dict())


@statistics_bp.route('/', methods=['POST'])
def create_or_update_statistic():
    data = request.get_json()
    stat = PlayerStatistic.query.filter_by(
        player_id=data['player_id'],
        match_id=data['match_id']
    ).first()

    if not stat:
        stat = PlayerStatistic(
            player_id=data['player_id'],
            match_id=data['match_id']
        )
        db.session.add(stat)

    for field in [
        'serves', 'aces', 'service_errors',
        'attack_attempts', 'successful_attacks', 'kills',
        'attack_errors', 'blocked_attacks',
        'solo_blocks', 'block_assists',
        'digs', 'saves',
        'reception_attempts', 'perfect_receptions', 'reception_errors',
        'assists', 'setting_errors',
        'distance_covered', 'number_of_jumps', 'highest_jump',
        'avg_jump_height', 'sprint_speed', 'avg_movement_speed',
        'playing_time_seconds'
    ]:
        if field in data:
            setattr(stat, field, data[field])

    db.session.commit()
    return jsonify(stat.to_dict())


@statistics_bp.route('/match/<int:match_id>', methods=['GET'])
def get_match_statistics(match_id):
    stats = PlayerStatistic.query.filter_by(match_id=match_id).all()
    return jsonify([s.to_dict() for s in stats])


@statistics_bp.route('/player/<int:player_id>/summary', methods=['GET'])
def get_player_summary(player_id):
    stats = PlayerStatistic.query.filter_by(player_id=player_id).all()

    if not stats:
        return jsonify({'message': 'No statistics found'}), 404

    summary = {
        'player_id': player_id,
        'matches_played': len(stats),
        'total_serves': sum(s.serves for s in stats),
        'total_aces': sum(s.aces for s in stats),
        'total_kills': sum(s.kills for s in stats),
        'total_digs': sum(s.digs for s in stats),
        'total_blocks': sum(s.solo_blocks + s.block_assists for s in stats),
        'total_assists': sum(s.assists for s in stats),
        'total_distance': sum(s.distance_covered for s in stats),
        'avg_distance_per_match': sum(s.distance_covered for s in stats) / len(stats)
    }

    return jsonify(summary)


@statistics_bp.route('/match/<int:match_id>/live', methods=['GET'])
def get_live_stats(match_id):
    match = Match.query.get_or_404(match_id)
    stats = PlayerStatistic.query.filter_by(match_id=match_id).all()

    home_players = Player.query.filter_by(team_id=match.home_team_id).all()
    away_players = Player.query.filter_by(team_id=match.away_team_id).all()

    def player_stat_dict(player, stat):
        d = stat.to_dict() if stat else {
            'player_id': player.id, 'match_id': match_id,
            'serves': 0, 'aces': 0, 'service_errors': 0,
            'attack_attempts': 0, 'successful_attacks': 0, 'kills': 0,
            'attack_errors': 0, 'blocked_attacks': 0,
            'solo_blocks': 0, 'block_assists': 0,
            'digs': 0, 'saves': 0,
            'reception_attempts': 0, 'perfect_receptions': 0, 'reception_errors': 0,
            'assists': 0, 'setting_errors': 0,
            'distance_covered': 0.0, 'number_of_jumps': 0,
            'highest_jump': 0.0, 'avg_jump_height': 0.0,
            'sprint_speed': 0.0, 'avg_movement_speed': 0.0,
            'playing_time_seconds': 0
        }
        d['player_name'] = player.name
        d['jersey_number'] = player.jersey_number
        d['position'] = player.position
        d['team_id'] = player.team_id
        return d

    stats_by_player = {s.player_id: s for s in stats}

    home_stats = [player_stat_dict(p, stats_by_player.get(p.id)) for p in home_players]
    away_stats = [player_stat_dict(p, stats_by_player.get(p.id)) for p in away_players]

    home_total_kills = sum(s['kills'] for s in home_stats)
    away_total_kills = sum(s['kills'] for s in away_stats)
    home_total_aces = sum(s['aces'] for s in home_stats)
    away_total_aces = sum(s['aces'] for s in away_stats)
    home_total_blocks = sum(s['solo_blocks'] + s['block_assists'] for s in home_stats)
    away_total_blocks = sum(s['solo_blocks'] + s['block_assists'] for s in away_stats)
    home_total_digs = sum(s['digs'] for s in home_stats)
    away_total_digs = sum(s['digs'] for s in away_stats)

    return jsonify({
        'match': match.to_dict(),
        'home_team': {'id': match.home_team_id, 'players': home_stats,
                       'total_kills': home_total_kills, 'total_aces': home_total_aces,
                       'total_blocks': home_total_blocks, 'total_digs': home_total_digs},
        'away_team': {'id': match.away_team_id, 'players': away_stats,
                       'total_kills': away_total_kills, 'total_aces': away_total_aces,
                       'total_blocks': away_total_blocks, 'total_digs': away_total_digs},
        'recent_events': [e.to_dict() for e in
                          sorted(
                              [ev for s in stats for ev in (s.player.events if hasattr(s.player, 'events') else [])],
                              key=lambda x: x.timestamp or 0, reverse=True
                          )[:20]]
    })


@statistics_bp.route('/match/<int:match_id>/awards', methods=['GET'])
def get_match_awards(match_id):
    match = Match.query.get_or_404(match_id)
    stats = PlayerStatistic.query.filter_by(match_id=match_id).all()

    if not stats:
        return jsonify({'error': 'No statistics found for this match'}), 404

    def get_player_info(player_id):
        player = Player.query.get(player_id)
        return {'id': player.id, 'name': player.name,
                'jersey_number': player.jersey_number,
                'position': player.position,
                'team_id': player.team_id} if player else {}

    def mvp_score(s):
        return (s.kills * 3 + s.aces * 3 +
                (s.solo_blocks + s.block_assists) * 2 +
                s.digs * 2 + s.assists * 2 -
                s.attack_errors * 1 - s.service_errors * 1 -
                s.reception_errors * 1)

    awards = {}

    mvp = max(stats, key=mvp_score)
    awards['mvp'] = {
        'title': 'Most Valuable Player',
        'icon': '🏆',
        'player': get_player_info(mvp.player_id),
        'stat_value': mvp_score(mvp),
        'stat_label': 'MVP Score',
        'breakdown': f"{mvp.kills}K {mvp.aces}A {(mvp.solo_blocks + mvp.block_assists)}B {mvp.digs}D {mvp.assists}AS"
    }

    best_scorer = max(stats, key=lambda s: s.kills)
    awards['best_scorer'] = {
        'title': 'Best Scorer',
        'icon': '🎯',
        'player': get_player_info(best_scorer.player_id),
        'stat_value': best_scorer.kills,
        'stat_label': 'Kills',
        'breakdown': f"{best_scorer.attack_attempts} attempts, {best_scorer.successful_attacks} successful"
    }

    servers = [s for s in stats if s.serves >= 3]
    if servers:
        best_server = max(servers, key=lambda s: s.aces)
        awards['best_server'] = {
            'title': 'Best Server',
            'icon': '📡',
            'player': get_player_info(best_server.player_id),
            'stat_value': best_server.aces,
            'stat_label': 'Aces',
            'breakdown': f"{best_server.serves} serves, {best_server.service_errors} errors"
        }
    else:
        best_server = max(stats, key=lambda s: s.aces)
        awards['best_server'] = {
            'title': 'Best Server',
            'icon': '📡',
            'player': get_player_info(best_server.player_id),
            'stat_value': best_server.aces,
            'stat_label': 'Aces',
            'breakdown': f"{best_server.serves} serves (min 3 required for official)"
        }

    best_blocker = max(stats, key=lambda s: s.solo_blocks + s.block_assists)
    total_blocks = best_blocker.solo_blocks + best_blocker.block_assists
    awards['best_blocker'] = {
        'title': 'Best Blocker',
        'icon': '🧱',
        'player': get_player_info(best_blocker.player_id),
        'stat_value': total_blocks,
        'stat_label': 'Total Blocks',
        'breakdown': f"{best_blocker.solo_blocks} solo, {best_blocker.block_assists} assists"
    }

    best_digger = max(stats, key=lambda s: s.digs)
    awards['best_digger'] = {
        'title': 'Best Digger',
        'icon': '🏐',
        'player': get_player_info(best_digger.player_id),
        'stat_value': best_digger.digs,
        'stat_label': 'Digs',
        'breakdown': f"{best_digger.saves} saves"
    }

    best_setter = max(stats, key=lambda s: s.assists)
    awards['best_setter'] = {
        'title': 'Best Setter',
        'icon': '🎯',
        'player': get_player_info(best_setter.player_id),
        'stat_value': best_setter.assists,
        'stat_label': 'Assists',
        'breakdown': f"{best_setter.setting_errors} setting errors"
    }

    receivers = [s for s in stats if s.reception_attempts >= 3]
    if receivers:
        best_receiver = max(receivers, key=lambda s: s.perfect_receptions / max(s.reception_attempts, 1))
        awards['best_receiver'] = {
            'title': 'Best Receiver',
            'icon': '📥',
            'player': get_player_info(best_receiver.player_id),
            'stat_value': f"{round(best_receiver.perfect_receptions / max(best_receiver.reception_attempts, 1) * 100)}%",
            'stat_label': 'Reception Accuracy',
            'breakdown': f"{best_receiver.perfect_receptions}/{best_receiver.reception_attempts} perfect"
        }
    else:
        best_receiver = max(stats, key=lambda s: s.reception_attempts)
        awards['best_receiver'] = {
            'title': 'Best Receiver',
            'icon': '📥',
            'player': get_player_info(best_receiver.player_id),
            'stat_value': best_receiver.perfect_receptions,
            'stat_label': 'Perfect Receptions',
            'breakdown': f"{best_receiver.reception_attempts} attempts"
        }

    most_active = max(stats, key=lambda s: s.distance_covered)
    awards['most_active'] = {
        'title': 'Most Active Player',
        'icon': '🏃',
        'player': get_player_info(most_active.player_id),
        'stat_value': f"{round(most_active.distance_covered, 2)} km",
        'stat_label': 'Distance Covered',
        'breakdown': f"Top speed: {round(most_active.sprint_speed, 1)} km/h"
    }

    top_jumper = max(stats, key=lambda s: s.highest_jump)
    awards['top_jumper'] = {
        'title': 'Highest Jumper',
        'icon': '🦘',
        'player': get_player_info(top_jumper.player_id),
        'stat_value': f"{round(top_jumper.highest_jump * 100, 1)} cm",
        'stat_label': 'Highest Jump',
        'breakdown': f"{top_jumper.number_of_jumps} total jumps"
    }

    all_players_stats = []
    for stat in stats:
        info = get_player_info(stat.player_id)
        all_players_stats.append({
            **info,
            **stat.to_dict(),
            'mvp_score': mvp_score(stat)
        })

    return jsonify({
        'awards': awards,
        'player_stats': all_players_stats,
        'match': match.to_dict()
    })
