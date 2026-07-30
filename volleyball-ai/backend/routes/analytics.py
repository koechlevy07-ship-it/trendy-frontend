from flask import Blueprint, request, jsonify
from backend.server import db
from backend.models.statistics import PlayerStatistic
from backend.models.player import Player
from backend.models.match import Match, MatchEvent
import numpy as np

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/match/<int:match_id>/rallies', methods=['GET'])
def get_rally_analysis(match_id):
    match = Match.query.get_or_404(match_id)
    events = MatchEvent.query.filter_by(match_id=match_id).order_by(MatchEvent.timestamp).all()

    rallies = []
    current_rally = []

    serve_events = ['serve', 'serve_ace', 'service_error']
    rally_end_events = ['kill', 'attack_error', 'service_error', 'blocked_attacks']

    for event in events:
        if event.event_type in serve_events:
            if current_rally:
                rallies.append(current_rally)
            current_rally = [event]
        elif current_rally:
            current_rally.append(event)

        if event.event_type in rally_end_events:
            rallies.append(current_rally)
            current_rally = []

    if current_rally:
        rallies.append(current_rally)

    rally_stats = []
    for rally in rallies:
        if not rally:
            continue

        start_time = rally[0].timestamp or 0
        end_time = rally[-1].timestamp or 0
        duration = end_time - start_time

        touches = len(rally)
        teams_involved = set()
        for e in rally:
            if e.player_id:
                player = Player.query.get(e.player_id)
                if player:
                    teams_involved.add(player.team_id)

        final_event = rally[-1]

        rally_stats.append({
            'rally_id': len(rally_stats) + 1,
            'start_time': start_time,
            'end_time': end_time,
            'duration': round(duration, 2),
            'touches': touches,
            'teams': list(teams_involved),
            'final_event': final_event.event_type,
            'events': [e.to_dict() for e in rally]
        })

    durations = [r['duration'] for r in rally_stats]
    touches = [r['touches'] for r in rally_stats]

    return jsonify({
        'total_rallies': len(rally_stats),
        'longest_rally': max(rally_stats, key=lambda r: r['duration']) if rally_stats else None,
        'shortest_rally': min(rally_stats, key=lambda r: r['duration']) if rally_stats else None,
        'average_duration': round(np.mean(durations), 2) if durations else 0,
        'average_touches': round(np.mean(touches), 1) if touches else 0,
        'max_touches': max(touches) if touches else 0,
        'rallies': rally_stats
    })


@analytics_bp.route('/match/<int:match_id>/tactics', methods=['GET'])
def get_tactical_analysis(match_id):
    match = Match.query.get_or_404(match_id)
    events = MatchEvent.query.filter_by(match_id=match_id).all()
    stats = PlayerStatistic.query.filter_by(match_id=match_id).all()

    home_players = Player.query.filter_by(team_id=match.home_team_id).all()
    away_players = Player.query.filter_by(team_id=match.away_team_id).all()

    home_player_ids = {p.id for p in home_players}
    away_player_ids = {p.id for p in away_players}

    home_kills = sum(1 for e in events if e.player_id in home_player_ids and e.event_type == 'kill')
    away_kills = sum(1 for e in events if e.player_id in away_player_ids and e.event_type == 'kill')

    home_attacks = sum(1 for e in events if e.player_id in home_player_ids and e.event_type in ['kill', 'spike', 'attack_error'])
    away_attacks = sum(1 for e in events if e.player_id in away_player_ids and e.event_type in ['kill', 'spike', 'attack_error'])

    home_blocks = sum(1 for e in events if e.player_id in home_player_ids and e.event_type == 'block')
    away_blocks = sum(1 for e in events if e.player_id in away_player_ids and e.event_type == 'block')

    home_aces = sum(1 for e in events if e.player_id in home_player_ids and e.event_type == 'ace')
    away_aces = sum(1 for e in events if e.player_id in away_player_ids and e.event_type == 'ace')

    home_errors = sum(1 for e in events if e.player_id in home_player_ids and e.event_type in ['attack_error', 'service_error'])
    away_errors = sum(1 for e in events if e.player_id in away_player_ids and e.event_type in ['attack_error', 'service_error'])

    attack_success = {
        'home': round(home_kills / max(home_attacks, 1) * 100, 1),
        'away': round(away_kills / max(away_attacks, 1) * 100, 1)
    }

    defensive_stats = {
        'home': {'digs': 0, 'blocks': home_blocks, 'saves': 0},
        'away': {'digs': 0, 'blocks': away_blocks, 'saves': 0}
    }

    for s in stats:
        if s.player_id in home_player_ids:
            defensive_stats['home']['digs'] += s.digs
            defensive_stats['home']['saves'] += s.saves
        elif s.player_id in away_player_ids:
            defensive_stats['away']['digs'] += s.digs
            defensive_stats['away']['saves'] += s.saves

    home_efficiency = round(
        (home_kills * 3 + home_blocks * 2 + home_aces * 3 - home_errors * 2) /
        max(home_attacks + home_blocks + home_aces, 1) * 100, 1
    )
    away_efficiency = round(
        (away_kills * 3 + away_blocks * 2 + away_aces * 3 - away_errors * 2) /
        max(away_attacks + away_blocks + away_aces, 1) * 100, 1
    )

    return jsonify({
        'attack_analysis': {
            'home': {'kills': home_kills, 'attacks': home_attacks, 'success_rate': attack_success['home']},
            'away': {'kills': away_kills, 'attacks': away_attacks, 'success_rate': attack_success['away']}
        },
        'defense_analysis': defensive_stats,
        'serve_analysis': {
            'home': {'aces': home_aces, 'errors': sum(1 for e in events if e.player_id in home_player_ids and e.event_type == 'service_error')},
            'away': {'aces': away_aces, 'errors': sum(1 for e in events if e.player_id in away_player_ids and e.event_type == 'service_error')}
        },
        'error_analysis': {
            'home': home_errors,
            'away': away_errors
        },
        'efficiency': {
            'home': home_efficiency,
            'away': away_efficiency
        },
        'momentum': _calculate_momentum(events, home_player_ids, away_player_ids)
    })


def _calculate_momentum(events, home_ids, away_ids):
    momentum = []
    home_score = 0
    away_score = 0

    for event in events:
        if event.event_type == 'kill':
            if event.player_id in home_ids:
                home_score += 1
            elif event.player_id in away_ids:
                away_score += 1

        total = home_score + away_score
        if total > 0:
            momentum.append({
                'timestamp': event.timestamp,
                'home_score': home_score,
                'away_score': away_score,
                'home_momentum': round(home_score / total * 100, 1),
                'event': event.event_type
            })

    return momentum


@analytics_bp.route('/rankings', methods=['GET'])
def get_player_rankings():
    category = request.args.get('category', 'overall')
    limit = request.args.get('limit', 20, type=int)

    all_stats = PlayerStatistic.query.all()

    player_totals = {}
    for stat in all_stats:
        pid = stat.player_id
        if pid not in player_totals:
            player_totals[pid] = {
                'player_id': pid, 'matches_played': 0,
                'kills': 0, 'aces': 0, 'blocks': 0, 'digs': 0,
                'assists': 0, 'attack_attempts': 0, 'serves': 0,
                'reception_attempts': 0, 'perfect_receptions': 0,
                'distance_covered': 0, 'errors': 0
            }
        p = player_totals[pid]
        p['matches_played'] += 1
        p['kills'] += stat.kills
        p['aces'] += stat.aces
        p['blocks'] += stat.solo_blocks + stat.block_assists
        p['digs'] += stat.digs
        p['assists'] += stat.assists
        p['attack_attempts'] += stat.attack_attempts
        p['serves'] += stat.serves
        p['reception_attempts'] += stat.reception_attempts
        p['perfect_receptions'] += stat.perfect_receptions
        p['distance_covered'] += stat.distance_covered
        p['errors'] += stat.attack_errors + stat.service_errors + stat.reception_errors

    rankings = list(player_totals.values())

    def get_player(p):
        player = Player.query.get(p['player_id'])
        if player:
            p['name'] = player.name
            p['jersey_number'] = player.jersey_number
            p['position'] = player.position
            p['team_id'] = player.team_id
        return p

    rankings = [get_player(p) for p in rankings]

    scoring = {
        'overall': lambda p: (p['kills'] * 3 + p['aces'] * 3 + p['blocks'] * 2 +
                              p['digs'] * 2 + p['assists'] * 2 - p['errors']),
        'attacking': lambda p: p['kills'],
        'serving': lambda p: p['aces'],
        'blocking': lambda p: p['blocks'],
        'defense': lambda p: p['digs'],
        'setting': lambda p: p['assists'],
        'receiving': lambda p: p['perfect_receptions']
    }

    score_fn = scoring.get(category, scoring['overall'])
    rankings.sort(key=score_fn, reverse=True)

    for i, p in enumerate(rankings):
        p['rank'] = i + 1
        p['score'] = round(score_fn(p), 2)
        if p['attack_attempts'] > 0:
            p['hitting_pct'] = round((p['kills'] - p['errors']) / p['attack_attempts'], 3)
        else:
            p['hitting_pct'] = 0
        if p['serves'] > 0:
            p['serve_pct'] = round(p['aces'] / p['serves'] * 100, 1)
        else:
            p['serve_pct'] = 0
        if p['reception_attempts'] > 0:
            p['reception_pct'] = round(p['perfect_receptions'] / p['reception_attempts'] * 100, 1)
        else:
            p['reception_pct'] = 0

    return jsonify(rankings[:limit])


@analytics_bp.route('/match/<int:match_id>/heatmaps', methods=['GET'])
def get_match_heatmaps(match_id):
    stats = PlayerStatistic.query.filter_by(match_id=match_id).all()

    heatmaps = {}
    for stat in stats:
        player = Player.query.get(stat.player_id)
        if player:
            heatmaps[stat.player_id] = {
                'player_name': player.name,
                'jersey_number': player.jersey_number,
                'position': player.position,
                'team_id': player.team_id
            }

    return jsonify(heatmaps)


@analytics_bp.route('/match/<int:match_id>/ball_trajectory', methods=['GET'])
def get_ball_trajectory(match_id):
    events = MatchEvent.query.filter_by(match_id=match_id).order_by(MatchEvent.frame_number).all()

    trajectory_points = []
    for event in events:
        if event.details:
            ball_info = event.details.get('ball_info')
            if ball_info and ball_info.get('position'):
                trajectory_points.append({
                    'frame': event.frame_number,
                    'timestamp': event.timestamp,
                    'position': ball_info['position'],
                    'speed': ball_info.get('speed', 0),
                    'height': ball_info.get('height', 0),
                    'event_type': event.event_type
                })

    return jsonify({
        'points': trajectory_points,
        'total_points': len(trajectory_points)
    })
